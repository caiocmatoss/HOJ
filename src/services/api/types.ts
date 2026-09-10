export type AuthUser = {
  id: string;
  name: string;
  email: string;
  username?: string | null;
  city?: string | null;
  phone?: string | null;
  avatar: string | null;
  bio: string | null;
  status: 'ONLINE' | 'OFFLINE';
  role?: 'USER' | 'ADMIN';
  emailVerifiedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type AuthResponse = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
};

export type RefreshResponse = {
  accessToken: string;
  refreshToken: string;
};
