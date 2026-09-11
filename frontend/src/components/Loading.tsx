export const Loading = ({ fullPage = false, text = 'Loading...' }: { fullPage?: boolean; text?: string }) => {
  if (fullPage) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-2xl border border-surface-300" />
          <div className="absolute inset-0 rounded-2xl border border-transparent border-t-primary animate-spin" />
          <div className="absolute inset-2 rounded-xl bg-gradient-to-br from-primary/20 to-emerald-500/20 flex items-center justify-center">
            <span className="font-display font-bold text-primary animate-pulse-slow">Fr</span>
          </div>
        </div>
        <p className="mt-5 text-sm text-surface-500 font-medium">{text}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-10 h-10 rounded-xl border-2 border-surface-300 border-t-primary animate-spin" />
      <p className="mt-4 text-sm text-surface-500">{text}</p>
    </div>
  );
};

export const EmptyState = ({ message, icon = '📊' }: { message: string; icon?: string }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <p className="text-surface-400 text-sm">{message}</p>
    </div>
  );
};
