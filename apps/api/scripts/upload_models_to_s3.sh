#!/usr/bin/env bash
# Upload AI model artifacts to S3 models bucket
# Run this once after terraform apply to seed the models bucket
# Usage: ./upload_models_to_s3.sh <bucket-name>
set -euo pipefail

BUCKET="${1:?Usage: $0 <s3-models-bucket-name>}"
ARTIFACTS_DIR="$(dirname "$0")/../app/services/ai/artifacts"

echo "Uploading AI model artifacts to s3://${BUCKET}/models/"

aws s3 cp "${ARTIFACTS_DIR}/finpal_extractor.joblib" \
  "s3://${BUCKET}/models/finpal_extractor.joblib" \
  --sse AES256

aws s3 cp "${ARTIFACTS_DIR}/finpal_pd_model.joblib" \
  "s3://${BUCKET}/models/finpal_pd_model.joblib" \
  --sse AES256

echo "Done. Models available at:"
echo "  s3://${BUCKET}/models/finpal_extractor.joblib"
echo "  s3://${BUCKET}/models/finpal_pd_model.joblib"
