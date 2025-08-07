import { createContext, useContext, useState } from 'react';

const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [playerName, setPlayerName] = useState('');
  const [level, setLevel] = useState('easy');
  return (
    <GameContext.Provider value={{ playerName, setPlayerName, level, setLevel }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => useContext(GameContext);
