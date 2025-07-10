import { ApplicationConfig, provideZoneChangeDetection, provideBrowserGlobalErrorListeners, LOCALE_ID } from '@angular/core';
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
import { APP_CONFIG, APP_INIT_AUTH_LISTENER, AuthService, FirebaseAuthInterceptor, HttpErrorInterceptor, HttpLoaderInterceptor } from '@saanjhi-creation-ui/shared-common';

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
      useValue: environment.services
    },
    {
      provide: APP_INIT_AUTH_LISTENER,
      useFactory: (authService: AuthService) => authService.initAuthListener(),
      deps: [AuthService]
    },
    MessageService,
    // Set default locale to Indian English
    { provide: LOCALE_ID, useValue: 'en-IN' },
  ]
};
