import { borzoi } from "borzoi";
import create from "zustand";

type TInterfaceStore = {
  loading: Map<string, boolean>;
  isLoading: boolean;
  setLoading: (key: string, value: boolean) => void;
};

export const useInterfaceStore = create<TInterfaceStore>((set) => ({
  loading: new Map([]),
  isLoading: false,
  setLoading: async (key, value) => {
    set((state) => {
      const newLoading = state.loading.set(key, value);
      return {
        ...state,
        isLoading: determineLoading(newLoading),
        loading: newLoading,
      };
    });
  },
}));

export const determineLoading = (values: Map<string, boolean>): boolean => {
  for (const value of values) {
    if (value[1]) {
      return true;
    }
  }
  return false;
};
