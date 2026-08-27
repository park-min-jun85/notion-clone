"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

export function Menu({
  trigger,
  children,
  align = "start",
}: {
  trigger: React.ReactNode
  children: React.ReactNode
  align?: "start" | "end"
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!ref.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [])

  return (
    <div ref={ref} className="relative">
      <div
        onClick={(event) => {
          event.stopPropagation()
          setOpen((value) => !value)
        }}
      >
        {trigger}
      </div>
      {open && (
        <div
          className={cn(
            "absolute z-30 mt-1 min-w-[180px] overflow-hidden rounded-md border border-border bg-background py-1 shadow-md",
            align === "end" ? "right-0" : "left-0",
          )}
          role="menu"
        >
          <div onClick={() => setOpen(false)}>{children}</div>
        </div>
      )}
    </div>
  )
}

export function MenuItem({
  children,
  onClick,
  danger,
}: {
  children: React.ReactNode
  onClick?: () => void
  danger?: boolean
}) {
  return (
    <button
      type="button"
      role="menuitem"
      className={cn(
        "flex w-full items-center px-3 py-1.5 text-left text-sm hover:bg-accent",
        danger && "text-destructive",
      )}
      onClick={(event) => {
        event.stopPropagation()
        onClick?.()
      }}
    >
      {children}
    </button>
  )
}
