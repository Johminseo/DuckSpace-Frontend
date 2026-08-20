import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoChevronBack, IoHeart, IoHeartOutline, IoSearch } from "react-icons/io5";

import { getPopups, likePopup, unlikePopup } from "../../apis/popupApi";

// 백엔드 status(대문자 enum) <-> 화면 상태 매핑
const STATUS_TAB_KEY = {
  UPCOMING: "upcoming",
  ONGOING: "ongoing",
  ENDED: "ended",
};

const STATUS_TEXT = {
  UPCOMING: "예정",
  ONGOING: "진행중",
  ENDED: "완료",
};

// "2026-08-10" -> "2026.08.10"
const formatDate = (isoDate) => (isoDate ? isoDate.replaceAll("-", ".") : "");

function PopupSchedule() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'ongoing' | 'upcoming' | 'ended'
  const [searchTerm, setSearchTerm] = useState("");
  const [popups, setPopups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPopups = async () => {
      try {
        setLoading(true);
        const data = await getPopups();
        setPopups(data || []);
      } catch (error) {
        console.error("팝업 목록 조회 실패:", error.response?.data || error);
      } finally {
        setLoading(false);
      }
    };

    fetchPopups();
  }, []);

  // 찜(하트) 토글 — 낙관적으로 먼저 바꾸고, 실패하면 되돌린다.
  const toggleLike = async (popup) => {
    const nextLiked = !popup.liked;
    setPopups((prev) =>
      prev.map((p) => (p.id === popup.id ? { ...p, liked: nextLiked } : p))
    );

    try {
      if (nextLiked) {
        await likePopup(popup.id);
      } else {
        await unlikePopup(popup.id);
      }
    } catch (error) {
      console.error("팝업 찜 처리 실패:", error.response?.data || error);
      setPopups((prev) =>
        prev.map((p) => (p.id === popup.id ? { ...p, liked: popup.liked } : p))
      );
    }
  };

  // 탭 & 검색 필터링
  const filteredPopups = popups.filter((popup) => {
    const tabKey = STATUS_TAB_KEY[popup.status];
    const matchesTab = activeTab === "all" || tabKey === activeTab;
    const matchesSearch = (popup.title || "").includes(searchTerm);
    return matchesTab && matchesSearch;
  });

  // 피그마 Dev Mode 100% 매칭 뱃지 스타일
  const getBadgeStyle = (status) => {
    switch (status) {
      case "ONGOING":
        return "bg-[#7EAAFA] text-[#FCFCFC] border-[#5791FB]";
      case "UPCOMING":
        return "bg-[#FCFCFC] text-[#2F78FD] border-[#A6C3F8]";
      case "ENDED":
      default:
        return "bg-[#DEDEDE] text-[#858485] border-[#A2A2A2]";
    }
  };

  return (
    <div className="min-h-screen bg-[#FEFEFE] pb-24">
      {/* 1. 상단 헤더 */}
      <header className="relative flex h-14 items-center justify-center px-5">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-5 cursor-pointer text-2xl text-[#171617]"
        >
          <IoChevronBack />
        </button>

        <h1 className="text-[18px] font-semibold text-[#171617]">팝업 일정</h1>

        {/* 팝업 위시리스트 페이지로 이동 */}
        <button
          onClick={() => navigate("/popup/wishlist")}
          className="absolute right-5 cursor-pointer text-2xl text-[#171617]"
        >
          <IoHeartOutline />
        </button>
      </header>

      {/* 2. 탭 메뉴 (전체 / 진행중 / 예정 / 종료) */}
      <div className="flex w-full border-b border-[#EEEEEE] text-center">
        {[
          { key: "all", label: "전체" },
          { key: "ongoing", label: "진행중" },
          { key: "upcoming", label: "예정" },
          { key: "ended", label: "종료" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2.5 text-[14px] leading-[21px] cursor-pointer transition-colors ${
              activeTab === tab.key
                ? "border-b-2 border-[#5791FB] font-semibold text-[#5791FB]"
                : "font-normal text-[#A2A2A2]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. 검색바 */}
      <div className="px-5 py-3.5">
        <div className="flex h-[48px] items-center rounded-lg bg-white/75 border border-white/60 px-4 shadow-[0_15px_40px_rgba(205,205,205,0.08)] backdrop-blur-[10px]">
          <IoSearch size={22} className="mr-2 text-[#DEDEDE]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="키워드로 검색해보세요."
            className="w-full bg-transparent text-[16px] leading-[24px] outline-none placeholder:text-[#A2A2A2]"
          />
        </div>
      </div>

      {/* 4. 팝업 카드 리스트 */}
      <main className="flex flex-col gap-3.5 px-5">
        {loading ? (
          <div className="py-20 text-center text-sm text-[#A2A2A2]">불러오는 중...</div>
        ) : filteredPopups.length === 0 ? (
          <div className="py-20 text-center text-sm text-[#A2A2A2]">등록된 팝업이 없습니다.</div>
        ) : (
          filteredPopups.map((popup) => (
            <div
              key={popup.id}
              onClick={() => navigate(`/popup/detail?id=${popup.id}`)}
              className="flex gap-4 rounded-2xl border border-[#F4F4F4] bg-white/75 p-4 shadow-[0_15px_40px_rgba(205,205,205,0.08)] backdrop-blur-[10px] cursor-pointer"
            >
              {/* 좌측 썸네일 & 찜 하트 */}
              <div className="relative h-[152px] w-[152px] shrink-0 overflow-hidden rounded-lg bg-[#F7F7F7]">
                {popup.imageUrl && (
                  <img
                    src={popup.imageUrl}
                    alt={popup.title}
                    className="h-full w-full object-cover"
                  />
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLike(popup);
                  }}
                  className="absolute top-2 left-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#FCFCFC] border border-[#F4F4F4] cursor-pointer shadow-sm"
                >
                  {popup.liked ? (
                    <IoHeart className="text-xl text-[#2F78FD]" />
                  ) : (
                    <IoHeartOutline className="text-xl text-[#545454]" />
                  )}
                </button>
              </div>

              {/* 우측 정보 영역 */}
              <div className="flex flex-1 flex-col justify-center py-0.5">
                {/* 뱃지 */}
                <span
                  className={`inline-block w-fit rounded-[20px] border px-3 py-[2px] text-[11px] font-semibold leading-[17.6px] mb-1 ${getBadgeStyle(
                    popup.status
                  )}`}
                >
                  {STATUS_TEXT[popup.status] || popup.status}
                </span>

                {/* 팝업 제목 */}
                <h2 className="text-[18px] font-semibold leading-[25.2px] text-[#171617] mb-1">
                  {popup.title}
                </h2>

                {/* 날짜 */}
                <p className="text-[12px] font-normal leading-[19.2px] text-[#858485]">
                  {formatDate(popup.startDate)} ~ {formatDate(popup.endDate)}
                </p>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}

export default PopupSchedule;
