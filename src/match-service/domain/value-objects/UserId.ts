export class UserId {
  private constructor(private readonly value: string) {}

  static create(value: string): UserId {
    if (!value || value.trim() === "") {
      throw new Error("Invalid user id");
    }
    return new UserId(value);
  }

  equals(other: UserId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
