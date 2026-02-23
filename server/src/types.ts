export type SuperHeroApiResponse<T> = {
  response: "success" | "error";
  error?: string;
} & T;

export type SuperHeroApiHero = {
  id: string;
  name: string;
  powerstats: {
    intelligence: string;
    strength: string;
    speed: string;
    durability: string;
    power: string;
    combat: string;
  };
  biography: {
    "full-name": string;
    "alter-egos": string;
    aliases: string[];
    "place-of-birth": string;
    "first-appearance": string;
    publisher: string;
    alignment: string;
  };
  appearance: {
    gender: string;
    race: string;
    height: string[];
    weight: string[];
    "eye-color": string;
    "hair-color": string;
  };
  work: {
    occupation: string;
    base: string;
  };
  connections: {
    "group-affiliation": string;
    relatives: string;
  };
  image: {
    url: string;
  };
};

export type SuperHeroSearchResponse = {
  "results-for": string;
  results: SuperHeroApiHero[];
};

export type Hero = {
  id: number;
  name: string;
  imageUrl?: string;
  powerstats?: SuperHeroApiHero["powerstats"];
  biography?: {
    fullName: string;
    alterEgos: string;
    aliases: string[];
    placeOfBirth: string;
    firstAppearance: string;
    publisher: string;
    alignment: string;
  };
  appearance?: {
    gender: string;
    race: string;
    height: string[];
    weight: string[];
    eyeColor: string;
    hairColor: string;
  };
  work?: {
    occupation: string;
    base: string;
  };
  connections?: {
    groupAffiliation: string;
    relatives: string;
  };
};
