import { useMemo, useEffect, useRef } from 'react';

/**
 * 高级的useEffect，主要功能是可以指定第一次不渲染，更新时才渲染，同时能标记更新中状态
 * @param callback 回调
 * @param deps 依赖
 * @param needSkipFirst 是否需要跳过第一次执行
 * @return isUpdate 类似于useRequest的loading状态
 */
export function useAdvanceEffect(callback: () => any, deps: any[], needSkipFirst = false) {
  const isFirst = useRef(needSkipFirst ? true: false);
  const isUpdate = useRef(false);
  
  // 依赖更新时，记录更新状态
  useMemo(() => {
    isUpdate.current = true;
  }, deps);
  
  // 执行依赖更新回调
  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      isUpdate.current = false;
      return;
    }
    const clear = callback();
    if (isUpdate.current) {
      isUpdate.current = false;
    }
    return clear;
  }, deps);

  return isUpdate.current;
}