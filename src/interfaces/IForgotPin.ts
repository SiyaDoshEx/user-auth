export interface IForgotPin {
  _id: string;
  cell_number: string;
  request_frequency: number;
  needs_pin_change: boolean;
}

export interface IForgotPinDTO {
  cell_number: string;
  request_frequency: number;
  needs_pin_change: boolean;
}