import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login').then(m => m.Login)
  },
  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./home/home').then(m => m.Home)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
