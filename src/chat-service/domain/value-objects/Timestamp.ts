export class Timestamp {
    readonly value: Date;

    constructor(value: Date = new Date()) {
        this.value = value;
    }

    equals(other: Timestamp): boolean {
        return this.value.getTime() === other.value.getTime();
    }

    isAfter(other: Timestamp): boolean {
        return this.value.getTime() > other.value.getTime();
    }

    isBefore(other: Timestamp): boolean {
        return this.value.getTime() < other.value.getTime();
    }

    toString(): string {
        return this.value.toISOString();
    }
}