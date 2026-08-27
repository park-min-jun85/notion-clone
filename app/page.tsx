import { requireUser } from "@/lib/auth"
import { listPages } from "@/app/actions/pages"
import { seedPagesForUser } from "@/lib/pages/seed"
import { NotionWorkspace } from "@/components/notion-workspace"

export default async function Home() {
  const user = await requireUser()
  let pages = await listPages()
  if (pages.length === 0) {
    await seedPagesForUser(user.id)
    pages = await listPages()
  }

  return <NotionWorkspace user={user} initialPages={pages} />
}
