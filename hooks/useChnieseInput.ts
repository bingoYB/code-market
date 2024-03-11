import { useState } from "react";
import { isEnter } from "../utils/keyboard";

export function useChnieseInput() {
  // 当前拼音输入的参数
  const [isChineseInput, setChineseInput] = useState(false);
  const onCompositionStart = () => setChineseInput(true);
  const onCompositionEnd = () => {
    // 没有异步在火狐浏览器里无法输入中文
    setTimeout(() => {
      setChineseInput(false);
    }, 1);
  };

  const isEnterKeyDown = (e: any) => {
    return isEnter(e) &&
            !isChineseInput &&
            // 360浏览器下搜狗中文输入法下，onCompositionStart不会触发，key为Process，所以需要在这里判断
            e.key !== "Process"
  };

  return {
    isChineseInput,
    isEnterKeyDown,
    onCompositionStart,
    onCompositionEnd,
  };
}
