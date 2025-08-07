import { useEffect, useState } from 'react';
import Leaderboard from '../components/Leaderboard';
import { useRouter } from 'next/router';
import { useGame } from '../context/GameContext';
import { playButtonSound } from '../utils/introMusic';
import styles from '../styles/Intro.module.css';

export default function Scoreboard() {
  const [scores, setScores] = useState([]);
  const router = useRouter();
  const { setLevel } = useGame();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('scores') || '[]');
    stored.sort((a, b) => b.points - a.points);
    setScores(stored);
  }, []);

  const handleNavigation = (callback) => {
    playButtonSound();
    callback();
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

      <div className={styles.cartridge} style={{ maxWidth: '600px' }}>
        <h1 className={styles.gameTitle}>RANKING</h1>
        <p className={styles.subtitle}>HALL OF FAME</p>
        
        <div style={{ margin: '30px 0' }}>
          <Leaderboard scores={scores} />
        </div>
        
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            className={styles.startButton}
            onClick={() => handleNavigation(() => router.push('/'))}
            style={{ 
              background: 'linear-gradient(145deg, #6cf9ff, #39a3ff)',
              fontSize: '12px',
              padding: '15px 25px'
            }}
          >
            🏠 VOLVER AL INICIO
          </button>
          <button
            className={styles.startButton}
            onClick={() => handleNavigation(() => {
              setLevel('easy');
              router.push('/select-level');
            })}
            style={{ 
              background: 'linear-gradient(145deg, #39ff14, #2dd60a)',
              fontSize: '12px',
              padding: '15px 25px'
            }}
          >
            🎮 VOLVER A JUGAR
          </button>
        </div>
      </div>

      <div className={styles.credits}>
        <div className={styles.authorCredit}>AUTOR: ROBERTRON</div>
        <div className={styles.poweredBy}>POWERED BY: GPT-5</div>
      </div>
    </div>
  );
}
