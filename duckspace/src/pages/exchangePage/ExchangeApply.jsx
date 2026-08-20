import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IoChevronBack, IoAdd } from "react-icons/io5";

import ExchangeUserPreferenceCard from "../../components/duckTalkComponents/ExchangeUserPreferenceCard";
import ExchangeActionComplete from "../../components/duckTalkComponents/ExchangeActionComplete";
import { getPostDetail, applyExchange, uploadImage } from "../../apis/postApi";
// ✅ 채팅 API 추가
import { createOrGetChatRoom } from "../../apis/chatApi";

export default function ExchangeApply() {
  const navigate = useNavigate();
  const { postId } = useParams(); // URL 파라미터에서 postId 추출

  const [postDetail, setPostDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // 내가 보내는 굿즈 정보 State
  const [goodsSource, setGoodsSource] = useState("direct");
  const [goodsImageUrl, setGoodsImageUrl] = useState("");
  const [goodsName, setGoodsName] = useState("");
  const [brandSeries, setBrandSeries] = useState("");
  const [status, setStatus] = useState("미개봉");
  const [message, setMessage] = useState("");

  // 상태 한글 -> Enum 매핑
  const mapConditionToEnum = (koreanCond) => {
    switch (koreanCond) {
      case "사용감 적음":
        return "LIGHTLY_USED";
      case "사용감 있음":
        return "USED";
      case "미개봉":
      default:
        return "UNOPENED";
    }
  };

  // 상대방 게시글 상세 정보 불러오기
  useEffect(() => {
    const fetchDetail = async () => {
      if (!postId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await getPostDetail(postId);
        setPostDetail(data);
      } catch (error) {
        console.error("교환글 상세 불러오기 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [postId]);

  // 사진 선택 시 백엔드 이미지 업로드 API 즉시 호출
  const handleImageChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        setIsUploadingImage(true);
        const uploadedUrl = await uploadImage(file);
        setGoodsImageUrl(uploadedUrl);
      } catch (error) {
        console.error("사진 업로드 실패:", error);
        alert("사진 업로드 중 오류가 발생했습니다. (10MB 이하 JPG/PNG)");
      } finally {
        setIsUploadingImage(false);
      }
    }
  };

  // 교환 신청서 제출 핸들러
  const handleSubmit = async () => {
    if (!goodsName.trim()) {
      alert("보내는 굿즈 이름을 입력해주세요.");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        offeredItemName: goodsName.trim(),
        offeredImageUrl: goodsImageUrl || undefined,
        offeredBrand: brandSeries.trim() || undefined,
        offeredCondition: mapConditionToEnum(status),
        message: message.trim() || undefined,
      };

      await applyExchange(postId, payload);
      setIsCompleted(true);
    } catch (error) {
      console.error("교환 신청 실패:", error);
      alert(error.response?.data?.error?.message || "교환 신청 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ 1:1 채팅방 생성 및 바로 입장 핸들러 추가
  const handleStartChat = async () => {
    try {
      const partnerId = postDetail?.authorId || postDetail?.writerId || postDetail?.userId;
      const numericPartnerId = Number(partnerId);

      if (!numericPartnerId || isNaN(numericPartnerId)) {
        alert("상대방 유저 정보를 찾지 못했습니다.");
        return;
      }

      const roomData = await createOrGetChatRoom(numericPartnerId);
      const targetRoomId = roomData?.roomId;

      if (targetRoomId) {
        const partnerName = postDetail?.authorNickname || "상대방";
        navigate(`/chat/${targetRoomId}`, { state: { partnerId: numericPartnerId, partnerNickname: partnerName } });
      } else {
        alert("채팅방 번호를 응답받지 못했습니다.");
      }
    } catch (error) {
      console.error("채팅방 개설/입장 실패:", error);
      alert(error.response?.data?.error?.message || "채팅방 입장 중 오류가 발생했습니다.");
    }
  };

  // 상대방 정보 및 희망 굿즈 파싱
  const exchangeInfo = postDetail?.exchangeInfo;
  const userObj = {
    name: postDetail?.authorNickname || "작성자",
    score: 95,
  };
  const preferencesObj = {
    popupName: exchangeInfo?.preferredPopupName || "미지정",
    date: exchangeInfo?.preferredDate || "조율 가능",
    time: exchangeInfo?.preferredTime || "조율 가능",
    condition: exchangeInfo?.extraCondition || "없음",
  };

  const isSubmitValid = goodsName.trim().length > 0 && !isUploadingImage && !isSubmitting;

  if (isCompleted) {
    return (
      <ExchangeActionComplete
        title="교환 신청 완료!"
        description="답변이 올 때까지 기다려주세요."
        listButtonText="교환 신청 목록 보러가기"
        onListClick={() => navigate("/ducktalk/exchange/list")}
        onChatClick={handleStartChat} // ✅ 채팅방 생성 및 입장 함수 연결
        onClose={() => navigate("/ducktalk")}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-sm text-[#858485]">
        상세 정보를 불러오는 중...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-28">
      <header className="relative flex h-14 items-center justify-center px-5 border-b border-transparent">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute left-5 cursor-pointer text-2xl text-[#171617]"
        >
          <IoChevronBack />
        </button>
        <h1 className="text-[18px] font-semibold text-[#171617]">교환 신청</h1>
      </header>

      <main className="flex flex-col gap-5 px-5 pt-3">
        {/* 1. 상대방 정보 및 선호 조건 카드 */}
        <ExchangeUserPreferenceCard user={userObj} preferences={preferencesObj} />

        {/* 2. 내가 보내는 굿즈 정보 입력 */}
        <div className="flex flex-col gap-3 rounded-lg border border-white/60 bg-white/75 p-5 shadow-[0_15px_40px_rgba(205,205,205,0.08)] backdrop-blur-[10px]">
          <h2 className="text-[18px] font-semibold text-[#171617]">내가 보내는 굿즈</h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setGoodsSource("direct")}
              className={`flex-1 h-12 rounded-lg text-[14px] font-semibold cursor-pointer ${
                goodsSource === "direct"
                  ? "bg-[#FCFCFC] border border-[#A6C3F8] text-[#2F78FD]"
                  : "bg-[#F4F4F4] border border-[#DEDEDE] text-[#858485]"
              }`}
            >
              직접입력
            </button>
            <button
              type="button"
              onClick={() => setGoodsSource("myPost")}
              className={`flex-1 h-12 rounded-lg text-[14px] font-semibold cursor-pointer ${
                goodsSource === "myPost"
                  ? "bg-[#FCFCFC] border border-[#A6C3F8] text-[#2F78FD]"
                  : "bg-[#F4F4F4] border border-[#DEDEDE] text-[#858485]"
              }`}
            >
              내 교환글에서 고르기
            </button>
          </div>

          {goodsSource === "direct" ? (
            <div className="flex flex-col gap-4 pt-2">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[16px] font-semibold text-[#171617]">내 굿즈 사진 (선택)</span>
                  {isUploadingImage && <span className="text-xs text-[#2F78FD]">업로드 중...</span>}
                </div>
                <label className="flex h-36 w-36 cursor-pointer flex-col items-center justify-center rounded-lg border border-[#2F78FD] bg-[#FCFCFC] overflow-hidden">
                  {goodsImageUrl ? (
                    <img src={goodsImageUrl} alt="내 굿즈" className="h-full w-full object-cover" />
                  ) : (
                    <IoAdd size={36} className="text-[#2F78FD]" />
                  )}
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[16px] font-semibold text-[#171617]">굿즈 이름 (필수)</span>
                <div className="flex items-center gap-1 rounded-lg border border-[#EEEEEE] bg-[#FCFCFC] px-3 py-3">
                  <span className={`text-[14px] ${goodsName ? "text-[#2F78FD]" : "text-[#545454]"}`}>#</span>
                  <input
                    type="text"
                    value={goodsName}
                    onChange={(e) => setGoodsName(e.target.value)}
                    placeholder="이름을 작성해주세요."
                    className="w-full bg-transparent text-[14px] text-[#171617] outline-none placeholder:text-[#A2A2A2]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[16px] font-semibold text-[#171617]">브랜드/시리즈 (선택)</span>
                <div className="flex items-center gap-1 rounded-lg border border-[#EEEEEE] bg-[#FCFCFC] px-3 py-3">
                  <span className="text-[14px] text-[#545454]">#</span>
                  <input
                    type="text"
                    value={brandSeries}
                    onChange={(e) => setBrandSeries(e.target.value)}
                    placeholder="브랜드나 시리즈를 작성해주세요."
                    className="w-full bg-transparent text-[14px] text-[#171617] outline-none placeholder:text-[#A2A2A2]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[16px] font-semibold text-[#171617]">상태 (선택)</span>
                <div className="flex gap-2">
                  {["미개봉", "사용감 적음", "사용감 있음"].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setStatus(item)}
                      className={`flex-1 h-11 rounded-lg text-[13px] font-semibold cursor-pointer ${
                        status === item
                          ? "bg-[#FCFCFC] border border-[#A6C3F8] text-[#2F78FD]"
                          : "bg-[#F4F4F4] border border-[#DEDEDE] text-[#858485]"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-sm text-[#858485]">
              내 교환글 선택 기능은 준비 중입니다. 직접 입력을 이용해 주세요.
            </div>
          )}
        </div>

        {/* 3. 상대방이 교환으로 내놓은 굿즈 정보 */}
        <div className="flex flex-col gap-3 rounded-lg border border-white/60 bg-white/75 p-5 shadow-[0_15px_40px_rgba(205,205,205,0.08)] backdrop-blur-[10px]">
          <h2 className="text-[18px] font-semibold text-[#171617]">상대방이 등록한 굿즈</h2>
          <div className="flex items-center gap-4 rounded-lg border border-white/60 bg-white/75 p-3 shadow-sm">
            {exchangeInfo?.offeredItem?.imageUrl ? (
              <img
                src={exchangeInfo.offeredItem.imageUrl}
                alt="상대방 굿즈"
                className="h-20 w-20 shrink-0 rounded-lg border border-[#DEDEDE] object-cover"
              />
            ) : (
              <div className="h-20 w-20 shrink-0 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                사진 없음
              </div>
            )}
            <div className="flex flex-col gap-1">
              <h3 className="text-[16px] font-semibold text-[#171617]">
                {exchangeInfo?.offeredItem?.itemName || "등록된 굿즈"}
              </h3>
              <p className="text-[13px] text-[#858485]">
                {exchangeInfo?.offeredItem?.brand || "브랜드 미지정"}
              </p>
            </div>
          </div>
        </div>

        {/* 4. 신청 메시지 */}
        <div className="flex flex-col gap-3 rounded-lg border border-white/60 bg-white/75 p-5 shadow-[0_15px_40px_rgba(205,205,205,0.08)] backdrop-blur-[10px]">
          <h2 className="text-[18px] font-semibold text-[#171617]">메세지 (선택)</h2>
          <div className="flex flex-col items-end gap-1">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 200))}
              placeholder="교환 시 전달할 메시지를 작성해주세요. (최대 200자)"
              className="h-28 w-full rounded-lg border border-[#EEEEEE] bg-[#FCFCFC] p-3 text-[14px] outline-none resize-none placeholder:text-[#A2A2A2]"
            />
            <span className="text-[13px] text-[#A2A2A2]">{message.length}/200</span>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-white/90 p-5 backdrop-blur-md z-30">
        <button
          type="button"
          disabled={!isSubmitValid}
          onClick={handleSubmit}
          className={`flex h-12 w-full items-center justify-center rounded-lg text-[14px] font-semibold ${
            isSubmitValid
              ? "bg-[#2F78FD] text-[#FCFCFC] cursor-pointer shadow-md hover:bg-blue-600 transition-all"
              : "bg-[#F4F4F4] border border-[#DEDEDE] text-[#858485] cursor-not-allowed"
          }`}
        >
          {isSubmitting ? "신청 등록 중..." : "신청하기"}
        </button>
      </div>
    </div>
  );
}