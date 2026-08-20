import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  IoChevronBack,
  IoEyeOutline,
  IoEyeOffOutline,
  IoMailOutline,
  IoLockClosedOutline,
} from "react-icons/io5";

import { login } from "../../apis/authApi";

// 로고 이미지 불러오기 (경로 확인)
import Logo from "../../assets/Logo.png";
import Character from "../../assets/character.png"

function Login() {
  const navigate = useNavigate();

  // 입력값 및 상태 관리
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // 로그인 제출 핸들러 (나중에 백엔드 API 연동할 자리)
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setErrorMessage("아이디(이메일)와 비밀번호를 모두 입력해 주세요.");
      return;
    }

    try {
      setErrorMessage(""); // 이전 에러 메시지 초기화
      const result = await login(email, password);
      const { accessToken, refreshToken } = result.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      navigate("/");
    } catch (error) {
      console.error("로그인 에러 응답:", error.response?.data);
      const errorCode = error.response?.data?.error?.code;
      if (errorCode === "INVALID_CREDENTIALS") {
        setErrorMessage(
          "이메일 또는 비밀번호가 올바르지 않습니다."
        );
        return;
      }
      if (errorCode === "TOO_MANY_LOGIN_ATTEMPTS") {
        setErrorMessage(
          "로그인 시도가 너무 많습니다. 잠시 후 다시 시도해 주세요."
        );
        return;
      }
      setErrorMessage("로그인 중 오류가 발생했습니다." );
    }
  };

  return (
    <div className="min-h-screen bg-[#FEFEFE] px-6 pb-12 flex flex-col justify-between">
      {/* 1. 상단 뒤로가기 헤더 */}
      <div>

        {/* 2. 로고 및 타이틀 영역 */}
        <div className="mt-8 mb-10 flex flex-col items-center text-center">
          <img
            src={Logo}
            alt="DuckSpace Logo"
            className="h-12 w-auto mb-3"
          />
          <h1 className="text-xl font-bold text-[#171617] tracking-tight">
            나만의 덕질 공간, DuckSpace
          </h1>
          <p className="mt-1 text-sm text-[#858485]">
            로그인하고 나만의 전시장을 꾸며보세요!
          </p>
        </div>

        {/* 3. 로그인 폼 */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          {/* 아이디/이메일 입력창 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#545454] px-1">
              아이디 / 이메일
            </label>
            <div className="flex h-12 items-center rounded-xl bg-white border border-[#EEEEEE] px-4 shadow-sm focus-within:border-[#2F78FD] focus-within:ring-1 focus-within:ring-[#2F78FD] transition-all">
              <IoMailOutline className="mr-2 text-xl text-[#A2A2A2]" />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="아이디 또는 이메일을 입력하세요"
                className="w-full bg-transparent text-sm outline-none placeholder:text-[#A2A2A2]"
              />
            </div>
          </div>

          {/* 비밀번호 입력창 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#545454] px-1">
              비밀번호
            </label>
            <div className="flex h-12 items-center rounded-xl bg-white border border-[#EEEEEE] px-4 shadow-sm focus-within:border-[#2F78FD] focus-within:ring-1 focus-within:ring-[#2F78FD] transition-all">
              <IoLockClosedOutline className="mr-2 text-xl text-[#A2A2A2]" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className="w-full bg-transparent text-sm outline-none placeholder:text-[#A2A2A2]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-xl text-[#A2A2A2] cursor-pointer hover:text-[#545454]"
              >
                {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
              </button>
            </div>
          </div>

          {/* 에러 메시지 노출 영역 */}
          {errorMessage && (
            <p className="text-xs text-[#FF4D4D] px-1">{errorMessage}</p>
          )}

          {/* 로그인 버튼 */}
          <button
            type="submit"
            className="mt-4 flex h-12 w-full items-center justify-center rounded-xl bg-[#2F78FD] text-base font-semibold text-white shadow-md active:scale-[0.99] hover:bg-[#1E67EC] transition-all cursor-pointer"
          >
            로그인
          </button>
        </form>
      </div>

          <img
            src={Character}
            alt="character"
            className="h-[360px] w-auto object-contain"
          />

      {/* 4. 하단 회원가입 / 계정 찾기 링크 */}
      <div className="flex items-center justify-center gap-3 text-xs text-[#858485] pt-6">
        <button
          type="button"
          onClick={() => alert("아이디/비밀번호 찾기 준비 중입니다.")}
          className="cursor-pointer hover:underline"
        >
          계정 찾기
        </button>
        <span>|</span>
        <button
          type="button"
          onClick={() => navigate("/signup")}
          className="cursor-pointer font-semibold text-[#2F78FD] hover:underline"
        >
          회원가입
        </button>
      </div>
    </div>
  );
}

export default Login;