import { useMemo } from "react";
import { useLocation } from "react-router-dom";

export function useQueryParams<T extends { [key: string]: string }>(): T {
  const { search } = useLocation();

  return useMemo(() => {
    const params = new URLSearchParams(search);
    const x: { [key: string]: string } = {};
    params.forEach((v, k) => {
      x[k] = v;
    });

    return x as unknown as T;
  }, [search]);
}
