locals {
  project     = var.project_name
  environment = var.environment
  name_prefix = "${local.project}-${local.environment}"

  tags = merge({
    Project     = local.project
    Environment = local.environment
    ManagedBy   = "terraform"
    Owner       = "devops"
    CostCenter  = "engineering"
  }, var.extra_tags)
} 