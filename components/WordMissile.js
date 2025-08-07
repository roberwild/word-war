import React from 'react';
import styles from '../styles/Game.module.css';

const WordMissile = React.memo(({ word, x, y }) => {
  return (
    <div className={styles.word} style={{ left: `${x}%`, top: y }}>
      {word}
    </div>
  );
});

export default WordMissile;
