export type Role = 'guest' | 'operative' | 'contributor' | 'beta-tester' | 'moderator';

export interface OliveBranchData {
  svg: string;
  colors: {
    olive: string;
    branch: string;
    leaf: string;
  };
  oliveCount: number;
  id: number;
}

export interface User {
  username: string;
  role: Role;
  onset: string; // 'dd/mm/yyyy' format
  idNo: string; // '######' format
  bio?: string;
  oliveBranch?: OliveBranchData;
}

export interface CardProps {
  role: Role;
  username?: string;
  onset?: string;
  idNo?: string;
  bio?: string;
  seed?: string;
  followMouse?: boolean;
  oliveBranch?: OliveBranchData;
  size?: 'small' | 'large'; // Add size prop
}

export interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
}