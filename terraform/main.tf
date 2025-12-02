# 1. AWS 공급자 설정 (서울 리전)
provider "aws" {
  region = "ap-northeast-2"
}

# =================================================================
# 1. 경기 일정 테이블 (SportsSchedules)
# =================================================================
resource "aws_dynamodb_table" "schedules" {
  name         = "SportsSchedules"       # 테이블 이름 (API 코드랑 일치해야 함!)
  billing_mode = "PAY_PER_REQUEST"       # 온디맨드 (쓴 만큼만 냄 - 초보자 추천)
  
  hash_key     = "date"                  # 파티션 키 (Partition Key)
  range_key    = "match_id"              # 정렬 키 (Sort Key)

  # 속성 정의 (키로 쓰는 것만 정의하면 됩니다)
  attribute {
    name = "date"
    type = "S"  # String (문자열)
  }

  attribute {
    name = "match_id"
    type = "S"  # String
  }

  tags = {
    Name        = "SportsSchedules"
    Environment = "Dev"
    Project     = "SportsAlarm"
  }
}

# =================================================================
# 2. 사용자 정보/토큰 테이블 (SportsUsers)
# =================================================================
resource "aws_dynamodb_table" "users" {
  name         = "SportsUsers"
  billing_mode = "PAY_PER_REQUEST"
  
  hash_key     = "user_id"               # 사용자 고유 ID (파티션 키)

  attribute {
    name = "user_id"
    type = "S"
  }

  tags = {
    Name        = "SportsUsers"
    Environment = "Dev"
    Project     = "SportsAlarm"
  }
}

# =================================================================
# AWS Amplify App (Next.js)
# =================================================================
resource "aws_amplify_app" "sports_alarm" {
  name       = "sports-alarm"
  repository = var.repository
  
  # GitHub 토큰 (OAuth 토큰)
  access_token = var.github_token

  # Next.js (App Router)를 위한 설정 ★중요
  platform = "WEB_COMPUTE"

  # 빌드 설정 (Next.js가 배포될 때 실행할 명령어)
  build_spec = <<-EOT
    version: 1
    frontend:
      phases:
        preBuild:
          commands:
            - npm ci
        build:
          commands:
            - npm run build
      artifacts:
        baseDirectory: .next
        files:
          - '**/*'
      cache:
        paths:
          - node_modules/**/*
  EOT

  # 환경 변수 설정 (DB 접속용 키)
  environment_variables = {
    "DB_ACCESS_KEY_ID"     = var.aws_access_key  # ✅ 이름 변경
    "DB_SECRET_ACCESS_KEY" = var.aws_secret_key  # ✅ 이름 변경
    "DB_REGION"            = var.region          # ✅ 이름 변경
    "NEXT_PUBLIC_API_URL"  = "/"
  }

  # 리액트/Next.js 라우팅을 위한 리다이렉트 규칙
  custom_rule {
    source = "/<*>"
    status = "404-200"
    target = "/index.html"
  }
}

# =================================================================
# Branch 연결 (Main 브랜치)
# =================================================================
resource "aws_amplify_branch" "main" {
  app_id      = aws_amplify_app.sports_alarm.id
  branch_name = "main"

  # 프레임워크 자동 감지
  framework = "Next.js - SSR"
  
  # 코드가 푸시되면 자동으로 빌드 시작
  enable_auto_build = true
}