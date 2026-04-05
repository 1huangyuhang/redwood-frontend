export interface AuthUserDTO {
  id: string;
  email: string;
  username: string;
  role: string;
}

export interface AuthSuccessResponse {
  token: string;
  user: AuthUserDTO;
}
