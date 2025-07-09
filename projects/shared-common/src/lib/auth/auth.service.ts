import { Injectable, inject } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, User } from '@angular/fire/auth';
import { mapFirebaseUserToUserModel } from '../mapping/user.mapper';
import { UserServiceClient } from '../http-clients';
import { UiLoaderService, ToastService, UserContextService } from '../services';
import { AppMessages } from '../constants';
import { BehaviorSubject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

export const APP_INIT_AUTH_LISTENER = 'APP_INIT_AUTH_LISTENER' as const;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth!: Auth;

  private userService = inject(UserServiceClient);
  private loaderService = inject(UiLoaderService);
  private toastService = inject(ToastService);
  private userContextService = inject(UserContextService);

  private authReadySubject = new BehaviorSubject<boolean>(false);
  readonly authReady$ = this.authReadySubject.asObservable();

  constructor() {
    this.auth = inject(Auth);
  }
  // Login with email and password
  async login(email: string, password: string) {
    await this.loginWithEmailAndPassword(email, password);
    await this.onSuccessfulLogin();
  }

  private async loginWithEmailAndPassword(email: string, password: string) {
    try {
      this.loaderService.show(); // Show loader before starting the login process
      await signInWithEmailAndPassword(this.auth, email, password);
    }
    catch (error) {
      this.toastService.error(AppMessages.auth.loginFailed, 'Login Error');
      throw error; // Re-throw the error to handle it in the component
    }
    finally {
      this.loaderService.hide();
    }
  }

  // Register with email and password
  async register(email: string, password: string) {
    await createUserWithEmailAndPassword(this.auth, email, password);
    await this.onSuccessfulLogin();
  }

  // Login with Google Provider
  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(this.auth, provider);
    await this.onSuccessfulLogin();
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  // Get Firebase ID token
  async getToken(): Promise<string | null> {
    const user = this.getCurrentUser();
    return user ? await user.getIdToken() : null;
  }

  // Logout
  async logout() {
    await signOut(this.auth);
    this.userContextService.setUser(null);
  }

  // Ensure user exists in backend
  private async ensureUserRegistered() {
    const user = this.getCurrentUser();
    if (!user) return;

    try {
      const existing = await this.userService.getUserByFirebaseUid(user.uid);
      if (!existing) {
        const userModel = mapFirebaseUserToUserModel(user);
        await this.userService.createUser(userModel);
      }
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 404) {
        // User not found, create a new user
        const userModel = mapFirebaseUserToUserModel(user);
        await this.userService.createUser(userModel);
      }
    }

  }

  async initAuthListener() {
    this.auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        await this.onSuccessfulLogin();
      } else {
        this.userContextService.setUser(null);
      }
      this.authReadySubject.next(true);
    });
  }

  private async setAccessToken() {
    if (this.getCurrentUser()) {
      const token = await this.getCurrentUser()?.getIdToken()
      this.userContextService.setAccessToken(token);
    }
  }

  private async setUserContext() {
    if (this.getCurrentUser()) {
      const userModel = await this.userService.getUserByFirebaseUid(this.getCurrentUser()?.uid!)
      this.userContextService.setUser(userModel);
    }
  }

  private async onSuccessfulLogin() {
    await this.setAccessToken();
    await this.ensureUserRegistered();
    await this.setUserContext();
  }
}
