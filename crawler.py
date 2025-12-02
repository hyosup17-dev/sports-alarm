import requests
import boto3
from datetime import datetime
import json
import os

# ==========================================
# 1. 내 AWS 정보 입력 (여기에 본인 키를 넣으세요!)
# ==========================================
AWS_ACCESS_KEY = ""
AWS_SECRET_KEY = ""
REGION = "ap-northeast-2"

# DynamoDB 연결
try:
    dynamodb = boto3.resource(
        'dynamodb',
        region_name=REGION,
        aws_access_key_id=AWS_ACCESS_KEY,
        aws_secret_access_key=AWS_SECRET_KEY
    )
    table = dynamodb.Table('SportsSchedules')
    print("✅ AWS DynamoDB 연결 성공!")
except Exception as e:
    print(f"❌ AWS 연결 실패: {e}")
    exit()

# ==========================================
# 2. 데이터 수집 함수 (네이버 모바일 API 사용)
# ==========================================
def collect_schedule(sport_type):
    # 오늘 날짜 (YYYYMMDD)
    today = datetime.now().strftime("%Y%m%d")
    date_formatted = datetime.now().strftime("%Y-%m-%d") # DB 저장용 (2025-04-02)

    # category: kbo(야구), kleague(축구)
    category = "kbo" if sport_type == "baseball" else "kleague"
    
    # 네이버가 실제로 쓰는 '숨겨진' API 주소
    api_url = f"https://m.sports.naver.com/{category}/schedule/index.json?date={today}"
    
    headers = {'User-Agent': 'Mozilla/5.0'} # 봇 아닌 척 위장

    try:
        print(f"\n📡 [{sport_type}] 데이터 요청 중... ({today})")
        response = requests.get(api_url, headers=headers)
        data = response.json()
        
        # 경기 리스트 추출
        game_list = data.get('scheduleList', [])
        
        if not game_list:
            print(f"   👉 오늘은 {sport_type} 경기가 없습니다.")
            return

        print(f"   👉 총 {len(game_list)}개의 경기 발견! DB 저장을 시작합니다.")

        for game in game_list:
            # 데이터 추출
            home_team = game.get('homeTeamName', '')
            away_team = game.get('awayTeamName', '')
            state = game.get('gameStatus', '') # 'BEFORE', 'RESULT' 등
            game_time = game.get('gameStartTime', '00:00')
            
            # 경기 취소된 경우 제외 (CANCELED 등)
            if state == 'CANCELED':
                print(f"   ⚠️ 취소된 경기 제외: {home_team} vs {away_team}")
                continue

            # DB에 넣을 데이터 뭉치
            item = {
                'date': date_formatted,       # 파티션 키
                'match_id': f"{sport_type}_{date_formatted}_{home_team}", # 정렬 키 (고유값)
                'home_team': home_team,
                'away_team': away_team,
                'time': game_time,
                'type': sport_type
            }

            # DynamoDB 저장
            table.put_item(Item=item)
            print(f"   💾 [저장완료] {game_time} {home_team} vs {away_team}")

    except Exception as e:
        print(f"❌ 에러 발생: {e}")

# ==========================================
# 실행
# ==========================================
if __name__ == "__main__":
    collect_schedule("baseball") # 야구 수집
    collect_schedule("soccer")   # 축구 수집