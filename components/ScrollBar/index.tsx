
import { useCallback, useEffect, useRef } from "react";
import classNames from "classnames";
import styles from "./index.module.less";
import { throttle } from "lodash";

export default function ScrollWrap({
  children,
  className = "",
  id,
  barStyle = {},
  ...rest
}) {
  const scrollContentRef = useRef();
  const scrollBarRef = useRef();
  const onScroll = useCallback((e) => {
    const height = e.target.offsetHeight;
    const scrollHeight = e.target.scrollHeight;
    const scrollBarHeight = scrollBarRef.current.offsetHeight;

    const top =
      ((height - scrollBarHeight) / (scrollHeight - height)) *
      e.target.scrollTop;

    scrollBarRef.current.style.top = top + "px";
  }, []);

  // 监听视图变化，根据高度自适应显示滚动条
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onViewChange = useCallback(
    throttle(
      () => {
        if (scrollContentRef.current) {
          const height = scrollContentRef.current.offsetHeight;
          const scrollHeight = scrollContentRef.current.scrollHeight;

          if (scrollHeight === height) {
            scrollBarRef.current.style.display = "none";
          } else {
            scrollBarRef.current.style.display = "block";
            //  滚动条高度 = 总高度/可视区域高度/(总高度 - 可视区域高度)
            const scrollBarHeight =
              scrollHeight / height / (scrollHeight - height);
            scrollBarRef.current.style.height = scrollBarHeight;
            // 位置重置
            const top =
              ((height - scrollBarHeight) / (scrollHeight - height)) *
              scrollContentRef.current.scrollTop;
            scrollBarRef.current.style.top = top + "px";
          }
        }
      },
      0,
      { trailing: true }
    ),
    []
  );

  const observerRef = useRef(new MutationObserver(onViewChange));

  useEffect(() => {
    const config = { attributes: true, childList: true, subtree: true };
    observerRef.current.observe(scrollContentRef.current, config);

    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      observerRef.current.disconnect();
    };
  }, []);

  return (
    <div className={classNames(styles.scrollWarp, className)} {...rest}>
      <div
        ref={scrollContentRef}
        id={id}
        className={styles.scrollContent}
        onScroll={onScroll}
        style={barStyle}
      >
        {children}
      </div>
      <div
        ref={scrollBarRef}
        className={styles.scrollBar}
        style={{ display: "none" }}
      ></div>
    </div>
  );
}
