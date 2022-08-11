import React from "react";
import { useNavigate } from "react-router-dom";

export const GoBack = () => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(-1)}
      className="border-b-2 text-sm font-medium text-stone-400 hover:text-stone-600 border-b-stone-400 hover:border-b-stone-600 transition-all"
    >
      Go back
    </button>
  );
};
