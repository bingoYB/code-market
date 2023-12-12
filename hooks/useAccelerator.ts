import { useEffect, useRef } from "react"

type KeyAlias = string

type KeyCallback = () => void

type KeyMap = {
  [key in KeyAlias]: string
}

const keyMap: KeyMap = {
  ctrl: "Control",
  alt: "Alt",
  shift: "Shift",
  delete: "Delete",
  backspace: "Backspace",
  enter: "Enter",
  tab: "Tab",
  esc: "Escape",
  up: "ArrowUp",
  down: "ArrowDown",
  left: "ArrowLeft",
  right: "ArrowRight",
  cmd: "Meta"
}

const useAccelerator = (alias: KeyAlias, callback: KeyCallback) => {
  const timeoutRef = useRef<number | null>(null)
  const currentPressRef = useRef<string[]>([])
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const keys = alias.split("+").map((key) => keyMap[key] || key)
      const keyPressed = event.code
      currentPressRef.current.push(keyPressed)

      if (keys.every((key) => currentPressRef.current.includes(key))) {
        if (alias.startsWith("double+")) {
          // 点击过，触发双击，清空定时器
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
            callback()
          } else {
            // 没有点击过，设置定时器
            timeoutRef.current = setTimeout(() => {
              timeoutRef.current = null
            }, 300)
          }
        } else {
          callback()
        }
      }
    }

    // 清空按键记录
    const handleKeyUp = (event: KeyboardEvent) => {
      const keyPressed = event.code
      const index = currentPressRef.current.indexOf(keyPressed)
      if (index > -1) {
        currentPressRef.current.splice(index, 1)
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    window.addEventListener("keyup", handleKeyUp)
    return () => {
      window.removeEventListener("keydown", handleKeyPress)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [alias, callback])
}

export default useAccelerator
