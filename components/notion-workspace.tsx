"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { PanelLeft } from "lucide-react"
import { NotionSidebar } from "@/components/notion-sidebar"
import { NotionPageView } from "@/components/notion-page"
import {
  createPage,
  deletePage,
  duplicatePage,
  updatePage,
} from "@/app/actions/pages"
import { signOutAction } from "@/app/actions/auth"
import type { SessionUser } from "@/lib/auth"
import type { Block, NotionPage } from "@/lib/notion-data"
import { getBreadcrumb, toNavTree } from "@/lib/pages/map"

type Props = {
  user: SessionUser
  initialPages: NotionPage[]
}

export function NotionWorkspace({ user, initialPages }: Props) {
  const [, startTransition] = useTransition()
  const [pages, setPages] = useState(initialPages)
  const [activeId, setActiveId] = useState(initialPages[0]?.id ?? "")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (pages.length === 0) {
      setActiveId("")
      return
    }
    if (!pages.some((page) => page.id === activeId)) {
      setActiveId(pages[0].id)
    }
  }, [pages, activeId])

  const navTree = useMemo(() => toNavTree(pages), [pages])
  const page = pages.find((item) => item.id === activeId) ?? pages[0]
  const breadcrumb = page ? getBreadcrumb(pages, page) : []

  function patchPage(id: string, patch: Partial<NotionPage>) {
    setPages((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    )
  }

  function handleCreate(parentId?: string) {
    startTransition(async () => {
      const created = await createPage(parentId)
      setPages((prev) => [...prev, created])
      setActiveId(created.id)
      setMobileOpen(false)
    })
  }

  function handleDuplicate(id: string) {
    startTransition(async () => {
      const copied = await duplicatePage(id)
      setPages((prev) => [...prev, copied])
      setActiveId(copied.id)
    })
  }

  function handleDelete(id: string) {
    if (!confirm("이 페이지를 삭제할까요?")) return
    startTransition(async () => {
      await deletePage(id)
      setPages((prev) =>
        prev
          .filter((item) => item.id !== id)
          .map((item) =>
            item.parentId === id ? { ...item, parentId: undefined } : item,
          ),
      )
    })
  }

  function handleRename(id: string, title: string) {
    const next = title.trim() || "제목 없음"
    patchPage(id, { title: next })
    startTransition(async () => {
      await updatePage(id, { title: next })
    })
  }

  function handleTitleChange(title: string) {
    if (!activeId) return
    handleRename(activeId, title)
  }

  function handleIconChange(icon: string) {
    if (!activeId) return
    patchPage(activeId, { icon })
    startTransition(async () => {
      await updatePage(activeId, { icon })
    })
  }

  function handleCoverChange(cover: string | null) {
    if (!activeId) return
    patchPage(activeId, { cover: cover ?? undefined })
    startTransition(async () => {
      await updatePage(activeId, { cover })
    })
  }

  function handleBlocksChange(blocks: Block[]) {
    if (!activeId) return
    const id = activeId
    patchPage(id, { blocks })
    startTransition(async () => {
      await updatePage(id, { blocks })
    })
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  useEffect(() => {
    if (!mobileOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previous
    }
  }, [mobileOpen])

  function openSidebar() {
    setMobileOpen(true)
    setSidebarCollapsed(false)
  }

  function closeSidebar() {
    setMobileOpen(false)
    if (window.matchMedia("(min-width: 768px)").matches) {
      setSidebarCollapsed(true)
    }
  }

  function handleSelectPage(id: string) {
    setActiveId(id)
    setMobileOpen(false)
  }

  return (
    <div className="flex h-dvh overflow-hidden pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          aria-label="사이드바 닫기"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <NotionSidebar
        userName={user.name}
        navTree={navTree}
        activeId={page?.id ?? ""}
        mobileOpen={mobileOpen}
        desktopCollapsed={sidebarCollapsed}
        onSelect={handleSelectPage}
        onCollapse={closeSidebar}
        onCreatePage={handleCreate}
        onRenamePage={handleRename}
        onDuplicatePage={handleDuplicate}
        onDeletePage={handleDelete}
        onSignOut={() => {
          startTransition(async () => {
            await signOutAction()
          })
        }}
      />
      {page ? (
        <NotionPageView
          page={page}
          breadcrumb={breadcrumb}
          sidebarCollapsed={sidebarCollapsed}
          onExpandSidebar={openSidebar}
          onSelectPage={handleSelectPage}
          onTitleChange={handleTitleChange}
          onIconChange={handleIconChange}
          onCoverChange={handleCoverChange}
          onBlocksChange={handleBlocksChange}
          onDuplicate={() => handleDuplicate(page.id)}
          onDelete={() => handleDelete(page.id)}
        />
      ) : (
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-11 shrink-0 items-center px-3">
            <button
              type="button"
              onClick={openSidebar}
              className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-accent md:hidden"
              aria-label="사이드바 열기"
            >
              <PanelLeft className="h-[18px] w-[18px]" />
            </button>
          </header>
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 text-muted-foreground">
            <p>아직 페이지가 없습니다.</p>
            <button
              type="button"
              onClick={() => handleCreate()}
              className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground"
            >
              새 페이지 만들기
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
