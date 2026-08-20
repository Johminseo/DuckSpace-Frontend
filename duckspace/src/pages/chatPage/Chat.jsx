import { useState, useEffect } from "react";
import { IoChevronBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

import NavBar from "../../components/common/NavBar";
import Avatar from "../../components/common/Avatar";
import { getChatRooms } from "../../apis/chatApi";
import { getUserProfile } from "../../apis/userApi";

function Chat() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileImages, setProfileImages] = useState({}); // partnerId -> profileImageUrl

  // 참여 중인 채팅방 목록 조회
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const data = await getChatRooms();
        setRooms(data || []);
      } catch (error) {
        console.error("채팅방 목록 불러오기 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  // 채팅방 목록 API는 상대방 프로필 이미지를 안 주므로, partnerId로 유저 정보를 따로 채운다
  useEffect(() => {
    const partnerIds = [
      ...new Set(rooms.map((room) => room.partnerId).filter(Boolean)),
    ];
    if (partnerIds.length === 0) return;

    Promise.all(
      partnerIds.map((id) =>
        getUserProfile(id)
          .then((profile) => [id, profile?.profileImageUrl || null])
          .catch((error) => {
            console.error("상대방 프로필 조회 실패:", error);
            return [id, null];
          })
      )
    ).then((results) => {
      setProfileImages(Object.fromEntries(results));
    });
  }, [rooms]);

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000 / 60);

    if (diff < 1) return "방금 전";
    if (diff < 60) return `${diff}분 전`;

    return `${String(date.getFullYear()).slice(2)}.${String(
      date.getMonth() + 1
    ).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
  };

  const handleRoomClick = (room) => {
    const roomId = room.roomId;
    const partnerId = room.partnerId;
    const partnerNickname = room.partnerNickname || "상대방";
    const partnerProfileImageUrl = profileImages[partnerId] || null;

    navigate(`/chat/${roomId}`, {
      state: {
        partnerId,
        partnerNickname,
        partnerProfileImageUrl,
      },
    });
  };

  const handleProfileClick = (e, partnerId) => {
    e.stopPropagation();
    if (!partnerId) return;
    navigate(`/ducktalk/user?id=${partnerId}`);
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* 상단 헤더 */}
      <header className="relative flex h-[60px] items-center justify-center border-b border-[#F4F4F4]">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute left-5 cursor-pointer"
          aria-label="뒤로가기"
        >
          <IoChevronBack size={24} />
        </button>

        <h1 className="text-[16px] font-medium text-black">채팅</h1>
      </header>

      {/* 채팅 목록 영역 */}
      <div>
        {loading ? (
          <div className="py-20 text-center text-sm text-[#A2A2A2]">
            채팅방 목록을 불러오는 중...
          </div>
        ) : rooms.length === 0 ? (
          <div className="py-20 text-center text-sm text-[#A2A2A2]">
            진행 중인 채팅이 없습니다.
          </div>
        ) : (
          rooms.map((room) => {
            const roomId = room.roomId;
            const partnerId = room.partnerId;
            const partnerName = room.partnerNickname || "상대방";
            const lastMsg = room.lastMessage || "대화 내용이 없습니다.";
            const lastTime = room.lastMessageAt;
            const hasUnread = room.hasUnread;

            return (
              <div
                key={roomId}
                role="button"
                tabIndex={0}
                onClick={() => handleRoomClick(room)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") handleRoomClick(room);
                }}
                className="flex w-full items-center border-b border-[#F4F4F4] px-5 py-4 text-left cursor-pointer hover:bg-gray-50/70 transition-colors"
              >
                {/* 프로필 이미지 — 누르면 채팅방이 아니라 상대방 프로필로 이동 */}
                <button
                  type="button"
                  onClick={(e) => handleProfileClick(e, partnerId)}
                  className="shrink-0 cursor-pointer"
                  aria-label={`${partnerName} 프로필 보기`}
                >
                  <Avatar
                    src={profileImages[partnerId]}
                    alt="프로필"
                    className="h-[40px] w-[40px]"
                  />
                </button>

                {/* 채팅 요약 정보 */}
                <div className="ml-3 min-w-0 flex-1">
                  <div className="flex items-center">
                    <p className="text-[15px] font-medium text-black truncate max-w-[180px]">
                      {partnerName}
                    </p>

                    <span className="ml-2 text-[12px] text-[#A2A2A2]">
                      {formatTime(lastTime)}
                    </span>

                    {hasUnread && (
                      <span className="ml-1.5 h-[6px] w-[6px] rounded-full bg-[#5791FB]" />
                    )}
                  </div>

                  <p
                    className={`mt-1 truncate text-[13px] ${
                      hasUnread ? "font-medium text-[#2F78FD]" : "text-[#A2A2A2]"
                    }`}
                  >
                    {lastMsg}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <NavBar />
    </div>
  );
}

export default Chat;