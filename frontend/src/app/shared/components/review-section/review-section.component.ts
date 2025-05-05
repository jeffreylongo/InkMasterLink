import { Component, OnInit, Input } from '@angular/core';
import { ReviewTargetType, ReviewListItem } from '../../../core/models/review.model';
import { ReviewService } from '../../../core/services/review.service';
import { AuthService } from '../../../core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-review-section',
  templateUrl: './review-section.component.html',
  styleUrls: ['./review-section.component.scss']
})
export class ReviewSectionComponent implements OnInit {
  @Input() targetId!: string;
  @Input() targetType!: ReviewTargetType;
  
  isAuthenticated = false;
  canReview = false;
  showReviewForm = false;
  existingReview: ReviewListItem | null = null;
  isEditing = false;

  constructor(
    private reviewService: ReviewService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    
    if (this.isAuthenticated) {
      this.checkIfUserCanReview();
    }
  }

  private checkIfUserCanReview(): void {
    this.reviewService.hasUserReviewed(this.targetId, this.targetType).subscribe(
      (result) => {
        if (result.exists && result.reviewId) {
          this.canReview = false;
          this.getExistingReview(result.reviewId);
        } else {
          this.canReview = true;
        }
      },
      (error) => {
        console.error('Error checking if user can review:', error);
        this.canReview = false;
      }
    );
  }

  private getExistingReview(reviewId: string): void {
    this.reviewService.getReviewById(reviewId).subscribe(
      (review) => {
        this.existingReview = {
          id: review.id,
          userId: review.userId,
          targetId: review.targetId,
          targetType: review.targetType,
          rating: review.rating,
          title: review.title,
          content: review.content,
          userDisplayName: this.authService.currentUser?.profile.name || 'Anonymous',
          userAvatar: this.authService.currentUser?.profile.avatar,
          created: review.created
        };
      },
      (error) => {
        console.error('Error getting existing review:', error);
      }
    );
  }

  onCreateReview(): void {
    this.showReviewForm = true;
    this.isEditing = false;
  }

  onEditReview(review: ReviewListItem): void {
    this.existingReview = review;
    this.showReviewForm = true;
    this.isEditing = true;
  }

  onCancelReview(): void {
    this.showReviewForm = false;
    if (this.isEditing) {
      this.isEditing = false;
    }
  }

  onSubmitReview(reviewData: any): void {
    if (this.isEditing && this.existingReview) {
      // Update existing review
      this.reviewService.updateReview(this.existingReview.id, reviewData).subscribe(
        (updatedReview) => {
          this.showReviewForm = false;
          this.isEditing = false;
          this.snackBar.open('Review updated successfully!', 'Close', {
            duration: 3000
          });
          // Refresh the review list
          const reviewList = this.getReviewListComponent();
          if (reviewList) {
            reviewList.loadReviews();
          }
        },
        (error) => {
          console.error('Error updating review:', error);
          this.snackBar.open('Failed to update review. Please try again.', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      );
    } else {
      // Create new review
      this.reviewService.createReview(reviewData).subscribe(
        (newReview) => {
          this.showReviewForm = false;
          this.canReview = false;
          this.snackBar.open('Review submitted successfully!', 'Close', {
            duration: 3000
          });
          // Refresh the review list
          const reviewList = this.getReviewListComponent();
          if (reviewList) {
            reviewList.loadReviews();
          }
          // Get the new review as existing review for future edits
          this.getExistingReview(newReview.id);
        },
        (error) => {
          console.error('Error submitting review:', error);
          this.snackBar.open('Failed to submit review. Please try again.', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      );
    }
  }

  onReviewDeleted(reviewId: string): void {
    if (this.existingReview && this.existingReview.id === reviewId) {
      this.existingReview = null;
      this.canReview = true;
      this.snackBar.open('Review deleted successfully!', 'Close', {
        duration: 3000
      });
    }
  }

  private getReviewListComponent(): any {
    // This is a workaround to get the child component
    // In a real application, you'd use @ViewChild
    const element = document.querySelector('app-review-list') as any;
    return element?.component;
  }
}