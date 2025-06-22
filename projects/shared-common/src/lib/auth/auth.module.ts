import { NgModule } from '@angular/core';
// AngularFireAuthModule is optional if consuming app initializes Firebase itself

/**
 * AuthModule provides injectable services and guards for authentication.
 * Designed to be imported by multiple Angular apps (public/admin).
 */
@NgModule({
  // Do not import Firebase providers here if already bootstrapped in consuming app
  providers: [],
})
export class AuthModule {}
