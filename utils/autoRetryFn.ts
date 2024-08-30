import { useMemoizedFn } from "ahooks";
import { useEffect, useRef } from "react";

type FnParam<P extends Array<any>, T> = {
  /**重试方法 */
  fn: (...args: P) => Promise<T>;
  /**重试间隔 单位ms */
  retryInterval?: number;
  /**判断是否停止重试, 默认是判断result的值来判断 */
  onStopCheck?: (result: T) => boolean;
  maxRetries?: number;
};

/**
 * 调用接口直到满足条件停止重试
 */
export function autoRetryFnWrap<P extends Array<any>, T>({
  fn,
  retryInterval = 2000,
  onStopCheck,
  maxRetries = Infinity,
}: FnParam<P, T>) {
  return async (...args: P) => {
    let retries = 0;

    const retry = async () => {
      if (retries >= maxRetries) {
        return;
      }

      const result = await fn(...args);

      if (onStopCheck) {
        // 当有 onStopCheck， 以 onStopCheck 的返回值来判断是否停止重试
        if (onStopCheck(result)) {
          return result;
        }
      } else if (result) {
        // 当没有指定 onStopCheck， 以result是否存在来判断是否停止重试
        return result;
      }

      retries++;
      // 间隔后再调用， 类似于 sleep
      await new Promise((resolve) => setTimeout(resolve, retryInterval));

      return retry();
    };

    return retry();
  };
}

/**
 * 调用接口直到满足条件停止重试
 * hook版本: 增加了unmount会停止重试的功能
 */
export function useAutoRetryFn<P extends Array<any>, T>(params: FnParam<P, T>) {
  // 卸载标识
  const unmountFlag = useRef(false);
  useEffect(() => {
    return () => {
      unmountFlag.current = true;
    };
  }, []);

  // 封装一下方法
  return useMemoizedFn(async (...args: P) => {
    const wrap = autoRetryFnWrap({
      ...params,
      onStopCheck: (result) => {
        // 卸载组件后停止重试
        if (unmountFlag.current) {
          return true;
        }

        if (params.onStopCheck) {
          return params.onStopCheck(result);
        }

        if (result) {
          return true;
        }
      },
    });

    return wrap(...args);
  });
}
