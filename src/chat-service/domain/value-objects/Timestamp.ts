export class Timestamp {
  private readonly date: Date;

  private constructor(date: Date) {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
    this.date = date;
  }

  static create(date: Date = new Date()): Timestamp {
    return new Timestamp(date);
  }

  static fromISOString(isoString: string): Timestamp {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid ISO date string');
    }
    return new Timestamp(date);
  }

  get value(): Date {
    return new Date(this.date); // Retorna cópia para evitar mutações
  }

  get isoString(): string {
    return this.date.toISOString();
  }

  get milliseconds(): number {
    return this.date.getTime();
  }

  isBefore(other: Timestamp): boolean {
    return this.date.getTime() < other.milliseconds;
  }

  isAfter(other: Timestamp): boolean {
    return this.date.getTime() > other.milliseconds;
  }

  equals(other: Timestamp): boolean {
    return this.date.getTime() === other.milliseconds;
  }

  addSeconds(seconds: number): Timestamp {
    const newDate = new Date(this.date);
    newDate.setSeconds(newDate.getSeconds() + seconds);
    return new Timestamp(newDate);
  }

  diffInSeconds(other: Timestamp): number {
    return Math.abs(this.date.getTime() - other.milliseconds) / 1000;
  }

  toString(): string {
    return this.date.toISOString();
  }
}