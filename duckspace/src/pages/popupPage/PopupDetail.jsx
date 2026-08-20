import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { IoChevronBack, IoHeart, IoHeartOutline } from "react-icons/io5";

import displayBack from "../../assets/displaybackgrounds/display_back.png";
import { getPopupDetail, likePopup, unlikePopup } from "../../apis/popupApi";

// "2026-08-10" -> "2026.08.10" (PopupSchedule.jsx와 동일한 포맷)
const formatDate = (isoDate) => (isoDate ? isoDate.replaceAll("-", ".") : "");

function PopupDetail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const popupId = searchParams.get("id");

  const [popupDetail, setPopupDetail] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(!!popupId);

  // 백엔드 PR #103(상세 응답에 benefitImageUrl/benefitDescription/operatingHours 추가) 반영 후
  // 배너 이미지 + AI 요약 + 찜 여부 + 아래 상세 정보 전부 실제 데이터.
  useEffect(() => {
    if (!popupId) return;

    const fetchPopupDetail = async () => {
      try {
        setLoadingSummary(true);
        const detail = await getPopupDetail(popupId);
        setPopupDetail(detail);
      } catch (error) {
        console.error("팝업 상세 조회 실패:", error.response?.data || error);
      } finally {
        setLoadingSummary(false);
      }
    };

    fetchPopupDetail();
  }, [popupId]);

  // 찜(하트) 토글 — 낙관적으로 먼저 바꾸고, 실패하면 되돌린다.
  const toggleLike = async () => {
    if (!popupDetail) return;
    const nextLiked = !popupDetail.liked;
    setPopupDetail((prev) => ({ ...prev, liked: nextLiked }));

    try {
      if (nextLiked) {
        await likePopup(popupId);
      } else {
        await unlikePopup(popupId);
      }
    } catch (error) {
      console.error("팝업 찜 처리 실패:", error.response?.data || error);
      setPopupDetail((prev) => ({ ...prev, liked: !nextLiked }));
    }
  };

  return (
    <div className="mx-auto min-h-screen max-w-[430px] bg-[#FEFEFE] pb-12">
      {/* 배너 이미지 + 헤더 버튼 */}
      <div className="relative h-[280px] w-full overflow-hidden bg-[#F7F7F7]">
        <img
          src={popupDetail?.imageUrl || displayBack}
          alt="팝업 배너"
          className="h-full w-full object-cover"
        />

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute left-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-xl text-[#171617] cursor-pointer"
          aria-label="뒤로가기"
        >
          <IoChevronBack />
        </button>

        <button
          type="button"
          onClick={toggleLike}
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-xl cursor-pointer"
          aria-label="찜하기"
        >
          {popupDetail?.liked ? (
            <IoHeart className="text-[#2F78FD]" />
          ) : (
            <IoHeartOutline className="text-[#545454]" />
          )}
        </button>
      </div>

      <div className="px-5 pt-4">
        {/* 기본 정보 */}
        <h1 className="text-[20px] font-semibold text-[#171617]">{popupDetail?.title}</h1>
        <p className="mt-1 text-[13px] text-[#858485]">
          {formatDate(popupDetail?.startDate)} ~ {formatDate(popupDetail?.endDate)}
        </p>
        {popupDetail?.operatingHours && (
          <p className="text-[13px] text-[#858485]">{popupDetail.operatingHours}</p>
        )}
        <p className="mt-1 text-[13px] text-[#545454]">{popupDetail?.location}</p>

        {/* AI 요약 — 실제 API 연동 */}
        <section className="mt-6">
          <h2 className="text-[16px] font-semibold text-[#171617]">AI 요약</h2>
          <div className="mt-2 rounded-lg bg-[#F9FAFB] p-4 text-[14px] leading-[22px] text-[#545454] whitespace-pre-wrap">
            {loadingSummary ? (
              "요약을 불러오는 중..."
            ) : popupDetail?.aiSummary ? (
              popupDetail.aiSummary
            ) : (
              "이 팝업의 AI 요약이 아직 준비되지 않았습니다."
            )}
          </div>
        </section>

        {/* 팝업 소개 */}
        {popupDetail?.description && (
          <section className="mt-6">
            <h2 className="text-[16px] font-semibold text-[#171617]">팝업 소개</h2>
            <p className="mt-2 text-[14px] leading-[22px] text-[#545454] whitespace-pre-wrap">
              {popupDetail.description}
            </p>
          </section>
        )}

        {/* 혜택 및 굿즈 — benefitImageUrl/benefitDescription 둘 다 없으면 섹션 자체를 숨김 */}
        {(popupDetail?.benefitImageUrl || popupDetail?.benefitDescription) && (
          <section className="mt-6">
            <h2 className="text-[16px] font-semibold text-[#171617]">혜택 및 굿즈</h2>
            {popupDetail.benefitImageUrl && (
              <div className="mt-2 h-[380px] w-[380px] overflow-hidden rounded-lg bg-[#CDDCF7]">
                <img
                  src={popupDetail.benefitImageUrl}
                  alt="혜택 및 굿즈"
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            {popupDetail.benefitDescription && (
              <p className="mt-2 text-[14px] leading-[22px] text-[#545454] whitespace-pre-wrap">
                {popupDetail.benefitDescription}
              </p>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

export default PopupDetail;
