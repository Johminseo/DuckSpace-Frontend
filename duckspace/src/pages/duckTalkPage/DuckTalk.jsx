import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { IoChevronBack, IoSearch, IoAdd } from "react-icons/io5";

import NavBar from "../../components/common/NavBar";
import DuckTalkModal from "../../components/duckTalkComponents/DuckTalkModal";

// 덕톡 마이페이지 아이콘
import userIcon from "../../assets/ducktalkIcon/userIcon.svg";

// 카드 컴포넌트
import DuckTalkChatCard from "../../components/duckTalkComponents/DuckTalkChatCard";
import DuckTalkExchangeCard from "../../components/duckTalkComponents/DuckTalkExchangeCard";

// 실제 백엔드 API
import { getCasualPosts, getExchangePosts } from "../../apis/postApi";
import { getMyProfile } from "../../apis/userApi";

function DuckTalk() {
  const navigate = useNavigate();

  // 뒤로가기 시 탭이 잡담으로 초기화되지 않도록 탭 상태를 URL 쿼리에 실어서 유지
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") === "exchange" ? "exchange" : "chat"; // 'chat' | 'exchange'
  const setActiveTab = (tab) => setSearchParams({ tab }, { replace: true });
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [chatPosts, setChatPosts] = useState([]);
  const [exchangePosts, setExchangePosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [myUserId, setMyUserId] = useState(null);

  // 목록 응답엔 mine 필드가 없어서, 작성자 클릭 시 마이페이지/유저페이지를 구분하려면
  // 내 프로필의 userId를 따로 받아와 authorId와 비교해야 함
  useEffect(() => {
    getMyProfile()
      .then((profile) => setMyUserId(profile.userId))
      .catch((error) => console.error("내 프로필 조회 실패:", error));
  }, []);

  // 탭 변경 또는 검색어 변경 시 서버에서 게시글 목록 조회
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        if (activeTab === "chat") {
          const data = await getCasualPosts({ keyword: search.trim() || undefined });
          setChatPosts(data || []);
        } else {
          const data = await getExchangePosts({ keyword: search.trim() || undefined });
          setExchangePosts(data || []);
        }
      } catch (error) {
        console.error("게시글 목록 불러오기 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    // 검색어 입력 시 디바운스 처리 (300ms)
    const debounceTimer = setTimeout(() => {
      fetchPosts();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [activeTab, search]);

  return (
    <div className="min-h-screen bg-white pb-28">
      {/* 상단 헤더 */}
      <header className="flex h-16 items-center justify-between px-6">
        <button
          onClick={() => navigate(-1)}
          className="cursor-pointer"
          aria-label="뒤로가기"
        >
          <IoChevronBack size={24} />
        </button>

        <h1 className="text-xl font-semibold">덕톡라운지</h1>

        <button
          onClick={() => navigate("/ducktalk/mypage")}
          className="cursor-pointer flex items-center justify-center"
          aria-label="프로필"
        >
          <img src={userIcon} alt="프로필" className="h-6 w-6 object-contain" />
        </button>
      </header>

      {/* 잡담 / 교환 탭 */}
      <div className="grid grid-cols-2 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab("chat")}
          className={`relative h-12 cursor-pointer text-base transition-colors ${
            activeTab === "chat"
              ? "font-medium text-[#5791FB]"
              : "text-[#A2A2A2]"
          }`}
        >
          잡담
          {activeTab === "chat" && (
            <div className="absolute bottom-0 left-0 h-[2px] w-full bg-[#5791FB]" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("exchange")}
          className={`relative h-12 cursor-pointer text-base transition-colors ${
            activeTab === "exchange"
              ? "font-medium text-[#5791FB]"
              : "text-[#A2A2A2]"
          }`}
        >
          교환
          {activeTab === "exchange" && (
            <div className="absolute bottom-0 left-0 h-[2px] w-full bg-[#5791FB]" />
          )}
        </button>
      </div>

      {/* 검색바 */}
      <div className="px-6 py-5">
        <div className="flex h-12 items-center rounded-xl bg-[#FAFAFA] px-4">
          <IoSearch size={24} className="mr-3 shrink-0 text-[#D9D9D9]" />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="키워드로 검색해보세요."
            className="w-full bg-transparent text-sm outline-none placeholder:text-[#A2A2A2]"
          />
        </div>
      </div>

      {/* 게시글 카드 목록 */}
      <main className="px-6">
        {loading ? (
          <div className="py-20 text-center text-sm text-[#A2A2A2]">
            게시글을 불러오는 중...
          </div>
        ) : activeTab === "chat" ? (
          chatPosts.length === 0 ? (
            <div className="py-20 text-center text-sm text-[#A2A2A2]">
              등록된 잡담 글이 없습니다.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {chatPosts.map((post) => (
                <DuckTalkChatCard
                  key={post.id}
                  post={{ ...post, mine: post.authorId === myUserId }}
                />
              ))}
            </div>
          )
        ) : (
          exchangePosts.length === 0 ? (
            <div className="py-20 text-center text-sm text-[#A2A2A2]">
              등록된 교환 글이 없습니다.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {exchangePosts.map((post) => (
                <DuckTalkExchangeCard
                  key={post.id}
                  post={{ ...post, mine: post.authorId === myUserId }}
                  mode="feed"
                />
              ))}
            </div>
          )
        )}
      </main>

      {/* 글쓰기 플로팅 버튼 */}
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-28 right-6 z-40 flex h-16 w-16 cursor-pointer items-center justify-center rounded-full bg-[#2F78FD] shadow-lg active:scale-95 transition-all"
        aria-label="글쓰기"
      >
        <IoAdd size={42} className="text-white" />
      </button>

      {/* 글쓰기 선택 모달 */}
      {isModalOpen && <DuckTalkModal onClose={() => setIsModalOpen(false)} />}

      <NavBar />
    </div>
  );
}

export default DuckTalk;
