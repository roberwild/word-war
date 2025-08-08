import { useRouter } from 'next/router';
import { useGame } from '../context/GameContext';
import { playButtonSound } from '../utils/introMusic';
import styles from '../styles/Intro.module.css';

export default function SelectLevel() {
  const router = useRouter();
  const { setLevel } = useGame();

  const choose = (lvl) => {
    playButtonSound();
    setLevel(lvl);
    router.push('/game');
  };

  const levelDescriptions = {
    easy: { name: 'PRINCIPIANTE', desc: '< 20 WPM', color: '#39ff14' },
    middle: { name: 'INTERMEDIO', desc: '20-40 WPM', color: '#ffaa00' },
    advanced: { name: 'AVANZADO', desc: '40-60 WPM', color: '#ff4444' }
  };

  return (
    <div className={styles.introContainer}>
      <div className={styles.stars}>
        <div className={styles.star}></div>
        <div className={styles.star}></div>
        <div className={styles.star}></div>
        <div className={styles.star}></div>
        <div className={styles.star}></div>
        <div className={styles.star}></div>
      </div>
      <div className={styles.scanlines}></div>

      <div className={styles.cartridge} style={{ width: '100%', maxWidth: 600 }}>
        <h1 className={styles.gameTitle} style={{ fontSize: '2.5rem' }}>SELECCIONA NIVEL</h1>
        <p className={styles.subtitle}>ELIGE TU DIFICULTAD DE MECANOGRAFÍA</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
          {Object.entries(levelDescriptions).map(([level, info]) => (
            <button 
              key={level}
              onClick={() => choose(level)} 
              className={styles.startButton}
              style={{ 
                background: `linear-gradient(145deg, ${info.color}, ${info.color}aa)`,
                color: level === 'easy' ? '#000' : '#fff',
                fontSize: '14px',
                padding: '16px'
              }}
            >
              {info.name}
              <br />
              <small style={{ fontSize: '10px', opacity: 0.8 }}>
                {info.desc}
              </small>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.credits}>
        <div className={styles.authorCredit}>AUTOR: ROBERTRON</div>
        <div className={styles.poweredBy}>POWERED BY: GPT-5</div>
      </div>
    </div>
  );
}
