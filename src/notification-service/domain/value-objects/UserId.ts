export class UserId {
  private constructor(private readonly value: string) {}

  public static create(value: string): UserId {
    const trimmed = value?.trim();
    if (!trimmed) {
      throw new Error("UserId cannot be empty");
    }
    return new UserId(trimmed);
  }

  public toString(): string {
    return this.value;
  }
}
