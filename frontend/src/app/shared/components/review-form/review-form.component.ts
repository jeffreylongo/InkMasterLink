import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReviewTargetType } from '../../../core/models/review.model';

@Component({
  selector: 'app-review-form',
  templateUrl: './review-form.component.html',
  styleUrls: ['./review-form.component.scss']
})
export class ReviewFormComponent implements OnInit {
  @Input() targetId!: string;
  @Input() targetType!: ReviewTargetType;
  @Input() existingReview: any = null;
  @Output() submitted = new EventEmitter<any>();
  @Output() cancelled = new EventEmitter<void>();

  reviewForm!: FormGroup;
  isSubmitting = false;
  
  // For the star rating
  hoverRating = 0;
  selectedRating = 0;
  maxRating = 5;
  ratingLabels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.initForm();
    
    if (this.existingReview) {
      this.patchExistingReview();
    }
  }

  private initForm(): void {
    this.reviewForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      content: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
      rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]]
    });
  }

  private patchExistingReview(): void {
    if (this.existingReview) {
      this.reviewForm.patchValue({
        title: this.existingReview.title,
        content: this.existingReview.content,
        rating: this.existingReview.rating
      });
      this.selectedRating = this.existingReview.rating;
    }
  }

  setRating(rating: number): void {
    this.selectedRating = rating;
    this.reviewForm.get('rating')?.setValue(rating);
  }

  onRatingHover(rating: number): void {
    this.hoverRating = rating;
  }

  onRatingLeave(): void {
    this.hoverRating = 0;
  }

  getCurrentRatingLabel(): string {
    const effectiveRating = this.hoverRating || this.selectedRating;
    return effectiveRating > 0 ? this.ratingLabels[effectiveRating - 1] : '';
  }

  onSubmit(): void {
    if (this.reviewForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.reviewForm.controls).forEach(key => {
        const control = this.reviewForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    
    const reviewData = {
      ...this.reviewForm.value,
      targetId: this.targetId,
      targetType: this.targetType
    };
    
    this.submitted.emit(reviewData);
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}