export type UserRole =
  | "admin"
  | "logistics"
  | "production"
  | "marketing"
  | "microfinance"
  | "savings";

export type UserStatus = "pending" | "active" | "rejected" | "suspended";

export interface FaceData {
  is_registered: boolean;
  image_url?: string | null;
  registered_at?: string | null;
}

export interface ApprovalInfo {
  approved_by?: string | null;
  approved_at?: string | null;
  rejection_reason?: string | null;
}

export interface User {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  role?: UserRole | null;
  status: UserStatus;
  face_data: FaceData;
  approval: ApprovalInfo;
  created_at: string;
  updated_at: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token?: string | null;
  token_type: string;
  user: User;
}

export interface RegisterFormState {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  confirm_password: string;
}

