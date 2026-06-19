resource "aws_cognito_user_pool" "main" {
  name = "${var.project_name}-user-pool-${var.environment}"

  # Email is the primary identifier — borrowers use company email (e.g. john@acmeltd.ie)
  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  password_policy {
    minimum_length                   = 10
    require_lowercase                = true
    require_numbers                  = true
    require_symbols                  = true
    require_uppercase                = true
    temporary_password_validity_days = 7
  }

  # Self-signup disabled — borrowers are invited by CO or register via the app
  admin_create_user_config {
    allow_admin_create_user_only = false
  }

  # Capture company domain at signup so email looks like firstname@company.ie
  schema {
    name                     = "company_name"
    attribute_data_type      = "String"
    mutable                  = true
    required                 = false
    string_attribute_constraints {
      min_length = 2
      max_length = 100
    }
  }

  schema {
    name                     = "role"
    attribute_data_type      = "String"
    mutable                  = true
    required                 = false
    string_attribute_constraints {
      min_length = 2
      max_length = 50
    }
  }

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  tags = {
    Name        = "${var.project_name}-user-pool-${var.environment}"
    Environment = var.environment
  }
}

resource "aws_cognito_user_pool_client" "web" {
  name         = "${var.project_name}-web-client-${var.environment}"
  user_pool_id = aws_cognito_user_pool.main.id

  generate_secret = false

  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH"
  ]

  # Token validity
  access_token_validity  = 8   # hours
  id_token_validity      = 8
  refresh_token_validity = 30  # days

  token_validity_units {
    access_token  = "hours"
    id_token      = "hours"
    refresh_token = "days"
  }

  # Read the custom attributes in the ID token
  read_attributes = [
    "email",
    "email_verified",
    "name",
    "custom:company_name",
    "custom:role"
  ]

  write_attributes = [
    "email",
    "name",
    "custom:company_name",
    "custom:role"
  ]
}

# ── RBAC Groups ────────────────────────────────────────────────────────────────

resource "aws_cognito_user_group" "borrower" {
  name         = "Borrower"
  user_pool_id = aws_cognito_user_pool.main.id
  description  = "SME borrowers — apply for loans, upload documents, track status"
  precedence   = 10
}

resource "aws_cognito_user_group" "credit_officer" {
  name         = "CreditOfficer"
  user_pool_id = aws_cognito_user_pool.main.id
  description  = "Credit officers — review applications, make HITL decisions"
  precedence   = 20
}

resource "aws_cognito_user_group" "risk_manager" {
  name         = "RiskManager"
  user_pool_id = aws_cognito_user_pool.main.id
  description  = "Risk managers — stress testing, EWI monitoring, risk models"
  precedence   = 30
}

resource "aws_cognito_user_group" "compliance_officer" {
  name         = "ComplianceOfficer"
  user_pool_id = aws_cognito_user_pool.main.id
  description  = "Compliance officers — audit trail, GDPR evidence bundles, AML"
  precedence   = 30
}

resource "aws_cognito_user_group" "mrm_analyst" {
  name         = "MRMAnalyst"
  user_pool_id = aws_cognito_user_pool.main.id
  description  = "Model Risk Management — PSI drift monitoring, model validation"
  precedence   = 35
}

resource "aws_cognito_user_group" "ops_manager" {
  name         = "OpsManager"
  user_pool_id = aws_cognito_user_pool.main.id
  description  = "Operations managers — platform dashboard, SLA, payments"
  precedence   = 40
}

resource "aws_cognito_user_group" "collections_officer" {
  name         = "CollectionsOfficer"
  user_pool_id = aws_cognito_user_pool.main.id
  description  = "Collections officers — arrears management, bureau reporting"
  precedence   = 40
}

resource "aws_cognito_user_group" "admin" {
  name         = "Admin"
  user_pool_id = aws_cognito_user_pool.main.id
  description  = "Platform administrators — user management, system config"
  precedence   = 50
}
