import { getReaders } from '@/server/actions'
import { ReadersClient } from './ReadersClient'

export default async function ReadersPage() {
  const readers = await getReaders()
  return <ReadersClient readers={readers} />
}
