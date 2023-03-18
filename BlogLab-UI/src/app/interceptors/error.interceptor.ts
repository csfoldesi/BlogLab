/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { AccountService } from '../services/account.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private toastr: ToastrService,
    private router: Router,
    private accountService: AccountService
  ) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error) {
          switch (error.status) {
            case 400:
              this.handle400Error(error);
              break;
            case 401:
              this.handle401Error(error);
              break;
            case 500:
              this.handle500Error(error);
              break;
            default:
              this.handleUnexpectedError(error);
              break;
          }
        }
        return throwError(() => error);
      })
    );
  }

  handle400Error(error: HttpErrorResponse) {
    if (!!error && Array.isArray(error.error)) {
      let errorMessage = '';
      for (const errorElement of error.error as {
        code: string;
        description: string;
      }[]) {
        errorMessage = `${errorMessage}${errorElement.code} - ${errorElement.description}\n`;
      }
      this.toastr.error(errorMessage, error.statusText);
    } else if (
      !!error?.error.errors?.Content &&
      typeof error.error.errors.Content === 'object'
    ) {
      const errorObject = error.error.errors.Content;
      let errorMessage = '';
      for (const errorElement of errorObject) {
        errorMessage = `${errorMessage}${errorElement}\n`;
      }
      this.toastr.error(errorMessage, error.statusText);
    } else if (error.error) {
      const errorMessage =
        typeof error.error === 'string'
          ? error.error
          : 'There was a validation error.';
      this.toastr.error(errorMessage, error.statusText);
    } else {
      this.toastr.error(error.statusText, error.statusText);
    }
    console.log(error);
  }

  handle401Error(error: HttpErrorResponse) {
    const errorMessage = 'Please login to your account.';
    this.accountService.logout();
    this.toastr.error(errorMessage, error.statusText);
    this.router.navigate(['/login']);
    console.log(error);
  }

  handle500Error(error: HttpErrorResponse) {
    this.toastr.error(
      'Please contact the administrator. An error happened in the server.'
    );
    console.log(error);
  }

  handleUnexpectedError(error: HttpErrorResponse) {
    this.toastr.error('Something unexpected happened.');
    console.log(error);
  }
}
