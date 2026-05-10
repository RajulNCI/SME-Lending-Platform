output "alb_dns_name" {
  value       = module.ecs.alb_dns_name
  description = "The DNS name of the ALB"
}

output "db_endpoint" {
  value       = module.rds.db_endpoint
  description = "The connection endpoint for the RDS database"
}

output "cognito_user_pool_id" {
  value       = module.cognito.user_pool_id
  description = "The Cognito User Pool ID"
}

output "cognito_user_pool_client_id" {
  value       = module.cognito.user_pool_client_id
  description = "The Cognito User Pool Client ID"
}

output "s3_bucket_name" {
  value       = module.s3.bucket_name
  description = "The S3 bucket name for documents"
}
