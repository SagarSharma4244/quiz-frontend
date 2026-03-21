import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-zinc-200 bg-white px-6 py-4 shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-zinc-900 hover:text-zinc-700"
        >
          TechGym
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/upload"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
          >
            Upload
          </Link>
        </nav>
      </div>
    </header>
  );
}
