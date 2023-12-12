import { useState, useCallback, useEffect, useRef, type MutableRefObject } from "react";

/**
 * 下拉内容点击内容外进行隐藏功能的封装
 * @param initState 初始隐藏状态
 * @param option 额外配置项
 * @returns [ref,visible, setVisible]
 * ref引用, 指向下拉框dom元素
 * visible： 下拉框显示隐藏变量
 * setVisible： 控制下拉框显示隐藏变量
 * extraTargets 额外点击不会隐藏的排除目标
 * @example const [ref, visible, setVisible] = useOuterClick(false);
 */
export default function useOuterClick(
  initState: boolean,
  { action = "click", isCapture = true, extraTargets = [] } : {
    action?: string | 'click'
    isCapture?: boolean | false
    extraTargets?: MutableRefObject<HTMLElement>[]
  } = {}
) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(initState);

  const judgeState = useCallback(
    (e) => {
      if (!ref.current) return;

      let tag = ref.current.contains(e.target);

      // 额外点击不会隐藏的排除目标
      if (!tag) {
        for (let i = 0; i < extraTargets.length; i++) {
          const el = extraTargets[i].current;
          if (el) {
            tag = el.contains(e.target);
          }
        }
      }

      if (!tag) {
        document.removeEventListener(action, judgeState, {
          capture: isCapture,
        });
        setVisible(false);
      }
    },
    [action, extraTargets, isCapture, setVisible]
  );

  useEffect(() => {
    if (visible) {
      document.addEventListener(action, judgeState, { capture: isCapture });
      return () =>
        document.removeEventListener(action, judgeState, {
          capture: isCapture,
        }); //销毁阶段
    }
  }, [action, isCapture, judgeState, visible]);

  return [ref, visible, setVisible];
}
