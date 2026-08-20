import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoCheckmarkCircle } from "react-icons/io5";
import { followUser, unfollowUser, getFollowing } from "../../apis/followApi";
import { getUserProfile, getMyProfile, } from "../../apis/userApi";
import Avatar from "../common/Avatar";

function DuckTalkProfile({ profile, isMe = true }) {

  // 팔로우 상태 토글 (다른 사람 프로필용) — isFollowing은 백엔드가 아직 안 내려줘서 당분간 로컬 state로만 관리
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentProfile, setCurrentProfile] = useState(profile || null);
  const [followLoading, setFollowLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    setCurrentProfile(profile || null);
  }, [profile]);

  useEffect(() => {
    if (isMe || !profile?.userId) return;

    const fetchFollowStatus = async () => {
      try {
        // 1. 내 userId 조회
        const myResult = await getMyProfile();

        const myProfile = myResult?.data ?? myResult;
        const myUserId = myProfile?.userId;

        if (!myUserId) {
          console.error("내 userId를 찾을 수 없음:", myResult);
          return;
        }

        // 2. 내가 팔로우하고 있는 사람들 조회
        const followingResult = await getFollowing(myUserId);

        // 아래 배열 위치는 실제 GET following 응답에 맞춰야 함
        const followingData =
          followingResult?.data ?? followingResult;

        const followingList =
          followingData?.items ??
          (Array.isArray(followingData) ? followingData : []);

        // 3. 현재 보고 있는 상대가 목록에 있는지 확인
        const following = followingList.some(
          (user) =>
            Number(user.userId) ===
            Number(profile.userId)
        );

        setIsFollowing(following);
      } catch (error) {
        console.error(
          "팔로우 상태 조회 실패:",
          error.response?.data || error
        );
      }
    };

    fetchFollowStatus();
  }, [profile?.userId, isMe]);

  const refreshProfile = async () => {
    try {
      const result = await getUserProfile(profile.userId);

      setCurrentProfile(result);
    } catch (error) {
      console.error(
        "프로필 재조회 실패:",
        error.response?.data || error
      );
    }
  };
  const handleFollow = async () => {
    if (followLoading) return;

    setIsFollowing(true);

    try {
      setFollowLoading(true);

      await followUser(profile.userId);

      await refreshProfile();
    } catch (error) {
      setIsFollowing(false);

      console.error(
        "팔로우 실패:",
        error.response?.data || error
      );
    } finally {
      setFollowLoading(false);
    }
  };

  const handleUnfollow = async () => {
    if (followLoading) return;

    setIsFollowing(false);

    try {
      setFollowLoading(true);

      await unfollowUser(profile.userId);

      await refreshProfile();
    } catch (error) {
      setIsFollowing(true);

      console.error(
        "언팔로우 실패:",
        error.response?.data || error
      );
    } finally {
      setFollowLoading(false);
    }
  };


  return (
    <div className="flex flex-col items-center justify-center pt-5 pb-3 px-5">
      {/* 아바타 원 */}
      <Avatar src={profile.profileImageUrl} alt={profile.nickname} className="h-20 w-20 mb-3" />

      {/* 이름 & 파란 체크 */}
      <div className="flex items-center gap-1 mb-1">
        <IoCheckmarkCircle className="text-[#2F78FD] text-lg" />
        <span className="text-[16px] font-semibold leading-[20.8px] text-[#545454]">
          {profile.nickname}
        </span>
      </div>

      {/* 신뢰도 | 후기 — 백엔드 스코프 밖이라 당분간 보류, 값 없으면 자리만 채움 */}
      <div className="flex items-center gap-1 text-[14px] font-semibold leading-[21px] text-[#2F78FD] mb-2">
        <span>신뢰도 98</span>
        <span>|</span>
        <span>후기 5개</span>
      </div>

      {/* 팔로잉 / 팔로워 */}
      {/* <div className="flex items-center gap-2 text-[12px] font-normal leading-[19.2px] text-[#A2A2A2] mb-3">
        <span>
          팔로잉 {currentProfile?.followingCount ?? profile?.followingCount ?? 0}
        </span>
        <span>
          팔로워 {currentProfile?.followerCount ?? profile?.followerCount ?? 0}
        </span>
      </div> */}
      <div className="flex items-center gap-2 text-[12px] font-normal leading-[19.2px] text-[#A2A2A2] mb-3">
        <button
          type="button"
          onClick={() =>
            navigate(
              `/ducktalk/follow?userId=${profile.userId}&tab=following`
            )
          }
          className="cursor-pointer"
        >
          팔로잉 {currentProfile?.followingCount ?? profile?.followingCount ?? 0}
        </button>

        <button
          type="button"
          onClick={() =>
            navigate(
              `/ducktalk/follow?userId=${profile.userId}&tab=followers`
            )
          }
          className="cursor-pointer"
        >
          팔로워 {currentProfile?.followerCount ?? profile?.followerCount ?? 0}
        </button>
      </div>

      {/* 버튼 (내 글: 프로필 편집 / 타인 글: 팔로우/팔로잉 토글) */}
      <div>
        {isMe ? (
          <button
            type="button"
            onClick={() => navigate("/ducktalk/profile/edit")}
            className="h-6 px-4 flex items-center justify-center rounded bg-[#FCFCFC] border border-[#A6C3F8] text-[11px] font-semibold leading-[17.6px] text-[#2F78FD] cursor-pointer"
          >
            프로필 편집
          </button>
        ) : isFollowing ? (
          <button
            type="button"
            onClick={handleUnfollow}
            disabled={followLoading}
            className="h-6 px-4 flex items-center justify-center rounded bg-[#FCFCFC] border border-[#A6C3F8] text-[11px] font-semibold leading-[17.6px] text-[#2F78FD] cursor-pointer"
          >
            팔로잉
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFollow}
            disabled={followLoading}
            className="h-6 px-4 flex items-center justify-center rounded bg-[#5791FB] border border-[#2F78FD] text-[11px] font-semibold leading-[17.6px] text-white cursor-pointer"
          >
            팔로우
          </button>
        )}
      </div>
    </div>
  );
}

export default DuckTalkProfile;
