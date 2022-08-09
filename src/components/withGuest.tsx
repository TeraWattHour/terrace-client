import React, { useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useUserStore } from "../store/UserStore";

export const withGuest = (Component: any) => {
  return (props: any) => {
    const { user, isLoading } = useUserStore();
    if (user) {
      return <Navigate to="/" />;
    }
    return <Component {...props} />;
  };
};
