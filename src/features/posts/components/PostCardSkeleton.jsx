export default function PostCardSkeleton() {
  return (
    <li className="flex gap-4 rounded-xl border border-border bg-surface p-4">
      <div className="flex w-10 flex-shrink-0 flex-col items-center gap-1.5">
        <div className="h-3 w-3 rounded bg-surface-2" />
        <div className="h-4 w-6 rounded bg-surface-2" />
        <div className="h-3 w-3 rounded bg-surface-2" />
      </div>
      <div className="min-w-0 flex-1 animate-pulse space-y-2.5">
        <div className="h-3 w-24 rounded bg-surface-2" />
        <div className="h-4 w-3/4 rounded bg-surface-2" />
        <div className="h-3 w-full rounded bg-surface-2" />
        <div className="h-3 w-1/2 rounded bg-surface-2" />
      </div>
    </li>
  )
}
