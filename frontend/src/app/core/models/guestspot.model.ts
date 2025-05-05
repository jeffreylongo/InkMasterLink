export enum GuestspotStatus {
  OPEN = 'open',
  REQUESTED = 'requested',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface Guestspot {
  id: string;
  parlorId: string;
  artistId?: string;  // Optional if open spot
  status: GuestspotStatus;
  dateStart: Date;
  dateEnd: Date;
  description?: string;
  requirements?: string;
  priceInfo?: string;
  applicants?: string[];  // List of artist IDs who applied
  created: Date;
  updated: Date;
}

export interface GuestspotListItem {
  id: string;
  parlorName: string;
  parlorLocation: {
    city: string;
    state: string;
    country: string;
  };
  artistName?: string;
  status: GuestspotStatus;
  dateStart: Date;
  dateEnd: Date;
  featured: boolean;
}

export interface GuestspotApplication {
  guestspotId: string;
  artistId: string;
  message: string;
  portfolio: string[];
  created: Date;
}
