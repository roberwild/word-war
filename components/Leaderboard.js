import React from 'react';

const hues = ['#ff6cf1', '#6cf9ff', '#ffd56c', '#6cff7a', '#ff6c6c', '#b06cff', '#6cc9ff'];

const Leaderboard = React.memo(({ scores }) => (
  <table style={{ width: '100%', borderCollapse: 'collapse', maxWidth: 720, margin: '0 auto' }}>
    <thead>
      <tr>
        {['Nombre', 'Nivel', 'Puntos', 'Fecha'].map((h, i) => (
          <th
            key={h}
            style={{
              padding: '10px 8px',
              color: hues[i % hues.length],
              textShadow: `0 0 6px ${hues[i % hues.length]}`,
              borderBottom: '2px solid rgba(255,255,255,0.15)'
            }}
          >
            {h}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {scores.map((s, idx) => (
        <tr key={idx} style={{ background: idx % 2 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
          <td style={{ padding: '8px 6px', color: hues[0] }}>{s.name}</td>
          <td style={{ padding: '8px 6px', color: hues[1] }}>{s.level}</td>
          <td style={{ padding: '8px 6px', color: hues[3], fontWeight: 'bold' }}>{s.points}</td>
          <td style={{ padding: '8px 6px', color: hues[2] }}>{new Date(s.date).toLocaleString()}</td>
        </tr>
      ))}
    </tbody>
  </table>
));

export default Leaderboard;
