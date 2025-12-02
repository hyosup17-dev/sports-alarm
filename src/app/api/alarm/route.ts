import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand, GetCommand } from "@aws-sdk/lib-dynamodb"; // ★ GetCommand 추가됨
import { NextResponse } from "next/server";

const client = new DynamoDBClient({
  region: "ap-northeast-2", // 또는 process.env.DB_REGION
  credentials: {
    accessKeyId: process.env.DB_ACCESS_KEY_ID!,        // ✅ 변경됨
    secretAccessKey: process.env.DB_SECRET_ACCESS_KEY!, // ✅ 변경됨
  },
});

const ddb = DynamoDBDocumentClient.from(client);

// 1. [GET] 내 알람 목록 가져오기 (불러오기)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) return NextResponse.json({ matches: [] });

  try {
    const command = new GetCommand({
      TableName: "SportsUsers",
      Key: { user_id: userId },
    });

    const result = await ddb.send(command);

    // DB에 데이터가 없거나, 구독한 게 없으면 빈 배열 반환
    if (!result.Item || !result.Item.subscribed_matches) {
      return NextResponse.json({ matches: [] });
    }

    // ★ 중요: DynamoDB의 Set 타입은 자바스크립트에서 바로 못 씀 -> 배열(Array)로 변환
    const matches = Array.from(result.Item.subscribed_matches);
    
    return NextResponse.json({ matches });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "불러오기 실패" }, { status: 500 });
  }
}

// 2. [POST] 알람 켜기/끄기 (저장하기 - 기존과 동일)
export async function POST(request: Request) {
  try {
    const { userId, matchId, action } = await request.json();

    if (!userId || !matchId) {
      return NextResponse.json({ error: "정보 부족" }, { status: 400 });
    }

    const command = new UpdateCommand({
      TableName: "SportsUsers",
      Key: { user_id: userId },
      UpdateExpression: action === 'on' 
        ? "ADD subscribed_matches :m"
        : "DELETE subscribed_matches :m",
      ExpressionAttributeValues: {
        ":m": new Set([String(matchId)]), // 무조건 문자열로 변환해서 저장
      },
    });

    await ddb.send(command);
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "저장 실패" }, { status: 500 });
  }
}