import api from "./api";

export const createExhibition = async (name, themeCode) => {
  const response = await api.post("/api/exhibitions", {
    name,
    themeCode,
  });

  return response.data;
};

// 검색 탭 기본 화면용 — 필터 없이 최신 등록순 커서 페이징. 비로그인도 호출 가능.
// cursor를 안 보내면 첫 페이지. 응답의 nextCursor를 다음 요청의 cursor로 넣으면 됨.
export const getExhibitionFeed = async ({ cursor, size } = {}) => {
  const params = {};
  if (cursor) params.cursor = cursor;
  if (size) params.size = size;

  const res = await api.get("/api/exhibitions", { params });

  return res.data.data;
};


export const getExhibitionDetail = async (exhibitionId) => {
  const response = await api.get(
    `/api/exhibitions/${exhibitionId}`
  );

  return response.data;
};

export const likeExhibition = async (exhibitionId) => {
  await api.post(`/api/exhibitions/${exhibitionId}/like`);
};

export const unlikeExhibition = async (exhibitionId) => {
  await api.delete(`/api/exhibitions/${exhibitionId}/like`);
};

export const updateExhibitionItemPosition = async (
  exhibitionId,
  itemId,
  placement
) => {
  const response = await api.patch(
    `/api/exhibitions/${exhibitionId}/items/${itemId}/position`,
    { placement }
  );

  return response.data;
};

export const addExhibitionItem = async (
  exhibitionId,
  itemData
) => {
  const response = await api.post(
    `/api/exhibitions/${exhibitionId}/items`,
    itemData
  );

  return response.data;
};

export const getExhibitionItems = async (
  exhibitionId,
  cursor,
  size = 20
) => {
  const params = { size };

  if (cursor) {
    params.cursor = cursor;
  }

  const response = await api.get(
    `/api/exhibitions/${exhibitionId}/items`,
    { params }
  );

  return response.data;
};

// 실제 사용 코드 지금은 X
export const uploadExhibitionItem = async (
  exhibitionId,
  file,
  data
) => {
  const formData = new FormData();

  formData.append("image", file);

  formData.append(
    "data",
    new Blob(
      [JSON.stringify(data)],
      { type: "application/json" }
    )
  );

  const response = await api.post(
    `/api/exhibitions/${exhibitionId}/items/upload`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};


export const getExhibitionItem = async (
  exhibitionId,
  itemId
) => {
  const response = await api.get(
    `/api/exhibitions/${exhibitionId}/items/${itemId}`
  );

  return response.data;
};


export const getMyExhibitions = async () => {
  const response = await api.get("/api/exhibitions/me");

  return response.data;
};

// 프로필 화면에서 "이 사람의 장식장" 버튼으로 이동할 때 사용.
// 장식장이 하나도 없는 유저면 404(EXHIBITION_NOT_FOUND).
export const getPrimaryExhibition = async (userId) => {
  const response = await api.get(
    `/api/exhibitions/users/${userId}/primary`
  );

  return response.data;
};

// 남의 장식장 전체 목록 (탭으로 넘겨보기용). /api/exhibitions/me와 응답 모양 동일,
// 만든 순서(오래된 것부터)로 옴. cursor 안 보내면 첫 페이지.
export const getUserExhibitions = async (userId, { cursor, limit } = {}) => {
  const params = {};
  if (cursor) params.cursor = cursor;
  if (limit) params.limit = limit;

  const response = await api.get(
    `/api/exhibitions/users/${userId}`,
    { params }
  );

  return response.data;
};

export const updateExhibition = async (
  exhibitionId,
  { name, themeCode }
) => {
  const response = await api.patch(
    `/api/exhibitions/${exhibitionId}`,
    {
      name,
      themeCode,
    }
  );

  return response.data;
};

export const deleteExhibition = async (exhibitionId) => {
  const response = await api.delete(
    `/api/exhibitions/${exhibitionId}`
  );

  return response.data;
};

export const deleteExhibitionItem = async (
  exhibitionId,
  itemId
) => {
  const response = await api.delete(
    `/api/exhibitions/${exhibitionId}/items/${itemId}`
  );

  return response.data;
};