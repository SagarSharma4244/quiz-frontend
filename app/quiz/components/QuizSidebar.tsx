export default function QuizSidebar() {
  const sidebarItems = [
    { icon: "📄", label: "Content" },
    { icon: "📚", label: "Lessons" },
    { icon: "👥", label: "Voters" },
    { icon: "🎓", label: "Ask Teacher" },
  ];

  return (
    <aside className="w-20 border-r border-zinc-200 bg-white px-4 py-8">
      <nav className="flex flex-col gap-8">
        {sidebarItems.map((item, index) => (
          <div
            key={index}
            className="flex flex-col items-center gap-2 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-zinc-100">
              <span className="text-sm">{item.icon}</span>
            </div>
            <span className="text-xs text-center">{item.label}</span>
          </div>
        ))}
      </nav>
    </aside>
  );
}
