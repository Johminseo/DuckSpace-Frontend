import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  IoHeart,
  IoHeartOutline,
  IoTrashOutline,
  IoSwapHorizontal,
} from "react-icons/io5";
import {
  getPostDetail,
  getPostApplications,
  likePost,
  unlikePost,
  deletePost,
} from "../../apis/postApi";
import { getUserProfile } from "../../apis/userApi";
import Avatar from "../common/Avatar";

function DuckTalkExchangeCard({ post, mode = "feed", onRefresh }) {
  const navigate = useNavigate();
  const [offeredItemDetail, setOfferedItemDetail] = useState(null);
  const [applicationCount, setApplicationCount] = useState(null);
  const [authorProfileImage, setAuthorProfileImage] = useState(null);
  const [liked, setLiked] = useState(post.liked ?? false);
  const [likeCount, setLikeCount] = useState(post.likeCount ?? 0);
  const [isLiking, setIsLiking] = useState(false);

  // 마이페이지에서는 목록 API가 안 주는 아이템 이미지/상태와 신청 건수를 카드마다 따로 가져옴
  useEffect(() => {
    if (mode !== "myPage") return;

    getPostDetail(post.id)
      .then((detail) => setOfferedItemDetail(detail?.exchangeInfo?.offeredItem || null))
      .catch((error) => console.error("교환 글 상세 조회 실패:", error));

    if (post.status !== "COMPLETED") {
      getPostApplications(post.id)
        .then((applications) => setApplicationCount((applications || []).length))
        .catch((error) => console.error("게시글별 신청 목록 조회 실패:", error));
    }
  }, [mode, post.id, post.status]);

  // 목록 API는 작성자 프로필 이미지를 안 주므로, 유저 정보로 채움
  useEffect(() => {
    if (!post.authorId) return;
    getUserProfile(post.authorId)
      .then((profile) => setAuthorProfileImage(profile?.profileImageUrl || null))
      .catch((error) => console.error("작성자 프로필 조회 실패:", error));
  }, [post.authorId]);

  // 목록 API는 내가 좋아요 눌렀는지 여부를 안 주므로(항상 비어있음), 상세 조회로 정확히 채움.
  // 이걸 안 하면 새로고침/재진입마다 실제로는 눌렀어도 안 누른 것처럼 보임.
  useEffect(() => {
    getPostDetail(post.id)
      .then((detail) => {
        if (typeof detail?.liked === "boolean") setLiked(detail.liked);
        if (typeof detail?.likeCount === "number") setLikeCount(detail.likeCount);
      })
      .catch((error) => console.error("좋아요 상태 조회 실패:", error));
  }, [post.id]);

  const handleViewApplications = (e) => {
    e.stopPropagation();
    navigate("/ducktalk/exchange/list?tab=received");
  };

  // 게시글 삭제 (내 글)
  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm("게시글을 삭제하시겠습니까?")) return;
    try {
      await deletePost(post.id);
      onRefresh?.();
    } catch (error) {
      console.error("게시글 삭제 실패:", error);
      alert("게시글 삭제 중 오류가 발생했습니다.");
    }
  };

  // 좋아요 토글 (카드 클릭으로 상세 이동되는 것 방지)
  const handleToggleLike = async (e) => {
    e.stopPropagation();
    if (isLiking) return;
    try {
      setIsLiking(true);
      if (liked) {
        await unlikePost(post.id);
        setLiked(false);
        setLikeCount((prev) => Math.max(0, prev - 1));
      } else {
        await likePost(post.id);
        setLiked(true);
        setLikeCount((prev) => prev + 1);
      }
    } catch (error) {
      // 목록 API는 내 좋아요 여부를 안 주므로, 이미 누른 글이면 409가 떨어짐 -> 상태만 동기화
      if (error.response?.status === 409) {
        setLiked((prev) => !prev);
      } else {
        console.error("좋아요 처리 실패:", error);
      }
    } finally {
      setIsLiking(false);
    }
  };

  // 1. 백엔드 필드 매핑 및 기본값 안전 처리
  const authorName = post.authorNickname || post.author || "사용자";
  const title = post.title || post.content || "교환 글";
  const offeredItem = post.offeredItemName || post.goods?.title || "제시 굿즈";
  const wantedItem = post.wantedItemName || post.goods?.series || "희망 굿즈";
  const isCompleted = post.status === "COMPLETED" || post.isCompleted;
  
  // 날짜 포맷 (2026-08-17T... -> 2026.08.17)
  const formattedDate = post.createdAt
    ? post.createdAt.slice(0, 10).replace(/-/g, ".")
    : post.date || "";

  const tagList = Array.isArray(post.tags)
    ? post.tags
    : post.tag
    ? [post.tag]
    : [];

  const handleAuthorClick = (e) => {
    e.stopPropagation();
    if (post.mine) {
      navigate("/ducktalk/mypage");
    } else if (post.authorId) {
      navigate(`/ducktalk/user?id=${post.authorId}`);
    }
  };

  // 상세 페이지 이동
  const handleCardClick = () => {
    navigate(`/ducktalk/exchange/detail/${post.id}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="flex flex-col gap-4 rounded-xl border border-[#F4F4F4] bg-white/75 p-5 shadow-[0_15px_40px_rgba(205,205,205,0.08)] backdrop-blur-[10px] cursor-pointer hover:border-[#A6C3F8] transition-all"
    >
      {/* 1. 상단 작성자 정보 */}
      <div className="flex items-center justify-between gap-2">
        <div
          onClick={handleAuthorClick}
          className="flex items-center gap-3 cursor-pointer"
        >
          <Avatar src={authorProfileImage} alt={authorName} className="h-7 w-7 shrink-0" />
          <span className="max-w-[110px] sm:max-w-[160px] md:max-w-[200px] shrink-0 truncate text-[15px] font-semibold text-[#171617]">
            {authorName}
          </span>
        </div>

        <span className="shrink-0 text-[12px] text-[#858485]">{formattedDate}</span>
      </div>

      {/* 2. 교환 제목 / 내용 */}
      <div className="flex flex-col gap-1.5">
        <h3 className="text-[16px] font-semibold leading-[22px] text-[#171617] line-clamp-1">
          {title}
        </h3>

        {tagList.length > 0 && (
          <div className="flex flex-wrap gap-2 text-[13px] font-normal leading-[18px] text-[#2F78FD]">
            {tagList.map((tag, idx) => (
              <span key={idx}>#{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* 3. 교환 물품 카드 */}
      {mode === "myPage" ? (
        <div className="flex items-center gap-3 rounded-lg border border-white/60 bg-[#F9FAFB] p-3.5 shadow-sm">
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-[#E5E5E5]">
            {offeredItemDetail?.imageUrl && (
              <img
                src={offeredItemDetail.imageUrl}
                alt={offeredItemDetail.itemName}
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[14px] font-semibold text-[#171617]">
              {offeredItemDetail?.itemName || offeredItem}
            </span>
            {offeredItemDetail?.brand && (
              <span className="text-[12px] text-[#858485]">{offeredItemDetail.brand}</span>
            )}
            {offeredItemDetail?.condition && (
              <span className="text-[12px] text-[#858485]">
                {offeredItemDetail.condition === "UNOPENED" ? "미개봉" : "개봉"}
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-lg border border-white/60 bg-[#F9FAFB] p-3.5 shadow-sm">
          <div className="flex flex-col items-center flex-1">
            <span className="text-[11px] font-medium text-[#858485] mb-1">보유 굿즈</span>
            <span className="text-[14px] font-semibold text-[#171617] text-center truncate max-w-[120px]">
              {offeredItem}
            </span>
          </div>

          <IoSwapHorizontal size={20} className="text-black shrink-0 mx-2" />

          <div className="flex flex-col items-center flex-1">
            <span className="text-[11px] font-medium text-[#858485] mb-1">희망 굿즈</span>
            <span className="text-[14px] font-semibold text-black text-center truncate max-w-[120px]">
              {wantedItem}
            </span>
          </div>
        </div>
      )}

      {/* 4. 좋아요 + 신고/메뉴 버튼 */}
      <div className="flex items-center justify-between gap-3 text-[#545454]">
        <button
          type="button"
          onClick={handleToggleLike}
          disabled={isLiking}
          className="flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
        >
          {liked ? (
            <IoHeart size={18} className="text-[#FF5A5A]" />
          ) : (
            <IoHeartOutline size={18} className="text-[#545454]" />
          )}
          <span className="text-[13px] font-semibold">{likeCount}</span>
        </button>

        {mode === "myPage" && (
          <button
            type="button"
            onClick={handleDelete}
            className="shrink-0 text-[#A2A2A2] cursor-pointer"
            aria-label="게시글 삭제"
          >
            <IoTrashOutline size={13} />
          </button>
        )}
      </div>

      {/* 5. 하단 버튼 영역 */}
      <div className="flex gap-4 pt-1" onClick={(e) => e.stopPropagation()}>
        {mode === "myPage" ? (
          isCompleted ? (
            <div className="flex h-11 flex-1 items-center justify-center rounded-lg bg-[#F4F4F4] border border-[#DEDEDE] text-[14px] font-semibold text-[#858485]">
              교환 완료
            </div>
          ) : (
            <button
              type="button"
              onClick={handleViewApplications}
              className="flex h-11 flex-1 items-center justify-center rounded-lg border border-[#A6C3F8] bg-[#FCFCFC] text-[14px] font-semibold text-[#2F78FD] cursor-pointer"
            >
              교환 신청 {applicationCount ?? 0}건
            </button>
          )
        ) : isCompleted ? (
          <div className="flex h-11 flex-1 items-center justify-center rounded-lg bg-[#F4F4F4] border border-[#DEDEDE] text-[14px] font-semibold text-[#858485]">
            교환 완료
          </div>
        ) : (
          <button
            type="button"
            onClick={() => navigate(`/ducktalk/exchange/detail/${post.id}`)}
            className="flex h-11 flex-1 items-center justify-center rounded-lg bg-[#2F78FD] border border-[#2F78FD] text-[14px] font-semibold text-white shadow-sm hover:bg-[#1E67EC] cursor-pointer transition-all"
          >
            교환 상세 / 신청하기
          </button>
        )}
      </div>
    </div>
  );
}

export default DuckTalkExchangeCard;