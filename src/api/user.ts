import { borzoi } from "borzoi";

export const fetchUser = async (userId?: string) => {
  if (!userId) return null;

  const { data, ok } = await borzoi(`/user/${userId}`);
  if (!data?.data || !ok) throw new Error();

  return data.data;
};
