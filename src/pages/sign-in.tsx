import React from "react";
import { withGuest } from "../components/withGuest";

const Page = () => {
  return <div>SignInPage</div>;
};

export const SignInPage = withGuest(Page);
