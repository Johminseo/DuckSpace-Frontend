import chatActiveIcon from "../../assets/ducktalkIcon/chat_active.svg";
import chatInactiveIcon from "../../assets/ducktalkIcon/chat_inactive.svg";
import exchangeActiveIcon from "../../assets/ducktalkIcon/exchange_active.svg";
import exchangeInactiveIcon from "../../assets/ducktalkIcon/exchange_inactive.svg";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function DuckTalkModal({ onClose }) {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState("chat");

    const handleNext = () => {
        if (selectedCategory === "chat") {
            navigate("/create/text");
        }

        if (selectedCategory === "exchange") {
            navigate("/create/exchange");
        }
    };

    return (
        /* 뒷배경 */
        <div className="fixed inset-0 z-[100] flex items-end bg-[#464545]/70">

        {/* 모달 */}
        <div className="w-full rounded-t-[24px] bg-white px-5 pb-6 pt-4">

            {/* 제목 */}
            <p className="mb-8 text-center text-lg leading-7 text-[#858485]">
            새 글을 작성할 카테고리를
            <br />
            선택해주세요
            </p>

            {/* 잡담 선택 */}
            <button
            type="button"
            onClick={() => setSelectedCategory("chat")}
            className={`mb-2 flex w-full cursor-pointer items-center rounded-xl border px-6 py-5 text-left ${
                selectedCategory === "chat"
                ? "border-[#5791FB] bg-[#5791FB]"
                : "border-[#5791FB] bg-white"
            }`}
            >
            <img
                src={
                selectedCategory === "chat"
                    ? chatActiveIcon
                    : chatInactiveIcon
                }
                alt="잡담"
                className="mr-5 h-12 w-12 object-contain"
            />

            <div>
                <p
                className={`text-lg font-semibold ${
                    selectedCategory === "chat"
                    ? "text-white"
                    : "text-[#5791FB]"
                }`}
                >
                잡담 글 작성
                </p>

                <p
                className={`mt-1 text-base ${
                    selectedCategory === "chat"
                    ? "text-white"
                    : "text-[#5791FB]"
                }`}
                >
                일상 이야기를 나눠요.
                </p>
            </div>
            </button>

            {/* 교환 선택 */}
            <button
            type="button"
            onClick={() => setSelectedCategory("exchange")}
            className={`mb-6 flex w-full cursor-pointer items-center rounded-xl border px-6 py-5 text-left ${
                selectedCategory === "exchange"
                ? "border-[#5791FB] bg-[#5791FB]"
                : "border-[#5791FB] bg-white"
            }`}
            >
            <img
                src={
                selectedCategory === "exchange"
                    ? exchangeActiveIcon
                    : exchangeInactiveIcon
                }
                alt="교환"
                className="mr-5 h-12 w-12 object-contain"
            />

            <div>
                <p
                className={`text-lg font-semibold ${
                    selectedCategory === "exchange"
                    ? "text-white"
                    : "text-[#5791FB]"
                }`}
                >
                교환 글 작성
                </p>

                <p
                className={`mt-1 text-base ${
                    selectedCategory === "exchange"
                    ? "text-white"
                    : "text-[#5791FB]"
                }`}
                >
                굿즈를 교환해요.
                </p>
            </div>
            </button>

            {/* 취소하기 */}
            <button
            type="button"
            onClick={onClose}
            className="mb-2 h-14 w-full cursor-pointer rounded-xl border border-[#E0E0E0] bg-[#F4F4F4] text-base text-[#858485]"
            >
            취소하기
            </button>

            {/* 다음 */}
            <button
            type="button"
            onClick={handleNext}
            className="h-14 w-full cursor-pointer rounded-xl bg-[#5791FB] text-base font-medium text-white"
            >
            다음
            </button>
        </div>
        </div>
    );
}

export default DuckTalkModal;