import datetime
import logging
import os
import sys
import firebase_admin
from firebase_admin import credentials, firestore

print("IAN Container launched successfully")
print("Current directory contents:", os.listdir("."))
sys.stdout.flush()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)

def main():
    print("Starting IAN flagging job...")
    logging.info("IAN flag user job started")

    try:
        if not firebase_admin._apps:
            cred = credentials.Certificate("firebase-service-account.json")
            firebase_admin.initialize_app(cred)
            print("Firebase Admin initialized")
            logging.info("Firebase Admin initialized")

        db = firestore.client()

        now = datetime.datetime.utcnow()
        window_start = now - datetime.timedelta(hours=24)
        print(f"Window start: {window_start.isoformat()}")
        logging.info(f"Looking for NEGATIVE verdicts since {window_start.isoformat()}")

        results = db.collection("results").where("timestamp", ">=", window_start.isoformat()).stream()
        ip_counts = {}
        doc_count = 0

        for doc in results:
            doc_count += 1
            data = doc.to_dict()
            ip = data.get("ip", "UNKNOWN")
            verdict = data.get("verdict", "").upper()

            if verdict == "NEGATIVE":
                ip_counts[ip] = ip_counts.get(ip, 0) + 1

        print(f"Documents fetched: {doc_count}")
        print(f"NEGATIVE verdicts grouped by IP: {ip_counts}")
        logging.info(f"Fetched {doc_count} documents from 'results'")
        logging.info(f"Aggregated NEGATIVE verdicts by IP: {ip_counts}")

        flagged_count = 0
        for ip, count in ip_counts.items():
            if count > 2:
                db.collection("flags").add({
                    "ip": ip,
                    "negative_count": count,
                    "timestamp": now.isoformat()
                })
                flagged_count += 1
                print(f"IP {ip} flagged with {count} NEGATIVE verdicts")
                logging.warning(f"IP {ip} flagged with {count} NEGATIVE verdicts")

        if flagged_count == 0:
            print("No IPs flagged.")
            logging.info("No IPs flagged this cycle.")
        else:
            print(f"{flagged_count} IPs flagged.")
            logging.info(f"{flagged_count} IPs flagged successfully.")

    except Exception as e:
        print("Exception occurred:", e)
        logging.error("Exception occurred during job execution", exc_info=True)

    sys.stdout.flush()
    sys.stderr.flush()

if __name__ == "__main__":
    main()
