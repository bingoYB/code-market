/**
 * 并行请求控制，控制当前最大请求数量
 */
class ParallelRequest {
  queue: Parameters<typeof fetch>[];
  currentTaskNumber: number;
  limitTaskNumber: number;

  constructor() {
    this.queue = [];
    this.currentTaskNumber = 0;
    this.limitTaskNumber = 6;
  }

  fetch(...option: Parameters<typeof fetch>) {
    if (this.currentTaskNumber < this.limitTaskNumber) {
      this.currentTaskNumber++;
      this.request(...option);
    } else {
      this.queue.push(option);
    }
  }

  request(...option: Parameters<typeof fetch>) {
    var retryTimes = 0;
    return fetch(...option)
      .then((rs) => {
        this.next();
      })
      .catch((err) => {
        if (retryTimes > 5) {
          this.next();
          return;
        }
        retryTimes++;
        return this.request(...option);
      });
  }

  next() {
    const task = this.queue.pop();
    if (task) {
      this.request(...task);
    } else {
      this.end();
    }
  }

  end() {}
}
