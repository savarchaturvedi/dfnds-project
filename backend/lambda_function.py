import json
import boto3
import requests
import os
from datetime import datetime
from google.oauth2 import service_account
from google.auth.transport.requests import Request

print("Lambda triggered")
runtime = boto3.client('sagemaker-runtime')
ENDPOINT_NAME = 'huggingface-pytorch-inference-dfnds'

# Pinata API keys
PINATA_API_KEY = os.environ.get('PINATA_API_KEY')
PINATA_SECRET_KEY = os.environ.get('PINATA_SECRET_KEY')
PINATA_URL = 'https://api.pinata.cloud/pinning/pinJSONToIPFS'

# Upload data to IPFS via Pinata
def upload_to_ipfs(data):
    headers = {
        'Content-Type': 'application/json',
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_KEY
    }
    try:
        response = requests.post(PINATA_URL, json=data, headers=headers)
        if response.status_code == 200:
            return response.json().get('IpfsHash')
        else:
            print(f"Error uploading to IPFS: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"Exception during IPFS upload: {str(e)}")
        return None

# Write data to Google Firestore
def write_to_firestore(data_dict):
    project_id = os.environ['GCP_PROJECT_ID']
    sa_info = json.loads(os.environ['GCP_SERVICE_ACCOUNT_JSON'])

    credentials = service_account.Credentials.from_service_account_info(
        sa_info,
        scopes=["https://www.googleapis.com/auth/datastore"]
    )
    credentials.refresh(Request())
    access_token = credentials.token

    url = f"https://firestore.googleapis.com/v1/projects/{project_id}/databases/(default)/documents/results"

    doc = {
        "fields": {
            key: {"stringValue": str(value)} for key, value in data_dict.items()
        }
    }

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    response = requests.post(url, headers=headers, json=doc)
    print("Firestore response:", response.status_code, response.text)

# Lambda handler
def lambda_handler(event, context):
    print("=== Lambda Triggered ===")
    print("Event -vaishu:", json.dumps(event))

    try:
        # Handle preflight CORS
        if event.get("httpMethod", "") == "OPTIONS":
            return {
                "statusCode": 200,
                "headers": {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type",
                },
                "body": json.dumps("CORS preflight response")
            }

        # Parse input
        body = json.loads(event.get('body', '{}'))
        input_text = body.get('inputs', '')
        print("Received input text -vaishu:", input_text)

        # Get client IP
        source_ip = event.get("requestContext", {}).get("identity", {}).get("sourceIp", "UNKNOWN")

        # Call SageMaker
        response = runtime.invoke_endpoint(
            EndpointName=ENDPOINT_NAME,
            ContentType='application/json',
            Body=json.dumps({"inputs": input_text})
        )
        prediction = json.loads(response['Body'].read().decode())[0]
        print("SageMaker result -vaishu:", prediction)

        # Build full data payload
        timestamp = datetime.utcnow().isoformat()
        data_to_store = {
            "headline": input_text,
            "verdict": prediction["label"],
            "score": prediction["score"],
            "timestamp": timestamp,
            "ip": source_ip,
            "source": "fake-news-detector"
        }

        # Upload to IPFS
        ipfs_hash = upload_to_ipfs(data_to_store)
        print(f"IPFS Upload Result: {ipfs_hash}")

        if ipfs_hash:
            data_to_store["ipfs_hash"] = ipfs_hash
            write_to_firestore(data_to_store)

        # Prepare response
        response_body = {
            "headline": input_text,
            "verdict": prediction["label"],
            "score": prediction["score"],
            "ipfs_hash": ipfs_hash
        }

        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            "body": json.dumps(response_body)
        }

    except Exception as e:
        print("Lambda ERROR -vaishu:", str(e))
        return {
            "statusCode": 500,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            "body": json.dumps({"error": str(e)})
        }
