import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";

import ExchangeUserPreferenceCard from "../components/duckTalkComponents/ExchangeUserPreferenceCard";
import ExchangeGoodsPair from "../components/duckTalkComponents/ExchangeGoodsPair";
import ExchangeActionComplete from "../components/duckTalkComponents/ExchangeActionComplete";
import {
  getPostDetail,
  acceptApplication,
  rejectApplication,
  cancelApplication,
  completeApplication,
  reportPost,
  deletePost,
} from "../apis/postApi";
// ✅ 채팅 API 추가
import { createOrGetChatRoom } from "../apis/chatApi";
import { getUserProfile } from "../apis/userApi";

export default function ExchangeDetail() {
  const navigate = useNavigate();
  const { id } = useParams(); // URL 파라미터 postId (게시글 상세 조회용)
  const [searchParams] = useSearchParams();
  const tabType = searchParams.get("tab") || "feed"; // 'sent' | 'received' | 'progress' | 'completed' | 'feed'
  // 신청 관련 액션(수락/거절/취소/완료)은 applicationId가 필요 — postId(id)와 다른 값이므로 쿼리로 별도 전달받음
  const applicationId = searchParams.get("applicationId") || id;

  const [postDetail, setPostDetail] = useState(null);
  const [authorProfileImage, setAuthorProfileImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionComplete, setActionComplete] = useState(null);

  // 게시글 상세 조회
  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await getPostDetail(id);
        setPostDetail(data);
      } catch (error) {
        console.error("게시글 상세 조회 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  // 상세 API는 작성자 프로필 이미지를 안 주므로, 유저 정보로 채움
  useEffect(() => {
    if (!postDetail?.authorId) return;
    getUserProfile(postDetail.authorId)
      .then((profile) => setAuthorProfileImage(profile?.profileImageUrl || null))
      .catch((error) => console.error("작성자 프로필 조회 실패:", error));
  }, [postDetail?.authorId]);

  // ✅ 1:1 채팅방 생성 및 바로 입장 핸들러 추가
  const handleStartChat = async () => {
    try {
      const partnerId = postDetail?.authorId || postDetail?.writerId || postDetail?.userId;
      const numericPartnerId = Number(partnerId);

      if (!numericPartnerId || isNaN(numericPartnerId)) {
        alert("상대방 유저 정보를 찾지 못했습니다.");
        return;
      }

      const roomData = await createOrGetChatRoom(numericPartnerId);
      const targetRoomId = roomData?.roomId;

      if (targetRoomId) {
        const partnerName = postDetail?.authorNickname || "상대방";
        navigate(`/chat/${targetRoomId}`, { state: { partnerId: numericPartnerId, partnerNickname: partnerName } });
      } else {
        alert("채팅방 번호를 응답받지 못했습니다.");
      }
    } catch (error) {
      console.error("채팅방 개설/입장 실패:", error);
      alert(error.response?.data?.error?.message || "채팅방 입장 중 오류가 발생했습니다.");
    }
  };

  // 신청 수락
  const handleAccept = async () => {
    if (!window.confirm("이 교환 신청을 수락하시겠습니까?")) return;
    try {
      await acceptApplication(applicationId);
      alert("신청을 수락했습니다.");
      navigate("/ducktalk/exchange/list");
    } catch (error) {
      console.error("신청 수락 실패:", error);
      alert("신청 수락 중 오류가 발생했습니다.");
    }
  };

  // 신청 거절
  const handleReject = async () => {
    if (!window.confirm("이 교환 신청을 거절하시겠습니까?")) return;
    try {
      await rejectApplication(applicationId);
      setActionComplete("rejected");
    } catch (error) {
      console.error("신청 거절 실패:", error);
      alert("신청 거절 중 오류가 발생했습니다.");
    }
  };

  // 신청 취소
  const handleCancel = async () => {
    if (!window.confirm("교환 신청을 취소하시겠습니까?")) return;
    try {
      await cancelApplication(applicationId);
      setActionComplete("canceled");
    } catch (error) {
      console.error("신청 취소 실패:", error);
      alert("신청 취소 중 오류가 발생했습니다.");
    }
  };

  // 게시글 신고
  const handleReport = async () => {
    const reason = window.prompt("신고 사유를 입력해주세요. (선택 사항)", "");
    if (reason === null) return;
    try {
      await reportPost(id, { reason });
      alert("신고가 접수되었습니다.");
    } catch (error) {
      console.error("게시글 신고 실패:", error);
      alert("신고 접수 중 오류가 발생했습니다.");
    }
  };

  // 게시글 삭제 (내 글)
  const handleDeletePost = async () => {
    if (!window.confirm("게시글을 삭제하시겠습니까?")) return;
    try {
      await deletePost(id);
      navigate("/ducktalk?tab=exchange");
    } catch (error) {
      console.error("게시글 삭제 실패:", error);
      alert("게시글 삭제 중 오류가 발생했습니다.");
    }
  };

  // 교환 완료 처리
  const handleComplete = async () => {
    if (!window.confirm("교환을 완료 처리하시겠습니까?")) return;
    try {
      await completeApplication(applicationId);
      alert("교환이 완료 처리되었습니다.");
      navigate("/ducktalk/exchange/list");
    } catch (error) {
      console.error("교환 완료 처리 실패:", error);
      alert("교환 완료 처리 중 오류가 발생했습니다.");
    }
  };

  // 탭 타입별 헤더 타이틀 및 세부 설정
  const getTabConfig = () => {
    switch (tabType) {
      case "sent":
        return { title: "보낸 신청", goodsSectionTitle: "교환 신청한 굿즈" };
      case "received":
        return { title: "받은 신청", goodsSectionTitle: "교환 신청받은 굿즈" };
      case "progress":
        return { title: "진행중인 교환", goodsSectionTitle: "교환 진행 중인 굿즈" };
      case "completed":
        return { title: "완료된 교환", goodsSectionTitle: "교환 완료된 굿즈" };
      case "feed":
      default:
        return { title: "교환 글 상세", goodsSectionTitle: "교환 희망 굿즈 대조" };
    }
  };

  const config = getTabConfig();
  const exchangeInfo = postDetail?.exchangeInfo;

  const userObj = {
    userId: postDetail?.authorId,
    name: postDetail?.authorNickname || "작성자",
    score: 95,
    profileImageUrl: authorProfileImage,
  };

  const preferencesObj = {
    popupName: exchangeInfo?.preferredPopupName || "미지정",
    date: exchangeInfo?.preferredDate || "조율 가능",
    time: exchangeInfo?.preferredTime || "조율 가능",
    condition: exchangeInfo?.extraCondition || "없음",
  };

  const firstGoods = {
    title: exchangeInfo?.offeredItem?.itemName || "제시 굿즈",
    series: exchangeInfo?.offeredItem?.brand || "",
    status: exchangeInfo?.offeredItem?.condition === "UNOPENED" ? "미개봉" : "개봉",
    image: exchangeInfo?.offeredItem?.imageUrl,
    label: "작성자 굿즈",
    isMine: postDetail?.mine,
  };

  const secondGoods = {
    title: exchangeInfo?.wantedItem?.itemName || "희망 굿즈",
    series: exchangeInfo?.wantedItem?.brand || "",
    image: exchangeInfo?.wantedItem?.imageUrl,
    label: "원하는 굿즈",
    isMine: false,
  };

  if (actionComplete) {
    return (
      <ExchangeActionComplete
        title={actionComplete === "canceled" ? "교환 신청 취소 완료!" : "교환 신청 거절 완료!"}
        listButtonText="교환목록 보러가기"
        onListClick={() => navigate("/ducktalk/exchange/list")}
        onChatClick={handleStartChat} // ✅ 하드코딩 제거 및 함수 연결
        onClose={() => navigate("/ducktalk/exchange/list")}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-sm text-[#858485]">
        상세 내용을 불러오는 중...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-36">
      <header className="relative flex h-14 items-center justify-center px-5 border-b border-transparent">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute left-5 cursor-pointer text-2xl text-[#171617]"
        >
          <IoChevronBack />
        </button>
        <h1 className="text-[18px] font-semibold text-[#171617]">{config.title}</h1>
      </header>

      <main className="flex flex-col gap-4 px-5 pt-3">
        {/* 1. 상대방 정보 및 선호 조건 카드 */}
        <ExchangeUserPreferenceCard
          user={userObj}
          preferences={preferencesObj}
          onReport={!postDetail?.mine ? handleReport : undefined}
          onDelete={postDetail?.mine ? handleDeletePost : undefined}
        />

        {/* 2. 교환 굿즈 대조 카드 */}
        <ExchangeGoodsPair
          sectionTitle={config.goodsSectionTitle}
          firstGoods={firstGoods}
          secondGoods={secondGoods}
        />

        {/* 3. 본문 내용 */}
        {postDetail?.content && (
          <div className="flex flex-col gap-2 rounded-lg bg-white/75 p-5 shadow-[0px_15px_40px_rgba(205.52,205.52,205.52,0.08)] backdrop-blur-[10px] border border-[#F4F4F4]">
            <h2 className="text-[16px] font-semibold text-[#171617]">상세 설명</h2>
            <p className="text-[14px] leading-[22px] text-[#545454] whitespace-pre-wrap">
              {postDetail.content}
            </p>
          </div>
        )}
      </main>

      {/* 4. 하단 액션 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 mx-auto max-w-[430px] bg-[#FCFCFC] px-5 py-3 z-30 flex flex-col items-center gap-2">
        {tabType === "feed" && (
          exchangeInfo?.status === "COMPLETED" ? (
            <div className="flex h-12 w-full items-center justify-center rounded-lg bg-[#F4F4F4] border border-[#DEDEDE] text-[14px] font-semibold text-[#858485]">
              교환이 완료된 게시글입니다
            </div>
          ) : postDetail?.mine ? (
            <div className="flex h-12 w-full items-center justify-center rounded-lg bg-[#F4F4F4] border border-[#DEDEDE] text-[14px] font-semibold text-[#858485]">
              내가 작성한 글입니다
            </div>
          ) : (
            <button
              type="button"
              onClick={() => navigate(`/ducktalk/exchange/apply/${postDetail?.id || id}`)}
              className="flex h-12 w-full items-center justify-center rounded-lg bg-[#2F78FD] text-[14px] font-semibold text-white shadow-md hover:bg-blue-600 transition-all cursor-pointer"
            >
              교환 신청하기
            </button>
          )
        )}

        {tabType === "received" && (
          <>
            <div className="flex w-full gap-2.5">
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
                className="flex h-12 flex-1 items-center justify-center rounded-lg border border-[#A6C3F8] bg-[#FCFCFC] text-[14px] font-semibold text-[#2F78FD] cursor-pointer"
              >
                수락하기
              </button>
            </div>
            <button
              type="button"
              onClick={handleStartChat} // ✅ 하드코딩 제거
              className="text-[15px] text-[#858485] cursor-pointer py-1"
            >
              채팅하기
            </button>
          </>
        )}

        {tabType === "progress" && (
          <div className="flex w-full gap-2">
            <button
              type="button"
              onClick={handleStartChat} // ✅ 하드코딩 제거
              className="flex h-12 flex-1 items-center justify-center rounded-lg border border-[#A6C3F8] bg-[#FCFCFC] text-[14px] font-semibold text-[#2F78FD] cursor-pointer"
            >
              채팅하기
            </button>
            <button
              type="button"
              onClick={handleComplete}
              className="flex h-12 flex-1 items-center justify-center rounded-lg border border-[#2F78FD] bg-[#5791FB] text-[14px] font-semibold text-[#FCFCFC] cursor-pointer shadow-sm hover:bg-[#2F78FD]"
            >
              교환 완료
            </button>
          </div>
        )}

        {tabType === "sent" && (
          <>
            <button
              type="button"
              onClick={handleCancel}
              className="flex h-12 w-full items-center justify-center rounded-lg border border-[#DEDEDE] bg-[#F4F4F4] text-[14px] font-semibold text-[#858485] cursor-pointer"
            >
              취소하기
            </button>
            <button
              type="button"
              onClick={handleStartChat} // ✅ 하드코딩 제거
              className="text-[15px] text-[#858485] cursor-pointer py-1"
            >
              채팅하기
            </button>
          </>
        )}
      </div>
    </div>
  );
}