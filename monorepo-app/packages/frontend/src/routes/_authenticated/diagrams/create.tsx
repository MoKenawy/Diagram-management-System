// src/routes/_authenticated/diagrams/create.tsx

import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/diagrams/create')({
  component: RouteComponent,
})

function RouteComponent() {

  return <div>Hello "/diagrams/create"!</div>
}
