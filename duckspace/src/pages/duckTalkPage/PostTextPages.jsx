import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createCasualPost, uploadImage } from "../../apis/postApi";

const MAX_IMAGES = 4;
const MAX_LENGTH = 500;

export default function PostTextPages() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [images, setImages] = useState([]);
  const [content, setContent] = useState("");
  const [hashtag, setHashtag] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 사진 선택 시 백엔드 이미지 업로드 API 호출
  const handleAddImages = async (e) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    try {
      setIsUploadingImage(true);
      const remainingSlots = MAX_IMAGES - images.length;
      const targetFiles = files.slice(0, remainingSlots);

      for (const file of targetFiles) {
        const uploadedUrl = await uploadImage(file);
        setImages((prev) => [
          ...prev,
          { id: `${file.name}-${Date.now()}-${Math.random()}`, url: uploadedUrl },
        ]);
      }
    } catch (error) {
      console.error("이미지 업로드 실패:", error);
      alert("이미지 업로드 중 오류가 발생했습니다. (JPG/PNG, 10MB 이하)");
    } finally {
      setIsUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleRemoveImage = (id) => {
    setImages((prev) => prev.filter((image) => image.id !== id));
  };

  // 잡담 글 등록 핸들러
  const handleSubmit = async () => {
    if (!content.trim()) {
      alert("글 내용을 작성해주세요.");
      return;
    }

    try {
      setIsSubmitting(true);

      // 해시태그 문자열을 배열로 분리 (# 및 공백 기준)
      const hashtagsArray = hashtag
        .split(/[\s,#]+/)
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)
        .slice(0, 10);

      const imageUrls = images.map((img) => img.url);

      await createCasualPost({
        content: content.trim(),
        hashtags: hashtagsArray,
        images: imageUrls,
      });

      alert("잡담 글이 작성되었습니다!");
      navigate("/ducktalk");
    } catch (error) {
      console.error("잡담 글 작성 실패:", error);
      alert(error.response?.data?.error?.message || "잡담 글 작성 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen justify-center bg-gray-100 sm:py-8">
      <div className="flex w-full max-w-[402px] flex-col justify-between bg-white sm:min-h-[874px] sm:rounded-3xl sm:shadow-xl border border-gray-100 overflow-hidden">
        
        <div>
          {/* 상단 헤더 */}
          <header className="flex h-[60px] items-center justify-between px-5 bg-white">
            <button
              type="button"
              aria-label="뒤로 가기"
              onClick={() => navigate(-1)}
              className="p-1 -ml-1 text-[#171617] hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <h1 className="text-[18px] font-semibold text-[#171617]">잡담 글 작성</h1>
            <div className="w-6" />
          </header>

          {/* 메인 입력 영역 */}
          <main className="p-[20px] space-y-[20px]">
            
            {/* 사진 섹션 */}
            <section className="space-y-[8px]">
              <div className="flex items-center justify-between h-[25px]">
                <div className="flex items-center gap-[10px]">
                  <span className="text-[18px] font-semibold text-[#171617]">사진</span>
                  <span className="text-[16px] font-normal text-[#A2A2A2]">(최대4장)</span>
                </div>
                {isUploadingImage && (
                  <span className="text-xs text-[#2F78FD]">사진 업로드 중...</span>
                )}
              </div>

              <div className="flex items-center gap-[12px] overflow-x-auto pb-1">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="relative w-[160px] h-[160px] shrink-0 rounded-[8px] bg-[#DEDEDE] overflow-hidden"
                  >
                    <img
                      src={image.url}
                      alt="첨부 이미지"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      aria-label="이미지 삭제"
                      onClick={() => handleRemoveImage(image.id)}
                      className="absolute right-[8px] top-[8px] flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#171617]/30 text-[#FCFCFC] hover:bg-[#171617]/60 transition-colors cursor-pointer"
                    >
                      <svg width="10.5" height="10.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                ))}

                {images.length < MAX_IMAGES && (
                  <button
                    type="button"
                    disabled={isUploadingImage}
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="사진 추가"
                    className="flex w-[160px] h-[160px] shrink-0 items-center justify-center rounded-[8px] border border-[#2F78FD] bg-[#FCFCFC] hover:bg-blue-50/30 transition-colors cursor-pointer"
                  >
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                      <path d="M20 8V32M8 20H32" stroke="#2F78FD" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                  </button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleAddImages}
                />
              </div>
            </section>

            {/* 글 작성 섹션 */}
            <section className="space-y-[8px]">
              <div className="flex items-center gap-[10px] h-[25px]">
                <span className="text-[18px] font-semibold text-[#171617]">글 작성</span>
              </div>
              <div className="flex flex-col items-end gap-[4px]">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value.slice(0, MAX_LENGTH))}
                  placeholder="글을 작성해주세요. (최대 500자)"
                  className="w-full h-[112px] resize-none rounded-[8px] bg-[#FCFCFC] p-[12px] text-[14px] text-[#171617] placeholder:text-[#A2A2A2] border border-[#EEEEEE] focus:border-[#2F78FD] focus:outline-none transition-all"
                />
                <span className="text-[14px] text-[#A2A2A2]">
                  {content.length}/{MAX_LENGTH}
                </span>
              </div>
            </section>

            {/* 해시태그 섹션 */}
            <section className="space-y-[8px]">
              <div className="flex items-center gap-[10px] h-[25px]">
                <span className="text-[18px] font-semibold text-[#171617]">해시태그 (선택)</span>
              </div>
              <input
                type="text"
                value={hashtag}
                onChange={(e) => setHashtag(e.target.value)}
                placeholder="#해시태그를 입력해주세요 (공백으로 구분)"
                className="w-full rounded-[8px] bg-[#FCFCFC] p-[12px] text-[14px] text-[#171617] placeholder:text-[#A2A2A2] border border-[#EEEEEE] focus:border-[#2F78FD] focus:outline-none transition-all"
              />
            </section>
          </main>
        </div>

        {/* 하단 완료 버튼 */}
        <footer className="p-[20px] bg-white">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting || isUploadingImage}
            className={`w-full h-[48px] rounded-[8px] text-[14px] font-semibold text-[#FCFCFC] transition-all duration-200 ${
              content.trim() && !isSubmitting && !isUploadingImage
                ? "bg-[#2F78FD] hover:bg-blue-600 active:scale-[0.99] shadow-md shadow-blue-100 cursor-pointer"
                : "bg-[#DEDEDE] cursor-not-allowed border border-[#DEDEDE] text-[#858485]"
            }`}
          >
            {isSubmitting ? "작성 중..." : "완료"}
          </button>
        </footer>

      </div>
    </div>
  );
}