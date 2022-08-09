import styles from "./BottomBar.module.scss";

export const BottomBar = ({ children }: TProps) => {
  return (
    <div className={styles.wrapper}>
      {/* <div class={styles.container}>{children}</div> */}
      {children}
    </div>
  );
};

type TProps = {
  children: JSX.Element[] | JSX.Element | any;
};
