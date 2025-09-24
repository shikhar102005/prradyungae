import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface Player {
  id: number;
  color: string;
  health: number;
  active: boolean;
}

interface GameOverScreenProps {
  players: Player[];
  onRestart: () => void;
  onBackToMenu: () => void;
}

export function GameOverScreen({ players, onRestart, onBackToMenu }: GameOverScreenProps) {
  const alivePlayers = players.filter(p => p.active);
  const winner = alivePlayers.length === 1 ? alivePlayers[0] : null;

  return (
    <div className="absolute inset-0 bg-black/75 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {winner ? `Player ${winner.id} Wins!` : 'Game Over!'}
          </CardTitle>
          {winner && (
            <div 
              className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center mx-auto mt-4"
              style={{ backgroundColor: winner.color }}
            >
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: winner.color }}
                />
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {players.map(player => (
              <div key={player.id} className="flex items-center justify-between p-2 rounded bg-gray-100">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-6 h-6 rounded-full border-2 border-white"
                    style={{ backgroundColor: player.color }}
                  />
                  <span>Player {player.id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i < player.health ? 'bg-red-500' : 'bg-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                  <span className={player.active ? 'text-green-600' : 'text-red-600'}>
                    {player.active ? 'ALIVE' : 'OUT'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Button className="flex-1" onClick={onRestart}>
              Play Again
            </Button>
            <Button variant="outline" className="flex-1" onClick={onBackToMenu}>
              Main Menu
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}