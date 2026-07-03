export default function PostCardSkeleton() {
  return (
    <li className="flex gap-3.5 rounded-xl border border-border bg-surface p-4">
      <div className="min-w-0 flex-1 animate-pulse space-y-2.5">
        <div className="h-3 w-40 rounded bg-surface-2" />
        <div className="h-4 w-3/4 rounded bg-surface-2" />
        <div className="h-3 w-full rounded bg-surface-2" />
        <div className="h-3 w-1/2 rounded bg-surface-2" />
      </div>
    </li>
  )
}
