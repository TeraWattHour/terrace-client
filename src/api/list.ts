import { borzoi } from "borzoi";

export const fetchList = async (listId?: string) => {
  if (!listId || !parseInt(listId)) return null;

  const { data, ok } = await borzoi(`/list/${listId}`);

  if (!data?.data || !ok) throw new Error();

  return data.data;
};

export const fetchPlace = async (placeId: number | null, listId?: number) => {
  if (!placeId || !listId) return null;

  const { data, ok } = await borzoi(`/place/${placeId}`);
  if (!data?.data || !ok) throw new Error();

  return data.data;
};
