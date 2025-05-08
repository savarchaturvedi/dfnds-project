import json
import boto3

print("Lambda trigerred ")
runtime = boto3.client('sagemaker-runtime')

ENDPOINT_NAME = 'huggingface-pytorch-inference-2025-05-08-16-55-13-231'

def lambda_handler(event, context):
    print("=== Lambda Triggered ===")
    print("Event -vaishu:", json.dumps(event))

    try:
        # Handle preflight CORS request
        if event.get("httpMethod", "") == "OPTIONS":
            print("CORS preflight request received -vaishu")
            return {
                "statusCode": 200,
                "headers": {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type",
                },
                "body": json.dumps("CORS preflight response")
            }

        # Parse incoming data
        body = json.loads(event.get('body', '{}'))
        input_text = body.get('inputs', '')  # Make sure this matches frontend

        print("Received input text -vaishu:", input_text)

        # Call SageMaker
        response = runtime.invoke_endpoint(
            EndpointName=ENDPOINT_NAME,
            ContentType='application/json',
            Body=json.dumps({ "inputs": input_text })
        )

        result = json.loads(response['Body'].read().decode())
        print("SageMaker result -vaishu:", result)

        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            "body": json.dumps(result)
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
            "body": json.dumps({ "error": str(e) })
        }