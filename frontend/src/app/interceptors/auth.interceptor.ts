import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.services';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const auth = inject(AuthService);
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);

  if (isPlatformBrowser(platformId)) {
    const token = auth.getToken();

    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 || error.status === 403) {
        const snackBarRef = snackBar.open(
          'Your session has expired. Please log in again.',
          'OK',
          {
            duration: 2500,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          }
        );

        snackBarRef.afterDismissed().subscribe(() => {
          auth.logout(); // Or remove the token manually
          router.navigate(['/login']);
        });
      }

      return throwError(() => error);
    })
  );
};