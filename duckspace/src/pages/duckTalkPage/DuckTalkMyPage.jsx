import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { IoChevronBack, IoSwapHorizontal } from "react-icons/io5";

import NavBar from "../../components/common/NavBar";

import DuckTalkProfile from "../../components/duckTalkComponents/DuckTalkProfile";
import DuckTalkChatCard from "../../components/duckTalkComponents/DuckTalkChatCard";
import DuckTalkExchangeCard from "../../components/duckTalkComponents/DuckTalkExchangeCard";

import { getMyProfile } from "../../apis/userApi";
import { getCasualPosts, getExchangePosts } from "../../apis/postApi";

function DuckTalkMyPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("chat"); // 'chat' | 'exchange'

  const [profile, setProfile] = useState(null);
  const [chatPosts, setChatPosts] = useState([]);
  const [exchangePosts, setExchangePosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // 내 프로필 조회
  useEffect(() => {
    getMyProfile()
      .then(setProfile)
      .catch((error) => console.error("내 프로필 조회 실패:", error));
  }, []);

  // 내 프로필이 로드된 후, 탭에 맞춰 내가 쓴 글만 조회 (authorId로 필터링)
  useEffect(() => {
    if (!profile?.userId) return;

    const fetchMyPosts = async () => {
      try {
        setLoading(true);
        if (activeTab === "chat") {
          const data = await getCasualPosts({ authorId: profile.userId });
          setChatPosts(data || []);
        } else {
          const data = await getExchangePosts({ authorId: profile.userId });
          setExchangePosts(data || []);
        }
      } catch (error) {
        console.error("내가 쓴 글 조회 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyPosts();
  }, [profile, activeTab, refreshKey]);

  const refreshMyPosts = useCallback(() => setRefreshKey((key) => key + 1), []);

  return (
    <div className="min-h-screen bg-white pb-28">
      {/* 1. 상단 헤더 */}
      <header className="relative flex h-14 items-center justify-center px-5 border-b border-transparent">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute left-5 cursor-pointer text-2xl text-[#171617]"
          aria-label="뒤로가기"
        >
          <IoChevronBack />
        </button>

        <h1 className="text-[18px] font-semibold text-[#171617]">내가 쓴 글</h1>

        {/* 👉 클릭 시 교환 목록(/ducktalk/exchange/list)으로 이동 */}
        <button
          type="button"
          onClick={() => navigate("/ducktalk/exchange/list")}
          className="absolute right-5 cursor-pointer text-2xl text-[#171617]"
          aria-label="교환 목록 보기"
        >
          <IoSwapHorizontal />
        </button>
      </header>

      {/* 2. 내 프로필 영역 */}
      {profile && <DuckTalkProfile profile={profile} isMe={true} />}

      {/* 3. 잡담 / 교환 탭 */}
      <div className="flex border-b border-[#EEEEEE] text-center">
        <button
          type="button"
          onClick={() => setActiveTab("chat")}
          className={`flex-1 py-2.5 text-[14px] leading-[21px] cursor-pointer transition-colors ${
            activeTab === "chat"
              ? "border-b-2 border-[#5791FB] font-semibold text-[#5791FB]"
              : "font-normal text-[#A2A2A2]"
          }`}
        >
          잡담
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("exchange")}
          className={`flex-1 py-2.5 text-[14px] leading-[21px] cursor-pointer transition-colors ${
            activeTab === "exchange"
              ? "border-b-2 border-[#5791FB] font-semibold text-[#5791FB]"
              : "font-normal text-[#A2A2A2]"
          }`}
        >
          교환
        </button>
      </div>

      {/* 4. 게시글 리스트 */}
      <main className="flex flex-col gap-3 px-5 pt-4">
        {loading ? (
          <div className="py-20 text-center text-sm text-[#A2A2A2]">
            불러오는 중...
          </div>
        ) : activeTab === "chat" ? (
          chatPosts.length === 0 ? (
            <div className="py-20 text-center text-sm text-[#A2A2A2]">
              작성한 잡담 글이 없습니다.
            </div>
          ) : (
            chatPosts.map((post) => (
              <DuckTalkChatCard
                key={post.id}
                post={post}
                mode="myPage"
                onRefresh={refreshMyPosts}
              />
            ))
          )
        ) : exchangePosts.length === 0 ? (
          <div className="py-20 text-center text-sm text-[#A2A2A2]">
            작성한 교환 글이 없습니다.
          </div>
        ) : (
          exchangePosts.map((post) => (
            <DuckTalkExchangeCard
              key={post.id}
              post={post}
              mode="myPage"
              onRefresh={refreshMyPosts}
            />
          ))
        )}
      </main>

      {/* 5. 하단 네비게이션 바 */}
      <NavBar />
    </div>
  );
}

export default DuckTalkMyPage;
