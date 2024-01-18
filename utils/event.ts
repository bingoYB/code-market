/**
 * 简易事件分发器
 */
export class SimpleEvent<T extends Record<string, any>> {
  cb: { [key in keyof T]?: Function[] }

  constructor() {
    this.cb = {}
  }

  /**
   * 监听事件
   * @param eventName
   * @param cb 回调
   */
  on<K extends keyof T>(eventName: K, cb: (data: T[K]) => void) {
    if (typeof cb !== "function") {
      console.warn(
        `Event on ${String(
          eventName
        )} failed , Parameter 'callback' expects to get a function, actually get ${typeof cb}`
      )
      return
    }
    const cbList = this.cb[eventName]
    if (cbList) {
      cbList.push(cb)
    } else {
      this.cb[eventName] = [cb]
    }
  }

  /**
   * 取消绑定事件
   * @param eventName
   * @param cb 回调
   */
  off<K extends keyof T>(eventName: K, cb: (data: T[K]) => void) {
    const cbList = this.cb[eventName]
    if(!cbList) return;
    const index = cbList.findIndex((el) => el === cb)
    cbList.splice(index, 1)
  }

  /**
   * 触发事件
   * @param  eventName
   * @param  eventData
   */
  trigger<K extends keyof T>(eventName: K, eventData?: T[K]) {
    const cbList = this.cb[eventName]
    if (cbList) {
      for (let i = 0; i < cbList.length; i++) {
        const cb = cbList[i]
        if (typeof cb === "function") {
          try {
            cb(eventData)
          } catch (error) {
            const errMessage = `event callback ${String(eventName)} run fail: ${
              error.message
            }`
            error.message = errMessage
            console.error(error)
          }
        }
      }
    }
  }
}
