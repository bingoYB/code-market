import { useEffect, useRef, useState } from "react"
import { SimpleEvent } from "../utils/event"

type WindowInfo = {
  id: string
  zIndex: number
}

class WindowManager extends SimpleEvent<{
  onChange: {
    id: string
    zIndex: number
  },
  onTest: void
}> {
  private windows: WindowInfo[] = []

  addWindow(id: string) {
    // 避免相同窗口添加
    if (this.windows.some((w) => w.id === id)) {
      return
    }
    const zIndex = this.getMaxZIndex() + 1
    this.windows.push({ id, zIndex })
    return zIndex
  }

  setWindowTop(id: string) {
    const windowInfo = this.windows.find((w) => w.id === id)
    const currentMaxZIndex = this.getMaxZIndex()

    if (windowInfo && windowInfo.zIndex !== currentMaxZIndex) {
      windowInfo.zIndex = currentMaxZIndex

      // 其他窗口的 zIndex 都减一
      this.windows.forEach((w) => {
        if (w.id !== id) {
          w.zIndex -= 1

          // 通知组件更新
          this.trigger("onChange", {
            id: w.id,
            zIndex: w.zIndex
          })
        }
      })
    }
  }

  removeWindow(id: string) {
    const index = this.windows.findIndex((w) => w.id === id)
    if (index !== -1) {
      this.windows.splice(index, 1)
    }
  }

  getMaxZIndex() {
    return this.windows.reduce((maxZIndex, window) => {
      return window.zIndex > maxZIndex ? window.zIndex : maxZIndex
    }, 0)
  }

  getZIndex(id: string) {
    const windowInfo = this.windows.find((w) => w.id === id)
    return windowInfo ? windowInfo.zIndex : 0
  }
}

const windowManager = new WindowManager()

export const useZIndexControl = () => {
  const id = useRef(Math.random().toString(36).slice(2)).current
  const [zIndex, setZIndex] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const zIndex = windowManager.addWindow(id);
    zIndex && setZIndex(zIndex)

    return () => {
      windowManager.removeWindow(id)
    }
  }, [id])

  useEffect(() => {
    const cb = ({ id: windowId, zIndex }) => {
      if (windowId === id) {
        setZIndex(zIndex)
      }
    }
    windowManager.on("onChange", cb)

    return () => {
      windowManager.off("onChange", cb)
    }
  }, [id])

  const handleClick = () => {
    windowManager.setWindowTop(id)
    setZIndex(windowManager.getZIndex(id))
  }

  useEffect(() => {
    if (ref.current) {
      ref.current.style.zIndex = zIndex.toString()
    }
  }, [zIndex])

  return { ref, onClick: handleClick, zIndex }
}
