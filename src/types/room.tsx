export interface Room {
  id: number;
  name: string;
  code: string;
  status: string;
  maxPlayers: number;
  totalRounds: number;
  creator: {
    id: number;
    name: string;
    image: string;
  };
  _count: {
    players: number;
  };
}
