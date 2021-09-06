export * from './authApi.service';
import { AuthApiService } from './authApi.service';
export * from './chatApi.service';
import { ChatApiService } from './chatApi.service';
export * from './userApi.service';
import { UserApiService } from './userApi.service';
export const APIS = [AuthApiService, ChatApiService, UserApiService];
