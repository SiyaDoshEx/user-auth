export interface IFailedSignIn {
  _id: string;
  cell_number: string;
  pin: string;
  count: number;
}

export interface IFailedSignInDTO {
  cell_number: string;
  pin: string;
  count: number;
}
