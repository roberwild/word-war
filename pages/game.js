import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useGame } from '../context/GameContext';
import WordMissile from '../components/WordMissile';
import Building from '../components/Building';
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

const spawnRates = { easy: 1000, middle: 700, advanced: 400 };
const speedRates = { easy: 40, middle: 70, advanced: 100 };

export default function Game() {
  const { playerName, level } = useGame();
  const router = useRouter();
  const [missiles, setMissiles] = useState([]);
  const [score, setScore] = useState(0);
  const [typed, setTyped] = useState('');
  const [buildings, setBuildings] = useState(3);
  const [wordsTyped, setWordsTyped] = useState(0);
  const startTimeRef = useRef(Date.now());
  const inputRef = useRef(null);
  const animationRef = useRef();
  const wordPool = wordLists[level] || [];

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const spawn = () => {
      const word = wordPool[Math.floor(Math.random() * wordPool.length)];
      const x = 10 + Math.random() * 80;
      setMissiles((prev) => [...prev, { id: Date.now() + Math.random(), word, x, y: 0 }]);
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
      setMissiles((prev) => {
        const updated = [];
        let hits = 0;
        prev.forEach((m) => {
          const newY = m.y + (delta * speed) / 1000;
          if (newY >= 360) {
            hits += 1;
          } else {
            updated.push({ ...m, y: newY });
          }
        });
        if (hits) setBuildings((b) => Math.max(0, b - hits));
        return updated;
      });
      animationRef.current = requestAnimationFrame(step);
    };
    animationRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationRef.current);
  }, [level]);

  useEffect(() => {
    if (buildings <= 0) {
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
  }, [buildings, playerName, level, score, router]);

  const checkWord = useCallback(
    (word) => {
      setMissiles((prev) => {
        const index = prev.findIndex((m) => m.word === word);
        if (index !== -1) {
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

  const handleChange = (e) => {
    const val = e.target.value;
    if (val.endsWith(' ') || val.endsWith('\n')) {
      const word = val.trim();
      if (word) checkWord(word);
      setTyped('');
    } else {
      setTyped(val);
    }
  };

  const wpm = wordsTyped / ((Date.now() - startTimeRef.current) / 60000);

  if (!playerName) {
    router.replace('/');
    return null;
  }

  return (
    <div>
      <HUD score={score} wpm={wpm} />
      <div className={styles.gameArea}>
        {missiles.map((m) => (
          <WordMissile key={m.id} word={m.word} x={m.x} y={m.y} />
        ))}
        <div className={styles.buildings}>
          {[0, 1, 2].map((i) => (
            <Building key={i} destroyed={i >= buildings} />
          ))}
        </div>
        <input
          ref={inputRef}
          className={styles.hiddenInput}
          value={typed}
          onChange={handleChange}
        />
      </div>
    </div>
  );
}
