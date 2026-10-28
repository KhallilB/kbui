/** @param {string} markdown */
export function sanitizePackageMentions(markdown) {
  // Package scopes resemble GitHub handles; preserve real mentions and code.
  return markdown.replace(
    /(`+)[\s\S]*?\1|\[@kb\]\(https:\/\/github\.com\/kb\/?\)\.ui(?:\/[\w-]+)?|\[@kbui\]\(https:\/\/github\.com\/kbui\/?\)(?:\/[\w-]+)?|(?<![\w@`])@(?:kb\.ui|kbui)(?![\w-]|\.[\w])(?:\/[\w-]+)?/g,
    (match, code) => {
      if (code) return match;
      const scope = match
        .replace(/\[@kb\]\(https:\/\/github\.com\/kb\/?\)\.ui/, "@kb.ui")
        .replace(/\[@kbui\]\(https:\/\/github\.com\/kbui\/?\)/, "@kbui");
      return `\`${scope}\``;
    },
  );
}

export async function cleanReleaseNotes(github, repo, tag) {
  const { data: release } = await github.rest.repos.getReleaseByTag({ ...repo, tag });
  const body = sanitizePackageMentions(release.body ?? "");
  if (body !== (release.body ?? "")) {
    await github.rest.repos.updateRelease({ ...repo, release_id: release.id, body });
  }
}
