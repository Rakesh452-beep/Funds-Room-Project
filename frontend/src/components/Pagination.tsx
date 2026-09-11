interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}

export const Pagination = ({ page, totalPages, total, onPageChange }: PaginationProps) => {
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== -1) {
      pages.push(-1);
    }
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-surface-200">
      <p className="text-sm text-surface-500">
        Showing <span className="font-medium text-surface-400">{total === 0 ? 0 : (page - 1) * 10 + 1}-{Math.min(page * 10, total)}</span> of{' '}
        <span className="font-medium text-surface-400">{total}</span> results
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="btn-secondary !px-3 !py-1.5 text-sm"
        >
          Previous
        </button>
        {pages.map((p, idx) =>
          p === -1 ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-surface-500">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-all duration-200 ${
                p === page
                  ? 'bg-lime-500 text-black shadow-lime-glow font-bold scale-110'
                   : 'text-surface-400 hover:bg-lime-50 hover:text-black'
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="btn-secondary !px-3 !py-1.5 text-sm"
        >
          Next
        </button>
      </div>
    </div>
  );
};
