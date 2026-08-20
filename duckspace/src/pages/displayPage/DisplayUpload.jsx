import { useRef, useState } from "react";
import { IoChevronBack, IoAdd } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";
import { useGoodsStore } from "../../store/goodsStore";

// {/* 아래는 개발용 코드 주석이 진짜 실전용 코드임 */}
// import { addExhibitionItem } from "../../apis/displayApi";
import { uploadExhibitionItem, getExhibitionItem } from "../../apis/displayApi";


function DisplayUpload() {
    const navigate = useNavigate();
    const location = useLocation();
    const exhibitionId = location.state?.exhibitionId;

    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [comment, setComment] = useState("");

    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const isSubmittingRef = useRef(false);

    const handleImageChange = (e) => {
        const file = e.target.files[0];

        if (!file) return;

        setImageFile(file);

        const imageUrl = URL.createObjectURL(file);
        setPreviewUrl(imageUrl);
    };

    const handleSubmit = async () => {
      if (isSubmittingRef.current) return;

      if (!imageFile) {
        alert("굿즈 이미지를 등록해주세요.");
        return;
      }

      if (!name.trim()) {
        alert("굿즈 이름을 입력해주세요.");
        return;
      }

      if (!exhibitionId) {
        alert("장식장 정보를 찾을 수 없습니다.");
        return;
      }

      isSubmittingRef.current = true;
      setIsSubmitting(true);

      try {
        const data = {
          placement: {
            posX: 100 / 360,
            posY: 100 / 400,
            width: 70 / 360,
            height: 70 / 400,
            rotation: 0,
          },
          // /* 아래 url은 개발용, 실전에서는 삭제 */
          // imageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/15/Red_Apple.jpg",

          itemName: name.trim(),
          price: price ? Number(price) : 0,
          comment: comment.trim(),
        };

        const uploadResult = await uploadExhibitionItem(
          exhibitionId,
          imageFile,
          data
        );
        const uploadedItem = uploadResult.data;
        const itemId = uploadedItem.itemId;
        let finalItem = uploadedItem;
        // PENDING이면 2초마다 단건 GET
        while (finalItem.status === "PENDING") {
          await new Promise((resolve) =>
            setTimeout(resolve, 2000)
          );
          const pollResult = await getExhibitionItem(
            exhibitionId,
            itemId
          );
          finalItem = pollResult.data;
        }
        // 처리 실패
        if (finalItem.status === "FAILED") {
          console.error(
            "이미지 처리 실패:",
            finalItem
          );
          alert("이미지 처리에 실패했습니다.");
          return;
        }

        alert("굿즈가 등록되었습니다.");

        navigate("/display");
      } catch (error) {
        console.error(
          "굿즈 업로드 실패:",
          error.response?.data || error
        );

        alert("굿즈 등록에 실패했습니다.");
      } finally {
        isSubmittingRef.current = false;
        setIsSubmitting(false);
      }
    };

  return (
    <div className="min-h-screen bg-white px-6 pt-6 pb-24">
      {/* 헤더 */}
      <div className="mb-8 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="cursor-pointer text-2xl"
        >
          <IoChevronBack />
        </button>

        <h1 className="text-xl font-bold">굿즈 추가</h1>

        {/* 가운데 정렬 맞추기용 */}
        <div className="w-6" />
      </div>

      {/* 이미지 업로드 */}
      <label className="mb-8 flex h-[220px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-[8px] bg-[#F7F7F7]">
        {previewUrl ? (
            <img
                src={previewUrl}
                alt="굿즈 미리보기"
                className="h-full w-full object-contain"
            />
            ) : (
                <div className="flex flex-col items-center justify-center">
                  <IoAdd size={42} className="text-[#A2A2A2]" />

                  <p className="mt-3 text-[13px] text-[#A2A2A2]">
                    JPG, PNG 파일만 업로드할 수 있어요.
                  </p>

                  <p className="mt-1 text-[13px] text-[#A2A2A2]">
                    배경이 깔끔하게 보이도록 촬영한 이미지를 권장해요.
                  </p>
                </div>
              
            )}

            <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={isSubmitting}
            />
        </label>

      {/* 굿즈 이름 */}
      <div className="mb-6">
        <label className="mb-3 block text-base font-semibold">
          굿즈 이름
        </label>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="굿즈 이름을 입력해주세요."
          className="h-14 w-full rounded-[8px] bg-[#F7F7F7] px-4 outline-none placeholder:text-[#B5B5B5]"
        />
      </div>

      {/* 굿즈 가격 */}
      <div className="mb-6">
        <label className="mb-3 block text-base font-semibold">
          굿즈 가격 <span className="font-normal text-[#A2A2A2]">(선택)</span>
        </label>

        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="가격을 입력해주세요."
          className="h-14 w-full rounded-[8px] bg-[#F7F7F7] px-4 outline-none placeholder:text-[#B5B5B5]"
        />
      </div>

      {/* 코멘트 */}
      <div className="mb-10">
        <label className="mb-3 block text-base font-semibold">
          코멘트
        </label>

        <div className="relative">
          <textarea
            value={comment}
            onChange={(e) => {
              if (e.target.value.length <= 20) {
                setComment(e.target.value);
              }
            }}
            placeholder="코멘트를 입력해주세요."
            className="h-32 w-full resize-none rounded-[8px] bg-[#F7F7F7] px-4 py-4 outline-none placeholder:text-[#B5B5B5]"
          />

          <span className="absolute bottom-3 right-4 text-sm text-[#A2A2A2]">
            {comment.length}/20
          </span>
        </div>
      </div>

      {/* 완료 */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="h-14 w-full cursor-pointer rounded-[8px] bg-[#5791FB] text-base font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "등록 중..." : "완료"}
      </button>
    </div>
  );
}

export default DisplayUpload;