import React from 'react';
import styles from '../styles/Game.module.css';

const Building = ({ destroyed }) => (
  <div className={destroyed ? styles.buildingDestroyed : styles.building}></div>
);

export default React.memo(Building);
