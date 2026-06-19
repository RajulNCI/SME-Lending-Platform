output "queue_url" {
  value = aws_sqs_queue.processing.url
}

output "queue_arn" {
  value = aws_sqs_queue.processing.arn
}

output "dlq_arn" {
  value = aws_sqs_queue.processing_dlq.arn
}
