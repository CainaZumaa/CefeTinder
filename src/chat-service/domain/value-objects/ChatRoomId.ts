export class ChatRoomId {
    readonly value: string;

    constructor(value: string) {
        if (!value || value.trim().length === 0) {
            throw new Error("ChatRoomId cannot be empty");
        }
        this.value = value;
    }

    equals(other: ChatRoomId): boolean {
        return this.value === other.value;
    }

    toString(): string {
        return this.value;
    }
}