resource "aws_sqs_queue" "processing_dlq" {
  name                      = "${var.project_name}-processing-dlq-${var.environment}"
  message_retention_seconds = 1209600 # 14 days

  tags = {
    Name        = "${var.project_name}-processing-dlq-${var.environment}"
    Environment = var.environment
  }
}

resource "aws_sqs_queue" "processing" {
  name                       = "${var.project_name}-processing-${var.environment}"
  visibility_timeout_seconds = 300 # Must be >= Lambda timeout
  message_retention_seconds  = 86400
  receive_wait_time_seconds  = 20 # Long polling

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.processing_dlq.arn
    maxReceiveCount     = 3
  })

  tags = {
    Name        = "${var.project_name}-processing-${var.environment}"
    Environment = var.environment
  }
}

resource "aws_sqs_queue_policy" "processing" {
  queue_url = aws_sqs_queue.processing.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = { AWS = var.lab_role_arn }
        Action    = ["sqs:SendMessage", "sqs:ReceiveMessage", "sqs:DeleteMessage", "sqs:GetQueueAttributes"]
        Resource  = aws_sqs_queue.processing.arn
      }
    ]
  })
}
