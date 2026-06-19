output "alb_dns_name" {
  value       = module.ecs.alb_dns_name
  description = "API + Web DNS name (ALB)"
}

output "db_endpoint" {
  value       = module.rds.db_endpoint
  description = "RDS PostgreSQL endpoint"
}

output "cognito_user_pool_id" {
  value       = module.cognito.user_pool_id
  description = "Cognito User Pool ID"
}

output "cognito_user_pool_client_id" {
  value       = module.cognito.user_pool_client_id
  description = "Cognito App Client ID (used in frontend)"
}

output "cognito_user_pool_arn" {
  value       = module.cognito.user_pool_arn
  description = "Cognito User Pool ARN"
}

output "s3_documents_bucket" {
  value       = module.s3.bucket_name
  description = "S3 bucket for borrower document uploads"
}

output "s3_ai_models_bucket" {
  value       = module.s3.ai_models_bucket_name
  description = "S3 bucket for AI model artifacts (finpal_extractor.joblib, finpal_pd_model.joblib)"
}

output "sqs_processing_queue_url" {
  value       = module.sqs.queue_url
  description = "SQS URL for the async processing queue"
}

output "sqs_dlq_arn" {
  value       = module.sqs.dlq_arn
  description = "Dead-letter queue ARN for failed processing jobs"
}

output "lambda_ecr_repository_url" {
  value       = module.lambda.ecr_repository_url
  description = "ECR repo URL — push Docker image here before deploying Lambda"
}

output "lambda_function_name" {
  value       = module.lambda.function_name
  description = "Name of the Lambda processing worker"
}

output "waf_web_acl_arn" {
  value       = module.waf.web_acl_arn
  description = "WAF Web ACL ARN attached to the ALB"
}
