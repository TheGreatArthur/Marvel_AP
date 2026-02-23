import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Section from "../components/Section";
import { getHero } from "../lib/api";
import { uniqueNames } from "../lib/heuristics";
import { recordRecentHero } from "../lib/recent";
import { cleanField, getLandscapeUrl, splitList } from "../lib/utils";
import { Hero } from "../types/marvel";

const HeroDetail = () => {
  const { id } = useParams();
  const [hero, setHero] = useState<Hero | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [heroResponse] = await Promise.all([getHero(id)]);

        if (!active) return;

        setHero(heroResponse.data);
      } catch (err) {
        if (!active) return;
        const message = err instanceof Error ? err.message : "Impossible de charger les informations du héros.";
        setError(message);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (hero) recordRecentHero(hero);
  }, [hero]);

  const teamTags = useMemo(() => {
    return splitList(hero?.connections?.groupAffiliation);
  }, [hero?.connections?.groupAffiliation]);

  if (loading) {
    return (
      <div className="page-shell">
        <main className="relative z-10 mx-auto max-w-5xl px-6 py-20 md:px-12">
          <div className="surface rounded-2xl p-8">
            <div className="skeleton h-8 w-1/2 rounded-full" />
            <div className="mt-6 h-56 rounded-2xl skeleton" />
            <div className="mt-6 h-4 w-3/4 rounded-full skeleton" />
            <div className="mt-2 h-4 w-1/2 rounded-full skeleton" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !hero) {
    return (
      <div className="page-shell">
        <main className="relative z-10 mx-auto max-w-5xl px-6 py-20 md:px-12">
          <div className="surface rounded-2xl p-8">
            <p className="text-sm text-emberSoft">{error ?? "Héros introuvable."}</p>
            <Link to="/" className="mt-4 inline-flex text-sm text-emberSoft">
              ← Retour à la liste
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const heroImage = getLandscapeUrl(hero.imageUrl);
  const description =
    cleanField(hero.work?.occupation) ||
    cleanField(hero.biography?.fullName) ||
    "Description non disponible dans l’API officielle.";

  const identity = cleanField(hero.biography?.fullName);
  const alterEgos = cleanField(hero.biography?.alterEgos);
  const firstAppearance = cleanField(hero.biography?.firstAppearance);
  const publisher = cleanField(hero.biography?.publisher);
  const alignment = cleanField(hero.biography?.alignment);
  const placeOfBirth = cleanField(hero.biography?.placeOfBirth);
  const aliases = hero.biography?.aliases?.filter((alias) => alias && alias !== "-") ?? [];
  const relatives = cleanField(hero.connections?.relatives);
  const occupation = cleanField(hero.work?.occupation);
  const base = cleanField(hero.work?.base);
  const gender = cleanField(hero.appearance?.gender);
  const race = cleanField(hero.appearance?.race);
  const height = cleanField(hero.appearance?.height?.[1] || hero.appearance?.height?.[0]);
  const weight = cleanField(hero.appearance?.weight?.[1] || hero.appearance?.weight?.[0]);
  const eyeColor = cleanField(hero.appearance?.eyeColor);
  const hairColor = cleanField(hero.appearance?.hairColor);

  const statLabels: Record<string, string> = {
    intelligence: "Intelligence",
    strength: "Force",
    speed: "Vitesse",
    durability: "Durabilité",
    power: "Puissance",
    combat: "Combat"
  };

  const stats = hero.powerstats
    ? Object.entries(hero.powerstats)
        .map(([key, value]) => ({
          key,
          label: statLabels[key] ?? key,
          value: cleanField(value),
          numeric: Number(value)
        }))
        .filter((stat) => stat.value !== "")
    : [];

  return (
    <div className="page-shell">
      <main className="relative z-10 mx-auto max-w-5xl px-6 py-16 md:px-12">
        <Link to="/" className="text-sm text-emberSoft">← Retour</Link>

        <section className="surface mt-6 overflow-hidden rounded-3xl">
          {heroImage ? (
            <img src={heroImage} alt={hero.name} className="h-64 w-full object-cover" />
          ) : (
            <div className="flex h-64 items-center justify-center bg-slate-900 text-sm text-slate-100/60">
              Image non disponible
            </div>
          )}
          <div className="p-6">
            <h1 className="font-['Bebas_Neue'] text-5xl">{hero.name}</h1>
            <p className="mt-4 text-sm text-slate-100/80">{description}</p>
            <div className="mt-5 grid gap-3 text-sm md:grid-cols-2">
              {identity && (
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-100/60">Identité</p>
                  <p className="font-semibold">{identity}</p>
                </div>
              )}
              {alterEgos && (
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-100/60">Alter egos</p>
                  <p className="font-semibold">{alterEgos}</p>
                </div>
              )}
              {publisher && (
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-100/60">Éditeur</p>
                  <p className="font-semibold">{publisher}</p>
                </div>
              )}
              {alignment && (
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-100/60">Alignement</p>
                  <p className="font-semibold">{alignment}</p>
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <Section title="Première apparition">
            {firstAppearance ? <p className="font-semibold">{firstAppearance}</p> : <p>Non disponible.</p>}
          </Section>

          <Section title="Groupes (officiel)">
            {teamTags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {teamTags.map((team) => (
                  <span key={team} className="rounded-full bg-white/10 px-3 py-1 text-xs">
                    {team}
                  </span>
                ))}
              </div>
            ) : (
              <p>Non disponible.</p>
            )}
          </Section>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <Section title="Powerstats">
            {stats.length > 0 ? (
              <div className="space-y-3">
                {stats.map((stat) => {
                  const value = Number.isFinite(stat.numeric) ? stat.numeric : null;
                  const percent = value !== null ? Math.min(100, Math.max(0, value)) : 0;
                  return (
                    <div key={stat.key}>
                      <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-100/60">
                        <span>{stat.label}</span>
                        <span>{value !== null ? value : "—"}</span>
                      </div>
                      <div className="mt-2 h-2 w-full rounded-full bg-white/10">
                        <div
                          className="h-2 rounded-full bg-ember"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p>Non disponible.</p>
            )}
          </Section>

          <Section title="Apparence">
            <ul className="space-y-2">
              {gender && <li>Genre: {gender}</li>}
              {race && <li>Race: {race}</li>}
              {height && <li>Taille: {height}</li>}
              {weight && <li>Poids: {weight}</li>}
              {eyeColor && <li>Couleur des yeux: {eyeColor}</li>}
              {hairColor && <li>Couleur des cheveux: {hairColor}</li>}
            </ul>
            {!gender && !race && !height && !weight && !eyeColor && !hairColor && <p>Non disponible.</p>}
          </Section>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <Section title="Origines & travail">
            <ul className="space-y-2">
              {placeOfBirth && <li>Lieu de naissance: {placeOfBirth}</li>}
              {occupation && <li>Occupation: {occupation}</li>}
              {base && <li>Base: {base}</li>}
            </ul>
            {!placeOfBirth && !occupation && !base && <p>Non disponible.</p>}
          </Section>

          <Section title="Relations & alias">
            {aliases.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {uniqueNames(aliases).map((alias) => (
                  <span key={alias} className="rounded-full bg-white/10 px-3 py-1 text-xs">
                    {alias}
                  </span>
                ))}
              </div>
            )}
            {relatives && <p className="mt-3">Relatives: {relatives}</p>}
            {aliases.length === 0 && !relatives && <p>Non disponible.</p>}
          </Section>
        </div>
      </main>
    </div>
  );
};

export default HeroDetail;
