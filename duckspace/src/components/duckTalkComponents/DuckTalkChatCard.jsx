import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  IoHeart,
  IoHeartOutline,
  IoChatbubbleOutline,
  IoTrashOutline,
} from "react-icons/io5";
import { deletePost, getPostDetail, likePost, unlikePost } from "../../apis/postApi";
import { getUserProfile } from "../../apis/userApi";
import Avatar from "../Avatar";

function DuckTalkChatCard({ post, mode = "feed", onRefresh }) {
  const navigate = useNavigate();
  const [detailImage, setDetailImage] = useState(null);
  const [authorProfileImage, setAuthorProfileImage] = useState(null);
  const [liked, setLiked] = useState(post.liked ?? false);
  const [likeCount, setLikeCount] = useState(post.likeCount ?? 0);
  const [isLiking, setIsLiking] = useState(false);

  const isMe = mode === "myPage";

  // 마이페이지 목록 API는 첨부 이미지를 안 주므로, 카드마다 상세 조회로 채움
  useEffect(() => {
    if (mode !== "myPage") return;
    getPostDetail(post.id)
      .then((detail) => setDetailImage(detail?.imageUrls?.[0] || null))
      .catch((error) => console.error("잡담 글 상세 조회 실패:", error));
  }, [mode, post.id]);

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

  // 게시글 상세/댓글 화면으로 이동
  const handleCardClick = () => {
    navigate(`/ducktalk/post/${post.id}`);
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

  const authorName = post.authorNickname || "사용자";
  const formattedDate = post.createdAt
    ? post.createdAt.slice(0, 10).replace(/-/g, ".")
    : "";
  const handleAuthorClick = (e) => {
    e.stopPropagation();
    if (post.mine) {
      navigate("/ducktalk/mypage");
    } else if (post.authorId) {
      navigate(`/ducktalk/user?id=${post.authorId}`);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="flex flex-col gap-3 rounded-xl border border-[#F4F4F4] bg-white/75 p-5 shadow-[0_15px_40px_rgba(205,205,205,0.08)] backdrop-blur-[10px] cursor-pointer hover:border-[#A6C3F8] transition-all"
    >
      {/* 1. 상단 작성자 정보 (클릭 시 이동) */}
      <div className="flex items-center justify-between gap-2">
        <div
          onClick={handleAuthorClick}
          className="flex items-center gap-3 cursor-pointer"
        >
          <Avatar src={authorProfileImage} alt={authorName} className="h-6 w-6 shrink-0" />
          <span className="max-w-[110px] sm:max-w-[160px] md:max-w-[200px] shrink-0 truncate text-[16px] font-semibold text-[#171617]">
            {/*{post.author} //// 여기!!!! */}
            {authorName}
          </span>
        </div>

        <span className="shrink-0 text-[12px] text-[#858485]">
          {/*{post.date} //// 여기!!!! */}
          {formattedDate}
        </span>
      </div>

      {/* 2. 본문 내용 */}
      <p className="text-[14px] leading-[21px] text-[#545454] whitespace-pre-line">
        {post.content}
      </p>

      {/* 3. 본문 첨부 이미지 */}
      {(detailImage || post.thumbnailUrl) && (
        <div className="mt-1 h-[184px] w-[200px] overflow-hidden rounded-lg border border-[#EEEEEE]">
          <img
            src={detailImage || post.thumbnailUrl}
            alt="첨부 이미지"
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* 4. 하단 좋아요 & 댓글 + 신고/메뉴 버튼 */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-3 text-[#545454]">
          <button
            type="button"
            onClick={handleToggleLike}
            disabled={isLiking}
            className="flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
          >
            {liked ? (
              <IoHeart size={20} className="text-[#FF5A5A]" />
            ) : (
              <IoHeartOutline size={20} className="text-[#545454]" />
            )}
            <span className="text-[14px] font-semibold leading-[21px]">{likeCount}</span>
          </button>
          <div className="flex items-center gap-1.5">
            <IoChatbubbleOutline size={18} className="text-[#545454]" />
            <span className="text-[14px] font-semibold leading-[21px]">{post.commentCount}</span>
          </div>
        </div>

        {isMe && (
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
    </div>
  );
}

export default DuckTalkChatCard;