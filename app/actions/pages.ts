"use server"

import { revalidatePath } from "next/cache"
import { requireUser } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import type { Block } from "@/lib/notion-data"
import { toNotionPage, type PageRow } from "@/lib/pages/map"

function throwIfError(error: { message: string } | null) {
  if (error) throw new Error(error.message)
}

async function nextSortOrder(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  parentId: string | null,
) {
  let query = supabase
    .from("pages")
    .select("sort_order")
    .eq("user_id", userId)
    .order("sort_order", { ascending: false })
    .limit(1)

  query = parentId ? query.eq("parent_id", parentId) : query.is("parent_id", null)

  const { data, error } = await query.maybeSingle()
  throwIfError(error)
  return ((data?.sort_order as number | undefined) ?? -1) + 1
}

export async function listPages() {
  const user = await requireUser()
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .eq("user_id", user.id)
    .order("sort_order", { ascending: true })

  throwIfError(error)
  return ((data ?? []) as PageRow[]).map(toNotionPage)
}

export async function createPage(parentId?: string | null) {
  const user = await requireUser()
  const supabase = await createClient()

  if (parentId) {
    const { data: parent, error } = await supabase
      .from("pages")
      .select("id")
      .eq("id", parentId)
      .eq("user_id", user.id)
      .maybeSingle()
    throwIfError(error)
    if (!parent) {
      throw new Error("상위 페이지를 찾을 수 없습니다.")
    }
  }

  const { data, error } = await supabase
    .from("pages")
    .insert({
      user_id: user.id,
      parent_id: parentId ?? null,
      title: "제목 없음",
      icon: "📄",
      blocks: [{ type: "text", text: "" }],
      sort_order: await nextSortOrder(supabase, user.id, parentId ?? null),
    })
    .select("*")
    .single()

  throwIfError(error)
  revalidatePath("/")
  return toNotionPage(data as PageRow)
}

export async function updatePage(
  id: string,
  data: {
    title?: string
    icon?: string
    cover?: string | null
    parentId?: string | null
    blocks?: Block[]
  },
) {
  const user = await requireUser()
  const supabase = await createClient()

  const { data: existing, error: existingError } = await supabase
    .from("pages")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle()
  throwIfError(existingError)
  if (!existing) {
    throw new Error("페이지를 찾을 수 없습니다.")
  }

  if (data.parentId) {
    if (data.parentId === id) {
      throw new Error("자기 자신을 상위 페이지로 지정할 수 없습니다.")
    }
    const { data: parent, error: parentError } = await supabase
      .from("pages")
      .select("id")
      .eq("id", data.parentId)
      .eq("user_id", user.id)
      .maybeSingle()
    throwIfError(parentError)
    if (!parent) {
      throw new Error("상위 페이지를 찾을 수 없습니다.")
    }
  }

  const patch: Record<string, unknown> = {}
  if (data.title !== undefined) patch.title = data.title.trim() || "제목 없음"
  if (data.icon !== undefined) patch.icon = data.icon
  if (data.cover !== undefined) patch.cover = data.cover
  if (data.parentId !== undefined) patch.parent_id = data.parentId
  if (data.blocks !== undefined) patch.blocks = data.blocks

  const { data: page, error } = await supabase
    .from("pages")
    .update(patch)
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*")
    .single()

  throwIfError(error)
  revalidatePath("/")
  return toNotionPage(page as PageRow)
}

export async function deletePage(id: string) {
  const user = await requireUser()
  const supabase = await createClient()

  const { data: existing, error: existingError } = await supabase
    .from("pages")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle()
  throwIfError(existingError)
  if (!existing) {
    throw new Error("페이지를 찾을 수 없습니다.")
  }

  const { error } = await supabase
    .from("pages")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
  throwIfError(error)
  revalidatePath("/")
}

export async function duplicatePage(id: string) {
  const user = await requireUser()
  const supabase = await createClient()

  const { data: source, error: sourceError } = await supabase
    .from("pages")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle()
  throwIfError(sourceError)
  if (!source) {
    throw new Error("페이지를 찾을 수 없습니다.")
  }

  const row = source as PageRow
  const { data, error } = await supabase
    .from("pages")
    .insert({
      user_id: user.id,
      parent_id: row.parent_id,
      title: `${row.title} 복사본`,
      icon: row.icon,
      cover: row.cover,
      blocks: row.blocks ?? [{ type: "text", text: "" }],
      sort_order: await nextSortOrder(supabase, user.id, row.parent_id),
    })
    .select("*")
    .single()

  throwIfError(error)
  revalidatePath("/")
  return toNotionPage(data as PageRow)
}
