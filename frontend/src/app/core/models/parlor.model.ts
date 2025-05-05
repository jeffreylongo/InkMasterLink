export interface Parlor {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  images: string[];
  featured: boolean;
  sponsored: boolean;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    }
  };
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  social: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
  hours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  amenities: string[];
  artistIds: string[];
  rating: number;
  reviewCount: number;
  created: Date;
  updated: Date;
}

export interface ParlorListItem {
  id: string;
  name: string;
  featuredImage: string;
  location: {
    city: string;
    state: string;
    country: string;
  };
  rating: number;
  featured: boolean;
  sponsored: boolean;
}
