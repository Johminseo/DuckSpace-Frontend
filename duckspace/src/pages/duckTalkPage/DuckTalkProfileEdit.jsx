import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoChevronBack, IoAdd } from "react-icons/io5";

import { getMyProfile, updateMyProfile } from "../../apis/userApi";
import { uploadImage } from "../../apis/postApi";

function DuckTalkProfileEdit() {
  const navigate = useNavigate();

  const [nickname, setNickname] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const result = await getMyProfile();

        setNickname(result.nickname || "");
        setProfileImageUrl(result.profileImageUrl || "");
      } catch (error) {
        console.error(
          "프로필 조회 실패:",
          error.response?.data || error
        );
      }
    };

    fetchProfile();
  }, []);

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setProfileImageUrl(previewUrl);

    try {
      setUploading(true);
      const imageUrl = await uploadImage(file);
      setProfileImageUrl(imageUrl);
      URL.revokeObjectURL(previewUrl);
    } catch (error) {
      console.error("프로필 이미지 업로드 실패:", error.response?.data || error);
      alert("이미지 업로드 중 오류가 발생했습니다.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!nickname.trim()) {
      alert("닉네임을 입력해주세요.");
      return;
    }

    try {
      await updateMyProfile({
        nickname: nickname.trim(),
        profileImageUrl,
      });

      alert("프로필이 수정되었습니다.");
      navigate(-1);
    } catch (error) {
      console.error(
        "프로필 수정 실패:",
        error.response?.data || error
      );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <header className="relative flex h-14 items-center justify-center px-5">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute left-5 cursor-pointer text-2xl"
        >
          <IoChevronBack />
        </button>

        <h1 className="text-[18px] font-semibold">
          프로필 편집
        </h1>
      </header>

      {/* 프로필 영역 */}
      <div className="flex flex-col items-center px-5 pt-5 pb-3">
        {/* 이미지 */}
        <label className="relative mb-3 flex h-20 w-20 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-[#858485]">
          {profileImageUrl ? (
            <img
              src={profileImageUrl}
              alt="프로필"
              className="h-full w-full object-cover"
            />
          ) : (
            <IoAdd
              size={28}
              className="text-white"
            />
          )}

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </label>

        {/* 닉네임 수정 */}
        <input
          type="text"
          value={nickname}
          onChange={(e) =>
            setNickname(e.target.value)
          }
          maxLength={30}
          className="mb-2 w-[160px] border-b border-[#A6C3F8] bg-transparent text-center text-[16px] font-semibold text-[#545454] outline-none"
        />

        {/* 기존 UI 유지 */}
        <div className="mb-2 flex items-center gap-1 text-[14px] font-semibold text-[#2F78FD]">
          <span>신뢰도 98</span>
          <span>|</span>
          <span>후기 5개</span>
        </div>

        <div className="mb-3 flex items-center gap-2 text-[12px] text-[#A2A2A2]">
          <span>팔로잉</span>
          <span>팔로워</span>
        </div>

        {/* 기존 프로필 편집 버튼 자리 */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={uploading}
          className="flex h-6 cursor-pointer items-center justify-center rounded border border-[#2F78FD] bg-[#5791FB] px-4 text-[11px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploading ? "업로드 중..." : "완료"}
        </button>
      </div>

      {/* 아래 잡담/교환 영역도 기존 화면 그대로 복붙 가능 */}
    </div>
  );
}

export default DuckTalkProfileEdit;