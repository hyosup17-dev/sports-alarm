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