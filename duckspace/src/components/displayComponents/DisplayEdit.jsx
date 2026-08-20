import { Stage, Layer, Image, Transformer, Circle, Group } from "react-konva";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import useImage from "use-image";
import displayBackImg from "../../assets/displaybackgrounds/display_back.png";

import { THEME_BACKGROUNDS, DISPLAY_THEMES } from "./displayThemes";
import { useDisplayStore } from "../../store/displayStore";


import closeIcon from "../../assets/displayIcon/close.svg";
import addIcon from "../../assets/displayIcon/add.svg";
import saveIcon from "../../assets/displayIcon/save.svg";

import { updateExhibitionItemPosition, updateExhibition, deleteExhibition } from "../../apis/displayApi";
// 테스트
function DraggableImage({ item, onChange, isEditing, isSelected, onSelect, }) {  
    const [image] = useImage(item.src);
    const imageRef = useRef(null);
    const transformerRef = useRef(null);

  useEffect(() => {
    if (isSelected && imageRef.current && transformerRef.current) {
      transformerRef.current.nodes([imageRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <Image
        ref={imageRef}
        image={image}
        x={item.x}
        y={item.y}
        width={item.width}
        height={item.height}
        rotation={item.rotation || 0}
        

        // 편집 모드일 때만 드래그 가능
        draggable={isEditing}
        // 편집 모드일 때만 이벤트 받기
        listening={isEditing}

        // 이미지 클릭하면 선택
        onClick={() => {
          if (isEditing) {
            onSelect();
          }
        }}
        onTap={() => {
          if (isEditing) {
            onSelect();
          }
        }}
        onDragEnd={(e) => {
          if (!isEditing) return;
          onChange({
            ...item,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e) => {
          if (!isEditing) return;

          const node = e.target;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...item,
            x: node.x(),
            y: node.y(),
            width: Math.max(20, node.width() * scaleX),
            height: Math.max(20, node.height() * scaleY),
            rotation: node.rotation(),
          });
        }}
      />
      {isEditing && isSelected && (
        <Transformer
          ref={transformerRef}
          keepRatio={true}          
          rotateEnabled={true}
          enabledAnchors={[
            "top-left",
            "top-right",
            "bottom-left",
            "bottom-right",
          ]}
        />
      )}
    </>
  );
}

function CircleButton({ x, y, icon, onClick }) {
  return (
    <Group
      x={x}
      y={y}
      onClick={onClick}
      onTap={onClick}
      onMouseEnter={(e) => {
        const stage = e.target.getStage();
        stage.container().style.cursor = "pointer";
      }}
      onMouseLeave={(e) => {
        const stage = e.target.getStage();
        stage.container().style.cursor = "default";
      }}
    >
      <Circle
        radius={30}
        fill="rgba(255, 255, 255, 0.75)"
      />

      <Image
        image={icon}
        width={28}
        height={28}
        x={-14}
        y={-14}
      />
    </Group>
  );
}

function DisplayEdit({ exhibitionId, readOnly = false, themeCode = "BASIC", }) {

    const navigate = useNavigate();
    const [selectedTheme, setSelectedTheme] = useState(themeCode);

    const backgroundSrc =
        THEME_BACKGROUNDS[selectedTheme] ??
        THEME_BACKGROUNDS.BASIC;

    const [displayBack] = useImage(backgroundSrc);
    const [closeImage] = useImage(closeIcon);
    const [addImage] = useImage(addIcon);
    const [saveImage] = useImage(saveIcon);

    const items = useDisplayStore((state) => state.editingItems);
    const setItems = useDisplayStore((state) => state.setEditingItems);
    const updateItem = useDisplayStore((state) => state.updateItem);
    const storeIsEditing = useDisplayStore((state) => state.isEditing);
    const setIsEditing = useDisplayStore((state) => state.setIsEditing);
    // isEditing은 전역 상태라, 내 장식장을 편집하다가 저장/취소 없이 남의 장식장으로
    // 넘어오면 readOnly인데도 그대로 true로 남아 굿즈가 드래그/회전되던 버그가 있었다.
    // readOnly면 무조건 편집 불가로 강제한다.
    const isEditing = storeIsEditing && !readOnly;

    // 남의 장식장(readOnly)으로 넘어오면 전역 편집 상태 자체도 꺼서, 나중에 내
    // 장식장으로 돌아갔을 때 엉뚱하게 편집모드가 켜져 있는 것도 막는다.
    useEffect(() => {
        if (readOnly && storeIsEditing) {
            setIsEditing(false);
        }
    }, [readOnly, storeIsEditing, setIsEditing]);

    const [selectedId, setSelectedId] = useState(null);
    const [originalItems, setOriginalItems] = useState([]);

    const [isNameModalOpen, setIsNameModalOpen] = useState(false);
    const [exhibitionName, setExhibitionName] = useState("");

    const [themeStartIndex, setThemeStartIndex] = useState(0);


    useEffect(() => {
        setSelectedTheme(themeCode);
    }, [themeCode]);

    
    const handleSave = async () => {
        try {
            const requests = items.map((item) => {
            const placement = {
                posX: item.x / 360,
                posY: item.y / 400,
                width: item.width / 360,
                height: item.height / 400,
                rotation: item.rotation ?? 0,
            };

            return updateExhibitionItemPosition(
                exhibitionId,
                item.itemId,
                placement
            );
            });

            await Promise.all(requests);

            alert("저장되었습니다.");

            setIsEditing(false);
            setSelectedId(null);

            setOriginalItems(
            items.map((item) => ({ ...item }))
            );
            setIsNameModalOpen(true);
        } catch (error) {
            console.error(
            "장식장 위치 저장 실패:",
            error.response?.data || error
            );

            alert("저장에 실패했습니다.");
        }
    };
    const handleUpdateName = async () => {
        if (!exhibitionName.trim()) {
            alert("장식장 이름을 입력해주세요.");
            return;
        }

        try {
            const newName = exhibitionName.trim();

            await updateExhibition(exhibitionId, {
                name: newName,
                themeCode: selectedTheme,
            });

            setIsNameModalOpen(false);
            setExhibitionName("");

            alert("장식장이 저장되었습니다.");
            window.location.reload();
        } catch (error) {
            console.error(
            "장식장 이름 수정 실패:",
            error.response?.data || error
            );

            alert("장식장 이름 수정에 실패했습니다.");
        }
    };
    const handleDeleteExhibition = async () => {
        if (!exhibitionId) return;

        const confirmed = window.confirm(
            "이 장식장을 삭제하시겠습니까?"
        );

        if (!confirmed) return;

        try {
            await deleteExhibition(exhibitionId);

            setIsNameModalOpen(false);

            alert("장식장이 삭제되었습니다.");

            window.location.reload();
        } catch (error) {
            console.error(
            "장식장 삭제 실패:",
            error.response?.data || error
            );

            alert("장식장 삭제에 실패했습니다.");
        }
    };

  return (
    <>
    {!readOnly && isEditing && (
        <div className="mb-2">
            <h3 className="mb-2 text-center text-[18px] font-semibold">
            테마
            </h3>
            <div className="flex items-center justify-center gap-3">
                {/* 왼쪽 버튼 */}
                <button
                    type="button"
                    onClick={() =>
                    setThemeStartIndex((prev) =>
                        Math.max(0, prev - 1)
                    )
                    }
                    disabled={themeStartIndex === 0}
                    className={`flex h-[72px] w-[24px] shrink-0 items-center justify-center text-[32px] ${
                    themeStartIndex === 0
                        ? "cursor-default text-[#CFCFCF]"
                        : "cursor-pointer text-[#171617]"
                    }`}
                >
                    ‹
                </button>

                {/* 테마 4개 */}
                <div className="flex shrink-0 gap-3">
                    {DISPLAY_THEMES
                    .slice(themeStartIndex, themeStartIndex + 4)
                    .map((theme) => (
                        <button
                        key={theme.code}
                        type="button"
                        onClick={() =>
                            setSelectedTheme(theme.code)
                        }
                        className={`flex h-[72px] w-[64px] shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 ${
                            selectedTheme === theme.code
                            ? "border-[#5791FB]"
                            : "border-transparent"
                        }`}
                        >
                        <img
                            src={theme.image}
                            alt={theme.code}
                            className="h-full w-full object-cover"
                        />
                        </button>
                    ))}
                </div>

                {/* 오른쪽 버튼 */}
                <button
                    type="button"
                    onClick={() =>
                    setThemeStartIndex((prev) =>
                        Math.min(
                        DISPLAY_THEMES.length - 4,
                        prev + 1
                        )
                    )
                    }
                    disabled={
                    themeStartIndex >= DISPLAY_THEMES.length - 4
                    }
                    className={`flex h-[72px] w-[24px] shrink-0 items-center justify-center text-[32px] ${
                    themeStartIndex >= DISPLAY_THEMES.length - 4
                        ? "cursor-default text-[#CFCFCF]"
                        : "cursor-pointer text-[#171617]"
                    }`}
                >
                    ›
                </button>
            </div>
        </div>
    )}

    <div className="flex justify-center">
      <Stage width={360} height={400}>
        <Layer listening={false}>
          <Image image={displayBack} width={360} height={400} />
        </Layer>

        <Layer>
            {items.map((item) => (
                <DraggableImage
                    key={item.id}
                    item={item}
                    isEditing={isEditing}
                    isSelected={selectedId === item.id}
                    onSelect={() => setSelectedId(item.id)}
                    onChange={(updatedItem) => {
                        updateItem(updatedItem);
                    }}
                />
            ))}
        </Layer>

        {/* 버튼 — 남의 장식장은 편집할 수 없으니 아예 안 그린다 */}
        <Layer>
            {readOnly ? null : !isEditing ? (
                <CircleButton
                    x={320}
                    y={360}
                    icon={addImage}
                    onClick={() => {
                        setOriginalItems(
                            items.map((item) => ({ ...item }))
                        );
                        setIsEditing(true);
                        setSelectedId(null);
                    }}
                />
            ) : (
                <>
                    {/* 저장 안 하고 나가기 */}
                    <CircleButton
                        x={320}
                        y={225}
                        icon={closeImage}
                        onClick={() => {
                            setItems(originalItems);

                            setIsEditing(false);
                            setSelectedId(null);
                        }}
                    />

                    {/* 객체 추가 */}
                    <CircleButton
                        x={320}
                        y={295}
                        icon={addImage}
                        onClick={() => {
                            navigate("/display/list", {
                                state: {  
                                    mode: "select",
                                    exhibitionId,
                                },
                            });
                        }}
                    />
                    {/* 저장 */}
                    <CircleButton
                        x={320}
                        y={365}
                        icon={saveImage}
                        onClick={handleSave}
                        
                    />
                </>
            )}
        </Layer>

      </Stage>

      
    </div>

    {isNameModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-6">
            <div className="w-full max-w-[340px] rounded-2xl bg-white p-6">
            <h2 className="mb-5 text-center text-[18px] font-semibold text-black">
                장식장 이름 변경
            </h2>

            <input
                type="text"
                value={exhibitionName}
                onChange={(e) =>
                setExhibitionName(e.target.value)
                }
                placeholder="장식장 이름을 입력해주세요"
                className="w-full rounded-xl border border-[#DDDDDD] px-4 py-3 text-[15px] outline-none focus:border-[#5791FB]"
            />

            <div className="mt-5 flex gap-2">
                <button
                type="button"
                onClick={() => {
                    setIsNameModalOpen(false);
                    setExhibitionName("");
                }}
                className="flex-1 cursor-pointer rounded-xl bg-[#F4F4F4] py-3 text-[15px] text-black"
                >
                취소
                </button>

                <button
                type="button"
                onClick={handleUpdateName}
                className="flex-1 cursor-pointer rounded-xl bg-[#5791FB] py-3 text-[15px] text-white"
                >
                저장
                </button>
            </div>
            <button
                type="button"
                onClick={handleDeleteExhibition}
                className="mt-4 w-full cursor-pointer text-center text-[14px] text-[#A2A2A2]"
                >
                삭제하기
            </button>
            </div>
        </div>
        )}
    </>
  );
}

export default DisplayEdit;

