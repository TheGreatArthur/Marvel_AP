export type Hero = {
  id: number;
  name: string;
  imageUrl?: string;
  powerstats?: {
    intelligence: string;
    strength: string;
    speed: string;
    durability: string;
    power: string;
    combat: string;
  };
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
