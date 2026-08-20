import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";

import NavBar from "../components/NavBar";
import DuckTalkProfile from "../components/duckTalkComponents/DuckTalkProfile";
import DuckTalkChatCard from "../components/duckTalkComponents/DuckTalkChatCard";
import DuckTalkExchangeCard from "../components/duckTalkComponents/DuckTalkExchangeCard";
import shelfIcon from "../assets/shelfIcon.svg";

import { getUserProfile } from "../apis/userApi";
import { getCasualPosts, getExchangePosts } from "../apis/postApi";
import { getUserExhibitions } from "../apis/displayApi";

function DuckTalkUserPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("id");

  const [activeTab, setActiveTab] = useState("chat"); // 'chat' | 'exchange'
  const [profile, setProfile] = useState(null);
  const [chatPosts, setChatPosts] = useState([]);
  const [exchangePosts, setExchangePosts] = useState([]);
  const [loading, setLoading] = useState(false);

  // 이 유저의 장식장 목록에서 가장 오래된(exhibitionId가 가장 낮은) 걸 첫 화면으로 이동.
  // 거기서부터는 Display.jsx가 같은 유저의 나머지 장식장을 탭으로 보여준다.
  const handleViewExhibition = async () => {
    try {
      const result = await getUserExhibitions(userId, { limit: 50 });
      const list = result.data || [];

      if (list.length === 0) {
        alert("아직 만든 장식장이 없는 유저예요.");
        return;
      }

      const firstExhibition = list.reduce((oldest, exhibition) =>
        exhibition.exhibitionId < oldest.exhibitionId ? exhibition : oldest
      );

      navigate(`/display?id=${firstExhibition.exhibitionId}`);
    } catch (error) {
      console.error("장식장 목록 조회 실패:", error.response?.data || error);
    }
  };

  // 해당 유저 프로필 조회
  useEffect(() => {
    if (!userId) return;
    getUserProfile(userId)
      .then(setProfile)
      .catch((error) => console.error("유저 프로필 조회 실패:", error));
  }, [userId]);

  // 탭에 맞춰 해당 유저가 쓴 글만 조회 (authorId로 필터링)
  useEffect(() => {
    if (!userId) return;

    const fetchUserPosts = async () => {
      try {
        setLoading(true);
        if (activeTab === "chat") {
          const data = await getCasualPosts({ authorId: userId });
          setChatPosts(data || []);
        } else {
          const data = await getExchangePosts({ authorId: userId });
          setExchangePosts(data || []);
        }
      } catch (error) {
        console.error("유저 게시글 조회 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, [userId, activeTab]);

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

        <h1 className="text-[18px] font-semibold text-[#171617]">덕톡 라운지</h1>

        {/* 우측 상단: 해당 유저 전시장(장식장) 이동 아이콘 */}
        <button
          type="button"
          onClick={handleViewExhibition}
          className="absolute right-5 cursor-pointer flex items-center justify-center"
          aria-label="유저 전시장 보기"
        >
          <img src={shelfIcon} alt="전시장 아이콘" className="h-6 w-6 object-contain" />
        </button>
      </header>

      {/* 2. 다른 사람 프로필 영역 */}
      {profile && <DuckTalkProfile profile={profile} isMe={false} />}

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

      {/* 4. 게시글 목록 영역 */}
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
              <DuckTalkChatCard key={post.id} post={post} mode="otherUser" />
            ))
          )
        ) : exchangePosts.length === 0 ? (
          <div className="py-20 text-center text-sm text-[#A2A2A2]">
            작성한 교환 글이 없습니다.
          </div>
        ) : (
          exchangePosts.map((post) => (
            <DuckTalkExchangeCard key={post.id} post={post} mode="otherUser" />
          ))
        )}
      </main>

      {/* 5. 하단 네비게이션 바 */}
      <NavBar />
    </div>
  );
}

export default DuckTalkUserPage;
