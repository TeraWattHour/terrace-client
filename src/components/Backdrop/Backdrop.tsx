import { AnimatePresence, motion } from "framer-motion";
import styles from "./styles.module.scss";

export const Backdrop = ({ children, isVisible, setVisible }: TProps) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={styles["wrapper"]}
          onClick={() => setVisible && setVisible(false)}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

type TProps = {
  children: any;
  isVisible: boolean;
  setVisible?: (x: boolean) => void;
};
