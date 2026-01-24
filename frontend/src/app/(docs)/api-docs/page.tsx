import { getApiDocs } from '@/lib/swagger'

import ReactSwagger from './_components/react-swagger'

export default async function ApiDocsPage() {
  const spec = await getApiDocs()
  return (
    <section className="container">
      <ReactSwagger spec={spec} />
    </section>
  )
}
