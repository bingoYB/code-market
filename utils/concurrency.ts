/**
 * 并发控制器
 */
export class ConcurrencyController {
    private concurrentLimit: number;
    private currentRunning = 0;
    private waitingQueue: (() => Promise<void>)[] = [];
  
    constructor(concurrentLimit: number) {
      this.concurrentLimit = concurrentLimit;
    }
  
    // 封装一个执行任务的方法，控制任务的并发执行
    async run(task: () => Promise<void>): Promise<void> {
      return new Promise((resolve, reject) => {
        // 包装任务，用于将任务执行结果返回出去
        const wrapTask = async () => {
          try {
            const res = await task();
            //将任务结果返回
            resolve(res);
          } catch (error) {
            reject(error);
          }
        };
  
        // 将任务放入队列中
        this.waitingQueue.push(wrapTask);
  
        // 执行队列任务
        this.next();
      });
    }
  
    async next() {
      // 判断当前并发数是否达到限制
      if (this.currentRunning < this.concurrentLimit) {
        try {
          // 从队列中拿到任务
          const nextTask = this.waitingQueue.shift();
  
          // 任务存在，则执行任务
          if (nextTask) {
            this.currentRunning++;
            await nextTask();
            this.concurrentLimit--;
  
            // 任务结束执行下一个任务
            this.next();
          }
        } catch (error) {
          // donothing
        }
      }
    }
  }
  