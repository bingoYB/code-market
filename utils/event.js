/**
 * Simple Event Dispatcher
 * @template T - Type of events and their corresponding data
 */
export class SimpleEvent {
  /**
   * @type {Object.<string, Function[]>}
   */
  cb;

  /**
   * Creates an instance of SimpleEvent.
   */
  constructor() {
    /**
     * @type {Object.<string, Function[]>}
     */
    this.cb = {};
  }

  /**
   * Listen to an event.
   * @template K - Type of the event
   * @param {K} eventName - The name of the event
   * @param {(data: T[K]) => void} cb - Callback function
   */
  on(eventName, cb) {
    if (typeof cb !== "function") {
      console.warn(
        `Event on ${String(
          eventName
        )} failed , Parameter 'callback' expects to get a function, actually get ${typeof cb}`
      );
      return;
    }
    const cbList = this.cb[eventName];
    if (cbList) {
      cbList.push(cb);
    } else {
      this.cb[eventName] = [cb];
    }
  }

  /**
   * Unbind an event listener.
   * @template K - Type of the event
   * @param {K} eventName - The name of the event
   * @param {(data: T[K]) => void} cb - Callback function
   */
  off(eventName, cb) {
    const cbList = this.cb[eventName];
    if (!cbList) return;
    const index = cbList.findIndex((el) => el === cb);
    cbList.splice(index, 1);
  }

  /**
   * Trigger an event.
   * @template K - Type of the event
   * @param {K} eventName - The name of the event
   * @param {T[K]} eventData - Data to be passed to the event listeners
   */
  trigger(eventName, eventData) {
    const cbList = this.cb[eventName];
    if (cbList) {
      for (let i = 0; i < cbList.length; i++) {
        const cb = cbList[i];
        if (typeof cb === "function") {
          try {
            cb(eventData);
          } catch (error) {
            const errMessage = `event callback ${String(eventName)} run fail: ${
              error.message
            }`;
            error.message = errMessage;
            console.error(error);
          }
        }
      }
    }
  }
}