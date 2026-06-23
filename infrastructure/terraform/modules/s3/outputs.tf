output "bucket_name" {
  value = aws_s3_bucket.documents.id
}

output "bucket_arn" {
  value = aws_s3_bucket.documents.arn
}

output "ai_models_bucket_name" {
  value = aws_s3_bucket.ai_models.id
}

output "ai_models_bucket_arn" {
  value = aws_s3_bucket.ai_models.arn
}
