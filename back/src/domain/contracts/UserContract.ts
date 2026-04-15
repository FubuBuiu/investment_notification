import { UserModel } from '@/generated/prisma/models';

import { User } from '../entities/User';

export namespace UserContract {
  export namespace Create {
    export interface Input extends User {}
    export type Output = UserModel;
  }

  export namespace Update {
    export interface Input extends User {}
    export type Output = UserModel;
  }

  export namespace GetById {
    export type Input = string;
    export type Output = UserModel | null;
  }
  export namespace GetByPhoneNumber {
    export type Input = string;
    export type Output = UserModel | null;
  }

  export namespace Delete {
    export type Input = string;
    export type Output = void;
  }
}
