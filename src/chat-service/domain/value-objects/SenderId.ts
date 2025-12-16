export class SenderId {
    readonly value: string;

    constructor(value: string) {
        if (!value || value.trim().length === 0) {
            throw new Error("SenderId cannot be empty");
        }
        this.value = value;
    }

    equals(other: SenderId): boolean {
        return this.value === other.value;
    }

    toString(): string {
        return this.value;
    }
}