import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  submitting = false;
  hidePassword = true;
  returnUrl: string = '/';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
    
    // Redirect to home if already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit(): void {
    // Get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }
    
    this.submitting = true;
    const { email, password } = this.loginForm.value;
    
    this.authService.login(email, password).subscribe(
      () => {
        this.submitting = false;
        this.router.navigate([this.returnUrl]);
      },
      error => {
        this.submitting = false;
        console.error('Login error', error);
        
        let errorMessage = 'Login failed. Please check your credentials.';
        if (error.status === 401) {
          errorMessage = 'Invalid email or password.';
        } else if (error.status === 403) {
          errorMessage = 'Your account has been disabled. Please contact support.';
        }
        
        this.snackBar.open(errorMessage, 'Dismiss', {
          duration: 5000
        });
      }
    );
  }
}
