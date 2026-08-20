import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createExchangePost, uploadImage } from "../../apis/postApi";

export default function PostExchangePages() {
  const navigate = useNavigate();
  const myFileInputRef = useRef(null);
  const wantFileInputRef = useRef(null);

  // 현재 작성 단계 (1: 기본 정보, 2: 교환 품목, 3: 교환 정보, 4: 완료)
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [createdPostId, setCreatedPostId] = useState(null);

  // 1단계: 기본 정보 State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [popupName, setPopupName] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");

  // 2단계: 교환 품목 (내가 가진 굿즈) State
  const [myImages, setMyImages] = useState([]);
  const [myGoodsName, setMyGoodsName] = useState("");
  const [myGoodsBrand, setMyGoodsBrand] = useState("");
  const [myGoodsCondition, setMyGoodsCondition] = useState("미개봉");

  // 3단계: 교환 정보 (내가 원하는 굿즈) State
  const [wantImages, setWantImages] = useState([]);
  const [wantGoodsName, setWantGoodsName] = useState("");
  const [wantGoodsBrand, setWantGoodsBrand] = useState("");
  const [additionalCondition, setAdditionalCondition] = useState("");

  // 상태 한글 -> 백엔드 Enum 매핑 함수
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

  // 이미지 업로드 핸들러 (내가 가진 굿즈)
  const handleAddMyImages = async (e) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    try {
      setIsUploadingImage(true);
      const remainingSlots = 4 - myImages.length;
      const targetFiles = files.slice(0, remainingSlots);

      for (const file of targetFiles) {
        const uploadedUrl = await uploadImage(file);
        setMyImages((prev) => [
          ...prev,
          { id: `${file.name}-${Date.now()}-${Math.random()}`, url: uploadedUrl },
        ]);
      }
    } catch (error) {
      console.error("이미지 업로드 실패:", error);
      alert("이미지 업로드에 실패했습니다. (JPG/PNG, 10MB 이하)");
    } finally {
      setIsUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleRemoveMyImage = (id) => {
    setMyImages((prev) => prev.filter((img) => img.id !== id));
  };

  // 이미지 업로드 핸들러 (원하는 굿즈)
  const handleAddWantImages = async (e) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    try {
      setIsUploadingImage(true);
      const remainingSlots = 4 - wantImages.length;
      const targetFiles = files.slice(0, remainingSlots);

      for (const file of targetFiles) {
        const uploadedUrl = await uploadImage(file);
        setWantImages((prev) => [
          ...prev,
          { id: `${file.name}-${Date.now()}-${Math.random()}`, url: uploadedUrl },
        ]);
      }
    } catch (error) {
      console.error("이미지 업로드 실패:", error);
      alert("이미지 업로드에 실패했습니다. (JPG/PNG, 10MB 이하)");
    } finally {
      setIsUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleRemoveWantImage = (id) => {
    setWantImages((prev) => prev.filter((img) => img.id !== id));
  };

  // 3단계에서 [다음(등록)] 클릭 시 서버로 전송
  const handleSubmitExchange = async () => {
    try {
      setIsSubmitting(true);

      const payload = {
        title: title.trim(),
        content: content.trim() || undefined,
        preferredPopupName: popupName.trim() || undefined,
        preferredDate: preferredDate.trim() || undefined,
        preferredTime: preferredTime.trim() || undefined,
        extraCondition: additionalCondition.trim() || undefined,
        offeredItem: {
          itemName: myGoodsName.trim(),
          brand: myGoodsBrand.trim() || undefined,
          condition: mapConditionToEnum(myGoodsCondition),
          imageUrl: myImages[0]?.url || undefined,
        },
        wantedItem: {
          itemName: wantGoodsName.trim(),
          brand: wantGoodsBrand.trim() || undefined,
          imageUrl: wantImages[0]?.url || undefined,
        },
      };

      const newPostId = await createExchangePost(payload);
      setCreatedPostId(newPostId);
      setStep(4);
    } catch (error) {
      console.error("교환글 등록 실패:", error);
      alert(error.response?.data?.error?.message || "교환글 등록 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 필수값 검증
  const isStep1Valid = title.trim().length > 0;
  const isStep2Valid = myGoodsName.trim().length > 0 && myImages.length > 0;
  const isStep3Valid = wantGoodsName.trim().length > 0 && wantImages.length > 0;

  return (
    <div className="flex min-h-screen justify-center bg-gray-100 sm:py-8">
      <div className="flex w-full max-w-[402px] flex-col justify-between bg-white sm:min-h-[874px] sm:rounded-3xl sm:shadow-xl border border-gray-100 overflow-hidden">
        
        {/* 1 ~ 3단계 화면 */}
        {step < 4 && (
          <>
            <div>
              <header className="flex h-[60px] items-center justify-between px-5 bg-white">
                <button
                  type="button"
                  aria-label="뒤로 가기"
                  onClick={() => (step === 1 ? navigate(-1) : setStep(step - 1))}
                  className="p-1 -ml-1 text-[#171617] hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <h1 className="text-[18px] font-semibold text-[#171617]">교환 글 작성</h1>
                <div className="w-6" />
              </header>

              <main className="p-[20px] space-y-[20px]">
                {/* 인디케이터 */}
                <div className="flex justify-center items-center gap-[12px] py-1">
                  <div className="flex flex-col items-center gap-[8px] w-[59px]">
                    <div className={`flex items-center justify-center w-[24px] h-[24px] rounded-full text-[12px] font-semibold ${step === 1 ? "bg-[#2F78FD] text-[#FCFCFC]" : "bg-[#FCFCFC] border border-[#DEDEDE] text-[#A2A2A2]"}`}>
                      1
                    </div>
                    <span className={`text-[12px] font-semibold ${step === 1 ? "text-[#2F78FD]" : "text-[#858485]"}`}>기본 정보</span>
                  </div>

                  <div className="flex flex-col items-center gap-[8px] w-[59px]">
                    <div className={`flex items-center justify-center w-[24px] h-[24px] rounded-full text-[12px] font-semibold ${step === 2 ? "bg-[#2F78FD] text-[#FCFCFC]" : "bg-[#FCFCFC] border border-[#DEDEDE] text-[#A2A2A2]"}`}>
                      2
                    </div>
                    <span className={`text-[12px] font-semibold ${step === 2 ? "text-[#2F78FD]" : "text-[#858485]"}`}>교환 품목</span>
                  </div>

                  <div className="flex flex-col items-center gap-[8px] w-[59px]">
                    <div className={`flex items-center justify-center w-[24px] h-[24px] rounded-full text-[12px] font-semibold ${step === 3 ? "bg-[#2F78FD] text-[#FCFCFC]" : "bg-[#FCFCFC] border border-[#DEDEDE] text-[#A2A2A2]"}`}>
                      3
                    </div>
                    <span className={`text-[12px] font-semibold ${step === 3 ? "text-[#2F78FD]" : "text-[#858485]"}`}>교환 정보</span>
                  </div>
                </div>

                {/* 1단계: 기본 정보 */}
                {step === 1 && (
                  <div className="space-y-[20px]">
                    <section className="space-y-[8px]">
                      <h2 className="text-[18px] font-semibold text-[#171617]">제목(필수)</h2>
                      <div className="flex flex-col items-end gap-[4px]">
                        <textarea
                          value={title}
                          onChange={(e) => setTitle(e.target.value.slice(0, 50))}
                          placeholder="글을 작성해주세요. (최대 50자)"
                          className="w-full h-[112px] resize-none rounded-[8px] bg-[#FCFCFC] p-[12px] text-[14px] text-[#171617] placeholder:text-[#A2A2A2] border border-[#EEEEEE] focus:border-[#2F78FD] focus:outline-none transition-all"
                        />
                        <span className="text-[14px] text-[#A2A2A2]">{title.length}/50</span>
                      </div>
                    </section>

                    <section className="space-y-[8px]">
                      <h2 className="text-[18px] font-semibold text-[#171617]">내용(선택)</h2>
                      <div className="flex flex-col items-end gap-[4px]">
                        <textarea
                          value={content}
                          onChange={(e) => setContent(e.target.value.slice(0, 200))}
                          placeholder="글을 작성해주세요. (최대 200자)"
                          className="w-full h-[112px] resize-none rounded-[8px] bg-[#FCFCFC] p-[12px] text-[14px] text-[#171617] placeholder:text-[#A2A2A2] border border-[#EEEEEE] focus:border-[#2F78FD] focus:outline-none transition-all"
                        />
                        <span className="text-[14px] text-[#A2A2A2]">{content.length}/200</span>
                      </div>
                    </section>

                    <section className="space-y-[8px]">
                      <h2 className="text-[18px] font-semibold text-[#171617]">교환할 팝업 이름(선택)</h2>
                      <div className="flex items-center gap-[4px] rounded-[8px] bg-[#FCFCFC] p-[12px] border border-[#EEEEEE] focus-within:border-[#2F78FD]">
                        {/* <span className={`text-[14px] ${popupName ? "text-[#2F78FD]" : "text-[#545454]"}`}>#</span> */}
                        <input
                          type="text"
                          value={popupName}
                          onChange={(e) => setPopupName(e.target.value)}
                          placeholder="이름을 작성해주세요."
                          className="w-full bg-transparent text-[14px] text-black placeholder:text-[#A2A2A2] focus:outline-none"
                        />
                      </div>
                    </section>

                    <section className="space-y-[8px]">
                      <h2 className="text-[18px] font-semibold text-[#171617]">선호 날짜(선택)</h2>
                      <div className="flex items-center gap-[4px] rounded-[8px] bg-[#FCFCFC] p-[12px] border border-[#EEEEEE] focus-within:border-[#2F78FD]">
                        <span className={`text-[14px] ${preferredDate ? "text-[#2F78FD]" : "text-[#545454]"}`}>#</span>
                        <input
                          type="text"
                          value={preferredDate}
                          onChange={(e) => setPreferredDate(e.target.value)}
                          placeholder="날짜를 작성해주세요. (예: 260809)"
                          className="w-full bg-transparent text-[14px] text-[#2F78FD] placeholder:text-[#A2A2A2] focus:outline-none"
                        />
                      </div>
                    </section>

                    <section className="space-y-[8px]">
                      <h2 className="text-[18px] font-semibold text-[#171617]">선호 시간(선택)</h2>
                      <div className="flex items-center gap-[4px] rounded-[8px] bg-[#FCFCFC] p-[12px] border border-[#EEEEEE] focus-within:border-[#2F78FD]">
                        <span className={`text-[14px] ${preferredTime ? "text-[#2F78FD]" : "text-[#545454]"}`}>#</span>
                        <input
                          type="text"
                          value={preferredTime}
                          onChange={(e) => setPreferredTime(e.target.value)}
                          placeholder="시간을 작성해주세요. (예: 12시부터14시까지)"
                          className="w-full bg-transparent text-[14px] text-[#2F78FD] placeholder:text-[#A2A2A2] focus:outline-none"
                        />
                      </div>
                    </section>
                  </div>
                )}

                {/* 2단계: 교환 품목 */}
                {step === 2 && (
                  <div className="space-y-[20px]">
                    <section className="space-y-[8px]">
                      <div className="flex items-center justify-between">
                        <h2 className="text-[18px] font-semibold text-[#171617]">내가 가진 굿즈 (필수)</h2>
                        {isUploadingImage && <span className="text-xs text-[#2F78FD]">사진 업로드 중...</span>}
                      </div>
                      <div className="flex items-center gap-[12px] overflow-x-auto pb-1">
                        {myImages.map((img) => (
                          <div key={img.id} className="relative w-[160px] h-[160px] shrink-0 rounded-[8px] bg-[#DEDEDE] overflow-hidden">
                            <img src={img.url} alt="굿즈" className="h-full w-full object-cover" />
                            <button
                              type="button"
                              aria-label="삭제"
                              onClick={() => handleRemoveMyImage(img.id)}
                              className="absolute right-[8px] top-[8px] flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#171617]/30 text-[#FCFCFC]"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                        {myImages.length < 4 && (
                          <button
                            type="button"
                            aria-label="사진 추가"
                            disabled={isUploadingImage}
                            onClick={() => myFileInputRef.current?.click()}
                            className="flex w-[160px] h-[160px] shrink-0 items-center justify-center rounded-[8px] border border-[#2F78FD] bg-[#FCFCFC]"
                          >
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                              <path d="M20 8V32M8 20H32" stroke="#2F78FD" strokeWidth="3" strokeLinecap="round" />
                            </svg>
                          </button>
                        )}
                        <input ref={myFileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleAddMyImages} />
                      </div>
                    </section>

                    <section className="space-y-[8px]">
                      <h2 className="text-[18px] font-semibold text-[#171617]">굿즈 이름 (필수)</h2>
                      <div className="flex items-center gap-[4px] rounded-[8px] bg-[#FCFCFC] p-[12px] border border-[#EEEEEE] focus-within:border-[#2F78FD]">
                        {/* <span className={`text-[14px] ${myGoodsName ? "text-[#2F78FD]" : "text-[#545454]"}`}>#</span> */}
                        <input
                          type="text"
                          value={myGoodsName}
                          onChange={(e) => setMyGoodsName(e.target.value)}
                          placeholder="굿즈 이름을 입력해주세요."
                          className="w-full bg-transparent text-[14px] text-black placeholder:text-[#A2A2A2] focus:outline-none"
                        />
                      </div>
                    </section>

                    <section className="space-y-[8px]">
                      <h2 className="text-[18px] font-semibold text-[#171617]">브랜드/시리즈 (선택)</h2>
                      <div className="flex items-center gap-[4px] rounded-[8px] bg-[#FCFCFC] p-[12px] border border-[#EEEEEE] focus-within:border-[#2F78FD]">
                        <span className="text-[14px] text-[#545454]">#</span>
                        <input
                          type="text"
                          value={myGoodsBrand}
                          onChange={(e) => setMyGoodsBrand(e.target.value)}
                          placeholder="브랜드나 시리즈를 작성해주세요."
                          className="w-full bg-transparent text-[14px] text-[#171617] placeholder:text-[#A2A2A2] focus:outline-none"
                        />
                      </div>
                    </section>

                    <section className="space-y-[8px]">
                      <h2 className="text-[18px] font-semibold text-[#171617]">상태 (선택)</h2>
                      <div className="grid grid-cols-3 gap-[8px]">
                        {["미개봉", "사용감 적음", "사용감 있음"].map((cond) => (
                          <button
                            key={cond}
                            type="button"
                            onClick={() => setMyGoodsCondition(cond)}
                            className={`h-[48px] rounded-[8px] text-[14px] font-semibold transition-all ${
                              myGoodsCondition === cond
                                ? "bg-[#FCFCFC] border border-[#A6C3F8] text-[#2F78FD]"
                                : "bg-[#F4F4F4] border border-[#DEDEDE] text-[#858485]"
                            }`}
                          >
                            {cond}
                          </button>
                        ))}
                      </div>
                    </section>
                  </div>
                )}

                {/* 3단계: 교환 정보 */}
                {step === 3 && (
                  <div className="space-y-[20px]">
                    <section className="space-y-[8px]">
                      <div className="flex items-center justify-between">
                        <h2 className="text-[18px] font-semibold text-[#171617]">내가 원하는 굿즈 (필수)</h2>
                        {isUploadingImage && <span className="text-xs text-[#2F78FD]">사진 업로드 중...</span>}
                      </div>
                      <div className="flex items-center gap-[12px] overflow-x-auto pb-1">
                        {wantImages.map((img) => (
                          <div key={img.id} className="relative w-[160px] h-[160px] shrink-0 rounded-[8px] bg-[#DEDEDE] overflow-hidden">
                            <img src={img.url} alt="원하는 굿즈" className="h-full w-full object-cover" />
                            <button
                              type="button"
                              aria-label="삭제"
                              onClick={() => handleRemoveWantImage(img.id)}
                              className="absolute right-[8px] top-[8px] flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#171617]/30 text-[#FCFCFC]"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                        {wantImages.length < 4 && (
                          <button
                            type="button"
                            aria-label="사진 추가"
                            disabled={isUploadingImage}
                            onClick={() => wantFileInputRef.current?.click()}
                            className="flex w-[160px] h-[160px] shrink-0 items-center justify-center rounded-[8px] border border-[#2F78FD] bg-[#FCFCFC]"
                          >
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                              <path d="M20 8V32M8 20H32" stroke="#2F78FD" strokeWidth="3" strokeLinecap="round" />
                            </svg>
                          </button>
                        )}
                        <input ref={wantFileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleAddWantImages} />
                      </div>
                    </section>

                    <section className="space-y-[8px]">
                      <h2 className="text-[18px] font-semibold text-[#171617]">굿즈 이름 (필수)</h2>
                      <div className="flex items-center gap-[4px] rounded-[8px] bg-[#FCFCFC] p-[12px] border border-[#EEEEEE] focus-within:border-[#2F78FD]">
                        <input
                          type="text"
                          value={wantGoodsName}
                          onChange={(e) => setWantGoodsName(e.target.value)}
                          placeholder="굿즈 이름을 입력해주세요."
                          className="w-full bg-transparent text-[14px] text-[#171617] placeholder:text-[#A2A2A2] focus:outline-none"
                        />
                      </div>
                    </section>

                    <section className="space-y-[8px]">
                      <h2 className="text-[18px] font-semibold text-[#171617]">브랜드/시리즈 (선택)</h2>
                      <div className="flex items-center gap-[4px] rounded-[8px] bg-[#FCFCFC] p-[12px] border border-[#EEEEEE] focus-within:border-[#2F78FD]">
                        <span className="text-[14px] text-[#545454]">#</span>
                        <input
                          type="text"
                          value={wantGoodsBrand}
                          onChange={(e) => setWantGoodsBrand(e.target.value)}
                          placeholder="브랜드나 시리즈를 작성해주세요."
                          className="w-full bg-transparent text-[14px] text-[#171617] placeholder:text-[#A2A2A2] focus:outline-none"
                        />
                      </div>
                    </section>

                    <section className="space-y-[8px]">
                      <h2 className="text-[18px] font-semibold text-[#171617]">추가 조건 (선택)</h2>
                      <div className="flex flex-col items-end gap-[4px]">
                        <textarea
                          value={additionalCondition}
                          onChange={(e) => setAdditionalCondition(e.target.value.slice(0, 200))}
                          placeholder="글을 작성해주세요. (최대 200자)"
                          className="w-full h-[112px] resize-none rounded-[8px] bg-[#FCFCFC] p-[12px] text-[14px] text-[#171617] placeholder:text-[#A2A2A2] border border-[#EEEEEE] focus:border-[#2F78FD] focus:outline-none transition-all"
                        />
                        <span className="text-[14px] text-[#A2A2A2]">{additionalCondition.length}/200</span>
                      </div>
                    </section>
                  </div>
                )}

              </main>
            </div>

            {/* 하단 버튼 영역 */}
            <footer className="p-[20px] bg-white border-t border-gray-50">
              {step === 1 ? (
                <button
                  type="button"
                  onClick={() => isStep1Valid && setStep(2)}
                  disabled={!isStep1Valid}
                  className={`w-full h-[48px] rounded-[8px] text-[14px] font-semibold transition-all ${
                    isStep1Valid
                      ? "bg-[#2F78FD] text-[#FCFCFC] hover:bg-blue-600 shadow-md shadow-blue-100 cursor-pointer"
                      : "bg-[#F4F4F4] text-[#858485] border border-[#DEDEDE] cursor-not-allowed"
                  }`}
                >
                  다음
                </button>
              ) : (
                <div className="flex gap-[10px]">
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    disabled={isSubmitting || isUploadingImage}
                    className="flex-1 h-[48px] rounded-[8px] bg-[#FCFCFC] border border-[#A6C3F8] text-[14px] font-semibold text-[#2F78FD] hover:bg-blue-50/50 cursor-pointer"
                  >
                    이전
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (step === 2 && isStep2Valid) setStep(3);
                      if (step === 3 && isStep3Valid) handleSubmitExchange();
                    }}
                    disabled={(step === 2 ? !isStep2Valid : !isStep3Valid) || isSubmitting || isUploadingImage}
                    className={`flex-1 h-[48px] rounded-[8px] text-[14px] font-semibold transition-all ${
                      (step === 2 ? isStep2Valid : isStep3Valid) && !isSubmitting && !isUploadingImage
                        ? "bg-[#2F78FD] text-[#FCFCFC] hover:bg-blue-600 shadow-md shadow-blue-100 cursor-pointer"
                        : "bg-[#F4F4F4] text-[#858485] border border-[#DEDEDE] cursor-not-allowed"
                    }`}
                  >
                    {isSubmitting ? "등록 중..." : "다음"}
                  </button>
                </div>
              )}
            </footer>
          </>
        )}

        {/* 4단계: 완료 화면 */}
        {step === 4 && (
          <div className="flex flex-col justify-between h-full bg-white min-h-[874px]">
            <header className="flex h-[60px] items-center justify-between px-5 bg-white">
              <div className="w-6" />
              <h1 className="text-[18px] font-semibold text-[#171617]">완료</h1>
              <button
                type="button"
                aria-label="닫기"
                onClick={() => navigate("/ducktalk")}
                className="p-1 -mr-1 text-[#171617] hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </header>

            <main className="flex flex-col items-center justify-center flex-1 px-5">
              <div className="flex items-center justify-center w-[70px] h-[70px] rounded-full bg-[#2F78FD] mb-[20px] shadow-lg shadow-blue-200">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#FCFCFC" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="text-[22px] font-bold text-[#171617]">교환 글 등록 완료</h2>
            </main>

            <footer className="p-[20px] space-y-[10px]">
              <button
                type="button"
                onClick={() => {
                  if (createdPostId) {
                    navigate(`/ducktalk/exchange/detail/${createdPostId}`);
                  } else {
                    navigate("/ducktalk");
                  }
                }}
                className="w-full h-[48px] rounded-[8px] bg-[#FCFCFC] border border-[#A6C3F8] text-[14px] font-semibold text-[#2F78FD] hover:bg-blue-50/50 transition-all cursor-pointer"
              >
                글 보러가기
              </button>
              <button
                type="button"
                onClick={() => navigate("/ducktalk")}
                className="w-full h-[48px] rounded-[8px] bg-[#2F78FD] text-[14px] font-semibold text-[#FCFCFC] hover:bg-blue-600 transition-all shadow-md shadow-blue-100 cursor-pointer"
              >
                덕톡 라운지로
              </button>
            </footer>
          </div>
        )}

      </div>
    </div>
  );
}