import { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";

import ChatMessage from "../../components/chatComponents/ChatMessage";
import ChatInput from "../../components/chatComponents/ChatInput";
import { getChatMessages, sendChatMessage } from "../../apis/chatApi";

function ChatRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const partnerId = location.state?.partnerId || null;
  const partnerNickname = location.state?.partnerNickname || "대화 상대";
  const partnerProfileImageUrl = location.state?.partnerProfileImageUrl || null;
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // 자동 스크롤 (맨 아래로)
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 메시지 목록 조회 함수
  const fetchMessages = async (isFirst = false) => {
    if (!roomId) return;
    try {
      if (isFirst) setLoading(true);
      const data = await getChatMessages(roomId);
      setMessages(data || []);
    } catch (error) {
      console.error("대화 내용 조회 실패:", error);
    } finally {
      if (isFirst) setLoading(false);
    }
  };

  // 1. 최초 진입 시 로드 및 3초 주기 폴링(Polling)
  useEffect(() => {
    fetchMessages(true);

    const interval = setInterval(() => {
      fetchMessages(false);
    }, 3000);

    return () => clearInterval(interval);
  }, [roomId]);

  // 새 메시지 수신 시 스크롤 이동
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 메시지 전송 핸들러
  const handleSendMessage = async (content) => {
    try {
      await sendChatMessage(roomId, content);
      await fetchMessages(false);
      scrollToBottom();
    } catch (error) {
      console.error("메시지 전송 실패:", error);
      alert("메시지 전송에 실패했습니다.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* 1. 상단 헤더 */}
      <header className="relative flex h-[60px] shrink-0 items-center justify-center border-b border-[#F4F4F4] bg-white sticky top-0 z-20">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute left-5 cursor-pointer"
          aria-label="뒤로가기"
        >
          <IoChevronBack size={24} />
        </button>

        {partnerId ? (
          <button
            type="button"
            onClick={() => navigate(`/ducktalk/user?id=${partnerId}`)}
            className="cursor-pointer text-[16px] font-medium text-black"
          >
            {partnerNickname}
          </button>
        ) : (
          <h1 className="text-[16px] font-medium text-black">
            {partnerNickname}
          </h1>
        )}
      </header>

      {/* 2. 대화 메시지 영역 */}
      <main className="flex-1 overflow-y-auto px-5 py-5">
        {loading ? (
          <div className="py-20 text-center text-sm text-[#A2A2A2]">
            대화 내용을 불러오는 중...
          </div>
        ) : messages.length === 0 ? (
          <div className="py-20 text-center text-sm text-[#A2A2A2]">
            첫 메시지를 보내 대화를 시작해보세요!
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map((message) => (
              <ChatMessage
                key={message.messageId}
                message={message}
                partnerId={partnerId}
                partnerNickname={partnerNickname}
                profileImage={partnerProfileImageUrl}
              />
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* 3. 하단 입력창 */}
      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
}

export default ChatRoom;