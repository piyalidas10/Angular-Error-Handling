# ErrorHandling
Error handling is an essential part of RxJs and Angular

![error-handling](error-handling.png)

# Run Application
```
ng serve
```

# Catching Errors in HTTP Request
We can catch the HTTP Errors at three different places but HttpInterceptor is always better solution.

1. HttpInterceptor
2. Service
3. Component

## HttpInterceptor
Angular provides an interface called the HttpInterceptor that can intercept [HttpRequest] and [HttpResponse] and creates a platform to handle them. This means we get direct access to our server requests, what better place to deal with server errors than here!
The syntax looks like this:
```
    interface HttpInterceptor {
        intercept(req: HttpRequest<any>, next: HttpHandler):   Observable<HttpEvent<any>>
    }
```

http-error.interceptor.ts

```
import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!req.headers.has('Content-Type')) {
      req = req.clone({
        headers: req.headers.set('Content-Type', 'application/json')
      });
    }
    const request = req.clone({ setHeaders: { 'Header-Name': 'Piyali Das' } });
    return next.handle(request)
    .pipe(
      retry(1),
      catchError((error: HttpErrorResponse) => {
        return throwError(error);
      })
    ) as Observable<HttpEvent<any>>;
  }
}

```
Note: Need to include in app.module as providers to run

## Service
If you don't want to show the user the exact error message that you get from Angular HttpClient when an exception occurs. A great way to customize this message is by throwing your own custom exceptions using throwError. Using ErrorHandler inside global-error-handler.service, you have to handle errors as user understands.

```
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { User } from './models/user.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private usersAPI = {
    original: 'https://jsonplaceholder.typicode.com/users',
    wrong: 'https://jsonplaceholder.typicode.com/user'
  };

  constructor(private http: HttpClient) { }
  
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.usersAPI.wrong)
      .pipe(
        retry(1),
        catchError((error: HttpErrorResponse) => {
          return throwError(error);
        })
      );
  }
}
```
Note: Need to include in app.module as providers to run

## Component
You have another option Component to catch any exceptions that may occur from the HTTP request/response and throw error to global error handler

app.component.ts
```
import { Component } from '@angular/core';
import { ApiService } from './api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Error-handling';

  constructor(private apiService: ApiService) {
    this.apiService.getUsers().subscribe(
      (res) => {
        console.log('res => ', res);
      },
      (error) => {
        //Throwing error to global error handler
        throw error;
      }
    );
  }

}
```

### Error handler in Angular
Angular has a global error handling class called errorHandler that provides a hook for centralized exception handling inside your application. It basically intercepts all the errors that happen in your application, and logs all of them to the console, and stops the app from crashing.
This is global error handler to catch errors from everywhere like component, service, httpinterceptor

global-error-handler.service.ts

```
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, Inject, Injectable, Injector } from '@angular/core';
import {ErrorsConstant} from './errors-const';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class GlobalErrorHandlerService implements ErrorHandler {
  errorMsg = '';
  constructor(@Inject(Injector) private injector: Injector) {
  }

  // Need to get ToastrService from injector rather than constructor injection to avoid cyclic dependency error
  private get toastrService(): ToastrService {
    return this.injector.get(ToastrService);
  }


  // Handle API errors
  handleError(error: HttpErrorResponse): void {
    console.log(
      `Error code ${error.status}, ` +
      `body was: ${error.error}`);
    if (!navigator.onLine) {
      this.errorMsg = ErrorsConstant.NetworkIssue;
    } else if (error.status >= 400 && error.status <= 499) {
      this.errorMsg = ErrorsConstant.ClientSide;
    } else {
      this.errorMsg = ErrorsConstant.ServerSide;
    }
    console.log(this.errorMsg);
    this.toastrService.error(this.errorMsg, '');
  }

}
```

# Reference URLs
https://www.tektutorialshub.com/angular/angular-http-error-handling/
https://medium.com/@MatheusCAS/injecting-a-service-into-another-service-in-angular-3b253df5c21
https://stackoverflow.com/questions/64923089/how-to-use-toastrservice-to-show-toastr-notifications-for-server-errors-in-angul
