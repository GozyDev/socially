export interface Users {
    id: string;
    name: string | null;
    username: string;
    image: string | null;
    _count: { followers: number };
  }
  
