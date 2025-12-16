export abstract class DomainEvent {
    readonly eventId: string;
    readonly occurredOn: Date;
    readonly aggregateId: string;

    constructor(aggregateId: string) {
        this.eventId = this.generateEventId();
        this.occurredOn = new Date();
        this.aggregateId = aggregateId;
    }

    private generateEventId(): string {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    abstract getEventName(): string;
}