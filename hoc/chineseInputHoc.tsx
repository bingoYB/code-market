import React, { type HTMLAttributes, createElement, useState } from "react"

import { isEnter } from "~utils/keyBoard"

export function ChineseInputHoc<T extends HTMLAttributes<Element>>(
  Input: React.FC<T> | string
) {
  return function ChineseInput(props: T) {
    const [pinyininput, setPinyin] = useState(false)

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (
        isEnter(e) &&
        (pinyininput ||
          // 360浏览器下搜狗中文输入法下，onCompositionStart不会触发，key为Process，所以需要在这里判断
          e.key === "Process")
      ) {
        e.preventDefault()
        e.stopPropagation()
        return
      }

      props.onKeyDown?.(e)
    }

    if (typeof Input === "string") {
      return createElement(Input, {
        ...props,
        onKeyDown: onKeyDown,
        onCompositionStart: (e) => {
          setPinyin(true)

          props.onCompositionStart?.(e)
        },
        onCompositionEnd: (e) => {
          // 没有异步在火狐浏览器里无法输入中文
          setTimeout(() => {
            setPinyin(false)
          }, 1)

          props.onCompositionEnd?.(e)
        }
      })
    }

    return (
      <Input
        {...props}
        onCompositionStart={(e) => {
          setPinyin(true)

          props.onCompositionStart?.(e)
        }}
        onCompositionEnd={(e) => {
          // 没有异步在火狐浏览器里无法输入中文
          setTimeout(() => {
            setPinyin(false)
          }, 1)

          props.onCompositionEnd?.(e)
        }}
        onKeyDown={onKeyDown}
      />
    )
  }
}
