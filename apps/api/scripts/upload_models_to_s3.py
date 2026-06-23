"""
upload_models_to_s3.py

Uploads the trained AI model artifacts to the S3 models bucket.
Run once after any model retrain, or on first setup.

Usage:
    cd apps/api
    python scripts/upload_models_to_s3.py
"""

import os
from pathlib import Path

import boto3

BUCKET = os.environ.get("AWS_S3_MODELS_BUCKET", "creditcore-ai-models-dev")
REGION = os.environ.get("AWS_DEFAULT_REGION", "us-east-1")

ARTIFACTS = [
    (
        Path(__file__).resolve().parent.parent
        / "app/services/ai/artifacts/finpal_pd_model.joblib",
        "models/finpal_pd_model.joblib",
    ),
    (
        Path(__file__).resolve().parent.parent
        / "app/services/ai/idp/finpal_extractor.joblib",
        "models/finpal_extractor.joblib",
    ),
]


def main() -> None:
    s3 = boto3.client("s3", region_name=REGION)

    for local_path, s3_key in ARTIFACTS:
        if not local_path.exists():
            print(f"  SKIP  {local_path.name} — file not found")
            continue

        size_mb = local_path.stat().st_size / 1_048_576
        print(
            f"  Uploading {local_path.name} ({size_mb:.1f} MB) → s3://{BUCKET}/{s3_key}"
        )
        s3.upload_file(
            str(local_path),
            BUCKET,
            s3_key,
            ExtraArgs={"ServerSideEncryption": "AES256"},
        )
        print("  Done ✓")

    print("\nAll models uploaded.")


if __name__ == "__main__":
    main()
