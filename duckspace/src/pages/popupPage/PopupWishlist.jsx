import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoChevronBack, IoHeart } from "react-icons/io5";

import { getLikedPopups, unlikePopup } from "../../apis/popupApi";

const STATUS_TEXT = {
  UPCOMING: "예정",
  ONGOING: "진행중",
  ENDED: "완료",
};

const formatDate = (isoDate) => (isoDate ? isoDate.replaceAll("-", ".") : "");

function PopupWishlist() {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLikedPopups = async () => {
      try {
        setLoading(true);
        const data = await getLikedPopups();
        setWishlist(data || []);
      } catch (error) {
        console.error("찜한 팝업 목록 조회 실패:", error.response?.data || error);
      } finally {
        setLoading(false);
      }
    };

    fetchLikedPopups();
  }, []);

  // 하트 해제 — 서버에 찜 취소 반영 후 목록에서 제거. 실패하면 되돌린다.
  const handleRemoveLike = async (popupId) => {
    const removed = wishlist.find((popup) => popup.id === popupId);
    setWishlist((prev) => prev.filter((popup) => popup.id !== popupId));

    try {
      await unlikePopup(popupId);
    } catch (error) {
      console.error("찜 취소 실패:", error.response?.data || error);
      if (removed) {
        setWishlist((prev) => [...prev, removed]);
      }
    }
  };

  // 뱃지 스타일
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
      <header className="relative flex h-14 items-center justify-center px-5 border-b border-[#F4F4F4]">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-5 cursor-pointer text-2xl text-[#171617]"
        >
          <IoChevronBack />
        </button>

        <h1 className="text-[18px] font-semibold text-[#171617]">
          팝업 위시리스트
        </h1>
      </header>

      {/* 2. 찜한 팝업 리스트 */}
      <main className="flex flex-col gap-3.5 px-5 pt-4">
        {loading ? (
          <div className="flex h-60 flex-col items-center justify-center text-[#A2A2A2]">
            불러오는 중...
          </div>
        ) : wishlist.length === 0 ? (
          <div className="flex h-60 flex-col items-center justify-center text-[#A2A2A2]">
            위시리스트가 비어있습니다.
          </div>
        ) : (
          wishlist.map((popup) => (
            <div
              key={popup.id}
              onClick={() => navigate(`/popup/detail?id=${popup.id}`)}
              className="flex gap-4 rounded-2xl border border-[#F4F4F4] bg-white/75 p-4 shadow-[0_15px_40px_rgba(205,205,205,0.08)] backdrop-blur-[10px] cursor-pointer"
            >
              {/* 좌측 썸네일 & 파란 하트 아이콘 */}
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
                    handleRemoveLike(popup.id);
                  }}
                  className="absolute top-2 left-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#FCFCFC] border border-[#F4F4F4] cursor-pointer shadow-sm"
                >
                  <IoHeart className="text-xl text-[#2F78FD]" />
                </button>
              </div>

              {/* 우측 정보 */}
              <div className="flex flex-1 flex-col justify-center py-0.5">
                <span
                  className={`inline-block w-fit rounded-[20px] border px-3 py-[2px] text-[11px] font-semibold leading-[17.6px] mb-1 ${getBadgeStyle(
                    popup.status
                  )}`}
                >
                  {STATUS_TEXT[popup.status] || popup.status}
                </span>

                <h2 className="text-[18px] font-semibold leading-[25.2px] text-[#171617] mb-1">
                  {popup.title}
                </h2>

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

export default PopupWishlist;
