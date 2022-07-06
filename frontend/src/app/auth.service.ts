import { Router } from '@angular/router';
import { WebRequestService } from './web-request.service';
import { Injectable } from '@angular/core';
import { shareReplay, tap } from 'rxjs';
import { HttpResponse, HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  USER_ID_HEADER_NAME = '_id';
  ACCESS_TOKEN_HEADER_NAME = 'x-access-token';
  REFRESH_TOKEN_HEADER_NAME = 'x-refresh-token';

  constructor(
    private webRequestService: WebRequestService,
    private router: Router,
    private httpClient: HttpClient
  ) {}

  login(email: string, password: string) {
    return this.webRequestService.login(email, password).pipe(
      shareReplay(),
      tap((response: HttpResponse<any>) => {
        this.setSession(
          response.body._id,
          response.headers.get(this.ACCESS_TOKEN_HEADER_NAME) as string,
          response.headers.get(this.REFRESH_TOKEN_HEADER_NAME) as string
        );
      })
    );
  }

  private setSession(
    userId: string,
    accessToken: string,
    refreshToken: string
  ) {
    localStorage.setItem(this.USER_ID_HEADER_NAME, userId);
    localStorage.setItem(this.ACCESS_TOKEN_HEADER_NAME, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_HEADER_NAME, refreshToken);
  }

  logout() {
    this.clearSession();

    this.router.navigateByUrl('/login');
  }

  private clearSession() {
    localStorage.removeItem(this.USER_ID_HEADER_NAME);
    localStorage.removeItem(this.ACCESS_TOKEN_HEADER_NAME);
    localStorage.removeItem(this.REFRESH_TOKEN_HEADER_NAME);
  }

  getAccessToken() {
    return localStorage.getItem(this.ACCESS_TOKEN_HEADER_NAME);
  }

  setAccessToken(newAccessToken: string) {
    return localStorage.setItem(this.ACCESS_TOKEN_HEADER_NAME, newAccessToken);
  }

  getNewAccessToken() {
    return this.httpClient
      .get(`${this.webRequestService.ROOT_URL}/user/me/access-token`, {
        headers: {
          [this.REFRESH_TOKEN_HEADER_NAME]: this.getRefreshToken() as string,
          [this.USER_ID_HEADER_NAME]: this.getUserId() as string,
        },
        observe: 'response',
      })
      .pipe(
        tap((response) => {
          this.setAccessToken(
            response.headers.get(this.ACCESS_TOKEN_HEADER_NAME) as string
          );
        })
      );
  }

  getRefreshToken() {
    return localStorage.getItem(this.REFRESH_TOKEN_HEADER_NAME);
  }

  getUserId() {
    return localStorage.getItem(this.USER_ID_HEADER_NAME);
  }
}
