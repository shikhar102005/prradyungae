import { useState, useEffect, useCallback } from "react";
import { Button } from "./ui/button";
import { SpawnAreas } from "./SpawnAreas";
import { GameOverScreen } from "./GameOverScreen";

interface Player {
  id: number;
  color: string;
  health: number;
  position: { x: number; y: number };
  active: boolean;
  controls: {
    up: string;
    down: string;
    left: string;
    right: string;
    attack: string;
  };
  attacking: boolean;
  attackCooldown: number;
  invulnerable: boolean;
  invulnerabilityTime: number;
}

interface GameBoardProps {
  playerCount: number;
  onBackToMenu: () => void;
}

export function GameBoard({ playerCount, onBackToMenu }: GameBoardProps) {
  const [gameTime, setGameTime] = useState(90); // 1:30 in seconds
  const [players, setPlayers] = useState<Player[]>([]);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [gameOver, setGameOver] = useState(false);
  const [screenSize, setScreenSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  // Update screen size on resize
  useEffect(() => {
    const handleResize = () => {
      setScreenSize({ width: window.innerWidth, height: window.innerHeight });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Obstacle positions for collision detection (using pixel coordinates)
  const obstacles = [
    // Bushes
    { type: 'bush', x: screenSize.width * 0.25, y: screenSize.height * 0.25, width: 60, height: 60 },
    { type: 'bush', x: screenSize.width * 0.75, y: screenSize.height * 0.25, width: 60, height: 60 },
    { type: 'bush', x: screenSize.width * 0.25, y: screenSize.height * 0.75, width: 60, height: 60 },
    { type: 'bush', x: screenSize.width * 0.75, y: screenSize.height * 0.75, width: 60, height: 60 },
    { type: 'bush', x: screenSize.width * 0.15, y: screenSize.height * 0.5, width: 60, height: 60 },
    { type: 'bush', x: screenSize.width * 0.85, y: screenSize.height * 0.5, width: 60, height: 60 },
    
    // Boxes
    { type: 'box', x: screenSize.width * 0.4, y: screenSize.height * 0.35, width: 40, height: 40 },
    { type: 'box', x: screenSize.width * 0.6, y: screenSize.height * 0.35, width: 40, height: 40 },
    { type: 'box', x: screenSize.width * 0.4, y: screenSize.height * 0.65, width: 40, height: 40 },
    { type: 'box', x: screenSize.width * 0.6, y: screenSize.height * 0.65, width: 40, height: 40 },
    { type: 'box', x: screenSize.width * 0.35, y: screenSize.height * 0.2, width: 40, height: 40 },
    { type: 'box', x: screenSize.width * 0.65, y: screenSize.height * 0.8, width: 40, height: 40 },
    
    // Central structure
    { type: 'central', x: screenSize.width * 0.5, y: screenSize.height * 0.5, width: 100, height: 60 },
  ];

  useEffect(() => {
    // Initialize players based on count using pixel coordinates
    const playerColors = ['#ef4444', '#22c55e', '#3b82f6', '#eab308']; // red, green, blue, yellow
    const playerPositions = [
      { x: screenSize.width * 0.1, y: screenSize.height * 0.1 }, // top-left
      { x: screenSize.width * 0.9, y: screenSize.height * 0.9 }, // bottom-right
      { x: screenSize.width * 0.9, y: screenSize.height * 0.1 }, // top-right
      { x: screenSize.width * 0.1, y: screenSize.height * 0.9 }, // bottom-left
    ];
    
    const playerControls = [
      { up: 'w', down: 's', left: 'a', right: 'd', attack: 'q' },
      { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight', attack: ' ' },
      { up: 'i', down: 'k', left: 'j', right: 'l', attack: 'u' },
      { up: 't', down: 'g', left: 'f', right: 'h', attack: 'r' },
    ];

    const initialPlayers = Array.from({ length: playerCount }, (_, i) => ({
      id: i + 1,
      color: playerColors[i],
      health: 5,
      position: playerPositions[i],
      active: true,
      controls: playerControls[i],
      attacking: false,
      attackCooldown: 0,
      invulnerable: false,
      invulnerabilityTime: 0,
    }));

    setPlayers(initialPlayers);
  }, [playerCount, screenSize]);

  // Check collision with obstacles (using pixel coordinates)
  const checkCollision = useCallback((x: number, y: number, playerSize: number = 32) => {
    // Check boundaries (screen edges)
    if (x < playerSize/2 || x > screenSize.width - playerSize/2 || 
        y < playerSize/2 || y > screenSize.height - playerSize/2) {
      return true;
    }
    
    // Check obstacle collision
    return obstacles.some(obstacle => {
      const obstacleLeft = obstacle.x - obstacle.width / 2;
      const obstacleRight = obstacle.x + obstacle.width / 2;
      const obstacleTop = obstacle.y - obstacle.height / 2;
      const obstacleBottom = obstacle.y + obstacle.height / 2;
      
      const playerLeft = x - playerSize / 2;
      const playerRight = x + playerSize / 2;
      const playerTop = y - playerSize / 2;
      const playerBottom = y + playerSize / 2;
      
      return playerLeft < obstacleRight && 
             playerRight > obstacleLeft && 
             playerTop < obstacleBottom && 
             playerBottom > obstacleTop;
    });
  }, [obstacles, screenSize]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setPressedKeys(prev => new Set([...prev, e.key]));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setPressedKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(e.key);
        return newSet;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Check if two players are within attack range (using pixel coordinates)
  const checkAttackHit = useCallback((attacker: Player, target: Player) => {
    const distance = Math.sqrt(
      Math.pow(attacker.position.x - target.position.x, 2) + 
      Math.pow(attacker.position.y - target.position.y, 2)
    );
    return distance <= 80; // Attack range in pixels
  }, []);

  // Game movement and combat loop
  useEffect(() => {
    const gameLoop = setInterval(() => {
      setPlayers(prevPlayers => {
        let updatedPlayers = prevPlayers.map(player => {
          if (!player.active) return player;
          
          const moveSpeed = 5.0; // Increased move speed for fullscreen movement
          let newX = player.position.x;
          let newY = player.position.y;
          let updatedPlayer = { ...player };
          
          // Handle diagonal movement - allow simultaneous key presses
          if (pressedKeys.has(player.controls.up)) {
            newY = Math.max(16, newY - moveSpeed);
          }
          if (pressedKeys.has(player.controls.down)) {
            newY = Math.min(screenSize.height - 16, newY + moveSpeed);
          }
          if (pressedKeys.has(player.controls.left)) {
            newX = Math.max(16, newX - moveSpeed);
          }
          if (pressedKeys.has(player.controls.right)) {
            newX = Math.min(screenSize.width - 16, newX + moveSpeed);
          }
          
          // Check for collisions before moving
          if (!checkCollision(newX, newY)) {
            updatedPlayer.position = { x: newX, y: newY };
          }
          
          // Handle attack input
          if (pressedKeys.has(player.controls.attack) && player.attackCooldown <= 0) {
            updatedPlayer.attacking = true;
            updatedPlayer.attackCooldown = 30; // 30 frames = 0.5 seconds
          }
          
          // Update attack state
          if (updatedPlayer.attacking) {
            updatedPlayer.attacking = updatedPlayer.attackCooldown > 25; // Attack visual lasts 5 frames
          }
          
          // Decrease cooldowns
          updatedPlayer.attackCooldown = Math.max(0, updatedPlayer.attackCooldown - 1);
          updatedPlayer.invulnerabilityTime = Math.max(0, updatedPlayer.invulnerabilityTime - 1);
          updatedPlayer.invulnerable = updatedPlayer.invulnerabilityTime > 0;
          
          return updatedPlayer;
        });
        
        // Process attack damage in a separate pass to avoid array modification issues
        const damageTargets: { attackerId: number; targetId: number }[] = [];
        
        // First, identify all attack hits
        updatedPlayers.forEach(attacker => {
          if (!attacker.active || !attacker.attacking) return;
          
          // Check if this attacking player hits any other players
          updatedPlayers.forEach(target => {
            if (target.id !== attacker.id && 
                target.active && 
                !target.invulnerable &&
                checkAttackHit(attacker, target)) {
              damageTargets.push({ attackerId: attacker.id, targetId: target.id });
            }
          });
        });
        
        // Then apply all damage
        damageTargets.forEach(({ targetId }) => {
          const targetIndex = updatedPlayers.findIndex(p => p.id === targetId);
          if (targetIndex !== -1) {
            updatedPlayers[targetIndex] = {
              ...updatedPlayers[targetIndex],
              health: Math.max(0, updatedPlayers[targetIndex].health - 1),
              invulnerable: true,
              invulnerabilityTime: 60, // 1 second of invulnerability
            };
            
            // Check if player is defeated
            if (updatedPlayers[targetIndex].health <= 0) {
              updatedPlayers[targetIndex].active = false;
            }
          }
        });
        
        // Check for game over conditions
        const alivePlayers = updatedPlayers.filter(p => p.active);
        if (alivePlayers.length <= 1 && !gameOver) {
          setGameOver(true);
        }
        
        return updatedPlayers;
      });
    }, 16); // ~60 FPS

    return () => clearInterval(gameLoop);
  }, [pressedKeys, checkCollision, checkAttackHit, gameOver]);

  useEffect(() => {
    const timer = setInterval(() => {
      setGameTime((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleRestart = () => {
    setGameOver(false);
    setGameTime(90);
    
    // Reset players to initial state using pixel coordinates
    const playerColors = ['#ef4444', '#22c55e', '#3b82f6', '#eab308'];
    const playerPositions = [
      { x: screenSize.width * 0.1, y: screenSize.height * 0.1 }, // top-left
      { x: screenSize.width * 0.9, y: screenSize.height * 0.9 }, // bottom-right
      { x: screenSize.width * 0.9, y: screenSize.height * 0.1 }, // top-right
      { x: screenSize.width * 0.1, y: screenSize.height * 0.9 }, // bottom-left
    ];
    
    const playerControls = [
      { up: 'w', down: 's', left: 'a', right: 'd', attack: 'q' },
      { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight', attack: ' ' },
      { up: 'i', down: 'k', left: 'j', right: 'l', attack: 'u' },
      { up: 't', down: 'g', left: 'f', right: 'h', attack: 'r' },
    ];

    const resetPlayers = Array.from({ length: playerCount }, (_, i) => ({
      id: i + 1,
      color: playerColors[i],
      health: 5,
      position: playerPositions[i],
      active: true,
      controls: playerControls[i],
      attacking: false,
      attackCooldown: 0,
      invulnerable: false,
      invulnerabilityTime: 0,
    }));

    setPlayers(resetPlayers);
  };

  const renderObstacles = () => {
    return obstacles.map((obstacle, index) => (
      <div
        key={index}
        className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${
          obstacle.type === 'bush' 
            ? 'bg-green-600 rounded-full' 
            : obstacle.type === 'box'
            ? 'bg-amber-700 border-2 border-amber-800'
            : 'bg-gray-800 border-2 border-gray-700'
        }`}
        style={{
          left: `${obstacle.x}px`,
          top: `${obstacle.y}px`,
          width: `${obstacle.width}px`,
          height: `${obstacle.height}px`,
        }}
      />
    ));
  };

  const renderPlayer = (player: Player) => {
    if (!player.active) return null;
    
    return (
      <div
        key={player.id}
        className="absolute transform -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${player.position.x}px`,
          top: `${player.position.y}px`,
        }}
      >
        {/* Attack range indicator */}
        {player.attacking && (
          <div 
            className="absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full animate-ping"
            style={{
              width: '160px', // Attack range * 2
              height: '160px',
              backgroundColor: player.color,
              opacity: 0.3,
              left: '50%',
              top: '50%',
            }}
          />
        )}
        
        {/* Attack visual effect */}
        {player.attacking && (
          <div 
            className="absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full border-4"
            style={{
              width: '160px',
              height: '160px',
              borderColor: player.color,
              left: '50%',
              top: '50%',
            }}
          />
        )}
        
        {/* Player character */}
        <div 
          className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center shadow-lg ${
            player.invulnerable ? 'animate-pulse' : ''
          }`}
          style={{ 
            backgroundColor: player.color,
            opacity: player.invulnerable ? 0.7 : 1
          }}
        >
          <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: player.color }}
            />
          </div>
        </div>
        
        {/* Player number */}
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-black text-white px-2 py-1 rounded text-xs font-bold">
          P{player.id}
        </div>
      </div>
    );
  };

  const renderPlayerUI = (player: Player, position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right') => {
    const positionClasses = {
      'top-left': 'top-4 left-4',
      'top-right': 'top-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'bottom-right': 'bottom-4 right-4'
    };

    return (
      <div key={player.id} className={`absolute ${positionClasses[position]} flex flex-col items-center gap-2`}>
        <div 
          className={`w-12 h-12 rounded-full border-4 border-white flex items-center justify-center ${
            !player.active ? 'opacity-50 grayscale' : ''
          }`}
          style={{ backgroundColor: player.color }}
        >
          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: player.color }}
            />
          </div>
        </div>
        
        {/* Health display */}
        <div className={`bg-black text-white px-3 py-1 rounded-full flex items-center gap-1 ${
          !player.active ? 'bg-red-600' : ''
        }`}>
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i < player.health ? 'bg-red-500' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
        
        {/* Status indicators */}
        {!player.active && (
          <div className="bg-red-600 text-white px-2 py-1 rounded text-xs">
            OUT
          </div>
        )}
        {player.attacking && (
          <div className="bg-yellow-500 text-black px-2 py-1 rounded text-xs animate-pulse">
            ATK
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-green-500 overflow-hidden">
      {/* Timer */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black text-white px-4 py-2 rounded-full text-xl font-bold z-10">
        {formatTime(gameTime)}
      </div>

      {/* Back button */}
      <Button 
        className="absolute top-4 left-4 z-10"
        onClick={onBackToMenu}
      >
        Back to Menu
      </Button>

      {/* Spawn areas (background) */}
      <SpawnAreas 
        playerCount={playerCount} 
        playerColors={['#ef4444', '#22c55e', '#3b82f6', '#eab308']}
        screenSize={screenSize}
      />

      {/* Obstacles */}
      {renderObstacles()}

      {/* Players on board */}
      {players.map(renderPlayer)}

      {/* Player UI corners */}
      {players[0] && renderPlayerUI(players[0], 'bottom-left')}
      {players[1] && renderPlayerUI(players[1], 'top-right')}
      {players[2] && renderPlayerUI(players[2], 'top-left')}
      {players[3] && renderPlayerUI(players[3], 'bottom-right')}

      {/* Game controls hint */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/75 text-white px-4 py-2 rounded-lg text-sm z-10">
        <div className="text-center space-y-1">
          <div>P1: WASD + Q • P2: Arrows + Space</div>
          {playerCount > 2 && <div>P3: IJKL + U • P4: TFGH + R</div>}
        </div>
      </div>

      {/* Game Over Screen */}
      {gameOver && (
        <GameOverScreen 
          players={players}
          onRestart={handleRestart}
          onBackToMenu={onBackToMenu}
        />
      )}
    </div>
  );
}