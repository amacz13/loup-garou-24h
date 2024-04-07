import { HttpEvent, HttpHandler, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable, finalize } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InterceptorService {

  constructor(private spinner: NgxSpinnerService) { 
    console.log("InterceptorService constructor");
  }
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log("request interception !");
    this.spinner.show(); 
    return next.handle(req).pipe(finalize(() => this.spinner.hide()));
  }
}
