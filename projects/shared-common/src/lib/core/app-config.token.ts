// shared/core/app-config.token.ts
import { InjectionToken } from '@angular/core';

export interface AppConfig {
  userServiceBaseUrl: string;
  productServiceBaseUrl: string;
  mediaServiceBaseUrl?: string;
  categoryServiceBaseUrl?: string;
}

export const APP_CONFIG = new InjectionToken<AppConfig>('app.config');
