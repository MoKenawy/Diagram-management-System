import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/admin/audit-logs')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/audit-logs"!</div>
}
