import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from './../services/auth.services';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'Lenso Malaysia Stock List';

  constructor(private auth: AuthService, private router: Router) { }

  ngOnInit() {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/home']); // redirect to home if token exists
    } else {
      this.router.navigate(['/login']);
    }
  }
}
