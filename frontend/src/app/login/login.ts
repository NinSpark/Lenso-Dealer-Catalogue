import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.services';
import { Router } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MaterialModule } from '../shared/material.module';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule, MatProgressBarModule, MaterialModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  username = '';
  password = '';
  errorMessage = '';
  isLoading: boolean = false;
  showPassword: boolean = false;

  constructor(private authService: AuthService, private router: Router) { }

  async login() {
    this.isLoading = true;
    if (await this.authService.login(this.username, this.password)) {
      this.router.navigate(['/home']);
    } else {
      this.errorMessage = 'Invalid credentials';
      this.isLoading = false;
    }
  }
}
