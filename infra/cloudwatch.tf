# CloudWatch Log Groups for Application Logging
resource "aws_cloudwatch_log_group" "app_logs" {
  name              = "/canadagoose/${var.environment}/app"
  retention_in_days = 14

  tags = merge(local.tags, {
    Name = "${local.name_prefix}-app-logs"
  })
}

resource "aws_cloudwatch_log_group" "access_logs" {
  name              = "/canadagoose/${var.environment}/access"
  retention_in_days = 14

  tags = merge(local.tags, {
    Name = "${local.name_prefix}-access-logs"
  })
}

resource "aws_cloudwatch_log_group" "error_logs" {
  name              = "/canadagoose/${var.environment}/errors"
  retention_in_days = 30

  tags = merge(local.tags, {
    Name = "${local.name_prefix}-error-logs"
  })
}

resource "aws_cloudwatch_log_group" "database_logs" {
  name              = "/canadagoose/${var.environment}/database"
  retention_in_days = 14

  tags = merge(local.tags, {
    Name = "${local.name_prefix}-database-logs"
  })
}

# CloudWatch Dashboard for Application Monitoring
resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "${local.name_prefix}-dashboard"

  dashboard_body = jsonencode({
    widgets = [
      # EC2 Instance Metrics
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/EC2", "CPUUtilization", "InstanceId", aws_instance.app.id],
            [".", "NetworkIn", ".", "."],
            [".", "NetworkOut", ".", "."],
            [".", "DiskReadOps", ".", "."],
            [".", "DiskWriteOps", ".", "."]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "EC2 Instance Metrics"
        }
      },
      # RDS Database Metrics
      {
        type   = "metric"
        x      = 12
        y      = 0
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/RDS", "CPUUtilization", "DBInstanceIdentifier", aws_db_instance.main.id],
            [".", "DatabaseConnections", ".", "."],
            [".", "FreeableMemory", ".", "."],
            [".", "FreeStorageSpace", ".", "."]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "RDS Database Metrics"
        }
      },
      # Application Response Time (Custom Metric)
      {
        type   = "metric"
        x      = 0
        y      = 6
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["canadagoose/${var.environment}", "APIResponseTime", "Environment", var.environment],
            [".", "RequestCount", ".", "."],
            [".", "ErrorRate", ".", "."]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "Application Performance Metrics"
        }
      },
      # Error Rate Monitoring
      {
        type   = "metric"
        x      = 12
        y      = 6
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["canadagoose/${var.environment}", "ErrorRate", "Environment", var.environment],
            [".", "AuthenticationFailures", ".", "."],
            [".", "DatabaseErrors", ".", "."]
          ]
          period = 300
          stat   = "Sum"
          region = var.aws_region
          title  = "Error Rate Monitoring"
        }
      }
    ]
  })
}

# CloudWatch Alarms for Critical Metrics

# EC2 CPU Utilization Alarm
resource "aws_cloudwatch_metric_alarm" "ec2_cpu_high" {
  alarm_name          = "${local.name_prefix}-ec2-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "EC2 instance CPU utilization is high"
  alarm_actions       = []
  ok_actions          = []

  dimensions = {
    InstanceId = aws_instance.app.id
  }

  tags = local.tags
}

# EC2 Memory Alarm (using custom metric)
resource "aws_cloudwatch_metric_alarm" "ec2_memory_high" {
  alarm_name          = "${local.name_prefix}-ec2-memory-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "MemoryUtilization"
  namespace           = "canadagoose/${var.environment}"
  period              = 300
  statistic           = "Average"
  threshold           = 85
  alarm_description   = "EC2 instance memory utilization is high"
  alarm_actions       = []
  ok_actions          = []

  dimensions = {
    InstanceId = aws_instance.app.id
    Environment = var.environment
  }

  tags = local.tags
}

# RDS CPU Utilization Alarm
resource "aws_cloudwatch_metric_alarm" "rds_cpu_high" {
  alarm_name          = "${local.name_prefix}-rds-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "RDS instance CPU utilization is high"
  alarm_actions       = []
  ok_actions          = []

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.main.id
  }

  tags = local.tags
}

# RDS Free Storage Space Alarm
resource "aws_cloudwatch_metric_alarm" "rds_storage_low" {
  alarm_name          = "${local.name_prefix}-rds-storage-low"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 2
  metric_name         = "FreeStorageSpace"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 1000000000 # 1GB in bytes
  alarm_description   = "RDS instance free storage space is low"
  alarm_actions       = []
  ok_actions          = []

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.main.id
  }

  tags = local.tags
}

# Application Error Rate Alarm
resource "aws_cloudwatch_metric_alarm" "app_error_rate_high" {
  alarm_name          = "${local.name_prefix}-app-error-rate-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "ErrorRate"
  namespace           = "canadagoose/${var.environment}"
  period              = 300
  statistic           = "Sum"
  threshold           = 10
  alarm_description   = "Application error rate is high"
  alarm_actions       = []
  ok_actions          = []

  dimensions = {
    Environment = var.environment
  }

  tags = local.tags
}

# API Response Time Alarm
resource "aws_cloudwatch_metric_alarm" "api_response_time_slow" {
  alarm_name          = "${local.name_prefix}-api-response-time-slow"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "APIResponseTime"
  namespace           = "canadagoose/${var.environment}"
  period              = 300
  statistic           = "Average"
  threshold           = 2000 # 2 seconds in milliseconds
  alarm_description   = "API response time is slow"
  alarm_actions       = []
  ok_actions          = []

  dimensions = {
    Environment = var.environment
  }

  tags = local.tags
}

# CloudWatch Log Metric Filters

# Error Log Filter
resource "aws_cloudwatch_log_metric_filter" "error_count" {
  name           = "${local.name_prefix}-error-count"
  pattern        = "[timestamp, level=ERROR, ...]"
  log_group_name = aws_cloudwatch_log_group.error_logs.name

  metric_transformation {
    name          = "ErrorCount"
    namespace     = "canadagoose/${var.environment}"
    value         = "1"
    default_value = "0"
  }
}

# Authentication Failure Filter
resource "aws_cloudwatch_log_metric_filter" "auth_failures" {
  name           = "${local.name_prefix}-auth-failures"
  pattern        = "[timestamp, level=ERROR, message=*authentication*failed*, ...]"
  log_group_name = aws_cloudwatch_log_group.error_logs.name

  metric_transformation {
    name          = "AuthenticationFailures"
    namespace     = "canadagoose/${var.environment}"
    value         = "1"
    default_value = "0"
  }
}

# Database Error Filter
resource "aws_cloudwatch_log_metric_filter" "database_errors" {
  name           = "${local.name_prefix}-database-errors"
  pattern        = "[timestamp, level=ERROR, message=*database*error*, ...]"
  log_group_name = aws_cloudwatch_log_group.error_logs.name

  metric_transformation {
    name          = "DatabaseErrors"
    namespace     = "canadagoose/${var.environment}"
    value         = "1"
    default_value = "0"
  }
}

# API Request Count Filter
resource "aws_cloudwatch_log_metric_filter" "api_requests" {
  name           = "${local.name_prefix}-api-requests"
  pattern        = "[timestamp, method, path, status_code, response_time, ...]"
  log_group_name = aws_cloudwatch_log_group.access_logs.name

  metric_transformation {
    name          = "RequestCount"
    namespace     = "canadagoose/${var.environment}"
    value         = "1"
    default_value = "0"
  }
}

# API Response Time Filter
resource "aws_cloudwatch_log_metric_filter" "api_response_time" {
  name           = "${local.name_prefix}-api-response-time"
  pattern        = "[timestamp, method, path, status_code, response_time, ...]"
  log_group_name = aws_cloudwatch_log_group.access_logs.name

  metric_transformation {
    name          = "APIResponseTime"
    namespace     = "canadagoose/${var.environment}"
    value         = "$response_time"
    default_value = "0"
  }
}

# Outputs for CloudWatch Resources
output "cloudwatch_log_groups" {
  description = "CloudWatch Log Group ARNs"
  value = {
    app_logs      = aws_cloudwatch_log_group.app_logs.arn
    access_logs   = aws_cloudwatch_log_group.access_logs.arn
    error_logs    = aws_cloudwatch_log_group.error_logs.arn
    database_logs = aws_cloudwatch_log_group.database_logs.arn
  }
}

output "cloudwatch_dashboard_url" {
  description = "CloudWatch Dashboard URL"
  value       = "https://${var.aws_region}.console.aws.amazon.com/cloudwatch/home?region=${var.aws_region}#dashboards:name=${aws_cloudwatch_dashboard.main.dashboard_name}"
} 