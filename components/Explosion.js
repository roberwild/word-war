import React from 'react';
import styles from '../styles/Game.module.css';

const Explosion = React.memo(function Explosion({ x, y, size = 40, duration = 350 }) {
  return (
    <div
      className={styles.explosion}
      style={{
        left: x,
        top: y,
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        ['--explosion-duration']: `${duration}ms`,
      }}
    />
  );
});

export default Explosion;


