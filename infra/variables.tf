variable "project_name" {
  type        = string
  description = "Short project name (e.g., canadagoose)."
  default     = "canadagoose"
}

variable "aws_region" {
  type        = string
  description = "AWS region for all resources."
  default     = "us-east-1"
}

variable "db_name" {
  type        = string
  description = "Database name for the RDS instance."
  default     = "webapp_db"
}

variable "db_user" {
  type        = string
  description = "Database username for the RDS instance."
  default     = "webapp_user"
}

variable "domain_host" {
  type        = string
  description = "Domain host for the application (e.g., s25cicd.xiaopotato.top)."
  default     = "s25cicd.xiaopotato.top"
}

variable "environment" {
  type        = string
  description = "Environment name (dev|staging|prod)."
  default     = "dev"
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod."
  }
}

variable "vpc_cidr" {
  type        = string
  description = "VPC CIDR block."
  default     = "10.0.0.0/16"
  validation {
    condition     = can(regex("^\\d+\\.\\d+\\.\\d+\\.\\d+/\\d+$", var.vpc_cidr))
    error_message = "vpc_cidr must be a valid IPv4 CIDR."
  }
}

variable "public_subnet_cidrs" {
  type        = list(string)
  description = "CIDR blocks for public subnets."
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
  validation {
    condition = alltrue([
      for cidr in var.public_subnet_cidrs : can(regex("^\\d+\\.\\d+\\.\\d+\\.\\d+/\\d+$", cidr))
    ])
    error_message = "All public_subnet_cidrs must be valid IPv4 CIDRs."
  }
}

variable "instance_type" {
  type        = string
  description = "EC2 instance type."
  default     = "t3.micro"
}

variable "db_instance_class" {
  type        = string
  description = "RDS instance class."
  default     = "db.t3.micro"
}

variable "db_allocated_storage" {
  type        = number
  description = "RDS allocated storage in GB."
  default     = 20
  validation {
    condition     = var.db_allocated_storage >= 20 && var.db_allocated_storage <= 1000
    error_message = "db_allocated_storage must be between 20 and 1000 GB."
  }
}

variable "extra_tags" {
  type        = map(string)
  description = "Additional tags for all resources."
  default     = {}
}

variable "s3_bucket" {
  type        = string
  description = "S3 bucket name for storing server scripts and other assets."
  default     = "canadagoose-scripts"
}

variable "preserve_existing_resources" {
  type        = bool
  description = "If true, will try to preserve existing resources and prevent replacement. Set to false only when you want to recreate resources."
  default     = true
}

variable "force_resource_recreation" {
  type        = bool
  description = "WARNING: If true, will force recreation of all resources. This will cause data loss!"
  default     = false
  validation {
    condition     = !var.force_resource_recreation || !var.preserve_existing_resources
    error_message = "Cannot force resource recreation while preserving existing resources. Set preserve_existing_resources = false first."
  }
}

variable "external_db_password" {
  type        = string
  description = "External database password. If provided, will override the deterministic password. Leave empty to use deterministic password."
  default     = ""
  sensitive   = true
}

variable "external_jwt_secret" {
  type        = string
  description = "External JWT secret. If provided, will override the deterministic JWT secret. Leave empty to use deterministic secret."
  default     = ""
  sensitive   = true
} 