import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";

import ExchangeListCard from "../../components/duckTalkComponents/ExchangeListCard";
import { getApplications } from "../../apis/postApi";
import { getMyProfile } from "../../apis/userApi";

function ExchangeList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(
    ["sent", "received", "progress", "completed"].includes(initialTab) ? initialTab : "sent"
  );
  const [sentList, setSentList] = useState([]);
  const [receivedList, setReceivedList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [myUserId, setMyUserId] = useState(null);

  // 신청 목록 API는 신청자 관점 필드만 주므로, 보낸 신청에서 상대방(글 작성자)을 가리려면
  // 내 userId와 applicantUserId를 비교해야 함
  useEffect(() => {
    getMyProfile()
      .then((profile) => setMyUserId(profile.userId))
      .catch((error) => console.error("내 프로필 조회 실패:", error));
  }, []);

  const tabList = [
    { key: "sent", label: "보낸 신청" },
    { key: "received", label: "받은 신청" },
    { key: "progress", label: "진행중" },
    { key: "completed", label: "완료" },
  ];

  // 1. 서버에서 보낸 신청(sent)과 받은 신청(received)을 모두 가져옴
  useEffect(() => {
    const fetchAllApplications = async () => {
      try {
        setLoading(true);
        // 서버에는 sent와 received 두 가지만 요청 (400 에러 방지)
        const [sentData, receivedData] = await Promise.all([
          getApplications("sent"),
          getApplications("received"),
        ]);
        setSentList(sentData || []);
        setReceivedList(receivedData || []);
      } catch (error) {
        console.error("교환 신청 목록 조회 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllApplications();
  }, [refreshKey]);

  const refreshApplications = () => setRefreshKey((key) => key + 1);

  // 2. 탭에 따라 프론트엔드에서 status 필드로 걸러내기 (클라이언트 필터링)
  const getFilteredItems = () => {
    const allItems = [...sentList, ...receivedList];

    switch (activeTab) {
      case "sent":
        return sentList;
      case "received":
        return receivedList;
      case "progress":
        // 수락되어 실제로 진행 중인(ACCEPTED) 항목만 추출 — 대기중(APPLIED)은
        // 아직 수락 전이라 교환 완료 처리가 안 되므로 여기 포함하면 안 됨
        return allItems.filter((item) => item.status === "ACCEPTED");
      case "completed":
        // 완료(COMPLETED)된 항목만 추출
        return allItems.filter((item) => item.status === "COMPLETED");
      default:
        return [];
    }
  };

  const currentItems = getFilteredItems();

  return (
    <div className="min-h-screen bg-[#FEFEFE] pb-28">
      {/* 1. 헤더 */}
      <header className="relative flex h-14 items-center justify-center px-5 border-b border-transparent">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute left-5 cursor-pointer text-2xl text-[#171617]"
          aria-label="뒤로가기"
        >
          <IoChevronBack />
        </button>
        <h1 className="text-[18px] font-semibold text-[#171617]">교환 목록</h1>
      </header>

      {/* 2. 4단 탭 */}
      <div className="flex border-b border-[#EEEEEE] text-center">
        {tabList.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2.5 text-[14px] leading-[21px] cursor-pointer transition-colors ${
              activeTab === tab.key
                ? "border-b-2 border-[#5791FB] font-semibold text-[#5791FB]"
                : "font-normal text-[#A2A2A2]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. 카드 목록 */}
      <main className="flex flex-col gap-3.5 px-5 pt-3.5">
        {loading ? (
          <div className="py-20 text-center text-sm text-[#A2A2A2]">
            목록을 불러오는 중...
          </div>
        ) : currentItems.length === 0 ? (
          <div className="py-20 text-center text-sm text-[#A2A2A2]">
            내역이 없습니다.
          </div>
        ) : (
          currentItems.map((item) => (
            <ExchangeListCard
              key={item.id || item.applicationId}
              item={item}
              activeTab={activeTab}
              myUserId={myUserId}
              onRefresh={refreshApplications}
            />
          ))
        )}
      </main>
    </div>
  );
}

export default ExchangeList;