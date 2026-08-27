'use client'

import { useState } from 'react'
import {
  Search,
  Home,
  Inbox,
  LogOut,
  Trash2,
  ChevronRight,
  Plus,
  MoreHorizontal,
  Sparkles,
  ChevronsLeft,
  Calendar,
  FilePlus,
  LayoutGrid,
} from 'lucide-react'
import type { NavItem } from '@/lib/notion-data'
import { cn } from '@/lib/utils'
import { Menu, MenuItem } from '@/components/menu'

type Props = {
  userName: string
  navTree: NavItem[]
  activeId: string
  onSelect: (id: string) => void
  onCollapse: () => void
  onCreatePage: (parentId?: string) => void
  onRenamePage: (id: string, title: string) => void
  onDuplicatePage: (id: string) => void
  onDeletePage: (id: string) => void
  onSignOut: () => void
}

function NavRow({
  item,
  depth,
  activeId,
  onSelect,
  onCreatePage,
  onRenamePage,
  onDuplicatePage,
  onDeletePage,
}: {
  item: NavItem
  depth: number
  activeId: string
  onSelect: (id: string) => void
  onCreatePage: (parentId?: string) => void
  onRenamePage: (id: string, title: string) => void
  onDuplicatePage: (id: string) => void
  onDeletePage: (id: string) => void
}) {
  const [open, setOpen] = useState(true)
  const hasChildren = !!item.children?.length
  const isActive = activeId === item.id

  return (
    <div>
      <div
        className={cn(
          'group flex items-center gap-1 rounded pr-1.5 h-[27px] cursor-pointer text-sidebar-foreground',
          isActive
            ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
            : 'hover:bg-sidebar-accent/60',
        )}
        style={{ paddingLeft: 8 + depth * 16 }}
        onClick={() => onSelect(item.id)}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            if (hasChildren) setOpen((o) => !o)
          }}
          className={cn(
            'flex h-5 w-5 shrink-0 items-center justify-center rounded hover:bg-black/10',
            !hasChildren && 'invisible',
          )}
          aria-label={open ? '접기' : '펼치기'}
        >
          <ChevronRight
            className={cn(
              'h-3.5 w-3.5 transition-transform text-muted-foreground',
              open && 'rotate-90',
            )}
          />
        </button>
        <span className="text-base leading-none shrink-0 w-[18px] text-center">
          {item.icon}
        </span>
        <span className="truncate text-sm flex-1">{item.title}</span>
        <Menu
          align="end"
          trigger={
            <button
              type="button"
              className="hidden group-hover:flex h-5 w-5 items-center justify-center rounded hover:bg-black/10 text-muted-foreground"
              aria-label="페이지 메뉴"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
          }
        >
          <MenuItem
            onClick={() => {
              const title = window.prompt('페이지 이름', item.title)
              if (title != null) onRenamePage(item.id, title)
            }}
          >
            이름 바꾸기
          </MenuItem>
          <MenuItem onClick={() => onCreatePage(item.id)}>하위 페이지 추가</MenuItem>
          <MenuItem onClick={() => onDuplicatePage(item.id)}>복제</MenuItem>
          <MenuItem danger onClick={() => onDeletePage(item.id)}>
            삭제
          </MenuItem>
        </Menu>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onCreatePage(item.id)
          }}
          className="hidden group-hover:flex h-5 w-5 items-center justify-center rounded hover:bg-black/10 text-muted-foreground"
          aria-label="하위 페이지 추가"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
      {hasChildren && open && (
        <div>
          {item.children!.map((child) => (
            <NavRow
              key={child.id}
              item={child}
              depth={depth + 1}
              activeId={activeId}
              onSelect={onSelect}
              onCreatePage={onCreatePage}
              onRenamePage={onRenamePage}
              onDuplicatePage={onDuplicatePage}
              onDeletePage={onDeletePage}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ActionRow({
  icon,
  label,
  badge,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  badge?: string
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded px-2 h-[27px] text-sm text-sidebar-foreground hover:bg-sidebar-accent/60"
    >
      <span className="text-muted-foreground shrink-0">{icon}</span>
      <span className="flex-1 text-left truncate">{label}</span>
      {badge && (
        <span className="rounded bg-notion-blue px-1.5 py-0.5 text-[10px] font-medium text-white">
          {badge}
        </span>
      )}
    </button>
  )
}

export function NotionSidebar({
  userName,
  navTree,
  activeId,
  onSelect,
  onCollapse,
  onCreatePage,
  onRenamePage,
  onDuplicatePage,
  onDeletePage,
  onSignOut,
}: Props) {
  const initial = userName.trim().charAt(0) || '?'

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col bg-sidebar border-r border-sidebar-border select-none">
      <div className="group flex items-center gap-2 px-3 h-11 shrink-0 hover:bg-sidebar-accent/60 cursor-pointer">
        <div className="flex h-5 w-5 items-center justify-center rounded bg-foreground text-[11px] font-semibold text-background shrink-0">
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium text-foreground leading-tight">
            {userName}의 Notion
          </p>
        </div>
        <button
          type="button"
          onClick={onCollapse}
          className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-black/10"
          aria-label="사이드바 접기"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onCreatePage()}
          className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-black/10"
          aria-label="새 페이지"
        >
          <FilePlus className="h-4 w-4" />
        </button>
      </div>

      <div className="px-2 pt-1">
        <ActionRow icon={<Search className="h-[18px] w-[18px]" />} label="검색" />
        <ActionRow
          icon={<Sparkles className="h-[18px] w-[18px]" />}
          label="Notion AI"
        />
        <ActionRow icon={<Home className="h-[18px] w-[18px]" />} label="홈" />
        <ActionRow
          icon={<Inbox className="h-[18px] w-[18px]" />}
          label="받은 편지함"
        />
      </div>

      <div className="flex-1 overflow-y-auto px-2 pt-4">
        <div className="flex items-center justify-between px-2 pb-1">
          <span className="text-xs font-medium text-muted-foreground">개인 페이지</span>
          <button
            type="button"
            onClick={() => onCreatePage()}
            className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:bg-black/10"
            aria-label="페이지 추가"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        {navTree.map((item) => (
          <NavRow
            key={item.id}
            item={item}
            depth={0}
            activeId={activeId}
            onSelect={onSelect}
            onCreatePage={onCreatePage}
            onRenamePage={onRenamePage}
            onDuplicatePage={onDuplicatePage}
            onDeletePage={onDeletePage}
          />
        ))}

        <div className="mt-1 px-2">
          <button
            type="button"
            onClick={() => onCreatePage()}
            className="flex w-full items-center gap-2.5 rounded px-0 h-[27px] text-sm text-muted-foreground hover:text-sidebar-foreground"
          >
            <Plus className="h-[18px] w-[18px]" />
            <span>새 페이지</span>
          </button>
        </div>
      </div>

      <div className="px-2 pb-3 pt-1 border-t border-sidebar-border/60">
        <ActionRow
          icon={<Calendar className="h-[18px] w-[18px]" />}
          label="캘린더"
        />
        <ActionRow
          icon={<LayoutGrid className="h-[18px] w-[18px]" />}
          label="템플릿"
        />
        <ActionRow
          icon={<Trash2 className="h-[18px] w-[18px]" />}
          label="휴지통"
        />
        <ActionRow
          icon={<LogOut className="h-[18px] w-[18px]" />}
          label="로그아웃"
          onClick={onSignOut}
        />
      </div>
    </aside>
  )
}
