import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { AuthService } from '@saanjhi-creation-ui/shared-common';

bootstrapApplication(App, appConfig).then(appRef => {
  const injector = appRef.injector;
  const authService = injector.get(AuthService);
  authService.initAuthListener();
});
