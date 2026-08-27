import { pages } from "@/lib/notion-data"
import { createClient } from "@/lib/supabase/server"

export async function seedPagesForUser(userId: string) {
  const supabase = await createClient()
  const idMap = new Map<string, string>()
  for (const page of pages) {
    idMap.set(page.id, crypto.randomUUID())
  }

  const { error } = await supabase.from("pages").insert(
    pages.map((page, index) => ({
      id: idMap.get(page.id)!,
      user_id: userId,
      parent_id: page.parentId ? (idMap.get(page.parentId) ?? null) : null,
      icon: page.icon,
      title: page.title,
      cover: page.cover ?? null,
      blocks: page.blocks,
      sort_order: index,
    })),
  )

  if (error) {
    throw new Error(error.message)
  }
}
