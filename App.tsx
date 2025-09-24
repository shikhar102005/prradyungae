import { useState } from "react";
import { PlayerSetup } from "./components/PlayerSetup";
import { GameBoard } from "./components/GameBoard";

export default function App() {
  const [gameState, setGameState] = useState<'menu' | 'playing'>('menu');
  const [playerCount, setPlayerCount] = useState<number>(2);

  const handleStartGame = (count: number) => {
    setPlayerCount(count);
    setGameState('playing');
  };

  const handleBackToMenu = () => {
    setGameState('menu');
  };

  return (
    <div className="size-full">
      {gameState === 'menu' ? (
        <PlayerSetup onStartGame={handleStartGame} />
      ) : (
        <GameBoard 
          playerCount={playerCount} 
          onBackToMenu={handleBackToMenu} 
        />
      )}
    </div>
  );
}