export function AdminPage({ children, loading = false }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-[#1e3a5f] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <div className="flex flex-col gap-6 sm:gap-7 w-full max-w-full">{children}</div>;
}

export function AdminPageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-[28px] font-black text-[#1e3a5f] tracking-wide mb-1">{title}</h1>
        {subtitle && <p className="text-gray-400 text-sm">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
