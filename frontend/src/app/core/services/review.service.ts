import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Review, ReviewListItem, ReviewTargetType, UserReviewListItem } from '../models/review.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = `${environment.apiUrl}/reviews`;

  constructor(private http: HttpClient) { }

  /**
   * Get all reviews with optional filters
   */
  getReviews(filters: any = {}): Observable<ReviewListItem[]> {
    let params = new HttpParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined) {
        params = params.set(key, filters[key]);
      }
    });
    
    return this.http.get<ReviewListItem[]>(this.apiUrl, { params });
  }

  /**
   * Get a specific review by ID
   */
  getReviewById(id: string): Observable<Review> {
    return this.http.get<Review>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get reviews by user ID
   */
  getReviewsByUser(userId: string): Observable<UserReviewListItem[]> {
    return this.http.get<UserReviewListItem[]>(`${this.apiUrl}/user/${userId}`);
  }

  /**
   * Get reviews for a target (artist or parlor)
   */
  getReviewsByTarget(targetId: string, targetType: ReviewTargetType): Observable<ReviewListItem[]> {
    return this.http.get<ReviewListItem[]>(`${this.apiUrl}/target/${targetType}/${targetId}`);
  }

  /**
   * Create a new review
   */
  createReview(reviewData: {
    targetId: string;
    targetType: ReviewTargetType;
    rating: number;
    title: string;
    content: string;
  }): Observable<Review> {
    return this.http.post<Review>(this.apiUrl, reviewData);
  }

  /**
   * Update an existing review
   */
  updateReview(id: string, updates: Partial<Review>): Observable<Review> {
    return this.http.put<Review>(`${this.apiUrl}/${id}`, updates);
  }

  /**
   * Delete a review
   */
  deleteReview(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  /**
   * Check if the current user has already reviewed a target
   */
  hasUserReviewedTarget(targetId: string, targetType: ReviewTargetType): Observable<{ 
    hasReviewed: boolean; 
    reviewId?: string;
  }> {
    return this.http.get<{ hasReviewed: boolean; reviewId?: string; }>(
      `${this.apiUrl}/check-reviewed/${targetType}/${targetId}`
    );
  }
  
  /**
   * Alias for hasUserReviewedTarget for backward compatibility
   */
  hasUserReviewed(targetId: string, targetType: ReviewTargetType): Observable<{ 
    exists: boolean; 
    reviewId?: string;
  }> {
    return this.http.get<{ exists: boolean; reviewId?: string; }>(
      `${this.apiUrl}/check-reviewed/${targetType}/${targetId}`
    );
  }

  /**
   * Get average rating for a target
   */
  getAverageRating(targetId: string, targetType: ReviewTargetType): Observable<{ 
    averageRating: number;
    totalReviews: number;
  }> {
    return this.http.get<{ averageRating: number; totalReviews: number; }>(
      `${this.apiUrl}/rating/${targetType}/${targetId}`
    );
  }
}