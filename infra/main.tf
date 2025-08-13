# Data sources
data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }
}

# Deterministic naming - no random values that change between runs
locals {
  # Create a stable, deterministic suffix based on project and environment
  # This ensures the same names every time, but still unique per project/env
  stable_suffix = substr(md5("${var.project_name}-${var.environment}-${var.aws_region}"), 0, 8)

  # Resource names that are stable and predictable
  s3_bucket_name = "${var.s3_bucket}-${var.environment}-${local.stable_suffix}"
  secret_name    = "${local.name_prefix}-app-secrets-${local.stable_suffix}"
}

# S3 bucket for server scripts - deterministic naming
resource "aws_s3_bucket" "scripts" {
  bucket = local.s3_bucket_name

  tags = merge(local.tags, {
    Name = "${local.name_prefix}-scripts-bucket"
  })

  # TEMPORARILY DISABLED for migration to deterministic naming
  # TODO: Re-enable after migration is complete
  # lifecycle {
  #   prevent_destroy = true
  # }
}

# S3 bucket versioning
resource "aws_s3_bucket_versioning" "scripts" {
  bucket = aws_s3_bucket.scripts.id
  versioning_configuration {
    status = "Enabled"
  }
}

# S3 bucket public access block
resource "aws_s3_bucket_public_access_block" "scripts" {
  bucket = aws_s3_bucket.scripts.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# S3 bucket server-side encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "scripts" {
  bucket = aws_s3_bucket.scripts.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# S3 bucket ownership controls
resource "aws_s3_bucket_ownership_controls" "scripts" {
  bucket = aws_s3_bucket.scripts.id

  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

# S3 bucket ACL
resource "aws_s3_bucket_acl" "scripts" {
  depends_on = [aws_s3_bucket_ownership_controls.scripts]

  bucket = aws_s3_bucket.scripts.id
  acl    = "private"
}

# S3 bucket policy for EC2 access
resource "aws_s3_bucket_policy" "scripts" {
  bucket = aws_s3_bucket.scripts.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowEC2Access"
        Effect = "Allow"
        Principal = {
          AWS = aws_iam_role.ec2_role.arn
        }
        Action = [
          "s3:GetObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.scripts.arn,
          "${aws_s3_bucket.scripts.arn}/*"
        ]
      }
    ]
  })
}

# VPC and Networking
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = merge(local.tags, {
    Name = "${local.name_prefix}-vpc"
  })
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = merge(local.tags, {
    Name = "${local.name_prefix}-igw"
  })
}

resource "aws_subnet" "public" {
  count             = length(var.public_subnet_cidrs)
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.public_subnet_cidrs[count.index]
  availability_zone = data.aws_availability_zones.available.names[count.index]

  map_public_ip_on_launch = true

  tags = merge(local.tags, {
    Name = "${local.name_prefix}-public-subnet-${count.index + 1}"
  })
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = merge(local.tags, {
    Name = "${local.name_prefix}-public-rt"
  })
}

resource "aws_route_table_association" "public" {
  count          = length(var.public_subnet_cidrs)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# Security Groups
resource "aws_security_group" "api" {
  name_prefix = "${local.name_prefix}-api-sg"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP from internet"
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS from internet"
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "SSH from internet"
  }

  # Allow ICMP (ping) for troubleshooting
  ingress {
    from_port   = -1
    to_port     = -1
    protocol    = "icmp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "ICMP (ping) from internet"
  }

  # Allow port 3000 for Node.js app
  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Node.js app port"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "All outbound traffic"
  }

  tags = merge(local.tags, {
    Name = "${local.name_prefix}-api-sg"
  })
}

resource "aws_security_group" "rds" {
  name_prefix = "${local.name_prefix}-rds-sg"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.api.id]
    description     = "MySQL from API security group"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "All outbound traffic"
  }

  tags = merge(local.tags, {
    Name = "${local.name_prefix}-rds-sg"
  })
}

# RDS Subnet Group
resource "aws_db_subnet_group" "main" {
  name       = "${local.name_prefix}-db-subnet-group"
  subnet_ids = aws_subnet.public[*].id

  tags = local.tags
}

# RDS MySQL Instance
resource "aws_db_instance" "main" {
  identifier = "${local.name_prefix}-db"

  engine         = "mysql"
  engine_version = "8.0"
  instance_class = var.db_instance_class

  allocated_storage = var.db_allocated_storage
  storage_type      = "gp2"
  storage_encrypted = true

  db_name  = var.db_name
  username = var.db_user
  password = local.final_db_password

  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name

  multi_az            = false
  publicly_accessible = false
  skip_final_snapshot = true
  deletion_protection = false # Demo setting - enable for production

  backup_retention_period = 7
  backup_window           = "03:00-04:00"
  maintenance_window      = "sun:04:00-sun:05:00"

  tags = local.tags

  # Prevent replacement unless absolutely necessary
  lifecycle {
    ignore_changes = [
      password, # Ignore password changes to prevent replacement
      final_snapshot_identifier,
      snapshot_identifier
    ]
  }
}

# Deterministic secrets - same values every time for the same project/env
locals {
  # Generate deterministic but secure secrets based on project/environment
  # These will be the same every time for the same configuration
  db_password = substr(md5("${var.project_name}-${var.environment}-db-password-${var.db_name}"), 0, 16)
  jwt_secret  = substr(md5("${var.project_name}-${var.environment}-jwt-secret-${var.domain_host}"), 0, 32)

  # Allow external secret override for production use
  # Set these in terraform.tfvars if you want to use external secrets
  final_db_password = var.external_db_password != "" ? var.external_db_password : local.db_password
  final_jwt_secret  = var.external_jwt_secret != "" ? var.external_jwt_secret : local.jwt_secret
}

# Secrets Manager - Create new secret with unique name to avoid conflicts
resource "aws_secretsmanager_secret" "app_secrets" {
  name = local.secret_name
  tags = local.tags

  # TEMPORARILY DISABLED for migration to deterministic naming
  # TODO: Re-enable after migration is complete
  # lifecycle {
  #   prevent_destroy = true
  # }
}

locals {
  secret_id  = aws_secretsmanager_secret.app_secrets.id
  secret_arn = aws_secretsmanager_secret.app_secrets.arn
}

resource "aws_secretsmanager_secret_version" "app_secrets" {
  secret_id = local.secret_id
  secret_string = jsonencode({
    DB_HOST     = aws_db_instance.main.endpoint
    DB_PORT     = aws_db_instance.main.port
    DB_NAME     = aws_db_instance.main.db_name
    DB_USER     = aws_db_instance.main.username
    DB_PASSWORD = aws_db_instance.main.password
    JWT_SECRET  = local.final_jwt_secret
  })
}

# IAM Role for EC2
resource "aws_iam_role" "ec2_role" {
  name = "${local.name_prefix}-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = local.tags
}

resource "aws_iam_role_policy" "ec2_secrets_policy" {
  name = "${local.name_prefix}-ec2-secrets-policy"
  role = aws_iam_role.ec2_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = local.secret_arn
      },
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.scripts.arn,
          "${aws_s3_bucket.scripts.arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "cloudwatch:PutMetricData",
          "cloudwatch:GetMetricData",
          "cloudwatch:ListMetrics",
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogGroups",
          "logs:DescribeLogStreams"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_instance_profile" "ec2_profile" {
  name = "${local.name_prefix}-ec2-profile"
  role = aws_iam_role.ec2_role.name
}

# EC2 Instance
resource "aws_instance" "app" {
  ami                    = data.aws_ami.amazon_linux.id
  instance_type          = var.instance_type
  key_name               = aws_key_pair.app.key_name
  vpc_security_group_ids = [aws_security_group.api.id]
  subnet_id              = aws_subnet.public[0].id
  iam_instance_profile   = aws_iam_instance_profile.ec2_profile.name

  user_data = base64encode(templatefile("${path.module}/user_data.sh", {
    domain_host = var.domain_host
    secret_arn  = local.secret_arn
    port        = "3000"
    s3_bucket   = aws_s3_bucket.scripts.bucket
    aws_region  = var.aws_region
  }))

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
    encrypted   = true
  }

  tags = merge(local.tags, {
    Name = "${local.name_prefix}-app-server"
  })

  # Prevent replacement unless absolutely necessary
  lifecycle {
    ignore_changes = [
      ami,      # Ignore AMI changes to prevent replacement
      user_data # Ignore user_data changes to prevent replacement
    ]
  }
}

# Key Pair for SSH access
resource "aws_key_pair" "app" {
  key_name   = "${local.name_prefix}-key"
  public_key = file("${path.module}/ssh_key.pub")

  tags = local.tags
}

# Elastic IP for the EC2 instance
resource "aws_eip" "app" {
  instance = aws_instance.app.id
  domain   = "vpc"

  tags = merge(local.tags, {
    Name = "${local.name_prefix}-app-eip"
  })
} 