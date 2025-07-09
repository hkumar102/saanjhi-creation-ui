
export interface AuthProviderDto {
  providerId?: string | null;
  uid?: string | null;
  displayName?: string | null;
  email?: string | null;
  photoUrl?: string | null;
}

export interface UserRoleDto {
  id: string;
  name?: string | null;
}


export interface UserDto {
  id: string;
  displayName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  photoUrl?: string | null;
  isActive: boolean;
  emailVerified: boolean;
  firebaseUserId?: string | null;
  roles?: UserRoleDto[] | null;
  authProviders?: AuthProviderDto[] | null;
}

export interface UserDtoPaginatedResult {
  items?: UserDto[] | null;
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface CreateUserCommand {
  displayName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  photoUrl?: string | null;
  isActive: boolean;
  emailVerified: boolean;
  firebaseUserId?: string | null;
  providers?: AuthProviderDto[] | null;
}

export interface UpdateUserCommand {
  id: string;
  displayName?: string | null;
  phoneNumber?: string | null;
  photoUrl?: string | null;
  isActive: boolean;
  emailVerified: boolean;
  roles?: UserRoleDto[] | null;
}

export interface UpdateUserProfileCommand {
  displayName?: string | null;
  phoneNumber?: string | null;
  photoUrl?: string | null;
}