// Here is the all types (inputs,outpust,enums,etc...) about User entity
import { User } from '.';

export namespace UserTypes {
  export namespace Create {
    export type Input = {
      phoneNumber: string;
      name: string;
    };
    export interface Output extends User {}
  }

  export namespace Update {
    export type Input = {
      phoneNumber?: string;
      name?: string;
    };
    export type Output = User;
  }
}
