import Link from "next/link";

interface PageErrorProps {
  message: string;
  backLink?: string;
  backLinkLabel?: string;
}

export default function PageError({
  message,
  backLink = "/",
  backLinkLabel = "Back to home",
}: PageErrorProps) {
  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-6xl px-6 py-16">
        <p className="text-zinc-600">{message}</p>
        {backLink && (
          <Link href={backLink} className="mt-4 inline-block text-zinc-600 underline">
            {backLinkLabel}
          </Link>
        )}
      </main>
    </div>
  );
}
