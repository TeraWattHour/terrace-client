import React from "react";
import { GoBack } from "./GoBack";

export const NotFoundPage = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-stone-100">
      <div className="text-6xl font-black">404</div>
      <div className="text-2xl font-medium tracking-wider mb-4">Not found</div>
      <GoBack />
    </div>
  );
};
