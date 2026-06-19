# ── Borrower documents bucket ──────────────────────────────────────────────────
resource "aws_s3_bucket" "documents" {
  bucket = "${var.project_name}-documents-${var.environment}"

  tags = {
    Name        = "${var.project_name}-documents-${var.environment}"
    Environment = var.environment
  }
}

resource "aws_s3_bucket_public_access_block" "documents" {
  bucket = aws_s3_bucket.documents.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "documents" {
  bucket = aws_s3_bucket.documents.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_versioning" "documents" {
  bucket = aws_s3_bucket.documents.id
  versioning_configuration { status = "Enabled" }
}

# ── AI model artifacts bucket ──────────────────────────────────────────────────
# Stores finpal_extractor.joblib and finpal_pd_model.joblib
resource "aws_s3_bucket" "ai_models" {
  bucket = "${var.project_name}-ai-models-${var.environment}"

  tags = {
    Name        = "${var.project_name}-ai-models-${var.environment}"
    Environment = var.environment
  }
}

resource "aws_s3_bucket_public_access_block" "ai_models" {
  bucket = aws_s3_bucket.ai_models.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "ai_models" {
  bucket = aws_s3_bucket.ai_models.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_versioning" "ai_models" {
  bucket = aws_s3_bucket.ai_models.id
  versioning_configuration { status = "Enabled" }
}
