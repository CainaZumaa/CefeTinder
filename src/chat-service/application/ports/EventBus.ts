export interface EventBus {
    publish(event: any): Promise<void>;
    subscribe(eventName: string, handler: Function): Promise<void>;
}