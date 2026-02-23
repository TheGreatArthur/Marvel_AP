export const getImageUrl = (url?: string) => url ?? "";

export const getLandscapeUrl = (url?: string) => url ?? "";

export const cleanField = (value?: string) => {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed || trimmed === "-" || trimmed.toLowerCase() === "null") return "";
  return trimmed;
};

export const splitList = (value?: string) =>
  cleanField(value)
    .split(/,|;/)
    .map((item) => item.trim())
    .filter(Boolean);
