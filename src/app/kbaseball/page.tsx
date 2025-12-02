"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";

// 타입 정의
interface Match {
  match_id: string | number;
  date: string;
  time: string;
  home_team: string;
  away_team: string;
  type: string;
}

export default function BaseballPage() {
  const [subMenu, setSubMenu] = useState("schedule");
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [alarmList, setAlarmList] = useState<string[]>([]);
  const [userId, setUserId] = useState<string>("");
  
  // ★ 추가: 오늘 날짜를 "YYYY-MM-DD" 모양으로 구하는 함수
  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // 오늘 날짜 저장 변수
  const [currentDate, setCurrentDate] = useState(getTodayString());

  // 1. 사용자 ID & 알람 목록 불러오기
  useEffect(() => {
    let storedId = localStorage.getItem("sports_user_id");
    if (!storedId) {
      storedId = crypto.randomUUID();
      localStorage.setItem("sports_user_id", storedId);
    }
    setUserId(storedId);

    // 내 알람 목록 가져오기
    async function fetchMyAlarms() {
      if (!storedId) return;
      try {
        const res = await fetch(`/api/alarm?userId=${storedId}`);
        const data = await res.json();
        if (data.matches) setAlarmList(data.matches);
      } catch (err) {
        console.error(err);
      }
    }
    fetchMyAlarms();
  }, []);

  // 2. 경기 데이터 가져오기 (날짜 동적 적용)
  useEffect(() => {
    async function fetchSchedule() {
      setLoading(true);
      try {
        // ★ 중요: currentDate 변수를 사용해서 API 호출
        console.log(`데이터 요청 날짜: ${currentDate}`);
        const res = await fetch(`/api/schedule?date=${currentDate}&type=baseball`);
        const data = await res.json();
        setMatches(data.matches || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (subMenu === "schedule") {
      fetchSchedule();
    }
  }, [subMenu, currentDate]); // 날짜가 바뀌면 다시 실행

  // 3. 알람 토글 함수
  const toggleAlarm = async (rawId: string | number) => {
    const id = String(rawId);
    const isCurrentlyOn = alarmList.includes(id);
    const action = isCurrentlyOn ? 'off' : 'on';

    setAlarmList((prev) => 
      isCurrentlyOn ? prev.filter(i => i !== id) : [...prev, id]
    );

    try {
      await fetch("/api/alarm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, matchId: id, action }),
      });
    } catch (e) { console.error(e); }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-gray-200 bg-white">
        <button onClick={() => setSubMenu("schedule")} className="flex-1 py-3 text-sm font-bold border-b-2 border-blue-600 text-blue-600">경기 일정</button>
        <button onClick={() => setSubMenu("ranking")} className="flex-1 py-3 text-sm text-gray-500">순위</button>
      </div>

      <div className="p-4 bg-gray-50 flex-1 min-h-screen">
        {subMenu === "schedule" && (
          <div className="space-y-4">
            {/* 상단에 오늘 날짜 표시 */}
            <h2 className="text-lg font-bold text-gray-800">
              📅 {currentDate} 경기
            </h2>
            
            {loading ? <p className="text-center py-10">로딩 중...</p> : matches.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <p>오늘 예정된 경기가 없습니다.</p>
                <p className="text-xs mt-2">(비시즌이거나 휴식일입니다)</p>
              </div>
            ) : (
              matches.map((match, index) => {
                const currentId = String(match.match_id);
                const isAlarmOn = alarmList.includes(currentId);
                return (
                  <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                    <div className="w-1/3 text-center font-bold text-lg text-gray-900 break-keep">{match.home_team}</div>
                    <div className="flex flex-col items-center">
                      <span className="text-lg font-bold text-blue-600">{match.time}</span>
                    </div>
                    <div className="w-1/3 text-center font-bold text-lg text-gray-900 break-keep">{match.away_team}</div>
                    <button 
                      onClick={() => toggleAlarm(match.match_id)}
                      style={{ backgroundColor: isAlarmOn ? '#2563EB' : '#F3F4F6', color: isAlarmOn ? 'white' : '#9CA3AF' }}
                      className="p-2 rounded-full transition-all shadow-sm"
                    >
                      <Bell className={`w-5 h-5 ${isAlarmOn ? "fill-white" : ""}`} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}
         {subMenu === "ranking" && (
          <div className="text-center py-10 text-gray-500">순위 정보 준비 중</div>
        )}
      </div>
    </div>
  );
}