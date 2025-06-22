import { Injectable, inject } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, User } from '@angular/fire/auth';
import { UserServiceClient } from './user.service.client';
import { mapFirebaseUserToUserModel } from '../mapping/user.mapper';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth: Auth = inject(Auth);
  private userService = inject(UserServiceClient);

  // Login with email and password
  async login(email: string, password: string) {
    await signInWithEmailAndPassword(this.auth, email, password);
    await this.ensureUserRegistered();
  }

  // Register with email and password
  async register(email: string, password: string) {
    await createUserWithEmailAndPassword(this.auth, email, password);
    await this.ensureUserRegistered();
  }

  // Login with Google Provider
  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(this.auth, provider);
    await this.ensureUserRegistered();
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
    } catch (err) {
      console.error('Failed to ensure user is registered:', err);
    }
  }
}
