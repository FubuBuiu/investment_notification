import { UserModel } from '@/generated/prisma/models';

export namespace UserDTO {
  export namespace Create {
    export type Input = {
      name: string;
      phoneNumber: string;
    };
    export type Output = UserModel;
  }

  export namespace Update {
    export type Input = {
      name?: string;
      phoneNumber?: string;
      active?: boolean;
    };
    export type Output = UserModel;
  }

  export namespace GetById {
    export type Input = string;
    export type Output = UserModel;
  }

  export namespace Delete {
    export type Input = string;
    export type Output = void;
  }
}
