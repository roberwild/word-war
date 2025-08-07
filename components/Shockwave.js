import React from 'react';
import styles from '../styles/Game.module.css';

const Shockwave = React.memo(function Shockwave({ x, y, size = 200, duration = 700 }) {
  return (
    <div
      className={styles.shockwave}
      style={{
        left: x,
        top: y,
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        ['--wave-duration']: `${duration}ms`,
      }}
    />
  );
});

export default Shockwave;


