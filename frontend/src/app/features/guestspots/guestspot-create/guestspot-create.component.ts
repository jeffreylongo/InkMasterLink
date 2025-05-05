import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GuestspotService } from '../../../core/services/guestspot.service';
import { ParlorService } from '../../../core/services/parlor.service';
import { AuthService } from '../../../core/services/auth.service';
import { Parlor } from '../../../core/models/parlor.model';
import { GuestspotStatus } from '../../../core/models/guestspot.model';

@Component({
  selector: 'app-guestspot-create',
  templateUrl: './guestspot-create.component.html',
  styleUrls: ['./guestspot-create.component.scss']
})
export class GuestspotCreateComponent implements OnInit {
  guestspotForm!: FormGroup;
  isLoading = false;
  isEditMode = false;
  guestspotId: string | null = null;
  userParlors: Parlor[] = [];
  selectedParlor: Parlor | null = null;
  
  minDate = new Date();
  maxDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1));

  constructor(
    private fb: FormBuilder,
    private guestspotService: GuestspotService,
    private parlorService: ParlorService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadUserParlors();
    this.checkEditMode();
  }

  private initForm(): void {
    this.guestspotForm = this.fb.group({
      parlorId: ['', Validators.required],
      dateStart: ['', Validators.required],
      dateEnd: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(1000)]],
      requirements: ['', [Validators.maxLength(500)]],
      priceInfo: ['', [Validators.maxLength(300)]]
    });

    // Add validator that ensures end date is after start date
    this.guestspotForm.get('dateEnd')?.valueChanges.subscribe(() => {
      this.validateDateRange();
    });

    this.guestspotForm.get('dateStart')?.valueChanges.subscribe(() => {
      this.validateDateRange();
    });
  }

  private validateDateRange(): void {
    const startDate = this.guestspotForm.get('dateStart')?.value;
    const endDate = this.guestspotForm.get('dateEnd')?.value;

    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
      this.guestspotForm.get('dateEnd')?.setErrors({ 'endDateInvalid': true });
    }
  }

  private loadUserParlors(): void {
    if (!this.authService.currentUser) {
      this.snackBar.open('You must be logged in to create guest spots', 'Close', { duration: 3000 });
      this.router.navigate(['/auth/login']);
      return;
    }

    this.isLoading = true;
    const userId = this.authService.currentUser.id;

    this.parlorService.getParlorsByOwnerId(userId).subscribe({
      next: (parlors) => {
        this.userParlors = parlors;
        this.isLoading = false;

        if (parlors.length === 0) {
          this.snackBar.open('You need to create a parlor before posting guest spots', 'Close', { duration: 3000 });
        }

        // If we have a parlor ID from the route, select it
        const parlorId = this.route.snapshot.queryParamMap.get('parlorId');
        if (parlorId) {
          this.guestspotForm.get('parlorId')?.setValue(parlorId);
          this.onParlorChange();
        }
      },
      error: (error) => {
        console.error('Error loading parlors:', error);
        this.snackBar.open('Error loading your parlors', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  private checkEditMode(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.guestspotId = id;
        this.loadGuestspot(id);
      }
    });
  }

  private loadGuestspot(id: string): void {
    this.isLoading = true;
    this.guestspotService.getGuestspotById(id).subscribe({
      next: (guestspot) => {
        // Check if the current user owns this guestspot's parlor
        const userId = this.authService.currentUser?.id;
        if (!userId) {
          this.router.navigate(['/auth/login']);
          return;
        }

        // Find the parlor and check ownership
        this.parlorService.getParlorById(guestspot.parlorId).subscribe({
          next: (parlor) => {
            if (parlor.ownerId !== userId) {
              this.snackBar.open('You can only edit your own parlor guest spots', 'Close', { duration: 3000 });
              this.router.navigate(['/guestspots']);
              return;
            }

            // Update the form with guestspot data
            this.guestspotForm.patchValue({
              parlorId: guestspot.parlorId,
              dateStart: guestspot.dateStart,
              dateEnd: guestspot.dateEnd,
              description: guestspot.description,
              requirements: guestspot.requirements || '',
              priceInfo: guestspot.priceInfo || ''
            });

            this.onParlorChange();
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error loading parlor:', error);
            this.snackBar.open('Error loading parlor information', 'Close', { duration: 3000 });
            this.isLoading = false;
          }
        });
      },
      error: (error) => {
        console.error('Error loading guestspot:', error);
        this.snackBar.open('Error loading guest spot', 'Close', { duration: 3000 });
        this.isLoading = false;
        this.router.navigate(['/guestspots']);
      }
    });
  }

  onParlorChange(): void {
    const parlorId = this.guestspotForm.get('parlorId')?.value;
    if (parlorId) {
      this.selectedParlor = this.userParlors.find(p => p.id === parlorId) || null;
    } else {
      this.selectedParlor = null;
    }
  }

  onSubmit(): void {
    if (this.guestspotForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.guestspotForm.controls).forEach(key => {
        this.guestspotForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isLoading = true;
    const guestspotData = {
      ...this.guestspotForm.value,
      status: GuestspotStatus.OPEN
    };

    if (this.isEditMode && this.guestspotId) {
      this.guestspotService.updateGuestspot(this.guestspotId, guestspotData).subscribe({
        next: () => {
          this.snackBar.open('Guest spot updated successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/guestspots', this.guestspotId]);
        },
        error: (error) => {
          console.error('Error updating guestspot:', error);
          this.snackBar.open('Error updating guest spot', 'Close', { duration: 3000 });
          this.isLoading = false;
        }
      });
    } else {
      this.guestspotService.createGuestspot(guestspotData).subscribe({
        next: (newGuestspot) => {
          this.snackBar.open('Guest spot created successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/guestspots', newGuestspot.id]);
        },
        error: (error) => {
          console.error('Error creating guestspot:', error);
          this.snackBar.open('Error creating guest spot', 'Close', { duration: 3000 });
          this.isLoading = false;
        }
      });
    }
  }
}