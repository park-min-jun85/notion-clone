import type { Block, NavItem, NotionPage } from "@/lib/notion-data"

export type PageRow = {
  id: string
  user_id: string
  parent_id: string | null
  icon: string
  title: string
  cover: string | null
  blocks: unknown
  sort_order: number
  created_at: string
  updated_at: string
}

export function parseBlocks(value: unknown): Block[] {
  if (!Array.isArray(value)) return []
  return value as Block[]
}

export function toNotionPage(row: PageRow): NotionPage {
  return {
    id: row.id,
    icon: row.icon,
    title: row.title,
    cover: row.cover ?? undefined,
    parentId: row.parent_id ?? undefined,
    blocks: parseBlocks(row.blocks),
  }
}

export function toNavTree(pages: NotionPage[]): NavItem[] {
  const childrenByParent = new Map<string | undefined, NotionPage[]>()

  for (const page of pages) {
    const key = page.parentId
    const list = childrenByParent.get(key) ?? []
    list.push(page)
    childrenByParent.set(key, list)
  }

  function toItem(page: NotionPage): NavItem {
    const children = (childrenByParent.get(page.id) ?? []).map(toItem)
    return {
      id: page.id,
      icon: page.icon,
      title: page.title,
      children: children.length ? children : undefined,
    }
  }

  return (childrenByParent.get(undefined) ?? []).map(toItem)
}

export function getBreadcrumb(pages: NotionPage[], page: NotionPage) {
  const crumbs: { id: string; icon: string; title: string }[] = []
  const byId = new Map(pages.map((item) => [item.id, item]))
  let current: NotionPage | undefined = page
  const seen = new Set<string>()

  while (current && !seen.has(current.id)) {
    seen.add(current.id)
    crumbs.unshift({
      id: current.id,
      icon: current.icon,
      title: current.title,
    })
    current = current.parentId ? byId.get(current.parentId) : undefined
  }

  return crumbs
}
