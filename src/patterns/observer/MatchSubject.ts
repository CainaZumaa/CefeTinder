import { IMatchObserver, MatchEvent } from "./MatchObserver";

/**
 * Observer Pattern - Subject/Observable
 * Manages observers and notifies them of match events
 */
export class MatchSubject {
  private observers: IMatchObserver[] = [];

  /**
   * Attach an observer to the subject
   */
  public attach(observer: IMatchObserver): void {
    const isExist = this.observers.includes(observer);
    if (isExist) {
      console.warn("Observer already attached");
      return;
    }
    this.observers.push(observer);
    console.log(`Observer attached. Total observers: ${this.observers.length}`);
  }

  /**
   * Detach an observer from the subject
   */
  public detach(observer: IMatchObserver): void {
    const observerIndex = this.observers.indexOf(observer);
    if (observerIndex === -1) {
      console.warn("Observer not found");
      return;
    }
    this.observers.splice(observerIndex, 1);
    console.log(`Observer detached. Total observers: ${this.observers.length}`);
  }

  /**
   * Notify all observers of a match event
   */
  public notify(event: MatchEvent): void {
    console.log(
      `Notifying ${this.observers.length} observers of event: ${event.type}`
    );
    for (const observer of this.observers) {
      try {
        observer.update(event);
      } catch (error) {
        console.error(`Error notifying observer:`, error);
      }
    }
  }
}
