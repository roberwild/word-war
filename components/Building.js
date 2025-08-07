import React from 'react';
import styles from '../styles/Game.module.css';

const Building = ({ destroyed, height }) => (
  <div
    className={destroyed ? styles.buildingDestroyed : styles.building}
    style={destroyed ? undefined : { height }}
  />
);

export default React.memo(Building);
