# ⚾ Sports Alarm Service (Serverless Ver.)

"내가 응원하는 팀의 경기 시작 10분 전, 푸시 알림을 보내주는 개인화 PWA 서비스"

# 📖 Project Overview (개요)

이 프로젝트는 **"서버 관리 없는(Serverless) 완전 자동화 시스템"**을 목표로 구축되었습니다.
사용자가 별도의 회원가입 없이 응원 팀을 설정하면, AWS Lambda와 EventBridge가 매일 자동으로 데이터를 수집하고 경기 직전에 알림을 발송합니다. 모든 인프라는 Terraform을 통해 코드로 관리됩니다.

# 🏗️ Architecture (아키텍처)

AWS Managed Service를 적극 활용하여 유지보수 비용을 최소화하고 안정성을 높였습니다.

![Architecture](./architecture_v1.png)

# 🛠️ Tech Stack (기술 스택)

Frontend

Next.js: 웹 프레임워크 (App Router 사용)

TypeScript: 프로그래밍 언어

Tailwind CSS: 스타일링 도구

비고: PWA 적용, 모바일 최적화

Backend

Python: 크롤러 및 알림 봇 로직 작성 언어

AWS Lambda: 서버리스 컴퓨팅 (크롤러, 알림 봇 실행)

AWS EventBridge: 스케줄러 (자동 실행 트리거)

Database

Amazon DynamoDB: NoSQL 데이터베이스 (경기 일정 및 유저 정보 저장)

Infra & DevOps

Terraform: 인프라 코드 관리 (IaC)

AWS Amplify: 프론트엔드 호스팅 및 자동 배포

Notification

Firebase Cloud Messaging (FCM): 웹 푸시 알림 전송

# 🔥 Key Features (핵심 기능)

개인화된 구독 시스템 (No Login):

- 복잡한 회원가입 절차 없이 UUID와 localStorage를 활용하여 사용자를 식별합니다.

- "내 응원팀"을 설정하면 해당 팀의 모든 경기를 자동으로 구독합니다.

완전 자동화된 데이터 파이프라인:

- 수집: 매일 새벽 4시, Crawler Lambda가 네이버 스포츠에서 당일 경기 일정을 수집합니다.

- 알림: 매분마다 Notifier Lambda가 실행되어 경기 시작 10분 전인 경기를 감지하고 알림을 발송합니다.

Serverless & Cost Effective:

- 서버를 24시간 켜두지 않고, 코드가 실행되는 시간(밀리초)에만 과금되는 Lambda를 사용하여 비용을 0원(Free Tier)에 가깝게 유지했습니다.

PWA (Progressive Web App):

- 모바일 브라우저에서 '홈 화면에 추가'를 통해 네이티브 앱과 유사한 UX를 제공합니다.

# 🚀 Trouble Shooting (트러블 슈팅)

이슈: Firebase FCM V1 API 마이그레이션 중 권한(Permission Denied) 오류 발생.

해결: Google Cloud Console에서 서비스 계정(Service Account)에 Firebase Cloud Messaging API Admin 권한을 명시적으로 부여하여 해결.

이슈: 로컬 환경과 배포 환경(Amplify)의 환경변수 키 이름 충돌(AWS_ 접두사 예약어 문제).

해결: Terraform 변수명 및 Next.js 환경 변수를 DB_ 접두사로 변경하여 예약어 충돌 방지.

이슈: DynamoDB Scan 비용 최적화 문제.

해결: 알림 발송 시 전체 데이터를 스캔하는 대신, Global Secondary Index(GSI) 또는 쿼리 필터링을 최적화하여 읽기 비용 감소 (추후 적용 예정).

# 🏃 How to Run (실행 방법)

이 프로젝트는 Terraform을 통해 AWS 리소스를 생성합니다.

1. Prerequisites

AWS CLI 설치 및 자격 증명 설정 (aws configure)

Terraform 설치

Firebase 프로젝트 생성 및 serviceAccountKey.json 준비

2. Infrastructure Setup

cd terraform

3. Frontend Development

npm install
npm run dev

# 1. 초기화
terraform init

# 2. 변수 설정 (terraform.tfvars 파일 생성 필요)
aws_access_key = "..."
aws_secret_key = "..."

# 3. 리소스 생성
terraform apply
