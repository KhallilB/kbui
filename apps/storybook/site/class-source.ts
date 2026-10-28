export function classSourceParts(source: string) {
  const parts: { text: string; start: number; comment: boolean }[] = [];
  let offset = 0;
  // Comments start between utilities; arbitrary values retain literal delimiters.
  for (const match of source.matchAll(/(?<!\S)\/\*[\s\S]*?(?:\*\/|$)/g)) {
    if (match.index > offset)
      parts.push({ text: source.slice(offset, match.index), start: offset, comment: false });
    parts.push({ text: match[0], start: match.index, comment: true });
    offset = match.index + match[0].length;
  }
  if (offset < source.length)
    parts.push({ text: source.slice(offset), start: offset, comment: false });
  return parts;
}

export function activeClassNames(source: string) {
  return classSourceParts(source)
    .filter((part) => !part.comment)
    .flatMap((part) => part.text.split(/\s+/).filter(Boolean));
}
