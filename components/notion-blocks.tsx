'use client'

import { useEffect, useRef, useState } from 'react'
import type { Block } from '@/lib/notion-data'
import { cn } from '@/lib/utils'
import { Menu, MenuItem } from '@/components/menu'
import { GripVertical, Plus } from 'lucide-react'

const COMMANDS = [
  { id: 'text', label: '텍스트', hint: '일반 본문', type: 'text' as const },
  { id: 'h1', label: '제목 1', hint: '큰 제목', type: 'h1' as const },
  { id: 'h2', label: '제목 2', hint: '중간 제목', type: 'h2' as const },
  { id: 'todo', label: '할 일', hint: '체크박스', type: 'todo' as const },
  { id: 'bullet', label: '글머리 기호', hint: '리스트', type: 'bullet' as const },
  { id: 'numbered', label: '번호 매기기', hint: '순서 있는 목록', type: 'numbered' as const },
  { id: 'quote', label: '인용', hint: '인용문', type: 'quote' as const },
  { id: 'callout', label: '콜아웃', hint: '강조 상자', type: 'callout' as const },
  { id: 'divider', label: '구분선', hint: '가로선', type: 'divider' as const },
] as const

function emptyTextBlock(): Block {
  return { type: 'text', text: '' }
}

function blockText(block: Block): string {
  if (block.type === 'divider' || block.type === 'image') return ''
  return block.text
}

function withText(block: Block, text: string): Block {
  if (block.type === 'divider') return block
  if (block.type === 'image') return { ...block, caption: text }
  if (block.type === 'todo') return { ...block, text }
  if (block.type === 'callout') return { ...block, text }
  if (block.type === 'numbered') return { ...block, text }
  return { ...block, text }
}

function createBlock(
  type: (typeof COMMANDS)[number]['type'],
  text = '',
): Block {
  switch (type) {
    case 'todo':
      return { type: 'todo', text, checked: false }
    case 'numbered':
      return { type: 'numbered', text, index: 1 }
    case 'callout':
      return { type: 'callout', icon: '💡', text }
    case 'divider':
      return { type: 'divider' }
    default:
      return { type, text } as Block
  }
}

function reindexNumbered(blocks: Block[]): Block[] {
  let n = 0
  return blocks.map((block) => {
    if (block.type !== 'numbered') {
      n = 0
      return block
    }
    n += 1
    return { ...block, index: n }
  })
}

function ensureEditable(blocks: Block[]): Block[] {
  if (blocks.length === 0) return [emptyTextBlock()]
  const last = blocks[blocks.length - 1]
  if (last.type === 'divider' || last.type === 'image') {
    return [...blocks, emptyTextBlock()]
  }
  return blocks
}

function moveCaretToEnd(el: HTMLElement) {
  const range = document.createRange()
  const selection = window.getSelection()
  range.selectNodeContents(el)
  range.collapse(false)
  selection?.removeAllRanges()
  selection?.addRange(range)
}

function EditableLine({
  value,
  className,
  placeholder,
  autoFocus,
  blockIndex,
  commandMenuOpen,
  onCommit,
  onEnter,
  onBackspaceEmpty,
  onSlashQuery,
}: {
  value: string
  className?: string
  placeholder?: string
  autoFocus?: boolean
  blockIndex: number
  commandMenuOpen?: boolean
  onCommit: (text: string) => void
  onEnter: (text: string) => void
  onBackspaceEmpty: () => void
  onSlashQuery: (query: string | null) => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (document.activeElement === el) return
    if ((el.textContent ?? '') !== value) {
      el.textContent = value
    }
  }, [value])

  useEffect(() => {
    if (!autoFocus || !ref.current) return
    ref.current.focus()
    moveCaretToEnd(ref.current)
  }, [autoFocus])

  return (
    <div
      ref={ref}
      data-block-index={blockIndex}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      role="textbox"
      aria-label={placeholder ?? '텍스트'}
      className={cn('block-input min-h-[1.6em] w-full', className)}
      data-placeholder={placeholder}
      onInput={(event) => {
        const el = event.currentTarget
        const text = el.textContent ?? ''
        if (!text) el.innerHTML = ''
        onSlashQuery(text.startsWith('/') ? text.slice(1) : null)
      }}
      onBlur={(event) => {
        onSlashQuery(null)
        onCommit(event.currentTarget.textContent ?? '')
      }}
      onKeyDown={(event) => {
        if (event.nativeEvent.isComposing) return
        const text = event.currentTarget.textContent ?? ''
        if (commandMenuOpen && (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Escape')) {
          event.preventDefault()
          return
        }
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault()
          onEnter(text)
          return
        }
        if (event.key === 'Backspace' && text.length === 0) {
          event.preventDefault()
          onBackspaceEmpty()
        }
      }}
    />
  )
}

export function BlockEditor({
  pageId,
  blocks,
  onChange,
}: {
  pageId: string
  blocks: Block[]
  onChange: (blocks: Block[]) => void
}) {
  const [local, setLocal] = useState<Block[]>(() =>
    ensureEditable(blocks.length ? blocks : [emptyTextBlock()]),
  )
  const [focusIndex, setFocusIndex] = useState<number | null>(
    blocks.length === 0 || (blocks.length === 1 && blockText(blocks[0]) === '')
      ? 0
      : null,
  )
  const [slash, setSlash] = useState<{ index: number; query: string } | null>(
    null,
  )
  const [selectedCommand, setSelectedCommand] = useState(0)

  useEffect(() => {
    setLocal(ensureEditable(blocks.length ? blocks : [emptyTextBlock()]))
    setSlash(null)
    setFocusIndex(
      blocks.length === 0 || (blocks.length === 1 && blockText(blocks[0]) === '')
        ? 0
        : null,
    )
  }, [pageId])

  const filteredCommands = COMMANDS.filter((command) =>
    (slash?.query ?? '').trim() === ''
      ? true
      : command.label.includes(slash!.query) ||
        command.id.includes(slash!.query.toLowerCase()),
  )

  useEffect(() => {
    setSelectedCommand(0)
  }, [slash?.query, slash?.index])

  function commit(next: Block[], nextFocus?: number) {
    const normalized = reindexNumbered(ensureEditable(next))
    setLocal(normalized)
    onChange(normalized)
    if (nextFocus !== undefined) setFocusIndex(nextFocus)
  }

  function updateText(index: number, text: string) {
    const current = local[index]
    if (!current || blockText(current) === text) return
    const next = [...local]
    next[index] = withText(current, text)
    commit(next)
  }

  function handleEnter(index: number, text: string) {
    if (text.startsWith('/') && filteredCommands.length > 0) {
      applyCommand(index, filteredCommands[selectedCommand]?.id ?? 'text')
      return
    }
    const next = [...local]
    next[index] = withText(next[index], text)
    next.splice(index + 1, 0, emptyTextBlock())
    setSlash(null)
    commit(next, index + 1)
  }

  function handleBackspaceEmpty(index: number) {
    if (local.length <= 1) {
      commit([emptyTextBlock()], 0)
      return
    }
    const next = local.filter((_, i) => i !== index)
    setSlash(null)
    commit(next, Math.max(0, index - 1))
  }

  function insertBelow(index: number) {
    const next = [...local]
    next.splice(index + 1, 0, emptyTextBlock())
    commit(next, index + 1)
  }

  function duplicateBlock(index: number) {
    const next = [...local]
    next.splice(index + 1, 0, structuredClone(local[index]))
    commit(next, index + 1)
  }

  function moveBlock(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= local.length) return
    const next = [...local]
    const [item] = next.splice(index, 1)
    next.splice(target, 0, item)
    commit(next, target)
  }

  function turnInto(index: number, commandId: string) {
    const current = blockText(local[index])
    applyCommand(index, commandId, current.startsWith('/') ? '' : current)
  }

  function deleteBlock(index: number) {
    handleBackspaceEmpty(index)
  }

  function applyCommand(index: number, commandId: string, text = '') {
    const command = COMMANDS.find((item) => item.id === commandId)
    if (!command) return
    const next = [...local]
    if (command.type === 'divider') {
      next[index] = { type: 'divider' }
      next.splice(index + 1, 0, emptyTextBlock())
      setSlash(null)
      commit(next, index + 1)
      return
    }
    next[index] = createBlock(command.type, text)
    setSlash(null)
    commit(next, index)
  }

  useEffect(() => {
    if (focusIndex == null) return
    const el = document.querySelector(
      `[data-block-index="${focusIndex}"]`,
    ) as HTMLElement | null
    if (!el) return
    el.focus()
    moveCaretToEnd(el)
  }, [focusIndex, local.length])

  return (
    <div
      className="text-foreground pl-8 -ml-2 md:pl-10 md:-ml-10"
      onKeyDown={(event) => {
        if (!slash) return
        if (event.key === 'ArrowDown') {
          event.preventDefault()
          setSelectedCommand((i) =>
            Math.min(filteredCommands.length - 1, i + 1),
          )
        } else if (event.key === 'ArrowUp') {
          event.preventDefault()
          setSelectedCommand((i) => Math.max(0, i - 1))
        } else if (event.key === 'Escape') {
          event.preventDefault()
          setSlash(null)
        }
      }}
    >
      {local.map((block, i) => (
        <div key={`${pageId}-${i}`} className="group/block relative">
          <div className="absolute -left-8 top-1 hidden items-center text-muted-foreground group-focus-within/block:flex md:-left-10 md:hidden md:group-hover/block:flex">
            <button
              type="button"
              className="flex h-7 w-7 items-center justify-center rounded hover:bg-accent md:h-5 md:w-5"
              aria-label="아래에 블록 추가"
              onClick={() => insertBelow(i)}
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
            <Menu
              trigger={
                <button
                  type="button"
                  className="flex h-7 w-7 items-center justify-center rounded hover:bg-accent md:h-5 md:w-5"
                  aria-label="블록 메뉴"
                >
                  <GripVertical className="h-3.5 w-3.5" />
                </button>
              }
            >
              <MenuItem onClick={() => insertBelow(i)}>아래에 추가</MenuItem>
              <MenuItem onClick={() => duplicateBlock(i)}>복제</MenuItem>
              <MenuItem onClick={() => moveBlock(i, -1)}>위로 이동</MenuItem>
              <MenuItem onClick={() => moveBlock(i, 1)}>아래로 이동</MenuItem>
              {COMMANDS.map((command) => (
                <MenuItem
                  key={command.id}
                  onClick={() => turnInto(i, command.id)}
                >
                  {command.label}로 전환
                </MenuItem>
              ))}
              <MenuItem danger onClick={() => deleteBlock(i)}>
                삭제
              </MenuItem>
            </Menu>
          </div>
          <BlockRow
            block={block}
            index={i}
            autoFocus={focusIndex === i}
            commandMenuOpen={slash?.index === i}
            onCommit={(text) => updateText(i, text)}
            onEnter={(text) => handleEnter(i, text)}
            onBackspaceEmpty={() => handleBackspaceEmpty(i)}
            onSlashQuery={(query) => {
              if (query == null) {
                setSlash((current) => (current?.index === i ? null : current))
                return
              }
              setSlash({ index: i, query })
            }}
            onTodoToggle={(checked) => {
              if (block.type !== 'todo') return
              const next = [...local]
              next[i] = { ...block, checked }
              commit(next)
            }}
          />
          {slash?.index === i && filteredCommands.length > 0 && (
            <div
              className="absolute z-20 mt-1 w-64 max-w-[calc(100vw-2rem)] overflow-hidden rounded-md border border-border bg-background py-1 shadow-md"
              role="listbox"
            >
              {filteredCommands.map((command, commandIndex) => (
                <button
                  key={command.id}
                  type="button"
                  role="option"
                  aria-selected={commandIndex === selectedCommand}
                  className={cn(
                    'flex w-full flex-col items-start px-3 py-1.5 text-left text-sm',
                    commandIndex === selectedCommand
                      ? 'bg-accent'
                      : 'hover:bg-accent/60',
                  )}
                  onMouseDown={(event) => {
                    event.preventDefault()
                    applyCommand(i, command.id)
                  }}
                >
                  <span className="font-medium">{command.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {command.hint}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function BlockRow({
  block,
  index,
  autoFocus,
  commandMenuOpen,
  onCommit,
  onEnter,
  onBackspaceEmpty,
  onSlashQuery,
  onTodoToggle,
}: {
  block: Block
  index: number
  autoFocus?: boolean
  commandMenuOpen?: boolean
  onCommit: (text: string) => void
  onEnter: (text: string) => void
  onBackspaceEmpty: () => void
  onSlashQuery: (query: string | null) => void
  onTodoToggle: (checked: boolean) => void
}) {
  const placeholder =
    block.type === 'text'
      ? "입력하거나 '/' 를 눌러 명령어를 사용하세요..."
      : '내용 입력'

  if (block.type === 'divider') {
    return <hr className="my-3 border-border" />
  }

  if (block.type === 'image') {
    return (
      <figure className="my-2">
        <img src={block.src} alt={block.caption ?? ''} className="rounded" />
        {block.caption && (
          <figcaption className="mt-1 text-sm text-muted-foreground">
            {block.caption}
          </figcaption>
        )}
      </figure>
    )
  }

  const line = (
    <EditableLine
      value={block.text}
      blockIndex={index}
      autoFocus={autoFocus}
      commandMenuOpen={commandMenuOpen}
      placeholder={placeholder}
      className={cn(
        block.type === 'h1' &&
          'mt-8 mb-1 text-[1.875rem] font-bold tracking-tight',
        block.type === 'h2' &&
          'mt-6 mb-0.5 text-[1.5rem] font-semibold tracking-tight',
        (block.type === 'text' ||
          block.type === 'todo' ||
          block.type === 'bullet' ||
          block.type === 'numbered' ||
          block.type === 'quote' ||
          block.type === 'callout') &&
          'py-1 text-[16px] leading-[1.6]',
        block.type === 'todo' && block.checked && 'text-muted-foreground line-through',
      )}
      onCommit={onCommit}
      onEnter={onEnter}
      onBackspaceEmpty={onBackspaceEmpty}
      onSlashQuery={onSlashQuery}
    />
  )

  if (block.type === 'todo') {
    return (
      <div className="flex items-start gap-2 py-1">
        <button
          type="button"
          className="mt-[5px] shrink-0"
          aria-label={block.checked ? '완료 취소' : '완료로 표시'}
          onClick={() => onTodoToggle(!block.checked)}
        >
          <span
            className={cn(
              'flex h-4 w-4 items-center justify-center rounded-[3px] border',
              block.checked
                ? 'bg-notion-blue border-notion-blue'
                : 'border-muted-foreground/50',
            )}
          >
            {block.checked && (
              <svg viewBox="0 0 14 14" className="h-3 w-3 text-white" fill="none">
                <path
                  d="M3 7.5L6 10.5L11 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </span>
        </button>
        <div className="min-w-0 flex-1">{line}</div>
      </div>
    )
  }

  if (block.type === 'bullet') {
    return (
      <div className="flex items-start gap-2">
        <span className="mt-[13px] h-1.5 w-1.5 shrink-0 rounded-full bg-foreground" />
        <div className="min-w-0 flex-1">{line}</div>
      </div>
    )
  }

  if (block.type === 'numbered') {
    return (
      <div className="flex items-start gap-2">
        <span className="shrink-0 pt-1 tabular-nums text-foreground">
          {block.index}.
        </span>
        <div className="min-w-0 flex-1">{line}</div>
      </div>
    )
  }

  if (block.type === 'quote') {
    return (
      <div className="my-1.5 border-l-[3px] border-foreground pl-3.5">{line}</div>
    )
  }

  if (block.type === 'callout') {
    return (
      <div className="my-1.5 flex items-start gap-3 rounded bg-accent px-4 py-3">
        <span className="text-lg leading-[1.5]">{block.icon}</span>
        <div className="min-w-0 flex-1">{line}</div>
      </div>
    )
  }

  return line
}
