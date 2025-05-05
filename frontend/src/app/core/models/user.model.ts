export enum UserRole {
  ARTIST = 'artist',
  PARLOR_OWNER = 'parlor_owner',
  ADMIN = 'admin'
}

export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  created: Date;
  profile: {
    name: string;
    avatar?: string;
    bio?: string;
    location?: {
      city: string;
      state: string;
      country: string;
    };
    social?: {
      instagram?: string;
      website?: string;
      facebook?: string;
    };
  };
}

export interface AuthResponse {
  user: User;
  token: string;
}