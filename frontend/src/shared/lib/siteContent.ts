export const splitTitleLines = (title: string): string[] =>
  title
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
