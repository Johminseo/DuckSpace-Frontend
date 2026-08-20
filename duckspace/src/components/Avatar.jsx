// 프로필 이미지가 없을 때(null/undefined/빈 문자열) 앱 전체에서 같은 회색 원으로 통일해서 보여준다.
function Avatar({ src, alt = "프로필", className = "" }) {
  return (
    <div className={`overflow-hidden rounded-full bg-[#858485] ${className}`}>
      {src && <img src={src} alt={alt} className="h-full w-full object-cover" />}
    </div>
  );
}

export default Avatar;
