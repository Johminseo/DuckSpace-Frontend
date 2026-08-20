import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { IoChevronBack, IoCheckmarkCircle } from "react-icons/io5";

import NavBar from "../../components/common/NavBar";
import Avatar from "../../components/common/Avatar";

import { getFollowing, getFollowers, } from "../../apis/followApi";


function DuckTalkFollowPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const userId = searchParams.get("userId");
  const initialTab = searchParams.get("tab") || "following";

  const [activeTab, setActiveTab] = useState(initialTab);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const fetchFollowList = async () => {
      try {
        setLoading(true);

        let result;

        if (activeTab === "following") {
          result = await getFollowing(userId);
        } else {
          result = await getFollowers(userId);
        }

        const data = result?.data ?? result;

        const list =
          data?.items ??
          (Array.isArray(data) ? data : []);

        setUsers(list);
      } catch (error) {
        console.error(
          "팔로우 목록 조회 실패:",
          error.response?.data || error
        );

        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowList();
  }, [userId, activeTab]);

  const handleUserClick = (targetUserId) => {
    navigate(`/ducktalk/user?id=${targetUserId}`);
  };

  return (
    <div className="min-h-screen bg-white pb-28">
      {/* 헤더 */}
      <header className="relative flex h-14 items-center justify-center px-5">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute left-5 cursor-pointer text-2xl text-[#171617]"
          aria-label="뒤로가기"
        >
          <IoChevronBack />
        </button>

        <h1 className="text-[18px] font-semibold text-[#171617]">
          팔로우
        </h1>
      </header>

      {/* 팔로잉 / 팔로워 탭 */}
      <div className="flex border-b border-[#EEEEEE] text-center">
        <button
          type="button"
          onClick={() => setActiveTab("following")}
          className={`flex-1 py-3 text-[14px] cursor-pointer ${
            activeTab === "following"
              ? "border-b-2 border-[#5791FB] font-semibold text-[#5791FB]"
              : "text-[#A2A2A2]"
          }`}
        >
          팔로잉
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("followers")}
          className={`flex-1 py-3 text-[14px] cursor-pointer ${
            activeTab === "followers"
              ? "border-b-2 border-[#5791FB] font-semibold text-[#5791FB]"
              : "text-[#A2A2A2]"
          }`}
        >
          팔로워
        </button>
      </div>

      {/* 유저 목록 */}
      <main className="flex flex-col gap-3 px-5 pt-5">
        {loading ? (
          <div className="py-20 text-center text-sm text-[#A2A2A2]">
            불러오는 중...
          </div>
        ) : users.length === 0 ? (
          <div className="py-20 text-center text-sm text-[#A2A2A2]">
            {activeTab === "following"
              ? "팔로잉한 사용자가 없습니다."
              : "팔로워가 없습니다."}
          </div>
        ) : (
          users.map((user) => (
            <button
              key={user.userId}
              type="button"
              onClick={() => handleUserClick(user.userId)}
              className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-[#EEEEEE] bg-white px-4 py-4"
            >
              <div className="flex items-center gap-3">
                {/* 프로필 이미지 */}
                <Avatar src={user.profileImageUrl} alt={user.nickname} className="h-11 w-11" />

                {/* 닉네임 */}
                <span className="text-[16px] font-semibold text-[#171617]">
                  {user.nickname}
                </span>
              </div>

              
            </button>
          ))
        )}
      </main>

      
    </div>
  );
}

export default DuckTalkFollowPage;