/** Words inside `els` that the browser split across lines, as `"word" in <text>`. */
export function brokenWords(els: Iterable<Element>): string[] {
  const broken: string[] = [];
  for (const el of els) {
    const walker = el.ownerDocument.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const text = node.textContent ?? "";
      for (const match of text.matchAll(/\S+/g)) {
        const range = el.ownerDocument.createRange();
        range.setStart(node, match.index);
        range.setEnd(node, match.index + match[0].length);
        const lines = new Set([...range.getClientRects()].map((rect) => Math.round(rect.top)));
        if (lines.size > 1) broken.push(`"${match[0]}" in ${el.textContent?.trim()}`);
      }
    }
  }
  return broken;
}
