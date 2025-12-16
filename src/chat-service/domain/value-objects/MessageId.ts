export class MessageId {
    readonly value: string;

    constructor(value: string) {
        if (!value || value.trim().length === 0) {
            throw new Error("MessageId cannot be empty");
        }
        this.value = value;
    }

    equals(other: MessageId): boolean {
        return this.value === other.value;
    }

    toString(): string {
        return this.value;
    }
}