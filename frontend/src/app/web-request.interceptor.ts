import { AuthService } from './auth.service';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  catchError,
  Observable,
  throwError,
  tap,
  switchMap,
  EMPTY,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WebRequestInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    request = this.addAuthHeader(request);

    return next.handle(request).pipe(
      catchError((error) => {
        console.log(error);

        if (error.status === 401) {
          return this.refreshAccessToken().pipe(
            switchMap(() => {
              request = this.addAuthHeader(request);
              return next.handle(request);
            }),
            catchError((error) => {
              console.log(error);
              this.authService.logout();
              return EMPTY;
            })
          );
        }

        return throwError(() => new Error('Error on intercepting requesting'));
      })
    );
  }

  addAuthHeader(request: HttpRequest<any>) {
    const accessToken = this.authService.getAccessToken();
    const accessTokenHeaderName = this.authService.ACCESS_TOKEN_HEADER_NAME;

    if (accessToken) {
      return request.clone({
        setHeaders: {
          [accessTokenHeaderName]: accessToken,
        },
      });
    }

    return request;
  }

  refreshAccessToken() {
    return this.authService.getNewAccessToken().pipe(
      tap(() => {
        console.log('Access Token Refreshed');
      })
    );
  }
}
