export type UserLocation = {
  userId: string;
  latitude: number;
  longitude: number;
  updatedAt: string;
};

export const locations: UserLocation[] = [
  {
    userId: "1",
    latitude: -23.5505,
    longitude: -46.6333,
    updatedAt: new Date().toISOString(),
  },

  {
    userId: "2",
    latitude: -23.5523,
    longitude: -46.6361,
    updatedAt: new Date().toISOString(),
  },

  {
    userId: "3",
    latitude: -23.5585,
    longitude: -46.6412,
    updatedAt: new Date().toISOString(),
  },

  {
    userId: "4",
    latitude: -23.5478,
    longitude: -46.6295,
    updatedAt: new Date().toISOString(),
  },
];