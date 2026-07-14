import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { StockService } from '../services/stock.service';
import { lastValueFrom } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private platformId = inject(PLATFORM_ID);

  constructor(private api: StockService,
    private router: Router) { }

  async login(username: string, password: string): Promise<boolean> {
    try {
      const res = await lastValueFrom(
        this.api.getSecuredLoginDetails(username.toUpperCase(), password)
      );

      if (res?.token) {
        localStorage.setItem('token', res.token);
        localStorage.setItem('loggedInUser', res.username);
        localStorage.setItem('lensoDivision', res.lenso_division);
        localStorage.setItem('role', res.role);
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }

  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    return localStorage.getItem('token');
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
    }

    this.router.navigate(['/login']);
  }

  getLoggedInUser(): string | null {
    return localStorage.getItem('loggedInUser');
  }

  getLoggedInRole(): string | null {
    return localStorage.getItem('role');
  }

  isLensoDivision(): string | null {
    return localStorage.getItem('lensoDivision');
  }

  isLoggedIn(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false; // SSR / Node
    }

    return !!localStorage.getItem('token');
  }
}
