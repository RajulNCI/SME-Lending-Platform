variable "project_name" { type = string }
variable "environment" { type = string }
variable "alb_arn" {
  type        = string
  description = "ARN of the Application Load Balancer to attach WAF to"
}
