"""
API Lambda handler — wraps the FastAPI app for AWS Lambda + API Gateway.

Mangum translates API Gateway HTTP events into ASGI requests that FastAPI handles.
This Lambda runs inside the VPC so it can reach RDS and send to SQS.

Environment variables (same as .env but set in Lambda console):
  DATABASE_URL, COGNITO_USER_POOL_ID, COGNITO_CLIENT_ID,
  AWS_SQS_QUEUE_URL, AWS_S3_DOCUMENTS_BUCKET, AWS_S3_MODELS_BUCKET
"""

from mangum import Mangum

from app.main import app

handler = Mangum(app, lifespan="off", api_gateway_base_path="/prod")
