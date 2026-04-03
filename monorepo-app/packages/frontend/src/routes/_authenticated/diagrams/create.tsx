import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/diagrams/create')({
  component: RouteComponent,
})

function RouteComponent() {

  return <div>Hello "/diagrams/create"!</div>
}
