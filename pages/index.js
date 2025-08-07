import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useGame } from '../context/GameContext';
import { startIntroMusic, stopIntroMusic, playButtonSound } from '../utils/introMusic';
import styles from '../styles/Intro.module.css';

export default function Home() {
  const [name, setName] = useState('');
  const router = useRouter();
  const { setPlayerName } = useGame();

  // Iniciar música al cargar la página
  useEffect(() => {
    const timer = setTimeout(() => {
      startIntroMusic();
    }, 500); // Pequeña demora para mejor experiencia

    return () => {
      clearTimeout(timer);
      stopIntroMusic();
    };
  }, []);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (name.trim()) {
        playButtonSound();
        stopIntroMusic();
        setPlayerName(name.trim());
        router.push('/select-level');
      }
    },
    [name, setPlayerName, router]
  );

  const handleInputFocus = () => {
    playButtonSound();
  };

  return (
    <div className={styles.introContainer}>
      {/* Efectos de fondo */}
      <div className={styles.stars}>
        <div className={styles.star}></div>
        <div className={styles.star}></div>
        <div className={styles.star}></div>
        <div className={styles.star}></div>
        <div className={styles.star}></div>
        <div className={styles.star}></div>
      </div>
      <div className={styles.scanlines}></div>

      {/* Cartucho principal */}
      <div className={styles.cartridge}>
        <h1 className={styles.gameTitle}>WORD WAR</h1>
        <p className={styles.subtitle}>MISSILE COMMAND TYPING GAME</p>
        
        {/* Arte del juego estilo Atari */}
        <div className={styles.gameArt}>
          <div className={styles.cityscape}>
            <div className={styles.building}></div>
            <div className={styles.building}></div>
            <div className={styles.building}></div>
            <div className={styles.building}></div>
          </div>
          <div className={styles.missiles}>PALABRAS</div>
          <div className={styles.turretCenter}></div>
        </div>

        {/* Formulario de entrada */}
        <form onSubmit={handleSubmit} className={styles.inputForm}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onFocus={handleInputFocus}
            placeholder="INGRESA TU NOMBRE"
            className={styles.nameInput}
            maxLength={20}
          />
          <button type="submit" className={styles.startButton}>
            ▶ EMPEZAR JUEGO ◀
          </button>
        </form>
      </div>

      {/* Créditos */}
      <div className={styles.credits}>
        <div className={styles.authorCredit}>AUTOR: ROBERTRON</div>
        <div className={styles.poweredBy}>POWERED BY: GPT-5</div>
      </div>
    </div>
  );
}
