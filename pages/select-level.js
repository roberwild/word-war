import { useRouter } from 'next/router';
import { useGame } from '../context/GameContext';

export default function SelectLevel() {
  const router = useRouter();
  const { setLevel } = useGame();

  const choose = (lvl) => {
    setLevel(lvl);
    router.push('/game');
  };

  return (
    <div className="container">
      <h1>Selecciona nivel</h1>
      <button onClick={() => choose('easy')}>Easy</button>
      <button onClick={() => choose('middle')}>Middle</button>
      <button onClick={() => choose('advanced')}>Advance</button>
    </div>
  );
}
