import { User } from 'firebase/auth';
import { UserModel } from '../models/user.model';
import { AuthProviderModel } from '../models/auth-provider.model';

/**
 * Maps a Firebase User object to the app's UserModel.
 * @param user Firebase user instance
 * @returns UserModel used by the app
 */
export function mapFirebaseUserToUserModel(user: User): UserModel {
  const providers: AuthProviderModel[] = user.providerData.map(p => ({
    providerId: p.providerId,
    uid: p.uid,
    displayName: p.displayName ?? '',
    email: p.email ?? '',
    photoUrl: p.photoURL ?? ''
  }));

  return {
    firebaseUserId: user.uid,
    email: user.email ?? '',
    displayName: user.displayName ?? '',
    photoUrl: user.photoURL ?? '',
    phoneNumber: user.phoneNumber ?? '',
    emailVerified: user.emailVerified,
    roles: [], // roles can be updated after backend fetch
    providers
  };
}
