# 🧠 Decentralized Fake News Detection System (DFNDS)

A hybrid cloud + blockchain application that uses machine learning to detect fake news, stores it on IPFS, and logs results on Ethereum for transparency. An intelligent Python agent flags repeated or suspicious content.

---

## 📌 Features

* ✅ News classification using AWS Comprehend (ML-as-a-Service)
* ✅ IPFS integration for decentralized content storage
* ✅ Ethereum smart contract for immutable logging
* ✅ Firebase-hosted frontend for user interaction
* ✅ Python IAN (Intelligent Autonomous Network) agent for user flagging based on abuse detection

---

# 🛠️ DFNDS Backend

This backend powers the DFNDS (Decentralized Fake News Detection System) by:

* Accepting a news headline via HTTP POST.
* Sending the headline to an Amazon SageMaker endpoint to classify it as `POSITIVE` or `NEGATIVE`.
* Uploading results to IPFS using Pinata.
* Logging verdicts and metadata to **Google Firestore**.

### 🧠 IAN Agent (Autonomous User Flagging)

A containerized Python job that periodically scans Firestore for excessive `NEGATIVE` verdicts from the same IP address. It flags abusive users to a separate `flags` collection.

**Deployed via:** Azure Container Apps Job (manual or scheduled trigger)

---

## 📁 Directory Structure

```
DFNDS-PROJECT/
├── backend/
│   ├── lambda_function.py            # Lambda for classification pipeline
│   ├── Deploy_HF_Model_DFNDS.ipynb   # Model deployment notebook
├── ian_agent/
│   ├── Dockerfile                    # Container image for IAN job
│   ├── ian_flag_user.py              # Firestore query + flag logic
│   ├── requirements.txt             # Firebase dependencies
│   └── firebase-service-account.json # GCP auth (mount securely in prod)
```

---

## 🧠 Prerequisites

### 🔐 Environment Variables for Lambda

| Variable                   | Description                 |
| -------------------------- | --------------------------- |
| `PINATA_API_KEY`           | Pinata API Key              |
| `PINATA_SECRET_KEY`        | Pinata Secret               |
| `GCP_PROJECT_ID`           | Firestore Project ID        |
| `GCP_SERVICE_ACCOUNT_JSON` | JSON for Firebase Admin SDK |

---

## 🚀 Lambda Function Flow

Triggered via API Gateway:

1. Accepts payload:

   ```json
   { "inputs": "NASA confirms presence of water on Mars" }
   ```
2. Runs ML classification
3. Stores results in:

   * IPFS via Pinata
   * Firestore `results` collection

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

## 🤖 IAN Agent Behavior

The IAN job does the following every time it runs:

1. Checks all `results` in the past 24 hours.
2. Groups by `ip` and counts `NEGATIVE` verdicts.
3. Flags any IP with more than **2 negative verdicts** to Firestore:

```json
{
  "ip": "123.45.67.89",
  "negative_count": 3,
  "timestamp": "2025-05-16T16:30:01Z"
}
```

4. Stored under the `flags` collection.

### 🔄 Deployment

The job is deployed as a Docker container and triggered via:

```bash
az containerapp job start --name ian-flag-job --resource-group your-rg
```

Make sure the Firebase service account JSON is securely mounted or bundled into the container.

