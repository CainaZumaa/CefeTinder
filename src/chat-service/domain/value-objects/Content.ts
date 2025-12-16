export class Content {
    readonly value: string;

    constructor(value: string) {
        if (!value || value.trim().length === 0) {
            throw new Error("Content cannot be empty");
        }
        if (value.length > 2000) {
            throw new Error("Content cannot exceed 2000 characters");
        }
        this.value = value.trim();
    }

    equals(other: Content): boolean {
        return this.value === other.value;
    }

    toString(): string {
        return this.value;
    }
}