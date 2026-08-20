import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  IoChevronBack,
  IoHeart,
  IoHeartOutline,
  IoChatbubbleOutline,
  IoTrashOutline,
  IoAlertCircleOutline,
  IoLockClosedOutline,
  IoSend,
} from "react-icons/io5";

import {
  getPostDetail,
  deletePost,
  likePost,
  unlikePost,
  reportPost,
  getComments,
  createComment,
  deleteComment,
  reportComment,
} from "../../apis/postApi";
import { getUserProfile } from "../../apis/userApi";
import Avatar from "../../components/common/Avatar";

function CommentItem({ comment, isReply = false, onReply, onDelete, onReport }) {
  const navigate = useNavigate();
  const formattedDate = comment.createdAt ? comment.createdAt.slice(0, 10).replace(/-/g, ".") : "";
  const isHiddenSecret = comment.secret && !comment.content;

  const [authorProfileImage, setAuthorProfileImage] = useState(null);

  // 댓글 목록 API는 작성자 프로필 이미지를 안 주므로, 유저 정보로 채움
  useEffect(() => {
    if (!comment.authorId) return;
    getUserProfile(comment.authorId)
      .then((profile) => setAuthorProfileImage(profile?.profileImageUrl || null))
      .catch((error) => console.error("댓글 작성자 프로필 조회 실패:", error));
  }, [comment.authorId]);

  return (
    <div className={isReply ? "flex flex-col gap-3 border-l border-[#F4F4F4] pl-4" : "flex flex-col gap-3"}>
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => comment.authorId && navigate(`/ducktalk/user?id=${comment.authorId}`)}
          className="flex cursor-pointer items-center gap-3"
        >
          <Avatar
            src={authorProfileImage}
            alt={comment.authorNickname || "사용자"}
            className="h-6 w-6 shrink-0"
          />
          <span className="max-w-[110px] sm:max-w-[160px] md:max-w-[200px] shrink-0 truncate text-[16px] font-semibold text-[#171617]">
            {comment.authorNickname || "사용자"}
          </span>
        </button>
        <span className="shrink-0 text-[12px] text-[#858485]">{formattedDate}</span>
      </div>

      {comment.secret ? (
        <div className="flex items-center gap-1">
          <IoLockClosedOutline size={16} className="text-[#5791FB] shrink-0" />
          <p className="text-[14px] text-[#5791FB]">
            {isHiddenSecret ? "비밀글 입니다." : comment.content}
          </p>
        </div>
      ) : (
        <p className="text-[14px] leading-[21px] text-[#545454] whitespace-pre-wrap">{comment.content}</p>
      )}

      <div className="flex items-center gap-2">
        {!isReply && (
          <button
            type="button"
            onClick={() => onReply(comment)}
            className="text-[12px] text-[#545454] cursor-pointer hover:underline"
          >
            답글 달기
          </button>
        )}

        {comment.mine ? (
          <button
            type="button"
            onClick={() => onDelete(comment.id)}
            className="ml-auto text-[#A2A2A2] cursor-pointer"
            aria-label="댓글 삭제"
          >
            <IoTrashOutline size={18} />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onReport(comment.id)}
            className="ml-auto text-[#A2A2A2] cursor-pointer"
            aria-label="댓글 신고"
          >
            <IoAlertCircleOutline size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

export default function CasualPostDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [postDetail, setPostDetail] = useState(null);
  const [authorProfileImage, setAuthorProfileImage] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [content, setContent] = useState("");
  const [isSecret, setIsSecret] = useState(false);
  const [replyTo, setReplyTo] = useState(null); // { id, authorNickname }
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const fetchComments = useCallback(async () => {
    try {
      const data = await getComments(id);
      setComments(data || []);
    } catch (error) {
      console.error("댓글 목록 조회 실패:", error);
    }
  }, [id]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [detail] = await Promise.all([getPostDetail(id), fetchComments()]);
        setPostDetail(detail);
      } catch (error) {
        console.error("게시글 상세 조회 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id, fetchComments]);

  // 상세 API는 작성자 프로필 이미지를 안 주므로, 유저 정보로 채움
  useEffect(() => {
    if (!postDetail?.authorId) return;
    getUserProfile(postDetail.authorId)
      .then((profile) => setAuthorProfileImage(profile?.profileImageUrl || null))
      .catch((error) => console.error("작성자 프로필 조회 실패:", error));
  }, [postDetail?.authorId]);

  const handleToggleLike = async () => {
    if (!postDetail || isLiking) return;
    try {
      setIsLiking(true);
      if (postDetail.liked) {
        await unlikePost(id);
        setPostDetail((prev) => ({ ...prev, liked: false, likeCount: Math.max(0, prev.likeCount - 1) }));
      } else {
        await likePost(id);
        setPostDetail((prev) => ({ ...prev, liked: true, likeCount: prev.likeCount + 1 }));
      }
    } catch (error) {
      console.error("좋아요 처리 실패:", error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleReportPost = async () => {
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

  const handleDeletePost = async () => {
    if (!window.confirm("게시글을 삭제하시겠습니까?")) return;
    try {
      await deletePost(id);
      navigate("/ducktalk");
    } catch (error) {
      console.error("게시글 삭제 실패:", error);
      alert("게시글 삭제 중 오류가 발생했습니다.");
    }
  };

  const handleReportComment = async (commentId) => {
    const reason = window.prompt("신고 사유를 입력해주세요. (선택 사항)", "");
    if (reason === null) return;
    try {
      await reportComment(commentId, { reason });
      alert("신고가 접수되었습니다.");
    } catch (error) {
      console.error("댓글 신고 실패:", error);
      alert("신고 접수 중 오류가 발생했습니다.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("댓글을 삭제하시겠습니까?")) return;
    try {
      await deleteComment(commentId);
      await fetchComments();
      setPostDetail((prev) =>
        prev ? { ...prev, commentCount: Math.max(0, prev.commentCount - 1) } : prev
      );
    } catch (error) {
      console.error("댓글 삭제 실패:", error);
      alert("댓글 삭제 중 오류가 발생했습니다.");
    }
  };

  const handleSubmitComment = async () => {
    if (!content.trim()) return;
    try {
      setIsSubmitting(true);
      await createComment(id, {
        content: content.trim(),
        parentId: replyTo?.id,
        secret: isSecret,
      });
      setContent("");
      setIsSecret(false);
      setReplyTo(null);
      await fetchComments();
      setPostDetail((prev) => (prev ? { ...prev, commentCount: prev.commentCount + 1 } : prev));
    } catch (error) {
      console.error("댓글 작성 실패:", error);
      alert(error.response?.data?.error?.message || "댓글 작성 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-sm text-[#858485]">
        게시글을 불러오는 중...
      </div>
    );
  }

  if (!postDetail) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-sm text-[#858485]">
        게시글을 찾을 수 없습니다.
      </div>
    );
  }

  const formattedDate = postDetail.createdAt ? postDetail.createdAt.slice(0, 10).replace(/-/g, ".") : "";

  return (
    <div className="min-h-screen bg-[#FEFEFE] pb-24">
      <header className="relative flex h-14 items-center justify-center px-5 border-b border-transparent">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute left-5 cursor-pointer text-2xl text-[#171617]"
          aria-label="뒤로가기"
        >
          <IoChevronBack />
        </button>
        <h1 className="text-[18px] font-semibold text-[#171617]">게시글</h1>
      </header>

      <main className="flex flex-col gap-5 px-5 pt-3">
        {/* 게시글 본문 */}
        <div className="flex flex-col gap-3 rounded-lg border border-white/60 bg-white/75 p-5 shadow-[0_15px_40px_rgba(205,205,205,0.08)] backdrop-blur-[10px]">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() =>
                navigate(`/ducktalk/user?id=${postDetail.authorId}`)
              }
              className="flex cursor-pointer items-center gap-3"
            >
              <Avatar
                src={authorProfileImage}
                alt={postDetail.authorNickname || "사용자"}
                className="h-6 w-6 shrink-0"
              />

              <span className="max-w-[110px] sm:max-w-[160px] md:max-w-[200px] shrink-0 truncate text-[16px] font-semibold text-[#171617]">
                {postDetail.authorNickname || "사용자"}
              </span>
            </button>

            <span className="shrink-0 text-[12px] text-[#858485]">
              {formattedDate}
            </span>
          </div>

          <p className="text-[14px] leading-[21px] text-[#545454] whitespace-pre-wrap">{postDetail.content}</p>

          {postDetail.imageUrls?.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {postDetail.imageUrls.map((url) => (
                <img
                  key={url}
                  src={url}
                  alt="첨부 이미지"
                  className="h-[184px] w-[200px] shrink-0 rounded-lg border border-[#EEEEEE] object-cover"
                />
              ))}
            </div>
          )}

          {postDetail.hashtags?.length > 0 && (
            <div className="flex flex-wrap gap-2 text-[13px] text-[#2F78FD]">
              {postDetail.hashtags.map((tag) => (
                <span key={tag}>#{tag}</span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between gap-3 pt-1 text-[#545454]">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleToggleLike}
                disabled={isLiking}
                className="flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
              >
                {postDetail.liked ? (
                  <IoHeart size={20} className="text-[#FF5A5A]" />
                ) : (
                  <IoHeartOutline size={20} className="text-[#545454]" />
                )}
                <span className="text-[14px] font-semibold leading-[21px]">{postDetail.likeCount}</span>
              </button>
              <div className="flex items-center gap-1.5">
                <IoChatbubbleOutline size={18} className="text-[#545454]" />
                <span className="text-[14px] font-semibold leading-[21px]">{postDetail.commentCount}</span>
              </div>
            </div>

            {postDetail.mine ? (
              <button
                type="button"
                onClick={handleDeletePost}
                className="shrink-0 text-[#A2A2A2] cursor-pointer"
                aria-label="게시글 삭제"
              >
                <IoTrashOutline size={20} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleReportPost}
                className="shrink-0 text-[#A2A2A2] cursor-pointer"
                aria-label="게시글 신고"
              >
                <IoAlertCircleOutline size={18} />
              </button>
            )}
          </div>
        </div>

        {/* 댓글 영역 */}
        <div className="flex flex-col gap-4">
          <h2 className="text-[16px] font-semibold text-[#171617]">댓글</h2>

          {comments.length === 0 ? (
            <div className="py-10 text-center text-sm text-[#A2A2A2]">첫 댓글을 남겨보세요.</div>
          ) : (
            <div className="flex flex-col gap-2">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="flex flex-col gap-4 rounded-lg border border-white/60 bg-white/75 p-5 shadow-[0_15px_40px_rgba(205,205,205,0.08)] backdrop-blur-[10px]"
                >
                  <CommentItem
                    comment={comment}
                    onReply={(c) => setReplyTo({ id: c.id, authorNickname: c.authorNickname })}
                    onDelete={handleDeleteComment}
                    onReport={handleReportComment}
                  />
                  {comment.replies?.map((reply) => (
                    <CommentItem
                      key={reply.id}
                      comment={reply}
                      isReply
                      onReply={() => {}}
                      onDelete={handleDeleteComment}
                      onReport={handleReportComment}
                    />
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* 댓글 입력 바 */}
      <div className="fixed bottom-0 left-0 right-0 mx-auto max-w-[430px] bg-white/90 px-5 py-3 backdrop-blur-md z-30">
        {replyTo && (
          <div className="mb-2 flex items-center justify-between rounded-lg bg-[#F4F4F4] px-3 py-1.5 text-[12px] text-[#545454]">
            <span>{replyTo.authorNickname}님에게 답글 작성 중</span>
            <button type="button" onClick={() => setReplyTo(null)} className="cursor-pointer text-[#858485]">
              취소
            </button>
          </div>
        )}
        <div className="flex items-center gap-2 rounded-full border border-[#DEDEDE] bg-[#F4F4F4] px-3 py-2 backdrop-blur-[10px] shadow-[0px_15px_20px_rgba(206,206,206,0.08)]">
          <button
            type="button"
            onClick={() => setIsSecret((prev) => !prev)}
            aria-label="비밀 댓글로 작성"
            className={`shrink-0 cursor-pointer rounded-full p-1 ${isSecret ? "text-[#2F78FD]" : "text-[#A2A2A2]"}`}
          >
            <IoLockClosedOutline size={20} />
          </button>
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isSubmitting) handleSubmitComment();
            }}
            placeholder={isSecret ? "비밀 댓글을 입력해주세요." : "댓글을 입력해주세요."}
            className="w-full bg-transparent text-[14px] text-[#171617] outline-none placeholder:text-[#A2A2A2]"
          />
          <button
            type="button"
            onClick={handleSubmitComment}
            disabled={!content.trim() || isSubmitting}
            aria-label="댓글 등록"
            className={`shrink-0 cursor-pointer ${
              content.trim() && !isSubmitting ? "text-[#2F78FD]" : "text-[#A2A2A2] cursor-not-allowed"
            }`}
          >
            <IoSend size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
