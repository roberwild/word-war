import React from 'react';
import styles from '../styles/Game.module.css';

const Turret = React.memo(function Turret({ angleDeg = 0 }) {
  return (
    <div className={styles.turret}>
      <div className={styles.turretBase} />
      <div className={styles.turretCannon} style={{ 
        left: '50%', 
        transform: `translateX(-50%) rotate(${angleDeg}deg)`,
        transformOrigin: 'center bottom'
      }} />
    </div>
  );
});

export default Turret;


