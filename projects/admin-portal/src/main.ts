import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { registerLocaleData } from '@angular/common';
import localeEn from '@angular/common/locales/en';
import localeEnIN from '@angular/common/locales/en-IN';
import { App } from './app/app';
import { AuthService } from '@saanjhi-creation-ui/shared-common';

registerLocaleData(localeEn);
registerLocaleData(localeEnIN);

bootstrapApplication(App, appConfig).then(appRef => {
  const injector = appRef.injector;
  const authService = injector.get(AuthService);
  authService.initAuthListener();
});
