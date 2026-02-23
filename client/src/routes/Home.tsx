import { useEffect, useState } from "react";
import Header from "../components/Header";
import HeroCard from "../components/HeroCard";
import Pagination from "../components/Pagination";
import SkeletonCard from "../components/SkeletonCard";
import { useDebounce } from "../hooks/useDebounce";
import { getHeroes, HeroesResponse } from "../lib/api";
import { getRecentHeroes } from "../lib/recent";
import { Hero } from "../types/marvel";

const PAGE_SIZE = 30;
type AlignmentFilter = "" | "good" | "bad" | "neutral" | "unknown";

const CATEGORY_OPTIONS: { value: AlignmentFilter; label: string; hint: string }[] = [
  { value: "", label: "Tous", hint: "Tous les alignements" },
  { value: "good", label: "Héros", hint: "Alignement positif" },
  { value: "bad", label: "Vilains", hint: "Alignement négatif" },
  { value: "neutral", label: "Neutres", hint: "Alignement neutre" },
  { value: "unknown", label: "Inconnu", hint: "Alignement absent" }
];

const Home = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState<AlignmentFilter>("");
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [total, setTotal] = useState(0);
  const [recentHeroes, setRecentHeroes] = useState<Hero[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category]);

  useEffect(() => {
    setRecentHeroes(getRecentHeroes());
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response: HeroesResponse = await getHeroes({
          search: debouncedSearch,
          category: category || undefined,
          page,
          pageSize: PAGE_SIZE
        });
        if (!active) return;
        setHeroes(response.data);
        setTotal(response.pagination.total);
      } catch (err) {
        if (!active) return;
        const message = err instanceof Error ? err.message : "Impossible de charger les héros pour le moment.";
        setError(message);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [debouncedSearch, page, category]);

  const isEmpty = !loading && heroes.length === 0;

  return (
    <div className="page-shell">
      <Header />
      <main className="relative z-10 mx-auto max-w-6xl px-6 pb-20 md:px-12">
        <div className="surface rounded-2xl p-6">
          <label className="text-sm uppercase tracking-[0.3em] text-ember/80">Recherche</label>
          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
            <input
              type="text"
              placeholder="Ex: Spider, Iron, Cap..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate/60 px-4 py-3 text-sm text-white outline-none transition focus:border-ember"
            />
            <p className="text-xs text-slate-100/60">
              Recherche par nom (API SuperHero). Délais 400 ms.
            </p>
          </div>
          <div className="mt-6">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-100/60">Catégories</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map((option) => {
                const isActive = option.value === category;
                return (
                  <button
                    key={option.value || "all"}
                    type="button"
                    onClick={() => setCategory(option.value)}
                    title={option.hint}
                    className={`rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em] transition ${
                      isActive
                        ? "bg-ember text-white"
                        : "border border-white/10 text-slate-100/70 hover:border-white/30"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-slate-100/60">
              Filtre par alignement (good / bad / neutral / unknown).
            </p>
          </div>
        </div>

        <section className="mt-8">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-sm uppercase tracking-[0.3em] text-ember/80">Derniers visités</h2>
            <span className="text-xs text-slate-100/60">Cache local: 10 derniers profils</span>
          </div>
          {recentHeroes.length > 0 ? (
            <div className="mt-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recentHeroes.map((hero) => (
                <HeroCard key={`recent-${hero.id}`} hero={hero} />
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-100/60">
              Aucun profil visité pour le moment.
            </div>
          )}
        </section>

        {error && (
          <div className="mt-6 rounded-2xl border border-ember/50 bg-ember/10 p-4 text-sm text-emberSoft">
            {error}
          </div>
        )}

        {loading && (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={`skeleton-${index}`} />
            ))}
          </div>
        )}

        {isEmpty && (
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-100/70">
            Aucun héros trouvé. Essaie un autre préfixe.
          </div>
        )}

        {!loading && heroes.length > 0 && (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {heroes.map((hero) => (
              <HeroCard key={hero.id} hero={hero} />
            ))}
          </div>
        )}

        <Pagination
          page={page}
          total={total}
          pageSize={PAGE_SIZE}
          onPrev={() => setPage((prev) => Math.max(1, prev - 1))}
          onNext={() => setPage((prev) => prev + 1)}
        />
      </main>
    </div>
  );
};

export default Home;
