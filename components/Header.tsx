import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-zinc-200 bg-white px-6 py-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-zinc-900 hover:text-zinc-700 dark:text-zinc-50 dark:hover:text-zinc-200"
        >
          QuizApp
        </Link>
      </div>
    </header>
  );
}
