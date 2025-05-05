import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  submitting = false;
  hidePassword = true;
  accountType: 'artist' | 'parlor' = 'artist';
  
  userRoles = [
    { value: UserRole.ARTIST, label: 'Artist' },
    { value: UserRole.PARLOR_OWNER, label: 'Parlor Owner' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      name: ['', [Validators.required]],
      role: [UserRole.ARTIST, [Validators.required]]
    });
    
    // Redirect to home if already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit(): void {
    // Check if account type is specified in query params
    this.route.queryParams.subscribe(params => {
      if (params['type']) {
        if (params['type'] === 'artist') {
          this.accountType = 'artist';
          this.registerForm.patchValue({ role: UserRole.ARTIST });
        } else if (params['type'] === 'parlor') {
          this.accountType = 'parlor';
          this.registerForm.patchValue({ role: UserRole.PARLOR_OWNER });
        }
      }
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }
    
    this.submitting = true;
    const userData = this.registerForm.value;
    
    this.authService.register(userData).subscribe(
      () => {
        this.submitting = false;
        this.snackBar.open('Registration successful! Welcome to InkLink.', 'Close', {
          duration: 5000
        });
        
        // Redirect to profile setup page
        this.router.navigate(['/profile'], { queryParams: { setup: 'new' } });
      },
      error => {
        this.submitting = false;
        console.error('Registration error', error);
        
        let errorMessage = 'Registration failed. Please try again.';
        if (error.status === 409) {
          errorMessage = 'This email or username is already taken.';
        }
        
        this.snackBar.open(errorMessage, 'Dismiss', {
          duration: 5000
        });
      }
    );
  }

  setAccountType(type: 'artist' | 'parlor'): void {
    this.accountType = type;
    
    if (type === 'artist') {
      this.registerForm.patchValue({ role: UserRole.ARTIST });
    } else {
      this.registerForm.patchValue({ role: UserRole.PARLOR_OWNER });
    }
  }
}
