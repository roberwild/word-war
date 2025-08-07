import { useEffect, useState } from 'react';
import Leaderboard from '../components/Leaderboard';

export default function Scoreboard() {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('scores') || '[]');
    stored.sort((a, b) => b.points - a.points);
    setScores(stored);
  }, []);

  return (
    <div className="container">
      <h1>Ranking</h1>
      <Leaderboard scores={scores} />
    </div>
  );
}
