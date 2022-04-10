import { Injectable } from '@angular/core';
import { User } from './user';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  endpoint = 'https://snm-backend.herokuapp.com/api';
  headers = new HttpHeaders().set('Content-Type', 'application/json');
  currentUser = {};

  constructor(private http: HttpClient, public router: Router) { }

  signUp(user: User): Observable<any> {
    let registerApi = `${this.endpoint}/register`;
    return this.http.post(registerApi, user).pipe(catchError(this.handleError));
  }

  signIn(user: User) {
    return this.http.post<any>(`${this.endpoint}/login`, user).subscribe(res => {
      localStorage.setItem('access_token', res.token);
      this.getUserProfile(res._id).subscribe((res) => {
        this.currentUser = res;
        this.router.navigate([`user-profile/`+res._id]);
      })
    })
  }

  getToken() {
    return localStorage.getItem('access_token');
  }

  get isLoggedIn(): boolean {
    let authToken = localStorage.getItem('access_token');
    return authToken !== null ? true : false;
  }

  doLogout() {
    let removeToken = localStorage.removeItem('access_token');
    if(removeToken == null) {
      this.router.navigate(['log-in']);
    }
  }

  getUserProfile(id: any): Observable<any> {
    let profileApi = `${this.endpoint}/users/${id}`;
    return this.http.get(profileApi, {headers: this.headers}).pipe(
      map(res => res || {}),
      catchError(this.handleError)
    );
  }

  handleError(error: HttpErrorResponse) {
    let message = '';
    if(error.error instanceof ErrorEvent) {
      message = error.error.message;
    } else {
      message = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(message);
  }
}
