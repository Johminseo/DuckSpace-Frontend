import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  IoChevronBack,
  IoEyeOutline,
  IoEyeOffOutline,
  IoMailOutline,
  IoLockClosedOutline,
  IoPersonOutline,
} from "react-icons/io5";

import { signup } from "../../apis/authApi";

import DuckSpaceIcon from "../../assets/DuckSpaceIcon.svg";

function Signup() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    if (
      !email.trim() ||
      !password.trim() ||
      !nickname.trim()
    ) {
      setErrorMessage("모든 항목을 입력해 주세요.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("비밀번호는 8자 이상 입력해 주세요.");
      return;
    }

    try {
      setErrorMessage("");

      const result = await signup(
        email,
        password,
        nickname
      );

      const { accessToken, refreshToken } = result.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      navigate("/");
    } catch (error) {
      const errorCode =
        error.response?.data?.error?.code;

      if (errorCode === "EMAIL_ALREADY_EXISTS") {
        setErrorMessage("이미 가입된 이메일입니다.");
        return;
      }

      if (errorCode === "VALIDATION_FAILED") {
        const validationData =
          error.response?.data?.data;

        const firstMessage =
          validationData &&
          Object.values(validationData)[0];

        setErrorMessage(
          firstMessage || "입력값을 확인해 주세요."
        );
        return;
      }

      setErrorMessage(
        "회원가입 중 오류가 발생했습니다."
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#FEFEFE] px-6 pb-12 flex flex-col justify-between">
      <div>
        

        {/* 로고 */}
        <div className="mt-6 mb-8 flex flex-col items-center text-center">
          <img
            src={DuckSpaceIcon}
            alt="DuckSpace Logo"
            className="h-12 w-auto mb-3"
          />

          <h1 className="text-xl font-bold text-[#171617] tracking-tight">
            DuckSpace 회원가입
          </h1>

          <p className="mt-1 text-sm text-[#858485]">
            나만의 덕질 공간을 만들어보세요!
          </p>
        </div>

        {/* 회원가입 폼 */}
        <form
          onSubmit={handleSignup}
          className="flex flex-col gap-4"
        >
          {/* 이메일 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#545454] px-1">
              이메일
            </label>

            <div className="flex h-12 items-center rounded-xl bg-white border border-[#EEEEEE] px-4 shadow-sm focus-within:border-[#2F78FD] focus-within:ring-1 focus-within:ring-[#2F78FD] transition-all">
              <IoMailOutline className="mr-2 text-xl text-[#A2A2A2]" />

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="이메일을 입력하세요"
                className="w-full bg-transparent text-sm outline-none placeholder:text-[#A2A2A2]"
              />
            </div>
          </div>

          {/* 닉네임 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#545454] px-1">
              닉네임
            </label>

            <div className="flex h-12 items-center rounded-xl bg-white border border-[#EEEEEE] px-4 shadow-sm focus-within:border-[#2F78FD] focus-within:ring-1 focus-within:ring-[#2F78FD] transition-all">
              <IoPersonOutline className="mr-2 text-xl text-[#A2A2A2]" />

              <input
                type="text"
                value={nickname}
                onChange={(e) =>
                  setNickname(e.target.value)
                }
                placeholder="닉네임을 입력하세요"
                maxLength={30}
                className="w-full bg-transparent text-sm outline-none placeholder:text-[#A2A2A2]"
              />
            </div>
          </div>

          {/* 비밀번호 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#545454] px-1">
              비밀번호
            </label>

            <div className="flex h-12 items-center rounded-xl bg-white border border-[#EEEEEE] px-4 shadow-sm focus-within:border-[#2F78FD] focus-within:ring-1 focus-within:ring-[#2F78FD] transition-all">
              <IoLockClosedOutline className="mr-2 text-xl text-[#A2A2A2]" />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="비밀번호를 입력하세요"
                maxLength={64}
                className="w-full bg-transparent text-sm outline-none placeholder:text-[#A2A2A2]"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="text-xl text-[#A2A2A2] cursor-pointer hover:text-[#545454]"
              >
                {showPassword ? (
                  <IoEyeOffOutline />
                ) : (
                  <IoEyeOutline />
                )}
              </button>
            </div>
          </div>

          {/* 에러 */}
          {errorMessage && (
            <p className="text-xs text-[#FF4D4D] px-1">
              {errorMessage}
            </p>
          )}

          {/* 회원가입 버튼 */}
          <button
            type="submit"
            className="mt-4 flex h-12 w-full items-center justify-center rounded-xl bg-[#2F78FD] text-base font-semibold text-white shadow-md active:scale-[0.99] hover:bg-[#1E67EC] transition-all cursor-pointer"
          >
            회원가입
          </button>
        </form>
      </div>

      {/* 로그인 이동 */}
      <div className="flex items-center justify-center gap-2 text-xs text-[#858485] pt-6">
        <span>이미 계정이 있으신가요?</span>

        <button
          type="button"
          onClick={() => navigate("/login")}
          className="cursor-pointer font-semibold text-[#2F78FD] hover:underline"
        >
          로그인
        </button>
      </div>
    </div>
  );
}

export default Signup;