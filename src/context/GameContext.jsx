import React, { createContext, useContext, useState, useEffect } from 'react';
import { getGameBySlug } from '../data/games';

const GameContext = createContext(null);

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
};

export const GameProvider = ({ children }) => {
  const [selectedGame, setSelectedGame] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('elixir_selected_game');
    if (stored) {
      const game = getGameBySlug(stored);
      if (game) setSelectedGame(game);
    }
  }, []);

  const selectGame = (gameSlug) => {
    const game = getGameBySlug(gameSlug);
    if (game) {
      setSelectedGame(game);
      localStorage.setItem('elixir_selected_game', gameSlug);
    }
  };

  const clearGame = () => {
    setSelectedGame(null);
    localStorage.removeItem('elixir_selected_game');
  };

  return (
    <GameContext.Provider value={{ selectedGame, selectGame, clearGame }}>
      {children}
    </GameContext.Provider>
  );
};
