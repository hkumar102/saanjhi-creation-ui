import { AuthProviderModel } from './auth-provider.model';

export interface UserModel {
  id?: string;
  firebaseUid: string;
  email: string;
  displayName?: string;
  photoUrl?: string;
  phoneNumber?: string;
  emailVerified: boolean;
  roles: string[];
  providers: AuthProviderModel[]; // ✅ detailed provider info
}
