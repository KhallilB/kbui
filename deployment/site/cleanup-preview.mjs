const worker = "kbui-site-preview";
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;

export async function cleanupPreview({
  github,
  context,
  fetch = globalThis.fetch,
  env = process.env,
}) {
  const number = context.payload.number;
  if (!Number.isSafeInteger(number) || number <= 0) throw new Error("Invalid PR number");
  const { data: pr } = await github.rest.pulls.get({ ...context.repo, pull_number: number });
  if (
    pr.state !== "closed" ||
    pr.head.repo?.full_name !== `${context.repo.owner}/${context.repo.repo}`
  ) {
    return false;
  }
  const account = env.CLOUDFLARE_ACCOUNT_ID;
  const token = env.CLOUDFLARE_API_TOKEN;
  if (!account || !token)
    throw new Error("Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN in kbui-preview");
  const base = `/accounts/${encodeURIComponent(account)}/workers`;
  const versionsPath = `${base}/workers/${worker}/versions`;
  const message = new RegExp(`^PR ${number} [a-f0-9]{40}$`);

  async function request(path, method = "GET") {
    const response = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
      method,
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(30_000),
    });
    const body = await response.json();
    if (!response.ok || body.success !== true) {
      throw new Error(
        `Cloudflare ${method} ${path} failed (${response.status}): ${JSON.stringify(body.errors ?? [])}`,
      );
    }
    return body;
  }

  async function listMatchingVersions() {
    const matches = [];
    for (let page = 1; ; page++) {
      const body = await request(`${versionsPath}?page=${page}&per_page=100`);
      if (!Array.isArray(body.result) || !Number.isSafeInteger(body.result_info?.total_pages)) {
        throw new Error("Invalid Cloudflare version listing");
      }
      for (const version of body.result) {
        if (!message.test(version.annotations?.["workers/message"] ?? "")) continue;
        if (!uuid.test(version.id)) throw new Error("Invalid Cloudflare version ID");
        matches.push(version.id);
      }
      if (page >= body.result_info.total_pages) return matches;
    }
  }

  // Snapshot all pages before deletion shifts pagination.
  const versions = await listMatchingVersions();
  if (versions.length === 0) return true;
  const { result } = await request(`${base}/scripts/${worker}/deployments`);
  if (!Array.isArray(result?.deployments)) throw new Error("Invalid Cloudflare deployment listing");
  const active = result.deployments[0]?.versions ?? [];
  if (versions.some((id) => active.some((version) => version.version_id === id))) {
    throw new Error("Refusing to delete a preview version serving live traffic");
  }
  for (const id of versions) await request(`${versionsPath}/${id}`, "DELETE");
  if ((await listMatchingVersions()).length > 0)
    throw new Error("Cloudflare still contains PR preview versions; retry cleanup");
  return true;
}
