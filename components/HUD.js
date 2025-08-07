import React from 'react';
import styles from '../styles/Game.module.css';

const HUD = React.memo(({ score, wpm }) => (
  <div className={styles.hud}>
    <span>Puntos: {score}</span>
    <span>WPM: {wpm.toFixed(2)}</span>
  </div>
));

export default HUD;
