import { IoChevronForward, IoAdd, IoClose } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useGoodsStore } from "../store/goodsStore";
import { deleteExhibitionItem } from "../apis/displayApi";

function DisplayGoods({ goods = [], exhibitionId, readOnly = false, onDeleted, }) {
    const navigate = useNavigate();
    //const goods = useGoodsStore((state) => state.goods);

    const handleDelete = async (itemId) => {
    if (!exhibitionId || !itemId) return;

    const confirmed = window.confirm(
      "이 굿즈를 삭제하시겠습니까?"
    );

    if (!confirmed) return;

    try {
      await deleteExhibitionItem(
        exhibitionId,
        itemId
      );

      onDeleted?.(itemId);
    } catch (error) {
      console.error(
        "굿즈 삭제 실패:",
        error.response?.data || error
      );

      alert("굿즈 삭제에 실패했습니다.");
    }
  };
  

  return (
    <div className=" pb-5">
      {/* 제목 + 모두보기 */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">전시된 굿즈</h2>

        <button
          onClick={() =>
            navigate("/display/list", {
              state: { mode: "view", exhibitionId, readOnly },
            })
          }
          className="flex cursor-pointer items-center text-sm text-[#A2A2A2]"
        >
          모두보기
          <IoChevronForward size={18} />
        </button>
      </div>

      {/* 굿즈 미리보기 */}
      <div className="flex gap-3 pt-3 overflow-x-auto">
        {goods.map((item) => (
          <div
            key={item.itemId}
            className="relative flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-xl border border-[#EEEEEE]"
          >
            <img
              src={item.imageUrl}
              alt={item.itemName}
              className="h-[55px] w-[55px] object-contain"
            />
            {!readOnly && (
              <button
                type="button"
                onClick={() => handleDelete(item.itemId)}
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-[#858485] text-white"
                aria-label="굿즈 삭제"
              >
                <IoClose size={14} />
              </button>
            )}
          </div>
        ))}

        {/* 새 굿즈 등록 — 남의 장식장에는 못 넣으니 숨긴다 */}
        {!readOnly && (
          <button
            className="flex h-[60px] w-[60px] shrink-0 cursor-pointer items-center justify-center rounded-xl border border-[#EEEEEE]"
            onClick={() =>
              navigate("/display/upload", {
              state: { exhibitionId },
              })
            }
          >
            <IoAdd size={30} />
          </button>
        )}
      </div>
    </div>
  );
}

export default DisplayGoods;