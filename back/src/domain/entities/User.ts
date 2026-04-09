// Example entity - represents a core business concept
export class User {
    constructor(
        public id: string,
        public name: string,
        public email: string,
        public createdAt: Date
    ) { }
}