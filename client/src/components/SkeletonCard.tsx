const SkeletonCard = () => (
  <div className="surface flex flex-col overflow-hidden rounded-2xl p-4">
    <div className="skeleton h-48 w-full rounded-xl" />
    <div className="mt-4 h-4 w-3/4 rounded-full skeleton" />
    <div className="mt-2 h-4 w-1/2 rounded-full skeleton" />
    <div className="mt-4 h-10 w-full rounded-xl skeleton" />
  </div>
);

export default SkeletonCard;
