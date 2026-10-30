import { describe, expect, test } from "bun:test";
import { rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { measurePerformanceBaseline, resolveTempOutputPath } from "./perf-measure";

describe("perf-measure", () => {
  test("rejects output paths inside tracked repository root and allows temporary paths", () => {
    const repoRoot = process.cwd();
    expect(() => resolveTempOutputPath(join(repoRoot, "perf-results.json"), repoRoot)).toThrow(
      /outside tracked repository/,
    );
    const defaultOut = resolveTempOutputPath(undefined, repoRoot);
    expect(defaultOut.startsWith(tmpdir())).toBe(true);
  });

  test("records repeatable token, CSS, catalog, consumer, editing, and retention metrics outside tracked source", async () => {
    const outPath = join(tmpdir(), `kbui-perf-test-${Date.now()}.json`);
    try {
      const report = await measurePerformanceBaseline({
        outPath,
        editIterations: 12,
      });

      expect(report.environment.gitRevision).toMatch(/^[0-9a-f]{40}$/);
      expect(report.environment.bunVersion).toBeTruthy();

      expect(report.tokensAndCss.tokenDefinitionsCount).toBeGreaterThan(500);
      expect(report.tokensAndCss.tokenCss.rawBytes).toBeGreaterThan(
        report.tokensAndCss.tokenCss.gzipBytes,
      );
      expect(report.tokensAndCss.completeComponentCss.gzipBytes).toBeGreaterThan(
        report.tokensAndCss.selectiveButtonCss.gzipBytes,
      );

      expect(report.catalog.entriesCount).toBeGreaterThanOrEqual(62);
      expect(report.catalog.storiesCount).toBeGreaterThan(300);
      expect(report.catalog.fullPayload.gzipBytes).toBeGreaterThan(
        report.catalog.directoryMetadataPayload.gzipBytes * 10,
      );

      expect(report.consumer.externalizedPeers).toContain("react");
      expect(report.consumer.appBundledWithDeps.rawBytes).toBeGreaterThan(
        report.consumer.appExternalized.rawBytes,
      );
      expect(report.consumer.buttonBarrelExternalized.rawBytes).toBeGreaterThan(0);

      expect(report.editingAndRetention.highlightDistinctEdits.iterations).toBe(12);
      expect(report.editingAndRetention.highlightDistinctEdits.warmMedianMs).toBeGreaterThan(0);
      expect(report.editingAndRetention.previewRetention.maxRetainedEntries).toBe(6);
      expect(report.editingAndRetention.previewRetention.abaPreservedEntry).toBe(true);

      const persisted = await Bun.file(outPath).json();
      expect(persisted.environment.gitRevision).toBe(report.environment.gitRevision);
    } finally {
      await rm(outPath, { force: true });
    }
  });
});
