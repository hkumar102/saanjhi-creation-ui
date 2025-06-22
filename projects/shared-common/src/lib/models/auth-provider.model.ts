export interface AuthProviderModel {
  providerId: string;     // e.g. "google.com", "password"
  uid: string;            // UID from the provider
  displayName?: string;   // Name from provider profile
  email?: string;         // Email from provider
  photoUrl?: string;      // Avatar URL
}
