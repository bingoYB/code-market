import {
  DndContext,
  type DragEndEvent,
  MouseSensor,
  useDraggable,
  useSensor,
  useSensors
} from "@dnd-kit/core"
import { restrictToWindowEdges } from "@dnd-kit/modifiers"
import type { Coordinates } from "@dnd-kit/utilities"
import React, { type CSSProperties, useState } from "react"

import { useZIndexControl } from "../../hooks/useZIndex";
import "./index.less"


export interface PanelProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onDragEnd"> {
  title: string
  className?: string
  position?: Coordinates
  children?: React.ReactNode
  onClose?: () => void
  onMinimize?: () => void
  onMaximize?: () => void
  onRefresh?: () => void
  onDragEnd?: (event: DragEndEvent, position: { x: number; y: number }) => void
}

export function Panel(props: PanelProps) {
  const { position, onDragEnd, ...rest } = props

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 2
      }
    })
  )

  return (
    <DndContext
      sensors={sensors}
      modifiers={[restrictToWindowEdges]}
      onDragEnd={(event) => {
        const { delta } = event

        if (onDragEnd) {
          onDragEnd(event, {
            x: position.x + delta.x,
            y: position.y + delta.y
          })
        }
      }}>
      <DragableContent position={position} {...rest} />
    </DndContext>
  )
}

function DragableContent({
  children,
  title,
  className,
  position,
  onRefresh,
  onClose,
  onMinimize: onMinimizeCb,
  onMaximize: onMaximizeCb,
  ...props
}: Omit<PanelProps, "onDragEnd">) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: "draggable"
  })

  const { zIndex, onClick } = useZIndexControl()

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        top: position.y,
        left: position.x,
        zIndex
      }
    : {
        top: position.y,
        left: position.x,
        zIndex
      }

  const [bodyStyle, setBodyStyle] = useState<CSSProperties>({})
  const onMinimize = (e) => {
    e.stopPropagation()
    setBodyStyle({
      maxHeight: 0,
      overflowY: "hidden",
      padding: 0
    })
  }

  const onMaximize = (e) => {
    e.stopPropagation()
    setBodyStyle({})
  }

  const onHeadDoubleClick = (e) => {
    if (bodyStyle.maxHeight == 0) {
      onMaximize(e)
      onMaximizeCb?.()
    } else {
      onMinimize(e)
      onMinimizeCb?.()
    }
  }

  return (
    <div
      {...props}
      className={`panel ${className}`}
      ref={setNodeRef}
      onClickCapture={onClick}
      {...attributes}
      style={style}
      onWheel={(e) => {
        e.stopPropagation()
      }}>
      <div
        className="panel-header"
        {...listeners}
        onDoubleClick={onHeadDoubleClick}>
        <div className="panel-action">
         
            <span className="close" onClick={onClose}></span>

          {bodyStyle.maxHeight != 0 && (
        
              <span className="minimize" onClick={onMinimize}></span>

          )}
          {bodyStyle.maxHeight == 0 && (

              <span className="maximize" onClick={onMaximize}></span>

          )}
    
            <span className="refresh" onClick={onRefresh}></span>

        </div>
        <div className="title">{title}</div>
      </div>
      <div className="panel-body" style={bodyStyle}>
        {children}
      </div>
    </div>
  )
}

export function usePanelControl(initialPosition?: Coordinates) {
  const [ visible, setVisible ] = useState(true);
  const [position, setPosition] = useState(initialPosition || {x: 0, y: 0});

  const onClosePanel = () => {
    setVisible(false)
  }

  const setPanelPosition = (x: number, y: number) => {
    setPosition({
        x,
        y
    })
  }

  const onDragEnd = (e: DragEndEvent, position: { x: number; y: number }) => {
    setPanelPosition(position.x, position.y)
  }

  return {
    visible,
    position: position as Coordinates,
    onClosePanel,
    onDragEnd
  }
}
