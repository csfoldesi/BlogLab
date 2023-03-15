import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AccountService } from '../services/account.service';
import { environment } from '../../environments/environment';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private accountService: AccountService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const currentUser = this.accountService.currentUserValue;
    const isLoggedIn = !!currentUser && !!currentUser.token;
    const isApiUrl = request.url.startsWith(environment.webApi);

    if (isApiUrl && isLoggedIn) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearet ${currentUser.token}`,
        },
      });
    }
    return next.handle(request);
  }
}
