import React from "react";
import { withGuest } from "../utils/withGuest";

const Page = () => {
  return <div>SignInPage</div>;
};

export const SignInPage = withGuest(Page);
