output "alb_dns_name" {
  value = aws_lb.main.dns_name
}

output "alb_arn" {
  value = aws_lb.main.arn
}

output "ecs_security_group_id" {
  value = aws_security_group.ecs_sg.id
}

output "ecr_web_url" {
  value = aws_ecr_repository.web.repository_url
}

output "ecr_api_url" {
  value = aws_ecr_repository.api.repository_url
}
