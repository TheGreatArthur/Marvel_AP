import { Hero } from "../types/marvel";

type RecentHero = Pick<Hero, "id" | "name" | "imageUrl">;

const RECENT_KEY = "marvel_recent_heroes";
const RECENT_LIMIT = 10;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const parseRecent = (raw: string | null): RecentHero[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(isRecord)
      .map((item) => ({
        id: Number(item.id),
        name: typeof item.name === "string" ? item.name : "",
        imageUrl: typeof item.imageUrl === "string" ? item.imageUrl : undefined
      }))
      .filter((item) => Number.isFinite(item.id) && item.name.trim().length > 0);
  } catch {
    return [];
  }
};

const readRecent = (): RecentHero[] => {
  if (typeof window === "undefined") return [];
  return parseRecent(window.localStorage.getItem(RECENT_KEY));
};

const writeRecent = (items: RecentHero[]) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(items));
  } catch {
    // Ignore storage errors (quota, private mode, etc.).
  }
};

export const getRecentHeroes = () => readRecent();

export const recordRecentHero = (hero: Hero) => {
  if (!hero?.id || !hero.name) return readRecent();
  const minimal: RecentHero = {
    id: hero.id,
    name: hero.name,
    imageUrl: hero.imageUrl
  };
  const existing = readRecent().filter((item) => item.id !== minimal.id);
  const next = [minimal, ...existing].slice(0, RECENT_LIMIT);
  writeRecent(next);
  return next;
};
