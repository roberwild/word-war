import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useGame } from '../context/GameContext';
import WordMissile from '../components/WordMissile';
import Beam from '../components/Beam';
import Explosion from '../components/Explosion';
import Shockwave from '../components/Shockwave';
import Building from '../components/Building';
import Turret from '../components/Turret';
import { playShoot, playExplosion, playImpact, resumeAudio, playBigExplosion } from '../utils/sound';
import HUD from '../components/HUD';
import styles from '../styles/Game.module.css';
import easyWords from '../data/words-easy.json';
import middleWords from '../data/words-middle.json';
import advancedWords from '../data/words-advanced.json';

const wordLists = {
  easy: easyWords,
  middle: middleWords,
  advanced: advancedWords,
};

// Dificultad reducida al 50%: menos spawns (intervalos x2) y caída más lenta (velocidad /2)
const spawnRates = { easy: 2000, middle: 1400, advanced: 800 };
const speedRates = { easy: 20, middle: 35, advanced: 50 };

export default function Game() {
  const { playerName, level } = useGame();
  const router = useRouter();
  const [missiles, setMissiles] = useState([]);
  const [score, setScore] = useState(0);
  const [typed, setTyped] = useState('');
  const [buildingsAlive, setBuildingsAlive] = useState(() => Array(8).fill(true));
  const [wordsTyped, setWordsTyped] = useState(0);
  const [effects, setEffects] = useState([]); // visual effects like beam/explosion
  const [turretAngle, setTurretAngle] = useState(0);
  const [shake, setShake] = useState(false);
  const [mounted, setMounted] = useState(false);
  const startTimeRef = useRef(Date.now());
  const inputRef = useRef(null);
  const animationRef = useRef();
  const gameAreaRef = useRef(null);
  const buildingsRef = useRef(buildingsAlive);
  const missilesRef = useRef(missiles);
  const deckRef = useRef([]);
  const deckIndexRef = useRef(0);
  const wordPool = wordLists[level] || [];

  useEffect(() => {
    inputRef.current?.focus();
    // desbloquear audio en el primer gesto del usuario
    const unlock = () => {
      resumeAudio();
      // Disparo ínfimo para activar el pipeline de audio en iOS
      try {
        const ctx = (window.AudioContext || window.webkitAudioContext) ? new (window.AudioContext || window.webkitAudioContext)() : null;
        if (ctx) {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          g.gain.value = 0.0001;
          o.connect(g);
          g.connect(ctx.destination);
          const now = ctx.currentTime;
          o.start(now);
          o.stop(now + 0.01);
        }
      } catch (_) {}
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('touchstart', unlock, { passive: true });
    window.addEventListener('click', unlock, { passive: true });
    window.addEventListener('keydown', unlock);
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  // Ajustar viewport en móviles/tablets para que no lo tape el teclado
  useEffect(() => {
    const updateVh = () => {
      try {
        const vv = typeof window !== 'undefined' && window.visualViewport ? window.visualViewport : null;
        // En móviles Safari, usar visualViewport.height y restar safe-area inferior si procede
        const height = vv?.height || window.innerHeight;
        const vh = height * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
      } catch (_) {}
    };
    updateVh();
    window.addEventListener('resize', updateVh);
    window.addEventListener('orientationchange', updateVh);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateVh);
      window.visualViewport.addEventListener('scroll', updateVh);
    }
    return () => {
      window.removeEventListener('resize', updateVh);
      window.removeEventListener('orientationchange', updateVh);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateVh);
        window.visualViewport.removeEventListener('scroll', updateVh);
      }
    };
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    buildingsRef.current = buildingsAlive;
  }, [buildingsAlive]);

  useEffect(() => {
    missilesRef.current = missiles;
  }, [missiles]);

  // Crear un mazo (deck) barajado para mayor variedad y menos repeticiones
  const shuffleArray = useCallback((arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }, []);

  useEffect(() => {
    deckRef.current = shuffleArray(wordPool);
    deckIndexRef.current = 0;
  }, [level, wordPool, shuffleArray]);

  useEffect(() => {
    const pickNextWord = () => {
      const active = new Set((missilesRef.current || []).map((m) => m.word.toLowerCase()));
      let tries = 0;
      const maxTries = (deckRef.current?.length || 0) * 2 + 10;
      while (tries < maxTries) {
        if (!deckRef.current || deckIndexRef.current >= deckRef.current.length) {
          deckRef.current = shuffleArray(wordPool);
          deckIndexRef.current = 0;
        }
        const candidate = deckRef.current[deckIndexRef.current++];
        if (!active.has(candidate.toLowerCase())) {
          return candidate;
        }
        tries++;
      }
      // fallback
      return wordPool[Math.floor(Math.random() * wordPool.length)];
    };

    const spawn = () => {
      const word = pickNextWord();
      // Calcular un rango seguro para que la palabra no se salga por los bordes
      const areaEl = gameAreaRef.current;
      const areaW = areaEl ? areaEl.clientWidth : 400;
      const estimatedCharWidth = 12; // aproximación en px por carácter
      const borderPaddingPx = 10; // margen de seguridad respecto al borde verde
      const estimatedWordWidth = Math.min(
        word.length * estimatedCharWidth,
        Math.max(0, areaW - borderPaddingPx * 2)
      );
      const minCenterPx = (estimatedWordWidth / 2) + borderPaddingPx;
      const maxCenterPx = Math.max(minCenterPx, areaW - ((estimatedWordWidth / 2) + borderPaddingPx));
      const xCenterPx = minCenterPx + Math.random() * (maxCenterPx - minCenterPx);
      const x = (xCenterPx / areaW) * 100;
      const colors = ['#6cf9ff', '#ff6cf1', '#ffd56c', '#6cff7a', '#ff6c6c', '#b06cff', '#6cc9ff'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      setMissiles((prev) => [
        ...prev,
        { id: Date.now() + Math.random(), word, x, y: 0, color },
      ]);
    };
    spawn();
    const id = setInterval(spawn, spawnRates[level]);
    return () => clearInterval(id);
  }, [level, wordPool]);

  useEffect(() => {
    const speed = speedRates[level];
    let last = performance.now();
    const step = (now) => {
      const delta = now - last;
      last = now;
      const areaEl = gameAreaRef.current;
      const areaH = areaEl ? areaEl.clientHeight : 400;
      const floorY = areaH - 24 - 4;
      let pendingImpactEffects = [];
      setMissiles((prev) => {
        const updated = [];
        prev.forEach((m) => {
          const speedScale = areaH / 400;
          const newY = m.y + (delta * speed * speedScale) / 1000;
          if (newY >= floorY) {

            pendingImpactEffects.push({ xPercent: m.x, y: floorY });
          } else {
            updated.push({ ...m, y: newY });
          }
        });
        
        // Procesar impactos INMEDIATAMENTE aquí dentro
        if (pendingImpactEffects.length && gameAreaRef.current) {

          const w = gameAreaRef.current.clientWidth;
          const effectsToAdd = [];
          const aliveSnapshot = buildingsRef.current.slice();
          pendingImpactEffects.forEach((p, i) => {
            const approxIndex = Math.max(0, Math.min(7, Math.floor((p.xPercent / 100) * 8)));
            let targetIdx = -1;
            for (let d = 0; d < 8; d++) {
              const left = approxIndex - d;
              const right = approxIndex + d;
              if (left >= 0 && aliveSnapshot[left]) { targetIdx = left; break; }
              if (right < 8 && aliveSnapshot[right]) { targetIdx = right; break; }
            }
            if (targetIdx === -1) { 
              return; 
            }
            aliveSnapshot[targetIdx] = false;
            const x = ((targetIdx + 0.5) * w) / 8;
            const { y } = p;
            const buildingHeight = 28 + (targetIdx % 3) * 10;
            const boomY = y - Math.max(24, buildingHeight * 0.8);
            const id = `floor-imp-${now}-${i}`;
            effectsToAdd.push(
              { id: id + '-boom', type: 'explosion', x, y: boomY, duration: 1100, size: 180 },
              { id: id + '-wave', type: 'shockwave', x, y, duration: 800, size: 280 },
            );
          });
          if (effectsToAdd.length) {
            setBuildingsAlive(aliveSnapshot);
            setEffects((eff) => [...eff, ...effectsToAdd]);
            setShake(true);
            setTimeout(() => setShake(false), 300);
            playBigExplosion();
            setTimeout(() => {
              setEffects((eff) => eff.filter((e) => !e.id.startsWith(`floor-imp-${now}-`)));
            }, 1200);
          }
        }
        
        return updated;
      });

      animationRef.current = requestAnimationFrame(step);
    };
    animationRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationRef.current);
  }, [level]);

  useEffect(() => {
    const aliveCount = buildingsAlive.filter(Boolean).length;
    if (aliveCount <= 0) {
      const result = {
        name: playerName,
        level,
        points: score,
        date: new Date().toISOString(),
      };
      const saved = JSON.parse(localStorage.getItem('scores') || '[]');
      saved.push(result);
      localStorage.setItem('scores', JSON.stringify(saved));
      router.push('/scoreboard');
    }
  }, [buildingsAlive, playerName, level, score, router]);

  const checkWord = useCallback(
    (word) => {
      setMissiles((prev) => {
        const index = prev.findIndex((m) => m.word.toLowerCase() === word.toLowerCase());
        if (index !== -1) {
          const target = prev[index];
          // spawn beam from bottom-center to the target
          const areaEl = document.querySelector(`.${styles.gameArea}`);
          const turretEl = document.querySelector(`.${styles.turret}`);
          const areaRect = areaEl?.getBoundingClientRect();
          const turretRect = turretEl?.getBoundingClientRect();
          // fallback to approximate center if rect not found
          const startX = areaRect && turretRect ? (turretRect.left - areaRect.left) + (turretRect.width / 2) : (areaRect ? areaRect.width / 2 : 0);
          const startY = areaRect && turretRect ? (turretRect.top - areaRect.top) : (areaRect ? areaRect.height : 400);
          const endX = areaRect ? (target.x / 100) * areaRect.width : 0;
          const endY = target.y; // already in px from top

          const effectId = `${Date.now()}-${Math.random()}`;
          // orientar cañón hacia el objetivo (ajustado para que 0° sea hacia arriba)
          const dx = endX - startX;
          const dy = endY - startY;
          const angle = Math.atan2(dx, -dy) * (180 / Math.PI);
          setTurretAngle(angle);
          setEffects((eff) => [
            ...eff,
            { id: effectId + '-beam', type: 'beam', startX, startY, endX, endY, duration: 200 },
            { id: effectId + '-boom', type: 'explosion', x: endX, y: endY, duration: 650, size: 70 },
          ]);
          playShoot();
          setTimeout(() => playExplosion(), 200);

          // remove effects after they finish
          setTimeout(() => {
            setEffects((eff) => eff.filter((e) => !e.id.startsWith(effectId)));
          }, 600);

          const newMissiles = [...prev];
          newMissiles.splice(index, 1);
          setScore((s) => s + 10);
          setWordsTyped((w) => w + 1);
          return newMissiles;
        }
        return prev;
      });
    },
    [setScore]
  );

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    try {
      const ua = navigator.userAgent || navigator.vendor || '';
      const touch = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(pointer: coarse)').matches : false;
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet/i;
      setIsMobile(mobileRegex.test(ua) || touch);
    } catch (_) {
      setIsMobile(false);
    }
  }, []);

  const normalizeForMobile = (s) => s.normalize('NFD').replace(/\p{Diacritic}+/gu, '');

  const handleChange = (e) => {
    const val = e.target.value;
    const normalizedVal = isMobile ? normalizeForMobile(val) : val;
    let remaining = val;
    let lowerVal = normalizedVal.toLowerCase();
    let foundAny = false;
    

    
    if (missiles.length > 0 && lowerVal.length) {
      missiles.forEach((m) => {
        const w = (isMobile ? normalizeForMobile(m.word) : m.word).toLowerCase();
        const idx = lowerVal.indexOf(w);
        if (idx !== -1) {
          checkWord(m.word);
          foundAny = true;
          // quitar la palabra del texto para permitir más coincidencias
          lowerVal = lowerVal.slice(0, idx) + lowerVal.slice(idx + w.length);
          remaining = remaining.slice(0, idx) + remaining.slice(idx + w.length);
        }
      });
    }
    
    // Si se neutralizó alguna palabra, limpiar buffer
    if (foundAny) {
      setTyped('');
    } else {
      setTyped(remaining);
    }
  };

  const wpm = wordsTyped / ((Date.now() - startTimeRef.current) / 60000);

  useEffect(() => {
    if (mounted && !playerName) {
      router.replace('/');
    }
  }, [mounted, playerName, router]);

  if (!mounted || !playerName) {
    return null;
  }

  return (
    <div className={styles.safeWrap} style={{ overflowX: 'hidden' }}>
      <HUD score={score} wpm={wpm} />
      <div
        className={`${styles.gameArea} ${shake ? styles.shake : ''}`}
        ref={gameAreaRef}
        onMouseDown={() => {
          inputRef.current?.focus();
        }}
        tabIndex={0}
        onKeyDown={(ev) => {
          ev.preventDefault(); // AHORA SÍ prevenir default para evitar duplicación
          if (inputRef.current) {
            inputRef.current.focus();
            // Simular la entrada en el input
            const currentValue = typed; // usar el estado, no el input.value
            if (ev.key === 'Backspace') {
              const newValue = currentValue.slice(0, -1);
              handleChange({ target: { value: newValue } });
            } else if (ev.key.length === 1) {
              const newValue = currentValue + ev.key;
              handleChange({ target: { value: newValue } });
            }
          }
        }}
      >
        {missiles.map((m) => (
          <WordMissile key={m.id} word={m.word} x={m.x} y={m.y} color={m.color} />
        ))}
        {effects.map((e) =>
          e.type === 'beam' ? (
            <Beam key={e.id} id={e.id} startX={e.startX} startY={e.startY} endX={e.endX} endY={e.endY} duration={e.duration} />
          ) : e.type === 'explosion' ? (
            <Explosion key={e.id} x={e.x} y={e.y} duration={e.duration} size={e.size} />
          ) : (
            <Shockwave key={e.id} x={e.x} y={e.y} duration={e.duration} size={e.size} />
          )
        )}
        <div className={styles.ground} />
        <div className={styles.buildingsRow}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Building key={i} destroyed={!buildingsAlive[i]} height={`${28 + (i % 3) * 10}px`} />
          ))}
        </div>
        <Turret angleDeg={turretAngle} />
        <input
          ref={inputRef}
          className={styles.hiddenInput}
          value={typed}
          onChange={handleChange}
          onBlur={() => inputRef.current?.focus()}
          autoFocus
          style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', zIndex: -1 }}
        />
      </div>
    </div>
  );
}