import { cp, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

async function run(command: string[], cwd: string, capture = false): Promise<string> {
  console.log(`$ ${command.join(" ")}`);
  const child = Bun.spawn(command, { cwd, stdout: "pipe", stderr: "inherit" });
  const output = await new Response(child.stdout).text();
  if (!capture) process.stdout.write(output);
  const status = await child.exited;
  if (status !== 0) throw new Error(`Consumer check failed (${status}): ${command.join(" ")}`);
  return output.trim();
}

export async function checkConsumer(root = resolve(import.meta.dir, "..")) {
  const temporary = await mkdtemp(join(tmpdir(), "kbui-consumer-"));
  try {
    const react = join(root, "packages/react");
    const { name } = await Bun.file(join(react, "package.json")).json();
    const tarball = await run(
      ["bun", "pm", "pack", "--quiet", "--destination", temporary],
      react,
      true,
    );
    const consumer = join(temporary, "consumer");
    await cp(join(root, ".github/consumer"), consumer, { recursive: true });
    await run(["bun", "add", tarball], consumer);
    await run(["bun", "install", "--frozen-lockfile"], consumer);
    await run(["bun", `node_modules/${name}/dist/check-versions.js`], consumer);
    await run(["bunx", "--no-install", "tsc", "-p", "."], consumer);
    await run(["bun", "smoke.ts"], consumer);
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
}

if (import.meta.main) {
  await checkConsumer(process.argv[2]).catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
