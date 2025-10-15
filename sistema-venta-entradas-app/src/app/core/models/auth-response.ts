import { User } from './user';

export interface AuthResponse {
    message: string;
    user: User;
    token: string;
}