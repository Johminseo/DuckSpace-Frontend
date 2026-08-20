import api from "./api";

// 진행중/예정/종료 전체를 내려준다. 상태별 필터링은 프론트에서 status 필드로 처리.
export const getPopups = async () => {
  const res = await api.get("/api/popups");
  return res.data.data;
};

// 백엔드 PR #103 반영 후 상세 필드(benefitImageUrl/benefitDescription/operatingHours 포함) 전부 실제 값.
export const getPopupDetail = async (popupId) => {
  const res = await api.get(`/api/popups/${popupId}`);
  return res.data.data;
};

// 찜(좋아요). 백엔드 PR #55(feat/53-like) 기준 — merge/배포 전까지는 404.
export const likePopup = async (popupId) => {
  await api.post(`/api/popups/${popupId}/like`);
};

export const unlikePopup = async (popupId) => {
  await api.delete(`/api/popups/${popupId}/like`);
};

// 내가 찜한 팝업 목록 (위시리스트 화면용)
export const getLikedPopups = async () => {
  const res = await api.get("/api/popups/likes");
  return res.data.data;
};
