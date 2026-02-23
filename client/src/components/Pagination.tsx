type Props = {
  page: number;
  total: number;
  pageSize: number;
  onPrev: () => void;
  onNext: () => void;
};

const Pagination = ({ page, total, pageSize, onPrev, onNext }: Props) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
      <button
        className="rounded-full border border-white/10 px-5 py-2 text-sm transition hover:border-white/30 disabled:cursor-not-allowed disabled:opacity-40"
        onClick={onPrev}
        disabled={page <= 1}
      >
        Précédent
      </button>
      <span className="text-sm text-slate-100/70">Page {page} / {totalPages}</span>
      <button
        className="rounded-full border border-white/10 px-5 py-2 text-sm transition hover:border-white/30 disabled:cursor-not-allowed disabled:opacity-40"
        onClick={onNext}
        disabled={page >= totalPages}
      >
        Suivant
      </button>
    </div>
  );
};

export default Pagination;
