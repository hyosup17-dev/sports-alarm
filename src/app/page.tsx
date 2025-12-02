export default function HomePage() {
  return (
    <div>
      {/* 2차 메뉴 (서브 레이아웃) - 홈은 메뉴가 하나뿐 */}
      <div className="flex border-b border-gray-100 bg-white">
        <div className="flex-1 py-3 text-center text-sm font-bold text-blue-600 border-b-2 border-blue-600">
          경기 일정
        </div>
      </div>

      {/* 내용 영역 */}
      <div className="p-4 bg-gray-50 min-h-[500px]">
        <p className="text-gray-500 text-center mt-10">
          (홈) 오늘의 전체 경기 일정이 여기에 표시됩니다.
        </p>
      </div>
    </div>
  );
}