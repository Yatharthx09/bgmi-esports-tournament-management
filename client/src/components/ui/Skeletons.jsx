export function CardSkeleton() {
  return (
    <div className="glass-card p-5">
      <div className="skeleton h-36 w-full mb-4" />
      <div className="skeleton h-4 w-3/4 mb-2" />
      <div className="skeleton h-3 w-1/2 mb-4" />
      <div className="flex gap-2">
        <div className="skeleton h-6 w-16" />
        <div className="skeleton h-6 w-16" />
      </div>
    </div>
  )
}

export function RowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 glass-card">
      <div className="skeleton h-10 w-10 rounded-full" />
      <div className="flex-1">
        <div className="skeleton h-3 w-1/3 mb-2" />
        <div className="skeleton h-2 w-1/4" />
      </div>
      <div className="skeleton h-6 w-20" />
    </div>
  )
}

export function GridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}
