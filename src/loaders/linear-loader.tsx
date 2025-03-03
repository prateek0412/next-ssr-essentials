import React from "react";
import styles from "./styles.css";

const LinearLoader: React.FC = () => {
  return (
    <div className={`${styles.linearLoaderContainer} max-h-min`}>
      <div className={`${styles.linearLoaderBar}`}>
        <div className={`${styles.linearLoaderFill}`}></div>
      </div>
    </div>
  );
};

export default LinearLoader;
