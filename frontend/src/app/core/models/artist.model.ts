export interface Artist {
  id: string;
  userId: string;
  name: string;
  bio: string;
  specialty: string[];
  experienceYears: number;
  images: string[];
  featured: boolean;
  sponsored: boolean;
  portfolio: string[];
  location: {
    city: string;
    state: string;
    country: string;
    parlorId?: string;
  };
  social: {
    instagram?: string;
    website?: string;
    facebook?: string;
  };
  availability: {
    homeParlorId?: string;
    travelWilling: boolean;
    travelPreferences?: {
      cities?: string[];
      states?: string[];
      countries?: string[];
      distance?: number;
    }
  };
  upcomingGuestspots: string[];
  rating: number;
  reviewCount: number;
  created: Date;
  updated: Date;
}

export interface ArtistListItem {
  id: string;
  name: string;
  profileImage: string;
  specialty: string[];
  location: {
    city: string;
    state: string;
    country: string;
  };
  rating: number;
  featured: boolean;
  sponsored: boolean;
  travelWilling: boolean;
}
