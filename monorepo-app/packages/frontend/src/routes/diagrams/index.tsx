import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/diagrams/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/diagrams/"!</div>
}
