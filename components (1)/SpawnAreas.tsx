interface SpawnAreaProps {
  playerCount: number;
  playerColors: string[];
  screenSize: { width: number; height: number };
}

export function SpawnAreas({ playerCount, playerColors, screenSize }: SpawnAreaProps) {
  const spawnPositions = [
    { x: screenSize.width * 0.1, y: screenSize.height * 0.1, label: 'P1' }, // top-left
    { x: screenSize.width * 0.9, y: screenSize.height * 0.9, label: 'P2' }, // bottom-right  
    { x: screenSize.width * 0.9, y: screenSize.height * 0.1, label: 'P3' }, // top-right
    { x: screenSize.width * 0.1, y: screenSize.height * 0.9, label: 'P4' }, // bottom-left
  ];

  return (
    <>
      {spawnPositions.slice(0, playerCount).map((spawn, index) => (
        <div
          key={index}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 opacity-30"
          style={{
            left: `${spawn.x}px`,
            top: `${spawn.y}px`,
          }}
        >
          <div 
            className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center"
            style={{ backgroundColor: playerColors[index] }}
          >
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: playerColors[index] }}
              />
            </div>
          </div>
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-black text-white px-2 py-1 rounded text-xs font-bold">
            {spawn.label}
          </div>
        </div>
      ))}
    </>
  );
}