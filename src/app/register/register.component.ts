import { Component } from '@angular/core';
import { UserServiceService } from '../services/User/user-service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  user = {
    name: "",
    email: "",
    password: "",
    aadhar: "",
    birth_date: "",
    balance: 10000
  }
  constructor(private service: UserServiceService, private router: Router) { }
  register() {
    this.service.register(this.user).subscribe({
      next: (res) => {
        this.router.navigate(['/login'])
      },
      error: (err) => console.error('Error during registration', err)
    })
  }
}
