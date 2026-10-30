import { loadAdoptionCoverage } from "./adoption-source";

const rows = loadAdoptionCoverage();
if (process.argv.includes("--json")) console.log(JSON.stringify(rows, null, 2));
else {
  const adopted = rows.filter((row) => row.status === "adopted").length;
  console.log(
    `# Component adoption: ${rows.length} families, ${adopted} adopted, ${rows.length - adopted} pending\n`,
  );
  console.log(
    "Adopted means an explicit composed source and a resolving play story. Pending means catalog/reference support exists, but site composition proof remains unmapped. Static checks establish references and JSX bindings; browser checks establish behavior.\n",
  );
  console.log(
    "| Family / reference | Default / curated examples | Adoption / next destination | Source / focused proof |\n| --- | --- | --- | --- |",
  );
  for (const row of rows) {
    const storyLink = (id: string) => `[${id}](/storybook/?path=/story/${id})`;
    const examples = row.examples.map((example) => storyLink(example.id)).join("<br>");
    const state =
      row.status === "adopted" ? `Adopted: ${row.purpose}` : `Pending: ${row.destination}`;
    const proof =
      row.status === "adopted"
        ? `[${row.source}](${row.source})<br>\`${row.proof.id}\`<br>[${row.proof.exportName}](${row.proof.file})`
        : "Pending composed source and play story";
    console.log(
      `| [${row.family}](${row.reference}) | Default: ${storyLink(row.defaultStoryId)}<br>${examples} | ${state} | ${proof} |`,
    );
  }
}
