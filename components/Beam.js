import React, { useMemo } from 'react';
import styles from '../styles/Game.module.css';

function degrees(rad) {
  return (rad * 180) / Math.PI;
}

const Beam = React.memo(function Beam({ id, startX, startY, endX, endY, duration = 180 }) {
  const { angleDeg, lengthPx } = useMemo(() => {
    const dx = endX - startX;
    const dy = endY - startY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    return { angleDeg: degrees(angle), lengthPx: distance };
  }, [startX, startY, endX, endY]);

  return (
    <div
      className={styles.beam}
      style={{
        left: startX,
        top: startY,
        width: lengthPx,
        transform: `rotate(${angleDeg}deg)`,
        ['--beam-duration']: `${duration}ms`,
      }}
    >
      <div className={styles.beamInner} />
    </div>
  );
});

export default Beam;


