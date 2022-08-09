import React, { HtmlHTMLAttributes } from "react";
import { classes } from "@/utils/classes";
import styles from "./Card.module.scss";

export const Card = React.forwardRef<
  HTMLDivElement,
  HtmlHTMLAttributes<HTMLDivElement>
>((props, ref) => {
  return (
    <div
      ref={ref}
      {...props}
      className={classes(props.className, styles["card"])}
    >
      {props.children}
    </div>
  );
});
