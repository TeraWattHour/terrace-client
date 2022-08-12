import React, { useEffect } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { useUserStore } from "../store/UserStore";
import { GoBack } from "./GoBack";

export const withAuth = (Component: any) => {
  return (props: any) => {
    const { user, isLoading } = useUserStore();
    if (!user && isLoading) {
      return <div></div>;
    }
    if (!user && !isLoading) {
      return <NotAuthenticated />;
    }
    return <Component {...props} />;
  };
};

const NotAuthenticated = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-stone-100">
      <div className="text-6xl font-black">401</div>
      <div className="text-2xl font-medium tracking-wider mb-4">
        Not authenticated
      </div>
      <div className="mb-1">
        Click here to{" "}
        <Link
          to="/sign-in"
          className="inline-block font-medium border-b-2 border-black pb-0.5"
        >
          sign-in
        </Link>{" "}
        or{" "}
        <button
          onClick={() => navigate(-1)}
          className="inline-block font-medium border-b-2 border-black pb-0.5"
        >
          go back
        </button>
      </div>
      {/* <GoBack /> */}
    </div>
  );
};
