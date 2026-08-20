import { IoChevronBack, IoAdd, IoSearch } from "react-icons/io5";
import { useGoodsStore } from "../../store/goodsStore";

import { useLocation, useNavigate } from "react-router-dom";
import { useDisplayStore } from "../../store/displayStore";
import { addExhibitionItem, getExhibitionItems, } from "../../apis/displayApi";
import { useEffect, useState } from "react";

function DisplayList() {
    const location = useLocation();
    const navigate = useNavigate();

    const exhibitionId = location.state?.exhibitionId;
    // 남의 장식장 "모두보기"로 들어온 경우 — 굿즈 추가/수정 버튼을 숨긴다.
    const readOnly = location.state?.readOnly ?? false;

    const addItem = useDisplayStore((state) => state.addItem);
    const mode = !readOnly && location.state?.mode === "select" ? "select" : "view";
    const [goods, setGoods] = useState([]);

    useEffect(() => {
      if (!exhibitionId) return;

      const fetchGoods = async () => {
        try {
          const result = await getExhibitionItems(
            exhibitionId
          );

          setGoods(result.data.items || []);
        } catch (error) {
          console.error(
            "전시 굿즈 목록 조회 실패:",
            error.response?.data || error
          );
        }
      };

      fetchGoods();
    }, [exhibitionId]);

    const handleSelectItem = async(good) => {
        try {
          const result = await addExhibitionItem(
              exhibitionId,
              {
                  placement: {
                      posX: 100 / 360,
                      posY: 100 / 400,
                      width: 70 / 360,
                      height: 70 / 400,
                      rotation: 0,
                  },
                  imageUrl: good.imageUrl,
                  itemName: good.itemName,
                  price: good.price ?? 0,
                  comment: "",
              }
          );
          const item = result.data;

          addItem({
              id: item.itemId,
              itemId: item.itemId,
              src: item.imageUrl,
              x: item.posX * 360,
              y: item.posY * 400,
              width: item.width * 360,
              height: item.height * 400,
              rotation: item.rotation ?? 0,
          });
          navigate("/display");
      } catch (error) {
          console.error(
              "굿즈 배치 실패:",
              error.response?.data || error
          );
      }
    };

  return (
    <div className="min-h-screen bg-white px-6 pt-6 pb-24">
      {/* 헤더 */}
      <div className="mb-8 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className=" cursor-pointer text-2xl"
        >
          <IoChevronBack />
        </button>

        <h1 className="text-xl font-bold">장식장</h1>

        {/* 남의 장식장엔 굿즈를 못 넣으니 숨긴다 */}
        {readOnly ? (
          <div className="w-8" />
        ) : (
          <button
            onClick={() =>
              navigate("/display/upload", {
                state: { exhibitionId },
              })
            }
          >
            <IoAdd size={32} />
          </button>
        )}
      </div>

      {/* 검색창 */}
      <div className="mb-4 flex h-14 items-center rounded-2xl bg-[#FAFAFA] px-4">
        <IoSearch
          size={26}
          className="mr-3 text-[#D9D9D9]"
        />

        <input
          type="text"
          placeholder="키워드로 검색해보세요.(기능 구현 예정)"
          className="w-full bg-transparent text-base outline-none placeholder:text-[#A2A2A2]"
        />
      </div>

      {/* 굿즈 리스트 */}
      <div className="flex flex-col gap-4">
        {goods.map((item) => (
            <div
                key={item.itemId}
                onClick={() => {
                    if (mode === "select") {
                        handleSelectItem(item);
                    }
                }}
                className={`flex min-h-[220px] items-center rounded-2xl border border-[#EEEEEE] px-5 py-4 gap-8 ${
                    mode === "select" ? "cursor-pointer" : ""
                }`}          
            >
            {/* 이미지 */}
            <div className="flex w-[45%] items-center justify-center">
              <img
                src={item.imageUrl}
                alt={item.itemName}
                className="h-36 w-36 object-contain"
              />
            </div>

            {/* 굿즈 정보 */}
            <div className="flex flex-1 flex-col items-start">
              <div className="mb-4 rounded-tl-[16px] rounded-tr-[16px] rounded-br-[16px] rounded-bl-[0px] bg-[#2F78FD] px-4 py-2 text-sm font-medium text-white">
                {item.status}
              </div>

              <p className="mb-1 text-base font-semibold">
                ₩ {item.price.toLocaleString()}
              </p>

              <p className="mb-1 text-xl font-bold">
                {item.itemName}
              </p>

              <p className="mb-5 text-sm text-[#666666]">
                {item.createdAt
                  ? item.createdAt.slice(0, 10).replace(/-/g, ".")
                  : ""}
              </p>

              {!readOnly && (
                <button className="text-sm text-[#B5B5B5]">
                  수정하기 &gt;
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DisplayList;