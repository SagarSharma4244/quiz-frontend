import Header from "@/components/Header";
import SectorSelect from "@/components/SectorSelect";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <Header />
      <main className="mx-auto max-w-6xl px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            Choose Your Sector
          </h1>
          <p className="mb-10 text-lg text-zinc-600 dark:text-zinc-400">
            Select a sector from the dropdown to explore topics and take quizzes.
          </p>
          <div className="flex justify-center">
            <SectorSelect />
          </div>
        </div>
      </main>
    </div>
  );
}
