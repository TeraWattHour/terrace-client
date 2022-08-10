import styles from "./BottomBar.module.scss";

export const BottomBar = ({ children }: TProps) => {
  return <div className={styles.wrapper}>{children}</div>;
};

type TProps = {
  children: any[] | any;
};
