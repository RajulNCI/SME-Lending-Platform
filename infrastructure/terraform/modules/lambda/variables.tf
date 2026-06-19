variable "project_name" { type = string }
variable "environment" { type = string }
variable "aws_region" { type = string }
variable "vpc_id" { type = string }
variable "private_subnet_ids" { type = list(string) }
variable "lab_role_arn" { type = string }
variable "rds_security_group_id" { type = string }
variable "sqs_queue_arn" { type = string }
variable "sqs_queue_url" { type = string }
variable "models_bucket_name" { type = string }
variable "db_endpoint" { type = string }
variable "db_name" { type = string }
variable "db_username" { type = string }
variable "db_password" {
  type      = string
  sensitive = true
}
