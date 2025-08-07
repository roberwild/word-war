import React from 'react';

const Leaderboard = React.memo(({ scores }) => (
  <table>
    <thead>
      <tr>
        <th>Nombre</th>
        <th>Nivel</th>
        <th>Puntos</th>
        <th>Fecha</th>
      </tr>
    </thead>
    <tbody>
      {scores.map((s, idx) => (
        <tr key={idx}>
          <td>{s.name}</td>
          <td>{s.level}</td>
          <td>{s.points}</td>
          <td>{new Date(s.date).toLocaleString()}</td>
        </tr>
      ))}
    </tbody>
  </table>
));

export default Leaderboard;
