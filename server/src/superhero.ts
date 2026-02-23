import axios, { AxiosInstance } from "axios";
import { MemoryCache } from "./cache";
import { Hero, SuperHeroApiHero, SuperHeroApiResponse, SuperHeroSearchResponse } from "./types";

const BASE_URL = "https://superheroapi.com/api";
const cache = new MemoryCache();
const cacheTtlMs = Number(process.env.CACHE_TTL_MS ?? 60000);
const requestTimeoutMs = Number(process.env.SUPERHERO_TIMEOUT_MS ?? 15000);

const getEnvOrThrow = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

let client: AxiosInstance | null = null;

const getClient = () => {
  if (client) return client;
  const token = getEnvOrThrow("SUPERHERO_API_TOKEN");
  client = axios.create({
    baseURL: `${BASE_URL}/${token}`,
    timeout: requestTimeoutMs
  });
  return client;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const shouldRetry = (error: unknown) => {
  if (!axios.isAxiosError(error)) return false;
  const status = error.response?.status;
  if (status && [429, 500, 502, 503, 504, 522, 524].includes(status)) return true;
  const code = (error as { code?: string }).code;
  if (code && ["ECONNRESET", "ETIMEDOUT", "ECONNABORTED"].includes(code)) return true;
  return false;
};

const toCacheKey = (path: string) => path;

const superGet = async <T>(path: string) => {
  const key = toCacheKey(path);
  const cached = cache.get<T>(key);
  if (cached) return cached;

  const maxAttempts = 3;
  let attempt = 0;

  while (attempt < maxAttempts) {
    try {
      const response = await getClient().get<SuperHeroApiResponse<T>>(path);
      if (response.data.response === "error") {
        throw new Error(response.data.error || "SuperHero API error");
      }
      cache.set(key, response.data as T, cacheTtlMs);
      return response.data as T;
    } catch (error) {
      attempt += 1;
      if (!shouldRetry(error) || attempt >= maxAttempts) {
        if (axios.isAxiosError(error)) {
          const status = error.response?.status;
          const suffix = status ? ` (${status})` : "";
          const apiStatus =
            (error.response?.data as { error?: string } | undefined)?.error ??
            error.response?.statusText ??
            error.message;
          throw new Error(`SuperHero API error${suffix}: ${apiStatus}`);
        }
        throw error;
      }
      const backoffMs = 300 * attempt * attempt;
      await sleep(backoffMs);
    }
  }

  throw new Error("SuperHero API error: failed after retries.");
};

const mapHero = (hero: SuperHeroApiHero): Hero => ({
  id: Number(hero.id),
  name: hero.name,
  imageUrl: hero.image?.url,
  powerstats: hero.powerstats,
  biography: hero.biography
    ? {
        fullName: hero.biography["full-name"],
        alterEgos: hero.biography["alter-egos"],
        aliases: hero.biography.aliases,
        placeOfBirth: hero.biography["place-of-birth"],
        firstAppearance: hero.biography["first-appearance"],
        publisher: hero.biography.publisher,
        alignment: hero.biography.alignment
      }
    : undefined,
  appearance: hero.appearance
    ? {
        gender: hero.appearance.gender,
        race: hero.appearance.race,
        height: hero.appearance.height,
        weight: hero.appearance.weight,
        eyeColor: hero.appearance["eye-color"],
        hairColor: hero.appearance["hair-color"]
      }
    : undefined,
  work: hero.work
    ? {
        occupation: hero.work.occupation,
        base: hero.work.base
      }
    : undefined,
  connections: hero.connections
    ? {
        groupAffiliation: hero.connections["group-affiliation"],
        relatives: hero.connections.relatives
      }
    : undefined
});

export const fetchHeroById = async (id: number) => {
  const data = await superGet<SuperHeroApiHero>(`/${id}`);
  return mapHero(data);
};

export const fetchHeroesByIds = async (ids: number[]) => {
  const results: Hero[] = [];
  const concurrency = 5;

  for (let i = 0; i < ids.length; i += concurrency) {
    const chunk = ids.slice(i, i + concurrency);
    const chunkResults = await Promise.all(
      chunk.map(async (id) => {
        try {
          return await fetchHeroById(id);
        } catch (error) {
          return null;
        }
      })
    );

    chunkResults.forEach((hero) => {
      if (hero) results.push(hero);
    });
  }

  return results;
};

export const searchHeroes = async (name: string) => {
  try {
    const data = await superGet<SuperHeroSearchResponse>(`/search/${encodeURIComponent(name)}`);
    return data.results?.map(mapHero) ?? [];
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.toLowerCase().includes("not found")) {
      return [];
    }
    throw error;
  }
};
