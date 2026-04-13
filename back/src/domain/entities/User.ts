import { randomUUID } from "node:crypto";

// Example entity - represents a core business concept
export class User {
  private constructor(
    public readonly id: string,
    public phoneNumber: string,
    public name: string,
    public active: boolean,
    public createdAt: Date,
    public updatedAt?: Date,
  ) {
    // this.id = randomUUID()
    // this.name = name;
    // this.phoneNumber = phoneNumber
    // this.active = true
    // this.createdAt = new Date()
  }

  static create(phoneNumber: string, name: string): User {
    // tipar user
    const user = {
      id: randomUUID(),
      name,
      phoneNumber,
      active: true,
      createdAt: new Date(),
    };
    // zod validation here

    return new User(user);
  }

  update() {}

  get self() {
    return {
      ...this,
    };
  }
}
