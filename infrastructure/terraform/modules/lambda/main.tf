resource "aws_security_group" "lambda_sg" {
  name        = "${var.project_name}-lambda-sg-${var.environment}"
  description = "Security group for Lambda processing worker"
  vpc_id      = var.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.project_name}-lambda-sg-${var.environment}"
    Environment = var.environment
  }
}

# Allow Lambda to receive from SQS inbound on RDS port
resource "aws_security_group_rule" "lambda_to_rds" {
  type                     = "ingress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.lambda_sg.id
  security_group_id        = var.rds_security_group_id
  description              = "Allow Lambda to connect to RDS"
}

# ECR repository to store the Lambda Docker image
resource "aws_ecr_repository" "processing_worker" {
  name                 = "${var.project_name}-processing-worker-${var.environment}"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name        = "${var.project_name}-processing-worker-${var.environment}"
    Environment = var.environment
  }
}

resource "aws_ecr_lifecycle_policy" "processing_worker" {
  repository = aws_ecr_repository.processing_worker.name

  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep last 5 images"
      selection = {
        tagStatus   = "any"
        countType   = "imageCountMoreThan"
        countNumber = 5
      }
      action = { type = "expire" }
    }]
  })
}

# Lambda function (Docker image)
# NOTE: Deploy this after pushing the Docker image to ECR:
#   docker build -f Dockerfile.lambda -t <ecr_url>:latest .
#   docker push <ecr_url>:latest
#   terraform apply   (then this resource will succeed)
resource "aws_lambda_function" "processing_worker" {
  function_name = "${var.project_name}-processing-worker-${var.environment}"
  role          = var.lab_role_arn
  package_type  = "Image"

  # Image URI — populated after first docker push (placeholder until then)
  image_uri = "${aws_ecr_repository.processing_worker.repository_url}:latest"

  timeout     = 300 # 5 minutes — enough for OCR + LightGBM inference
  memory_size = 1024

  vpc_config {
    subnet_ids         = var.private_subnet_ids
    security_group_ids = [aws_security_group.lambda_sg.id]
  }

  environment {
    variables = {
      DB_HOST          = var.db_endpoint
      DB_NAME          = var.db_name
      DB_USER          = var.db_username
      DB_PASSWORD      = var.db_password
      S3_MODELS_BUCKET = var.models_bucket_name
      SQS_QUEUE_URL    = var.sqs_queue_url
      ENVIRONMENT      = var.environment
    }
  }

  tags = {
    Name        = "${var.project_name}-processing-worker-${var.environment}"
    Environment = var.environment
  }

  # Lambda can only be created after an image is pushed — skip if ECR empty
  lifecycle {
    ignore_changes = [image_uri]
  }
}

# SQS → Lambda event source mapping
resource "aws_lambda_event_source_mapping" "sqs_trigger" {
  event_source_arn                   = var.sqs_queue_arn
  function_name                      = aws_lambda_function.processing_worker.arn
  batch_size                         = 1 # Process one application at a time
  maximum_batching_window_in_seconds = 0
  enabled                            = true
}
