import { IoCheckmarkCircle, IoAlertCircleOutline, IoTrashOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import Avatar from "../Avatar";

function ExchangeUserPreferenceCard({ user, preferences, onReport, onDelete }) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-white/60 bg-white/75 p-4 sm:p-5 shadow-[0px_15px_40px_rgba(205.52,205.52,205.52,0.08)] backdrop-blur-[10px]">
      {/* 상단 사용자 이름 & 신뢰도 */}
      <div className="flex flex-wrap items-center justify-between gap-y-1">
        <button
          type="button"
          onClick={() => {
            if (!user?.userId) return;

            navigate(`/ducktalk/user?id=${user.userId}`);
          }}
          className="flex min-w-0 cursor-pointer items-center gap-3"
        >
          <Avatar src={user.profileImageUrl} alt={user.name} className="h-12 w-12 shrink-0" />

          <span className="max-w-[90px] sm:max-w-[160px] md:max-w-[200px] shrink-0 truncate text-[18px] font-semibold leading-[25.2px] text-[#171617]">
            {user.name}
          </span>
        </button>
        <div className="flex shrink-0 items-center gap-1 text-[#2F78FD]">
          <IoCheckmarkCircle size={20} />
          <span className="text-[16px] font-semibold leading-[20.8px]">
            신뢰도 {user.score}
          </span>
        </div>
      </div>

      {/* 하단 선호 팝업/날짜/시간 태그 */}
      <div className="flex flex-col gap-2 pt-2 border-t border-[#EEEEEE]/60 text-[14px]">
        <div className="flex items-center justify-between">
          <span className="font-semibold leading-[21px] text-[#171617]">선호하는 팝업</span>
          <span className="font-semibold leading-[21px] text-[#2F78FD]"># {preferences.popup}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-semibold leading-[21px] text-[#171617]">선호하는 날짜</span>
          <span className="font-semibold leading-[21px] text-[#2F78FD]"># {preferences.date}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-semibold leading-[21px] text-[#171617]">선호하는 시간</span>
          <span className="font-semibold leading-[21px] text-[#2F78FD]"># {preferences.time}</span>
        </div>
      </div>

      {(onReport || onDelete) && (
        <div className="flex items-center justify-end">
          {onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              className="shrink-0 text-[#A2A2A2] cursor-pointer"
              aria-label="게시글 삭제"
            >
              <IoTrashOutline size={18} />
            </button>
          ) : (
            <button
              type="button"
              onClick={onReport}
              className="shrink-0 text-[#A2A2A2] cursor-pointer"
              aria-label="게시글 신고"
            >
              <IoAlertCircleOutline size={18} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default ExchangeUserPreferenceCard;
