export enum ReviewTargetType {
  ARTIST = 'artist',
  PARLOR = 'parlor'
}

export interface Review {
  id: string;
  userId: string;
  targetId: string;
  targetType: ReviewTargetType;
  rating: number;
  title: string;
  content: string;
  created: Date;
  updated: Date;
}

export interface ReviewListItem {
  id: string;
  userId: string;
  targetId: string;
  targetType: ReviewTargetType;
  rating: number;
  title: string;
  content: string;
  userDisplayName: string;
  userAvatar?: string;
  created: Date;
}

export interface UserReviewListItem {
  id: string;
  targetId: string;
  targetType: ReviewTargetType;
  targetName: string;
  rating: number;
  title: string;
  content: string;
  created: Date;
}