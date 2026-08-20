import { useNavigate } from "react-router-dom";
import { IoChevronForward } from "react-icons/io5";
import ExhibitionCardPreview from "../ExhibitionCardPreview";

function HomeExhibition({ exhibitions = [] }) {
  const navigate = useNavigate();
  const [big, ...rest] = exhibitions;
  const smalls = rest.slice(0, 2);

  if (!big) return null;

  return (
    <section className="mt-7 px-5">
      {/* 타이틀 */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[18px] font-medium text-black">
          다른 유저 전시장
        </h2>

        <button
          type="button"
          onClick={() => navigate("/search")}
          className="flex items-center text-[16px] text-[#A2A2A2] cursor-pointer"
        >
          더보기
          <IoChevronForward size={20} />
        </button>
      </div>

      {/* 전시장 카드 */}
      <div className="flex items-start gap-4">
        {/* 왼쪽 큰 카드 */}
        <div
          onClick={() => navigate(`/display?id=${big.exhibitionId}`)}
          className="aspect-[9/10] w-[230px] shrink-0 overflow-hidden rounded-[8px] cursor-pointer bg-[#CDDCF7]"
        >
          <ExhibitionCardPreview
            items={big.items}
            themeCode={big.themeCode}
            alt={big.name}
            className="h-full w-full rounded-[8px]"
          />
        </div>

        {/* 오른쪽 작은 카드 2개 */}
        <div className="flex flex-col gap-4">
          {smalls.map((exhibition) => (
            <div
              key={exhibition.exhibitionId}
              onClick={() => navigate(`/display?id=${exhibition.exhibitionId}`)}
              className="aspect-[9/10] w-[110px] overflow-hidden rounded-[8px] cursor-pointer bg-[#CDDCF7]"
            >
              <ExhibitionCardPreview
                items={exhibition.items}
                themeCode={exhibition.themeCode}
                alt={exhibition.name}
                className="h-full w-full rounded-[8px]"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HomeExhibition;
