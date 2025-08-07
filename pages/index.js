import { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useGame } from '../context/GameContext';

export default function Home() {
  const [name, setName] = useState('');
  const router = useRouter();
  const { setPlayerName } = useGame();

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (name.trim()) {
        setPlayerName(name.trim());
        router.push('/select-level');
      }
    },
    [name, setPlayerName, router]
  );

  return (
    <div className="container">
      <h1>Word War</h1>
      <form onSubmit={handleSubmit}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tu nombre"
        />
        <button type="submit">Empezar</button>
      </form>
    </div>
  );
}
