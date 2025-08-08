import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useGame } from '../context/GameContext';
import { startIntroMusic, stopIntroMusic, playButtonSound } from '../utils/introMusic';
import styles from '../styles/Intro.module.css';

export default function Home() {
  const [name, setName] = useState('');
  const router = useRouter();
  const { setPlayerName } = useGame();
  const [introWords, setIntroWords] = useState([]);
  const [introEffects, setIntroEffects] = useState([]);

  // Iniciar música al cargar la página
  useEffect(() => {
    const timer = setTimeout(() => {
      startIntroMusic();
    }, 500); // Pequeña demora para mejor experiencia
    // Ajustar --vh también en pantallas de intro/selección
    const updateVh = () => {
      const vv = typeof window !== 'undefined' && window.visualViewport ? window.visualViewport : null;
      const height = vv?.height || window.innerHeight;
      const vh = height * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    updateVh();
    // Intentar desbloquear audio ante primer gesto en intro
    const unlock = () => {
      try {
        // Llamar a startIntroMusic asegura resume() tras interacción
        startIntroMusic();
      } catch (_) {}
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('touchstart', unlock, { passive: true });
    window.addEventListener('click', unlock, { passive: true });
    window.addEventListener('resize', updateVh);
    window.addEventListener('orientationchange', updateVh);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateVh);
      window.visualViewport.addEventListener('scroll', updateVh);
    }

    return () => {
      clearTimeout(timer);
      stopIntroMusic();
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('resize', updateVh);
      window.removeEventListener('orientationchange', updateVh);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateVh);
        window.visualViewport.removeEventListener('scroll', updateVh);
      }
    };
  }, []);

  // Intro animation: spawn words and auto-shoot from turret center
  useEffect(() => {
    const colors = ['#6cf9ff', '#ff6cf1', '#ffd56c', '#6cff7a', '#ff6c6c', '#b06cff', '#6cc9ff'];
    const sampleWords = ['sol','luz','aire','mar','casa','gato','pan','paz','nuevo','ojo','madre','padre','alto','coche','verde','azul'];
    const artEl = document.querySelector(`.${styles.gameArt}`);
    let frame = 0;
    let raf;
    const state = { items: [], w: 0, h: 0 };

    const spawn = () => {
      if (!artEl) {
        return;
      }
      state.w = artEl.clientWidth;
      state.h = artEl.clientHeight;
      const word = sampleWords[Math.floor(Math.random() * sampleWords.length)];
      const x = 10 + Math.random() * 80; // percent
      const color = colors[Math.floor(Math.random() * colors.length)];
      state.items.push({ id: `${Date.now()}-${Math.random()}`, word, x, y: 10, color, alive: true });
    };

    const shoot = (target) => {
      if (!artEl || !target) {
        return;
      }
      const rect = artEl.getBoundingClientRect();
      const startX = rect.width / 2;
      const startY = rect.height - 36;
      const endX = (target.x / 100) * rect.width;
      const endY = target.y;
      const id = `${Date.now()}-${Math.random()}`;
      setIntroEffects((eff) => [
        ...eff,
        { id: id + '-beam', type: 'beam', startX, startY, endX, endY },
        { id: id + '-boom', type: 'explosion', x: endX, y: endY }
      ]);
      setTimeout(() => setIntroEffects((eff) => eff.filter(e => !e.id.startsWith(id))), 700);
      target.alive = false;
    };

    const tick = () => {
      frame++;
      if (frame % 45 === 0) {
        spawn();
      }
      if (artEl) {
        state.w = artEl.clientWidth;
        state.h = artEl.clientHeight;
      }
      const floorY = state.h - 28;
      state.items.forEach((it) => {
        if (!it.alive) {
          return;
        }
        it.y += 0.9; // fall speed
        if (it.y > floorY - 40) {
          shoot(it);
        }
      });
      const alive = state.items.filter(it => it.alive && it.y < floorY);
      setIntroWords(alive.map(it => ({ id: it.id, word: it.word, x: it.x, y: it.y, color: it.color })));
      raf = requestAnimationFrame(tick);
    };
    spawn();
    raf = requestAnimationFrame(tick);
    const intId = setInterval(spawn, 1800);
    return () => { cancelAnimationFrame(raf); clearInterval(intId); };
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
          {introWords.map(w => (
            <div key={w.id} className={styles.introWord} style={{ left: `${w.x}%`, top: w.y, color: w.color }}>{w.word}</div>
          ))}
          {introEffects.map(e => e.type === 'beam' ? (
            <div key={e.id} className={styles.introBeam} style={{ left: e.startX, top: e.startY, width: Math.hypot(e.endX - e.startX, e.endY - e.startY), transform: `rotate(${Math.atan2(e.endY - e.startY, e.endX - e.startX)}rad)` }}>
              <div className={styles.introBeamInner} />
            </div>
          ) : (
            <div key={e.id} className={styles.introExplosion} style={{ left: e.x - 20, top: e.y - 20, width: 40, height: 40 }} />
          ))}
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
