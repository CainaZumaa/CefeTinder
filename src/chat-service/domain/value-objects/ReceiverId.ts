export class ReceiverId {
    readonly value: string;

    constructor(value: string) {
        if (!value || value.trim().length === 0) {
            throw new Error("ReceiverId cannot be empty");
        }
        this.value = value;
    }

    equals(other: ReceiverId): boolean {
        return this.value === other.value;
    }

    toString(): string {
        return this.value;
    }
}