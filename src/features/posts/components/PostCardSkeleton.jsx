export default function PostCardSkeleton() {
  return (
    <li className="border border-gray-200 dark:border-gray-700 rounded p-4 animate-pulse">
      <div className="space-y-2.5">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-2/3" />
        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
      </div>
    </li>
  )
}
