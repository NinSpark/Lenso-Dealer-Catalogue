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
        this.api.getDealerSecuredLoginDetails(username.toUpperCase(), password)
      );

      if (res?.token) {
        localStorage.setItem('token', res.token);
        localStorage.setItem('loggedInUser', res.username);
        localStorage.setItem('sales_agent', res.sale_agent);
        localStorage.setItem('id', res.id);
        localStorage.setItem('shopping_cart', res.shopping_cart);
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

  getloggedInID(): string | null {
    return localStorage.getItem('id');
  }

  getShoppingCart(): string | null {
    return localStorage.getItem('shopping_cart');
  }

  getSalesAgent(): string | null {
    return localStorage.getItem('sales_agent');
  }

  isLoggedIn(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false; // SSR / Node
    }

    return !!localStorage.getItem('token');
  }
}
