export * from './authApi.service';
import { AuthApiService } from './authApi.service';
export * from './userApi.service';
import { UserApiService } from './userApi.service';
export const APIS = [AuthApiService, UserApiService];
