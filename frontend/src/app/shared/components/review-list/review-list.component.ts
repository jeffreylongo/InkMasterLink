import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ReviewListItem, ReviewTargetType } from '../../../core/models/review.model';
import { ReviewService } from '../../../core/services/review.service';
import { AuthService } from '../../../core/services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-review-list',
  templateUrl: './review-list.component.html',
  styleUrls: ['./review-list.component.scss']
})
export class ReviewListComponent implements OnInit {
  @Input() targetId!: string;
  @Input() targetType!: ReviewTargetType;
  @Output() reviewDeleted = new EventEmitter<string>();
  @Output() reviewEdit = new EventEmitter<ReviewListItem>();
  
  reviews: ReviewListItem[] = [];
  loading = true;
  error: string | null = null;
  averageRating = 0;
  reviewCount = 0;

  constructor(
    private reviewService: ReviewService,
    private authService: AuthService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    this.loading = true;
    this.error = null;

    this.reviewService.getReviewsByTarget(this.targetId, this.targetType).subscribe(
      (data) => {
        this.reviews = data;
        this.calculateAverageRating();
        this.loading = false;
      },
      (error) => {
        console.error('Error loading reviews:', error);
        this.error = 'Unable to load reviews. Please try again later.';
        this.loading = false;
      }
    );
  }

  private calculateAverageRating(): void {
    if (this.reviews.length === 0) {
      this.averageRating = 0;
      this.reviewCount = 0;
      return;
    }

    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.averageRating = totalRating / this.reviews.length;
    this.reviewCount = this.reviews.length;
  }

  isCurrentUserReview(review: ReviewListItem): boolean {
    const currentUserId = this.authService.getCurrentUserId();
    return !!currentUserId && currentUserId === review.userId;
  }

  onDeleteReview(review: ReviewListItem): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Review',
        message: 'Are you sure you want to delete this review? This action cannot be undone.',
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        isDeleteConfirmation: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.reviewService.deleteReview(review.id).subscribe(
          () => {
            this.reviews = this.reviews.filter(r => r.id !== review.id);
            this.calculateAverageRating();
            this.reviewDeleted.emit(review.id);
          },
          (error) => {
            console.error('Error deleting review:', error);
          }
        );
      }
    });
  }

  onEditReview(review: ReviewListItem): void {
    this.reviewEdit.emit(review);
  }

  getFormattedDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}