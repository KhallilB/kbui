export function InlineCode({ text }: { text: string }) {
  let offset = 0;
  return text.split(/(`[^`]+`)/g).map((part) => {
    const key = offset;
    offset += part.length;
    return part.startsWith("`") ? <code key={key}>{part.slice(1, -1)}</code> : part;
  });
}
