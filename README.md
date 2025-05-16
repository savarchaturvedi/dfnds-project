# 🧠 Decentralized Fake News Detection System (DFNDS)

A hybrid cloud + blockchain application that uses machine learning to detect fake news, stores it on IPFS, and logs results on Ethereum for transparency. An intelligent Python agent flags repeated or suspicious content.

---

## 📌 Features

- ✅ News classification using AWS Comprehend (ML-as-a-Service)
- ✅ IPFS integration for decentralized content storage
- ✅ Ethereum smart contract for immutable logging
- ✅ Firebase-hosted frontend for user interaction
- ✅ Python IAN (Intelligent Autonomous Network) agent for duplicate detection

---


# 🛠️ DFNDS Backend

This backend powers the DFNDS (Decentralized Fake News Detection System) by performing the following:

* Accepting a news headline as input via an HTTP POST request.
* Sending the headline to an Amazon SageMaker endpoint to classify it as `POSITIVE` or `NEGATIVE`.
* Storing the classification result along with metadata to IPFS using Pinata.
* Logging all relevant results (IP, timestamp, verdict, IPFS hash) into **Google Firestore** for further analysis (e.g., user flagging by IAN agents).

---

## 📁 Directory Structure

```
DFNDS-PROJECT/
└── backend/
    ├── lambda_function.py            # Main Lambda code for processing news
    ├── Deploy_HF_Model_DFNDS.ipynb   # SageMaker model deployment notebook
    ├── .gitkeep                      # Git placeholder
    └── README_backend.md             # You're here
```

---

## 🧠 Prerequisites

Ensure the following are configured:

### 🔐 Environment Variables

Set the following as Lambda environment variables:

| Variable                   | Description                                                    |
| -------------------------- | -------------------------------------------------------------- |
| `PINATA_API_KEY`           | API key from [Pinata](https://pinata.cloud)                    |
| `PINATA_SECRET_KEY`        | Secret API key for IPFS uploads                                |
| `GCP_PROJECT_ID`           | Google Cloud Firestore project ID                              |
| `GCP_SERVICE_ACCOUNT_JSON` | Raw JSON string of a GCP service account with Firestore access |

---

## 🚀 Lambda Function Behavior

* Triggered via API Gateway (HTTP POST)
* Accepts payload:

  ```json
  {
    "inputs": "NASA confirms presence of water on Mars"
  }
  ```
* Sends `inputs` to SageMaker text classification endpoint.
* Collects:

  * IP address (if available via request context)
  * Prediction label (`POSITIVE`/`NEGATIVE`)
  * Model score
  * Timestamp
* Uploads the result to:

  * IPFS (via Pinata)
  * Google Firestore (`results` collection)

---

## 🧪 Testing

Use a test event in Lambda or any REST client (like Postman):

```json
{
  "httpMethod": "POST",
  "body": "{\"inputs\": \"NASA confirms presence of water on Mars\"}",
  "requestContext": {
    "identity": {
      "sourceIp": "123.45.67.89"
    }
  }
}
```

---

## 🔍 Example Firestore Document

```json
{
  "headline": "NASA confirms presence of water on Mars",
  "verdict": "POSITIVE",
  "score": 0.99,
  "timestamp": "2025-05-16T14:50:33.234Z",
  "ip": "123.45.67.89",
  "source": "fake-news-detector",
  "ipfs_hash": "QmXYZabc123..."
}
```

---

## 📦 Deployment Notes

* You can update the deployed model in SageMaker and reuse the same endpoint.
* Make sure your Lambda IAM role has `sagemaker:InvokeEndpoint` permission.

