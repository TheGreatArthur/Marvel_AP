import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fetchHeroById, fetchHeroesByIds, searchHeroes } from "./superhero";
import { Hero } from "./types";

dotenv.config({ path: "../.env" });

const requiredEnv = ["SUPERHERO_API_TOKEN"];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  console.error(`Missing environment variables: ${missingEnv.join(", ")}`);
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());

const port = Number(process.env.PORT ?? 3001);
const MAX_RESULTS_NO_SEARCH = Number(process.env.SUPERHERO_MAX_RESULTS ?? 200);
const MAX_HERO_ID = Number(process.env.SUPERHERO_MAX_ID ?? 731);

type AlignmentKey = "good" | "bad" | "neutral" | "unknown";

const alignmentKeys: AlignmentKey[] = ["good", "bad", "neutral", "unknown"];

const normalizeAlignment = (value?: string): AlignmentKey => {
  const raw = value?.trim().toLowerCase() ?? "";
  if (!raw || raw === "-" || raw === "null") return "unknown";
  if (raw.includes("good")) return "good";
  if (raw.includes("bad")) return "bad";
  if (raw.includes("neutral")) return "neutral";
  return "unknown";
};

const parseAlignmentFilter = (value: string | null): AlignmentKey | null => {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  return alignmentKeys.includes(normalized as AlignmentKey) ? (normalized as AlignmentKey) : null;
};

const isMarvelHero = (hero: Hero) => {
  const publisher = hero.biography?.publisher?.toLowerCase() ?? "";
  return publisher.includes("marvel");
};

let marvelIndex: number[] = [];
const marvelIndexByAlignment: Record<AlignmentKey, number[]> = {
  good: [],
  bad: [],
  neutral: [],
  unknown: []
};
let marvelScanCursor = 1;

const registerMarvelHero = (hero: Hero) => {
  if (!marvelIndex.includes(hero.id)) {
    marvelIndex.push(hero.id);
  }
  const alignment = normalizeAlignment(hero.biography?.alignment);
  const bucket = marvelIndexByAlignment[alignment];
  if (!bucket.includes(hero.id)) {
    bucket.push(hero.id);
  }
};

const ensureMarvelIndex = async (targetCount: number, alignment?: AlignmentKey | null) => {
  const maxCount = Math.min(MAX_RESULTS_NO_SEARCH, MAX_HERO_ID);
  const bucket = alignment ? marvelIndexByAlignment[alignment] : marvelIndex;
  if (bucket.length >= targetCount || bucket.length >= maxCount) return;

  while (bucket.length < targetCount && bucket.length < maxCount && marvelScanCursor <= MAX_HERO_ID) {
    const batchIds: number[] = [];
    while (batchIds.length < 5 && marvelScanCursor <= MAX_HERO_ID) {
      batchIds.push(marvelScanCursor);
      marvelScanCursor += 1;
    }

    const heroes = await fetchHeroesByIds(batchIds);
    heroes.forEach((hero) => {
      if (isMarvelHero(hero)) {
        registerMarvelHero(hero);
      }
    });
  }
};

const toInt = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  return "Unknown error.";
};

app.get("/api/heroes", async (req, res) => {
  try {
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const alignmentFilter = parseAlignmentFilter(
      typeof req.query.category === "string" ? req.query.category : null
    );
    const page = Math.max(1, toInt(req.query.page, 1));
    const pageSize = Math.min(100, Math.max(1, toInt(req.query.pageSize, 30)));
    const offset = (page - 1) * pageSize;
    const maxResults = search
      ? Number.POSITIVE_INFINITY
      : Math.min(MAX_RESULTS_NO_SEARCH, MAX_HERO_ID);

    if (offset >= maxResults) {
      res.json({
        data: [],
        pagination: {
          page,
          pageSize,
          total: Number.isFinite(maxResults) ? maxResults : 0,
          count: 0
        }
      });
      return;
    }

    const cappedLimit = Number.isFinite(maxResults)
      ? Math.min(pageSize, maxResults - offset)
      : pageSize;

    let heroes: Hero[] = [];
    let total = 0;

    if (search) {
      const results = await searchHeroes(search);
      const marvelOnly = results.filter(isMarvelHero);
      const filtered = alignmentFilter
        ? marvelOnly.filter((hero) => normalizeAlignment(hero.biography?.alignment) === alignmentFilter)
        : marvelOnly;
      total = filtered.length;
      heroes = filtered.slice(offset, offset + cappedLimit);
    } else {
      const endIndex = Math.min(offset + cappedLimit, maxResults);
      await ensureMarvelIndex(endIndex, alignmentFilter);
      const source = alignmentFilter ? marvelIndexByAlignment[alignmentFilter] : marvelIndex;
      const pageIds = source.slice(offset, endIndex);
      heroes = await fetchHeroesByIds(pageIds);
      total = Math.min(maxResults, source.length);
    }

    res.json({
      data: heroes,
      pagination: {
        page,
        pageSize,
        total,
        count: heroes.length
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: getErrorMessage(error) });
  }
});

app.get("/api/heroes/:id", async (req, res) => {
  try {
    const heroId = Number(req.params.id);
    if (!Number.isFinite(heroId)) {
      res.status(400).json({ message: "Invalid hero id." });
      return;
    }
    const hero = await fetchHeroById(heroId);
    res.json({ data: hero });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: getErrorMessage(error) });
  }
});

app.get("/api/heroes/:id/comics", async (_req, res) => {
  res.status(501).json({ data: [], message: "Not available via SuperHero API." });
});

app.get("/api/heroes/:id/series", async (_req, res) => {
  res.status(501).json({ data: [], message: "Not available via SuperHero API." });
});

app.get("/api/heroes/:id/events", async (_req, res) => {
  res.status(501).json({ data: [], message: "Not available via SuperHero API." });
});

app.get("/api/comics/:id/characters", async (_req, res) => {
  res.status(501).json({ data: [], message: "Not available via SuperHero API." });
});

app.use((req, res) => {
  res.status(404).json({ message: "Not found." });
});

app.listen(port, () => {
  console.log(`Marvel Heroes Explorer server running on port ${port}`);
});
