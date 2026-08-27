'use client'

import {
  Star,
  MessageSquare,
  Clock,
  MoreHorizontal,
  ChevronRight,
  PanelLeft,
  ImagePlus,
} from 'lucide-react'
import type { NotionPage } from '@/lib/notion-data'
import { BlockEditor } from './notion-blocks'
import { Menu, MenuItem } from '@/components/menu'
import { PAGE_COVERS, PAGE_ICONS } from '@/lib/page-presets'
import { cn } from '@/lib/utils'

type Props = {
  page: NotionPage
  breadcrumb: { id: string; icon: string; title: string }[]
  sidebarCollapsed: boolean
  onExpandSidebar: () => void
  onSelectPage: (id: string) => void
  onTitleChange: (title: string) => void
  onIconChange: (icon: string) => void
  onCoverChange: (cover: string | null) => void
  onBlocksChange: (blocks: NotionPage['blocks']) => void
  onDuplicate: () => void
  onDelete: () => void
}

export function NotionPageView({
  page,
  breadcrumb,
  sidebarCollapsed,
  onExpandSidebar,
  onSelectPage,
  onTitleChange,
  onIconChange,
  onCoverChange,
  onBlocksChange,
  onDuplicate,
  onDelete,
}: Props) {
  return (
    <div className="flex h-full flex-1 flex-col bg-background min-w-0">
      <header className="flex items-center gap-1 px-2 md:px-3 h-11 shrink-0 text-sm">
        <button
          type="button"
          onClick={onExpandSidebar}
          className={cn(
            'mr-1 flex h-8 w-8 items-center justify-center rounded text-muted-foreground hover:bg-accent',
            !sidebarCollapsed && 'md:hidden',
          )}
          aria-label="사이드바 열기"
        >
          <PanelLeft className="h-[18px] w-[18px]" />
        </button>
        <nav className="flex items-center gap-0.5 min-w-0 overflow-x-auto" aria-label="breadcrumb">
          {breadcrumb.map((crumb, i) => (
            <div key={crumb.id} className="flex items-center gap-0.5 min-w-0">
              {i > 0 && (
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
              )}
              <button
                type="button"
                onClick={() => onSelectPage(crumb.id)}
                className="flex items-center gap-1.5 rounded px-1.5 py-1 hover:bg-accent min-w-0"
              >
                <span className="text-sm leading-none">{crumb.icon}</span>
                <span className="truncate text-foreground max-w-[120px] md:max-w-[180px]">
                  {crumb.title}
                </span>
              </button>
            </div>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-0.5 text-muted-foreground shrink-0">
          <button
            type="button"
            className="hidden rounded px-2 py-1 text-sm hover:bg-accent sm:block"
          >
            공유
          </button>
          <div className="hidden md:flex items-center gap-0.5">
            <IconBtn label="댓글">
              <MessageSquare className="h-[18px] w-[18px]" />
            </IconBtn>
            <IconBtn label="수정 기록">
              <Clock className="h-[18px] w-[18px]" />
            </IconBtn>
            <IconBtn label="즐겨찾기">
              <Star className="h-[18px] w-[18px]" />
            </IconBtn>
          </div>
          <Menu
            align="end"
            trigger={
              <button
                type="button"
                className="flex h-7 w-7 items-center justify-center rounded hover:bg-accent"
                aria-label="페이지 메뉴"
              >
                <MoreHorizontal className="h-[18px] w-[18px]" />
              </button>
            }
          >
            <MenuItem onClick={onDuplicate}>복제</MenuItem>
            <MenuItem
              onClick={() =>
                onCoverChange(page.cover ? null : PAGE_COVERS[1].src)
              }
            >
              {page.cover ? '커버 제거' : '커버 추가'}
            </MenuItem>
            <MenuItem danger onClick={onDelete}>
              삭제
            </MenuItem>
          </Menu>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        {page.cover ? (
          <div className="group/cover relative h-[22vh] max-h-48 w-full overflow-hidden md:h-[30vh] md:max-h-64">
            <img
              src={page.cover}
              alt=""
              className="h-full w-full object-cover"
            />
            <div className="absolute right-2 bottom-2 flex max-w-[calc(100%-1rem)] flex-wrap justify-end gap-1 md:right-4 md:bottom-3 md:hidden md:group-hover/cover:flex">
              {PAGE_COVERS.filter((cover) => cover.src).map((cover) => (
                <button
                  key={cover.id}
                  type="button"
                  className="rounded bg-background/90 px-2 py-1 text-xs hover:bg-background"
                  onClick={() => onCoverChange(cover.src)}
                >
                  {cover.label}
                </button>
              ))}
              <button
                type="button"
                className="rounded bg-background/90 px-2 py-1 text-xs hover:bg-background"
                onClick={() => onCoverChange(null)}
              >
                제거
              </button>
            </div>
          </div>
        ) : null}

        <article className="mx-auto w-full max-w-[708px] px-4 md:px-12 lg:px-24 pb-40">
          <div className={page.cover ? '-mt-[46px] relative' : 'pt-10 md:pt-16'}>
            <Menu
              trigger={
                <button
                  type="button"
                  className="block text-[56px] md:text-[78px] leading-none rounded hover:bg-accent/50"
                  aria-label="아이콘 변경"
                >
                  {page.icon}
                </button>
              }
            >
              <div className="grid grid-cols-6 gap-1 px-2 py-2">
                {PAGE_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded text-lg hover:bg-accent"
                    onClick={() => onIconChange(icon)}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </Menu>
          </div>

          {!page.cover && (
            <button
              type="button"
              onClick={() => onCoverChange(PAGE_COVERS[1].src)}
              className="mb-2 flex items-center gap-1.5 rounded px-1.5 py-1 text-sm text-muted-foreground hover:bg-accent"
            >
              <ImagePlus className="h-4 w-4" />
              커버 추가
            </button>
          )}

          <h1
            key={`title-${page.id}`}
            className="mt-1 mb-2 text-[32px] md:text-[40px] font-bold leading-tight tracking-tight text-foreground outline-none"
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
            onBlur={(event) => {
              const title = event.currentTarget.textContent?.trim() || '제목 없음'
              if (title !== page.title) onTitleChange(title)
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') event.preventDefault()
            }}
          >
            {page.title}
          </h1>

          <div className="mb-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span>최종 편집: 방금 전</span>
          </div>

          <BlockEditor
            key={`blocks-${page.id}`}
            pageId={page.id}
            blocks={page.blocks}
            onChange={onBlocksChange}
          />
        </article>
      </div>
    </div>
  )
}

function IconBtn({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode
  label: string
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-7 w-7 items-center justify-center rounded hover:bg-accent"
      aria-label={label}
    >
      {children}
    </button>
  )
}
