import React from 'react';
import styles from '../styles/Game.module.css';

const WordMissile = React.memo(({ word, x, y, color }) => {
  return (
    <div
      className={styles.word}
      style={{ left: `${x}%`, top: y, color: color, textShadow: `0 0 6px ${color}` }}
    >
      {word}
    </div>
  );
});

export default WordMissile;
