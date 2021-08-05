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
