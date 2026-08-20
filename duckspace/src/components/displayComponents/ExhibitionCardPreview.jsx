import { THEME_BACKGROUNDS } from "./displayThemes";

// 장식장 카드 미리보기 — 배경 위에 배치된 굿즈(items)를 비율 좌표로 그린다.
// posX/posY/width/height는 0~1 비율, rotation은 각도(도) — 상세 화면 좌표계와 동일.
function ExhibitionCardPreview({ items = [], themeCode, alt = "", className = "" }) {
  const backgroundImg = THEME_BACKGROUNDS[themeCode] ?? THEME_BACKGROUNDS.BASIC;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        src={backgroundImg}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      {items.map((item) => (
        <img
          key={item.itemId}
          src={item.imageUrl}
          alt={alt}
          className="absolute object-contain"
          style={{
            left: `${item.posX * 100}%`,
            top: `${item.posY * 100}%`,
            width: `${item.width * 100}%`,
            height: `${item.height * 100}%`,
            transform: `rotate(${item.rotation ?? 0}deg)`,
          }}
        />
      ))}
    </div>
  );
}

export default ExhibitionCardPreview;
