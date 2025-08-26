import { Component } from '@angular/core';
import { UserServiceService } from '../services/User/user-service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginData = {
    username: "",
    password: ""
  }
  constructor(private service: UserServiceService, private router: Router) { }
  login() {
    this.service.login(this.loginData).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.access_token);
        this.service.isLoggedIn();
      },
      error: (err) => console.error('Error during logging', err)
    })
  }
}
