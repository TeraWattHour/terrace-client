import { borzoi } from "borzoi";
import create from "zustand";

type TUserStore = {
  user: TUserStore | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  fetchUser: () => Promise<void>;
};

export const useUserStore = create<TUserStore>((set) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  fetchUser: async () => {
    set((state) => ({
      ...state,
      isLoading: true,
    }));

    const { data, ok } = await borzoi(`/auth/me`, { credentials: "include" });
    if (!ok || !data) {
      return set((state) => ({
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      }));
    }

    set((state) => ({
      ...state,
      user: data.data,
      isAuthenticated: !!data.data,
      isLoading: false,
    }));
  },
  setUser: (user?: TUserStore) => {
    set((state) => ({
      ...state,
      user,
      isAuthenticated: !!user,
    }));
  },
}));
