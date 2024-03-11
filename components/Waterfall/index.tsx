import { debounce } from "lodash";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import styles from "./index.module.less";

interface IWaterfallProps {
  brickId?: string;
  bricks?: any[];
  render: (brick: any) => React.ReactNode;
  gutter?: number;
  columnSize?: number;
  columnNum?: number;
  threshold?: number;
  /** id 或者 dom引用 */
  scrollElement?: HTMLElement | string;
  className?: string;
  masonryKey?: string;
  onRendered?: () => void;
  children?: React.ReactNode;
}

export default forwardRef(
  /**
   * 瀑布流
   * @param {*} props
   */
  function Waterfall(
    {
      brickId = "id",
      bricks = [],
      render,
      gutter = 24,
      columnSize = 240,
      columnNum = 4,
      children,
      threshold = 1, // 预加载的滚动区域，小于10是容器倍数，大于10是绝对值
      scrollElement, // 滚动元素
      className = "masonry",
      masonryKey = "masonryKey", // 切换不同的瀑布流实例，用于，重新计算 containerOffsetTop 值
      onRendered = () => {},
    }: // getBrickHeight,
    IWaterfallProps,
    ref
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const computedBricks = useRef(new Map()); // 已经计算大小和位置的bricks
    const columnHeightArr = useRef([]); // 瀑布流各列高度

    const [containerOffsetTop, setContainerOffsetTop] = useState(0); 
    const [containerHeight, setContainerHeight] = useState(0); // 瀑布流容器高度
    const [scrollTop, setScrollTop] = useState(0); // 页面滚动高度

    const isUnmount = useRef(false); // 是否销毁
    useEffect(() => {
      isUnmount.current = false;
      return () => {
        isUnmount.current = true;
      };
    }, []);

    const renderChild = useMemo(() => {
      const childrenNode = React.Children.toArray(children);
      return function Fn(record) {
        const computedBrickMap = computedBricks.current;

        let props: React.DetailedHTMLProps<
          React.HTMLAttributes<HTMLDivElement>,
          HTMLDivElement
        > = {
          className: styles.brick,
        };

        if (computedBrickMap.has(record[brickId])) {
          const rect = computedBrickMap.get(record[brickId]);
          props = {
            className: `${styles.brick} ${styles.show}`,
            style: { transform: `translate(${rect.left}px, ${rect.top}px)` },
          };
        }

        // 先渲染 组件子元素
        if (record.mansonryInnerChildIndex !== undefined) {
          return (
            <div key={record.mansonryInnerChildIndex} {...props}>
              {childrenNode[record.mansonryInnerChildIndex]}
            </div>
          );
        }

        return (
          <div key={record[brickId]} {...props}>
            {render(record)}
          </div>
        );
      };
    }, [brickId, children, render]);

    // 获取瀑布流容器位置（距离视图顶部的距离）
    useEffect(() => {
      let realScrollElement: HTMLElement;

      if (typeof scrollElement === "string") {
        realScrollElement =
          document.getElementById(scrollElement) || document.documentElement;
      } else {
        realScrollElement = scrollElement || document.documentElement;
      }

      const containerRectTop = containerRef.current?.getBoundingClientRect()
        ?.top as number;

      if (!scrollElement) {
        // 窗口滚动距离 + 容器距离顶部距离
        setContainerOffsetTop(containerRectTop + window.scrollY);
      } else {
        setContainerOffsetTop(
          containerRectTop -
            realScrollElement?.getBoundingClientRect()?.top +
            realScrollElement.scrollTop
        );
      }
    }, [scrollElement]);

    // 获取瀑布流容器高度
    const getContainerHeight = useCallback(() => {
      // 真实滚动元素
      const realScrollElement =
        typeof scrollElement === "string"
          ? document.getElementById(scrollElement)
          : scrollElement || document.documentElement;
      const containerHeight = realScrollElement?.clientHeight || 0;
      setContainerHeight(containerHeight);
    }, [scrollElement]);

    useEffect(() => {
      getContainerHeight();
      window.addEventListener("resize", getContainerHeight);
      return () => {
        window.removeEventListener("resize", getContainerHeight);
      };
    }, [getContainerHeight]);

    // 所有要渲染的元素：子元素+列表
    const allBricks = useMemo(() => {
      let list = [];
      React.Children.map(children, (child, index) => {
        if (child) {
          list.push({
            mansonryInnerChildIndex: index,
            [brickId]: `childId_${index}`,
          });
        }
      });

      list.push(...bricks);
      return list;
    }, [brickId, bricks, children]);

    // 顶部加载新数据 或 删除某个brick
    useEffect(() => {
      const bricks = allBricks;

      // 清除bricks
      if (!bricks.length) {
        columnHeightArr.current.fill(0);
        computedBricks.current.clear();
        return;
      }

      const keys = {};
      let index = 0;
      for (let [key] of computedBricks.current) {
        let realKey = bricks[index] && bricks[index][brickId];

        // 循环跳过重复的brick
        while (keys[realKey] && index < bricks.length - 1) {
          index += 1;
          realKey = bricks[index][brickId];
        }

        if (!bricks[index] || bricks[index][brickId] !== key) {
          // 变更出现在前面几个，直接全部清空
          if (index < 5) {
            columnHeightArr.current.fill(0);
            computedBricks.current.clear();
            break;
          }

          // 清除当前brick后的所有brick缓存
          let clearAfter = false;
          for (let [remainKey, remainBrick] of computedBricks.current) {
            if (clearAfter || remainKey === key) {
              clearAfter = true;

              computedBricks.current.delete(remainKey);
              columnHeightArr.current[remainBrick.column] = Math.min(
                remainBrick.top,
                columnHeightArr.current[remainBrick.column]
              );
            }
          }
          break;
        }

        keys[key] = true;
        index += 1;
      }
    }, [allBricks, brickId]);

    // 重新渲染整个瀑布流所有内容
    const relayout = useCallback(() => {
      columnHeightArr.current = Array(columnNum).fill(0);
      computedBricks.current.clear();

      // @TODO: 临时解决列数变化情况，触发滚动，重新布局
      setScrollTop((scrollTop) => scrollTop + 1);
    }, [columnNum]);

    // 列数量发生变化
    useEffect(() => {
      relayout();
    }, [relayout]);

    // 可视区域坐标
    const visibleRect = useMemo(() => {
      const expandSize =
        threshold > 10 ? threshold : containerHeight * threshold;
      const top = scrollTop - containerOffsetTop - expandSize;
      const bottom =
        scrollTop + containerHeight - containerOffsetTop + expandSize;

      return { top, bottom };
    }, [threshold, containerHeight, containerOffsetTop, scrollTop]);

    // 需要被渲染的brick
    const renderBricks = useMemo(() => {
      const bricks = allBricks;
      const keys = {}; // 避免重复
      const beRenders = [];

      let unRect = 0; // 未定位过的元素个数
      for (let i = 0; i < bricks.length; i++) {
        const brick = bricks[i];
        const id = brick[brickId];
        const rect = computedBricks.current.get(id);
        if (rect) {
          if (rect.bottom > visibleRect.top && rect.top < visibleRect.bottom) {
            // 视口范围内
            if (!keys[id]) {
              beRenders.push(brick);
              keys[id] = true;
            }
          }
        } else {
          // 找到没有加载过的brick
          if (!keys[id]) {
            beRenders.push(brick);
            keys[id] = true;
            unRect += 1;
          }
        }

        // 最多200个， TODO
        if (unRect >= 20) {
          break;
        }
      }

      return beRenders;
    }, [allBricks, brickId, visibleRect]);

    // 定位所有Dom节点
    useEffect(() => {
      const container = containerRef.current;

      const brickDom = [...container.children];
      let columNum = 0;
      let minHeight = Infinity;

      const computedBrickMap = computedBricks.current;
      const columnHeightArrCurrent = columnHeightArr.current;
      let unRect = 0;
      let outVisibleRect = false;
      brickDom.forEach((brick, index) => {
        // // 移到队列中，防止修改dom导致的后续可能获取 clientHeight 等属性导致的重绘，以下其他代码雷同
        // Promise.resolve().then(() => {
        //   brick.classList.add(styles.brick);
        // });

        const rect = computedBrickMap.get(renderBricks[index][brickId]);

        if (!rect) {
          for (let i = 0; i < columnHeightArrCurrent.length; i++) {
            const value = columnHeightArrCurrent[i];
            if (value < minHeight) {
              columNum = i;
              minHeight = value;
              break;
            }
          }

          const clientHeight = brick.clientHeight;
          // const clientWidth = columnSize;
          const rect = {
            column: columNum,
            left: columNum * (columnSize + gutter),
            top: minHeight,
            height: clientHeight,
            bottom: minHeight + clientHeight,
            right: columNum * (columnSize + gutter) + columnSize,
          };
          // visibleRect 线上打印出来值为{}，跟本地有差异
          if (
            (rect.bottom > visibleRect.top && rect.top < visibleRect.bottom) ||
            !visibleRect.top
          ) {
            // 视口范围内
            Promise.resolve().then(() => {
              brick.classList.add(styles.show);
              brick.style.transform = `translate(${rect.left}px, ${rect.top}px)`;
            });
          }

          // 更新已经渲染数据
          computedBrickMap.set(renderBricks[index][brickId], rect);
          minHeight = columnHeightArrCurrent[columNum] =
            minHeight + clientHeight + gutter;

          unRect += 1;
          if (rect.top > visibleRect.bottom) {
            outVisibleRect = true;
          }
        }
      });

      container.style.height = Math.max(...columnHeightArr.current) + "px";

      // 加载更多未定位brick
      if (unRect >= 20 && !outVisibleRect) {
        setScrollTop((scrollTop) => scrollTop + 1);
      }

      // 定位完成后回调函数
      onRendered();
    }, [renderBricks, visibleRect, columnSize, gutter, brickId, onRendered]);

    // 滚动事件
    useEffect(() => {
      // 没有提供 scrollElement 的话，绑定window的滚动事件
      let target =
        typeof scrollElement === "string"
          ? document.getElementById(scrollElement)
          : scrollElement || window;

      const change = debounce(
        () => {
          if (isUnmount.current) {
            return;
          }

          // 获取真实 DOM是scrollTop， window是scrollY
          setScrollTop(target?.scrollTop || target?.scrollY || 0);
        },
        100,
        { trailing: true, maxWait: 200, leading: false }
      );

      // 初始化设置
      change();

      // 绑定滚动事件
      target?.addEventListener("scroll", change, { passive: true });

      // 取消滚动事件
      return () => {
        target?.removeEventListener("scroll", change);
      };
    }, [scrollElement]);

    useImperativeHandle(ref, () => ({
      // 获取所有图片的位置，用来做框选操作
      getBricksPosition: () => {
        return {
          containerOffsetTop:
            containerRef.current?.getBoundingClientRect()?.top,
          containerOffsetLeft:
            containerRef.current?.getBoundingClientRect()?.left,
          computedBricks,
        };
      },
      relayout,
    }));

    return (
      <div
        className={className}
        style={{ position: "relative", overflow: "hidden", }}
        ref={containerRef}
      >
        {renderBricks.map(renderChild)}
      </div>
    );
  }
);
