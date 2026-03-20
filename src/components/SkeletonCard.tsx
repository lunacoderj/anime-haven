const SkeletonCard = () => (
  <div className="w-40 flex-shrink-0 animate-pulse">
    <div className="aspect-[2/3] rounded-lg bg-muted" />
    <div className="mt-2 h-4 w-3/4 rounded bg-muted" />
    <div className="mt-1 h-3 w-1/2 rounded bg-muted" />
  </div>
);

export default SkeletonCard;
