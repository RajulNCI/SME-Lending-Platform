terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

module "vpc" {
  source       = "../../modules/vpc"
  project_name = var.project_name
  environment  = var.environment
  vpc_cidr     = var.vpc_cidr
}

module "rds" {
  source             = "../../modules/rds"
  project_name       = var.project_name
  environment        = var.environment
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  db_password        = var.db_password
}

module "s3" {
  source       = "../../modules/s3"
  project_name = var.project_name
  environment  = var.environment
}

module "sqs" {
  source       = "../../modules/sqs"
  project_name = var.project_name
  environment  = var.environment
  lab_role_arn = data.aws_iam_role.lab_role.arn
}

module "cognito" {
  source       = "../../modules/cognito"
  project_name = var.project_name
  environment  = var.environment
}

module "ecs" {
  source             = "../../modules/ecs"
  project_name       = var.project_name
  environment        = var.environment
  aws_region         = var.aws_region
  vpc_id             = module.vpc.vpc_id
  public_subnet_ids  = module.vpc.public_subnet_ids
  private_subnet_ids = module.vpc.private_subnet_ids
  lab_role_arn       = data.aws_iam_role.lab_role.arn

  db_endpoint           = module.rds.db_endpoint
  db_name               = module.rds.db_name
  db_username           = "postgres"
  db_password           = var.db_password
  rds_security_group_id = module.rds.rds_security_group_id
}

module "lambda" {
  source             = "../../modules/lambda"
  project_name       = var.project_name
  environment        = var.environment
  aws_region         = var.aws_region
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  lab_role_arn       = data.aws_iam_role.lab_role.arn

  rds_security_group_id = module.rds.rds_security_group_id
  sqs_queue_arn         = module.sqs.queue_arn
  sqs_queue_url         = module.sqs.queue_url
  models_bucket_name    = module.s3.ai_models_bucket_name

  db_endpoint = module.rds.db_endpoint
  db_name     = module.rds.db_name
  db_username = "postgres"
  db_password = var.db_password
}

module "waf" {
  source       = "../../modules/waf"
  project_name = var.project_name
  environment  = var.environment
  alb_arn      = module.ecs.alb_arn
}
