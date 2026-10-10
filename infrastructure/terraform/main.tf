terraform {
  required_version = ">= 1.5.0"
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

variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "aws_account_id" {
  type    = string
  default = "145023097151"
}

variable "lead_architect" {
  type    = string
  default = "Aaditya Uniyal"
}

variable "environment" {
  type    = string
  default = "prod"
}

# DynamoDB Table (Single-Table Design)
resource "aws_dynamodb_table" "cloudsentinel_table" {
  name         = "CloudSentinel-${var.environment}-Table"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "PK"
  range_key    = "SK"

  attribute {
    name = "PK"
    type = "S"
  }

  attribute {
    name = "SK"
    type = "S"
  }

  attribute {
    name = "GSI1PK"
    type = "S"
  }

  attribute {
    name = "GSI1SK"
    type = "S"
  }

  global_secondary_index {
    name            = "GSI1"
    hash_key        = "GSI1PK"
    range_key       = "GSI1SK"
    projection_type = "ALL"
  }

  point_in_time_recovery {
    enabled = true
  }

  server_side_encryption {
    enabled = true
  }

  tags = {
    Project     = "CloudSentinel-AI"
    AccountID   = var.aws_account_id
    Architect   = var.lead_architect
    Environment = var.environment
  }
}

# S3 Artifact Vault
resource "aws_s3_bucket" "cloudsentinel_vault" {
  bucket = "customer-pii-vault-${var.aws_account_id}"
}

resource "aws_s3_bucket_public_access_block" "vault_access" {
  bucket                  = aws_s3_bucket.cloudsentinel_vault.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "vault_crypto" {
  bucket = aws_s3_bucket.cloudsentinel_vault.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# SNS Alerts Topic
resource "aws_sns_topic" "alerts" {
  name = "CloudSentinel-${var.environment}-Alerts"
}

output "dynamodb_table_name" {
  value = aws_dynamodb_table.cloudsentinel_table.name
}

output "s3_bucket_name" {
  value = aws_s3_bucket.cloudsentinel_vault.id
}

output "sns_topic_arn" {
  value = aws_sns_topic.alerts.arn
}
