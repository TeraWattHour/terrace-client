import React from "react";
import styles from "./styles.module.scss";
import { AnimatePresence, motion } from "framer-motion";

export const ScreenLoader = ({ isLoading }: TProps) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={styles["wrapper"]}
        >
          <i className="fal fa-wrench"></i>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

type TProps = {
  isLoading: boolean;
};
