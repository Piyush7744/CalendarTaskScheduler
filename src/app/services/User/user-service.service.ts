import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap } from 'rxjs';


export interface User {
  name: string,
  email: string,
  aadhar: string,
  balance: number,
  birth_date: string
}

interface RegisterUser extends User {
  balance: number
}


@Injectable({
  providedIn: 'root'
})
export class UserServiceService {
  private url = 'http://localhost:8000/'
  constructor(private http: HttpClient, private router: Router) { }


  public status = new BehaviorSubject<boolean>(this.isLoggedIn());
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  register(userData: RegisterUser) {
    return this.http.post(`${this.url}register`, userData);
  }

  login(data: any): Observable<any> {
    const body = new URLSearchParams();
    body.set('username', data.username);
    body.set('password', data.password);

    return this.http.post(`${this.url}login`,
      body.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
    ).pipe(
      tap((res: any) => {
        localStorage.setItem("token", res.access_token);
        this.status.next(true)
      })
    )
  }
}
