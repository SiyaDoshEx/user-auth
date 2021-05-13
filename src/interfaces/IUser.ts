export interface IUser {
  _id: string;
  name: string;
  surname: string;
  email: string;
  cell_number: string;
  pin: string;
  salt: string;
}

export interface IUserInputDTO {
  name: string;
  surname: string;
  email: string;
  cell_number: string;
  pin: string;
  birthday: string;
}
