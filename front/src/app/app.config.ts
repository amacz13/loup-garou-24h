import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { HTTP_INTERCEPTORS, provideHttpClient, withFetch, withInterceptorsFromDi } from "@angular/common/http";
import { provideClientHydration } from '@angular/platform-browser';
import { routes } from './app.routes';
import { InterceptorService } from './interceptor.service';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideClientHydration(), provideHttpClient(withFetch(),withInterceptorsFromDi()), {
        provide: HTTP_INTERCEPTORS,
        useClass: InterceptorService,
        multi: true,
    },]
};
