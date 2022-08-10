type TUser = {
  id: string;
  name: string;

  createdAt: Date;
  updatedAt: Date;
  bannedAt?: Date;
};

type TList = {
  id: number;
  name: string;
  description: string;
  thumbnail?: string;
  places: TPlace[];
  userId: string;
};

type TPlace = {
  id: number;
  name: string;
  description: string;
  lon: number;
  lat: number;
  banner?: string;
  thumbnail?: string;
};
