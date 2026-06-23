output "function_name" {
  value = aws_lambda_function.processing_worker.function_name
}

output "function_arn" {
  value = aws_lambda_function.processing_worker.arn
}

output "ecr_repository_url" {
  value = aws_ecr_repository.processing_worker.repository_url
}
