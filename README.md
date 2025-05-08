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

## 🧱 Project Structure
dfnds-project/
├── frontend/ # Firebase-hosted HTML frontend
├── backend/ # AWS Lambda + IPFS uploader
├── smart_contract/ # Solidity contract for logging
├── ian_agent/ # Python script to flag duplicates
├── dataset/ # Fake news dataset (Kaggle)
└── README.md