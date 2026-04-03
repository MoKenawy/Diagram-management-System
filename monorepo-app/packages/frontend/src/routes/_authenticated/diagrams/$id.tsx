import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/diagrams/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/diagrams/$id"!</div>
}
