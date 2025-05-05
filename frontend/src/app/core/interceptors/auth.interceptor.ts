import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Get the auth token
    const authToken = this.authService.token;

    // Clone the request and add the authorization header if token exists
    if (authToken) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${authToken}`
        }
      });
    }

    // Handle the request and catch any authentication errors
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // If 401 Unauthorized or 403 Forbidden response, logout and redirect to login
        if (error.status === 401 || error.status === 403) {
          // Don't logout and redirect if this is already a login/register request
          const isAuthRequest = request.url.includes('/auth/login') || request.url.includes('/auth/register');
          if (!isAuthRequest) {
            this.authService.logout();
            this.router.navigate(['/auth/login'], {
              queryParams: { returnUrl: this.router.url }
            });
          }
        }

        // Pass the error along
        return throwError(() => error);
      })
    );
  }
}