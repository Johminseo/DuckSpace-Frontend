import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoSwapHorizontal, IoChevronForward } from "react-icons/io5";
import { acceptApplication, rejectApplication, cancelApplication, getPostDetail } from "../../apis/postApi";
import { getUserProfile } from "../../apis/userApi";
import { createOrGetChatRoom } from "../../apis/chatApi";
import Avatar from "../Avatar";

function ExchangeListCard({ item, activeTab, myUserId, onRefresh }) {
  const navigate = useNavigate();

  // 신청 목록 API는 신청자(applicant) 관점 필드만 줘서, 내가 보낸 신청이면
  // applicantUserId/applicantNickname이 상대방이 아니라 나 자신을 가리킴 —
  // 이 경우 상대방은 게시글 작성자이므로 상세 조회로 따로 구해야 함
  const isSentByMe = item.applicantUserId === myUserId;

  // 받은 신청이면 applicantUserId/닉네임이 곧 상대방이라 바로 계산 가능
  const knownPartner =
    myUserId != null && !isSentByMe
      ? { id: item.applicantUserId, nickname: item.applicantNickname }
      : null;

  // 보낸 신청이면 상대방은 게시글 작성자라, 상세 조회로 별도 확인해야 함
  const [fetchedPartner, setFetchedPartner] = useState(null);

  useEffect(() => {
    if (myUserId == null || !isSentByMe) return;
    const targetPostId = item.postId || item.exchangePostId;
    if (!targetPostId) return;
    getPostDetail(targetPostId)
      .then((detail) =>
        setFetchedPartner({ id: detail?.authorId, nickname: detail?.authorNickname || "상대방" })
      )
      .catch((error) => console.error("게시글 작성자 조회 실패:", error));
  }, [myUserId, isSentByMe, item.postId, item.exchangePostId]);

  const partner = knownPartner || fetchedPartner;
  const [partnerProfileImage, setPartnerProfileImage] = useState(null);

  useEffect(() => {
    if (!partner?.id) return;
    getUserProfile(partner.id)
      .then((profile) => setPartnerProfileImage(profile?.profileImageUrl || null))
      .catch((error) => console.error("상대방 프로필 조회 실패:", error));
  }, [partner?.id]);

  const partnerName = partner?.nickname || "상대방";

  // 1:1 채팅방 진입 핸들러
  const handleStartChat = async () => {
    try {
      if (item.roomId) {
        navigate(`/chat/${item.roomId}`, { state: { partnerId: partner?.id, partnerNickname: partnerName } });
        return;
      }

      if (!partner?.id) {
        alert("상대방 유저 정보를 찾지 못했습니다.");
        return;
      }

      const roomData = await createOrGetChatRoom(partner.id);
      const targetRoomId = roomData?.roomId;

      if (targetRoomId) {
        navigate(`/chat/${targetRoomId}`, { state: { partnerId: partner.id, partnerNickname: partnerName } });
      } else {
        alert("채팅방 번호를 응답받지 못했습니다.");
      }
    } catch (error) {
      console.error("채팅방 개설/입장 실패:", error);
      alert(error.response?.data?.error?.message || "채팅방 입장 중 오류가 발생했습니다.");
    }
  };

  // 신청 취소 처리
  const handleCancel = async () => {
    if (!window.confirm("교환 신청을 취소하시겠습니까?")) return;
    try {
      await cancelApplication(item.id);
      alert("신청이 취소되었습니다.");
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("신청 취소 실패:", error);
      alert("신청 취소 중 오류가 발생했습니다.");
    }
  };

  // 신청 수락 처리
  const handleAccept = async () => {
    if (!window.confirm("이 교환 신청을 수락하시겠습니까?")) return;
    try {
      await acceptApplication(item.id);
      alert("신청을 수락했습니다.");
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("신청 수락 실패:", error);
      alert("신청 수락 중 오류가 발생했습니다.");
    }
  };

  // 신청 거절 처리
  const handleReject = async () => {
    if (!window.confirm("이 교환 신청을 거절하시겠습니까?")) return;
    try {
      await rejectApplication(item.id);
      alert("신청을 거절했습니다.");
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("신청 거절 실패:", error);
      alert("신청 거절 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[#F4F4F4] bg-white/75 p-4 sm:p-5 shadow-[0px_15px_40px_rgba(205.52,205.52,205.52,0.08)] backdrop-blur-[10px]">
      {/* 1. 상대방 프로필 정보 */}
      <div className="flex items-center justify-between rounded-lg border border-[#F4F4F4] px-5 py-2">
        <button
          type="button"
          onClick={() => partner?.id && navigate(`/ducktalk/user?id=${partner.id}`)}
          className="flex cursor-pointer items-center gap-3"
        >
          <Avatar src={partnerProfileImage} alt={partnerName} className="h-9 w-9 shrink-0" />
          <span className="text-[16px] font-semibold leading-[20.8px] text-[#171617]">
            {partnerName}
          </span>
        </button>
        <span className="text-[13px] font-medium text-[#2F78FD]">
          {item.status === "APPLIED" && "대기중"}
          {item.status === "ACCEPTED" && "수락됨"}
          {item.status === "COMPLETED" && "교환 완료"}
          {item.status === "CANCELLED" && "취소됨"}
          {item.status === "REJECTED" && "거절됨"}
        </span>
      </div>

      {/* 2. 교환 굿즈 대조 */}
      <div className="flex items-center justify-between px-2">
        <div className="w-[124px] text-center text-[15px] font-semibold leading-[20.8px] text-[#171617] truncate">
          {item.offeredItemName || "신청 굿즈"}
        </div>
        <IoSwapHorizontal size={22} className="text-[#5791FB] shrink-0" />
        <div className="w-[124px] text-center text-[15px] font-semibold leading-[20.8px] text-[#171617] truncate">
          {item.postTitle || "게시글 굿즈"}
        </div>
      </div>

      {/* 3. 탭별 액션 버튼 분기 */}
      {activeTab === "sent" && (
        <div className="flex gap-3">
          {item.status === "APPLIED" ? (
            <>
              <button
                type="button"
                onClick={handleCancel}
                className="flex h-12 flex-1 items-center justify-center rounded-lg border border-[#DEDEDE] bg-[#F4F4F4] text-[14px] font-semibold text-[#858485] cursor-pointer"
              >
                취소하기
              </button>
              <button
                type="button"
                onClick={handleStartChat}
                className="flex h-12 flex-1 items-center justify-center rounded-lg border border-[#A6C3F8] bg-[#FCFCFC] text-[14px] font-semibold text-[#2F78FD] cursor-pointer hover:bg-blue-50/50 transition-colors"
              >
                채팅하기
              </button>
            </>
          ) : (
            <div className="flex h-12 flex-1 items-center justify-center rounded-lg border border-[#DEDEDE] bg-[#F4F4F4] text-[14px] font-semibold text-[#A2A2A2]">
              {item.status === "CANCELLED" ? "취소 완료" : "종료됨"}
            </div>
          )}
        </div>
      )}

      {activeTab === "received" && (
        <div className="flex gap-3">
          {item.status === "APPLIED" ? (
            <>
              <button
                type="button"
                onClick={handleReject}
                className="flex h-12 flex-1 items-center justify-center rounded-lg border border-[#DEDEDE] bg-[#F4F4F4] text-[14px] font-semibold text-[#858485] cursor-pointer"
              >
                거절하기
              </button>
              <button
                type="button"
                onClick={handleAccept}
                className="flex h-12 flex-1 items-center justify-center rounded-lg border border-[#A6C3F8] bg-[#FCFCFC] text-[14px] font-semibold text-[#2F78FD] cursor-pointer hover:bg-blue-50/50 transition-colors"
              >
                수락하기
              </button>
            </>
          ) : (
            <div className="flex h-12 flex-1 items-center justify-center rounded-lg border border-[#DEDEDE] bg-[#F4F4F4] text-[14px] font-semibold text-[#A2A2A2]">
              {item.status === "REJECTED" ? "거절 완료" : "처리 완료"}
            </div>
          )}
        </div>
      )}

      {(activeTab === "progress" || activeTab === "completed") && (
        <button
          type="button"
          onClick={handleStartChat}
          className="flex h-12 w-full items-center justify-center rounded-lg border border-[#2F78FD] bg-[#5791FB] text-[14px] font-semibold text-[#FCFCFC] cursor-pointer shadow-sm hover:bg-[#2F78FD] transition-all"
        >
          채팅하기
        </button>
      )}

      {/* 4. 자세히 보기 버튼 */}
      <div
        onClick={() =>
          navigate(`/ducktalk/exchange/detail/${item.postId}?applicationId=${item.id}&tab=${activeTab}`)
        }
        className="flex items-center justify-end gap-1 cursor-pointer text-[#A2A2A2] hover:text-[#545454] transition-colors"
      >
        <span className="text-[14px] font-normal leading-[24px]">게시글 보기</span>
        <IoChevronForward size={16} />
      </div>
    </div>
  );
}

export default ExchangeListCard;