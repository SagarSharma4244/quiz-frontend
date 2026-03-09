"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSectors, type Sector } from "@/lib/api";

export default function SectorSelect() {
  const router = useRouter();
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSectors()
      .then(setSectors)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sectorId = e.target.value;
    if (sectorId) {
      router.push(`/sector/${sectorId}`);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-md rounded-lg border border-zinc-300 bg-zinc-100 px-4 py-3 text-zinc-500 dark:border-zinc-600 dark:bg-zinc-800">
        Loading sectors...
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <select
        id="sector-select"
        className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-base text-zinc-900 shadow-sm transition-colors focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-500 dark:focus:ring-zinc-700"
        onChange={handleChange}
        defaultValue=""
      >
        <option value="" disabled>
          Choose a sector...
        </option>
        {sectors.map((sector) => (
          <option key={sector.id} value={sector.id}>
            {sector.name}
          </option>
        ))}
      </select>
    </div>
  );
}
