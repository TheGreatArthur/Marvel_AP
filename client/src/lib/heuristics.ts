export const uniqueNames = (items: string[]) => {
  const set = new Set<string>();
  items.forEach((name) => {
    if (name.trim()) set.add(name.trim());
  });
  return Array.from(set);
};
