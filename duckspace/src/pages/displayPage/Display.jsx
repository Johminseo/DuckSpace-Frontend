import { IoChevronBack,IoEllipsisHorizontal, IoHeart, IoHeartOutline } from "react-icons/io5";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";

import DisplayEdit from "../../components/displayComponents/DisplayEdit";
import DisplayGoods from "../../components/displayComponents/DisplayGoods";
import NavBar from "../../components/common/NavBar";
import Avatar from "../../components/common/Avatar";

import { useDisplayStore } from "../../store/displayStore";

import { createExhibition , getMyExhibitions, getUserExhibitions, getExhibitionDetail, likeExhibition, unlikeExhibition } from "../../apis/displayApi";

import { getMyProfile, getUserProfile } from "../../apis/userApi";

import { logout } from "../../apis/authApi";



function Display() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const viewExhibitionId = searchParams.get("id");
  const isOwnView = !viewExhibitionId;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [profile, setProfile] = useState(null);
  const [mine, setMine] = useState(isOwnView);
  const [viewingExhibitionName, setViewingExhibitionName] = useState("");

  const setEditingItems = useDisplayStore(
    (state) => state.setEditingItems
  );
  const handleLogout = async () => {
    const refreshToken =
      localStorage.getItem("refreshToken");

    try {
      if (refreshToken) {
        await logout(refreshToken);
      }
    } catch (error) {
      console.error("로그아웃 API 오류:", error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      setIsMenuOpen(false);
      navigate("/login");
    }
  };
  const handleGoodsDeleted = (itemId) => {
    setDisplayGoods((prev) =>
      prev.filter((item) => item.itemId !== itemId)
    );

    const currentItems =
      useDisplayStore.getState().editingItems;

    setEditingItems(
      currentItems.filter(
        (item) => item.itemId !== itemId
      )
    );
  };

  const [exhibitions, setExhibitions] = useState([]);
  const [activeExhibitionId, setActiveExhibitionId] = useState(
    viewExhibitionId ? Number(viewExhibitionId) : null
  );
  const [displayGoods, setDisplayGoods] = useState([]);
  const [viewedOwnerId, setViewedOwnerId] = useState(null);
  // URL의 exhibitionId(남의 장식장 보기)가 바뀌면 그대로 반영하고,
  // 내 장식장으로 돌아오면 일단 비워서 남의 장식장 상세가 잠깐이라도
  // "내 장식장" 컨텍스트로 다시 그려지는 걸 막는다 (아래 fetchMyExhibitions가 새로 채운다).
  useEffect(() => {
    setActiveExhibitionId(viewExhibitionId ? Number(viewExhibitionId) : null);
    setViewedOwnerId(null); // 다른 사람 장식장으로 넘어가면 이전 사람 탭 목록은 버림
  }, [viewExhibitionId]);
  const [activeThemeCode, setActiveThemeCode] = useState("BASIC");
  const [likeCount, setLikeCount] = useState(0);
  const [likedByMe, setLikedByMe] = useState(false);

  // 내 프로필 조회 (내 장식장을 볼 때만 — 남의 장식장은 상세 조회 후 소유자 프로필을 따로 불러옴)
  useEffect(() => {
    if (!isOwnView) return;

    const fetchMyProfile = async () => {
      try {
        const result = await getMyProfile();

        setProfile(result);
      } catch (error) {
        console.error(
          "내 프로필 조회 실패:",
          error.response?.data || error
        );
      }
    };

    fetchMyProfile();
  }, [isOwnView]);

  // 내 장식장 목록 (내 장식장을 볼 때만). 남의 장식장은 URL의 exhibitionId 하나만 본다(초기 state에서 이미 세팅됨).
  useEffect(() => {
    if (!isOwnView) return;

    const fetchMyExhibitions = async () => {
      try {
        const result = await getMyExhibitions();

        const exhibitionList = result.data || [];

        setExhibitions(exhibitionList);

        if (exhibitionList.length > 0) {
          setActiveExhibitionId(
            exhibitionList[0].exhibitionId
          );
        }
      } catch (error) {
        console.error(
          "장식장 목록 조회 실패:",
          error.response?.data || error
        );
      }
    };

    fetchMyExhibitions();
  }, [isOwnView]);

  // 남의 장식장 전체 목록 (탭으로 넘겨보기용). 상세 조회로 ownerId를 알아낸 뒤에야 부를 수 있다.
  useEffect(() => {
    if (isOwnView || !viewedOwnerId) return;

    const fetchTheirExhibitions = async () => {
      try {
        const result = await getUserExhibitions(viewedOwnerId, { limit: 50 });
        setExhibitions(result.data || []);
      } catch (error) {
        console.error(
          "남의 장식장 목록 조회 실패:",
          error.response?.data || error
        );
      }
    };

    fetchTheirExhibitions();
  }, [isOwnView, viewedOwnerId]);


  const handleAddExhibition = async () => {
    try {
      const nextNumber = exhibitions.length + 1;

      const result = await createExhibition(
        `장식장 ${nextNumber}`,
        "BASIC"
      );

      const newExhibition = result.data;

      setExhibitions((prev) => [
        ...prev,
        newExhibition,
      ]);

      setActiveExhibitionId(
        newExhibition.exhibitionId
      );
    } catch (error) {
      console.error(
        "장식장 생성 실패:",
        error.response?.data || error
      );
    }
  };
  useEffect(() => {
    if (!activeExhibitionId) return;

    const fetchExhibitionDetail = async () => {
      try {
        const result = await getExhibitionDetail(
          activeExhibitionId

        );

        const detail = result.data;
        setActiveThemeCode(detail.themeCode || "BASIC");
        const items = detail.items || [];
        setDisplayGoods(items);
        setLikeCount(detail.likeCount ?? 0);
        setLikedByMe(detail.likedByMe ?? false);
        const convertedItems = items.map(
          (item) => ({
            id: item.itemId,
            itemId: item.itemId,
            src: item.imageUrl,

            x: item.posX * 360,
            y: item.posY * 400,
            width: item.width * 360,
            height: item.height * 400,

            rotation: item.rotation ?? 0,
          })
        );

        setEditingItems(convertedItems);

        // 내 장식장 탭에서 보는 거면 항상 내 것이고, 남의 장식장이면 응답의 mine을 따른다.
        // (예전엔 남의 장식장 볼 때만 mine을 세팅해서, 거기서 내 장식장으로 돌아와도
        //  false로 고정된 채 안 바뀌는 버그가 있었다)
        setMine(isOwnView ? true : detail.mine);

        // 남의 장식장이면 상세 응답의 ownerId로 그 사람 프로필을 따로 불러오고,
        // 그 사람 장식장 목록(탭)도 이 ownerId로 따로 불러온다 (아래 effect).
        if (!isOwnView) {
          setViewingExhibitionName(detail.name || "");
          setViewedOwnerId(detail.ownerId);
          try {
            const ownerProfile = await getUserProfile(detail.ownerId);
            setProfile(ownerProfile);
          } catch (error) {
            console.error(
              "장식장 소유자 프로필 조회 실패:",
              error.response?.data || error
            );
          }
        }
      } catch (error) {
        console.error(
          "장식장 상세 조회 실패:",
          error.response?.data || error
        );
      }
    };

    fetchExhibitionDetail();
  }, [activeExhibitionId, setEditingItems, isOwnView]);

  const handleToggleLike = async () => {
    if (!activeExhibitionId) return;

    const nextLiked = !likedByMe;

    setLikedByMe(nextLiked);
    setLikeCount((prev) => prev + (nextLiked ? 1 : -1));

    try {
      if (nextLiked) {
        await likeExhibition(activeExhibitionId);
      } else {
        await unlikeExhibition(activeExhibitionId);
      }
    } catch (error) {
      console.error("좋아요 처리 실패:", error.response?.data || error);
      setLikedByMe(!nextLiked);
      setLikeCount((prev) => prev + (nextLiked ? -1 : 1));
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* 헤더 */}
      <header className="relative flex h-14 items-center justify-center px-5">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-5 cursor-pointer text-2xl"
        >
          <IoChevronBack />
        </button>

        <h1 className="text-[20px] font-semibold text-black">
          {isOwnView ? "장식장" : viewingExhibitionName || "장식장"}
        </h1>
      </header>

      {/* 프로필 영역 */}
      <section className="flex items-center justify-between px-7 py-5">
        <button
          type="button"
          onClick={() =>
            navigate(
              isOwnView ? "/ducktalk/mypage" : `/ducktalk/user?id=${profile?.userId}`
            )
          }
          className="flex cursor-pointer items-center gap-3"
        >
          <Avatar src={profile?.profileImageUrl} alt={profile?.nickname} className="h-14 w-14" />

          <div className="text-left">
            <p className="text-[20px] font-semibold text-black">
              {profile?.nickname || "사용자"}
            </p>

            <p className="mt-1 text-[14px] text-[#A2A2A2]">
              팔로워 {profile?.followerCount ?? 0} | 팔로잉 {profile?.followingCount ?? 0}
            </p>
          </div>
        </button>

        {mine && (
          <button
            type = "button" 
            onClick={() => setIsMenuOpen(true)}
            className="cursor-pointer text-2xl text-[#A2A2A2]"
          >
            <IoEllipsisHorizontal/>
          
          </button>
        )}
      </section>

      {/* 탭 영역 — 내 장식장이든 남의 장식장이든 그 사람이 만든 전체 목록을 탭으로 보여준다 */}
      {exhibitions.length > 0 && (
        <section className="px-7">
          <div className="flex overflow-x-auto border-b border-[#EEEEEE]">
            {exhibitions.map((exhibition) => (
              <button
                key={exhibition.exhibitionId}
                onClick={() =>
                  setActiveExhibitionId(
                    exhibition.exhibitionId
                  )
                }
                className={`
                  shrink-0
                  min-w-[120px]
                  py-3
                  text-[16px]
                  font-medium
                  cursor-pointer
                  ${
                    activeExhibitionId ===
                    exhibition.exhibitionId
                      ? "border-b-2 border-[#5791FB] text-[#5791FB]"
                      : "text-[#A2A2A2]"
                  }
                `}
              >
                {exhibition.name}
              </button>
            ))}

            {/* 새 장식장 추가 — 남의 장식장엔 못 만드니 숨긴다 */}
            {isOwnView && (
              <button
                type="button"
                onClick={handleAddExhibition}
                className="
                  shrink-0
                  min-w-[120px]
                  cursor-pointer
                  py-3
                  text-[26px]
                  text-[#A2A2A2]
                "
              >
                +
              </button>
            )}
          </div>
        </section>
      )}

      {/* 전시장 */}
      <section className="px-7 pt-3">
        <DisplayEdit exhibitionId={activeExhibitionId} readOnly={!mine} themeCode={activeThemeCode} />
      </section>

      {/* 좋아요 영역 */}
      <section className="flex items-center justify-center gap-1 py-4">
        <button
          type="button"
          onClick={handleToggleLike}
          className="flex cursor-pointer items-center gap-1"
          aria-label={likedByMe ? "좋아요 취소" : "좋아요"}
        >
          {likedByMe ? (
            <IoHeart className="text-[24px] text-[#FF5A5F]" />
          ) : (
            <IoHeartOutline className="text-[24px] text-[#555555]" />
          )}
          <span className="text-[15px] text-[#555555]">{likeCount}</span>
        </button>
      </section>

      {/* 전시된 굿즈 */}
      <section className="px-7">
        <DisplayGoods
          goods={displayGoods}
          exhibitionId={activeExhibitionId}
          readOnly={!mine}
          onDeleted={handleGoodsDeleted}
        />
      </section>

      {/* 하단 네브바 */}
      <NavBar />
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-6">
          <div className="w-full max-w-[320px] rounded-2xl bg-white p-6">
            <h2 className="mb-5 text-center text-[18px] font-semibold text-black">
              설정
            </h2>

            <button
              type="button"
              onClick={() => navigate("/ducktalk/mypage")}
              className="mb-3 w-full cursor-pointer rounded-xl bg-[#F4F4F4] py-3 text-[15px] text-black"
            >
              내가 쓴 글
            </button>

            <button
              type="button"
              onClick={() => navigate("/popup/wishlist")}
              className="mb-3 w-full cursor-pointer rounded-xl bg-[#F4F4F4] py-3 text-[15px] text-black"
            >
              팝업 위시리스트
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full cursor-pointer rounded-xl bg-[#F4F4F4] py-3 text-[15px] text-black"
            >
              로그아웃
            </button>

            <button
              type="button"
              onClick={() => setIsMenuOpen(false)}
              className="mt-4 w-full cursor-pointer text-[14px] text-[#A2A2A2]"
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Display;