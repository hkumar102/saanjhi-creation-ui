import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { routes } from './app.routes';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { MessageService } from 'primeng/api';
import { APP_CONFIG, FirebaseAuthInterceptor, HttpErrorInterceptor, HttpLoaderInterceptor } from '@saanjhi-creation-ui/shared-common';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),

    // Firebase
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),

    // Animations / PrimeNG
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura
      }
    }),

    // Provide Interceptors via DI
    {
      provide: HTTP_INTERCEPTORS,
      useClass: FirebaseAuthInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpLoaderInterceptor,
      multi: true
    },

    // Inject all HTTP interceptors from DI
    provideHttpClient(withInterceptorsFromDi()),

    // Custom config
    {
      provide: APP_CONFIG,
      useValue: {
        userServiceBaseUrl: 'https://localhost:8003/api/user',
        mediaServiceBaseUrl: 'https://localhost:8005/api/media',
        categoryServiceBaseUrl: 'https://localhost:8007/api/category',
        productServiceBaseUrl: 'https://localhost:8010/api/product',
      }
    },

    MessageService
  ]
};
