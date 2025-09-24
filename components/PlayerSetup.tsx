import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface PlayerSetupProps {
  onStartGame: (playerCount: number) => void;
}

export function PlayerSetup({ onStartGame }: PlayerSetupProps) {
  return (
    <div className="min-h-screen bg-green-500 flex items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Battle Arena</CardTitle>
          <p className="text-muted-foreground">Choose number of players</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            className="w-full h-16 text-lg" 
            onClick={() => onStartGame(2)}
          >
            2 Players
          </Button>
          <Button 
            className="w-full h-16 text-lg" 
            onClick={() => onStartGame(3)}
          >
            3 Players
          </Button>
          <Button 
            className="w-full h-16 text-lg" 
            onClick={() => onStartGame(4)}
          >
            4 Players
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}