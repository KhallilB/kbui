// Runtime half of the install check; app.tsx covers types.
import { fileURLToPath } from "node:url";
import * as kbui from "@kbui/react";

const missing = ["Button", "Dialog", "Input", "Status", "Card", "Grid", "kb"].filter(
  (name) => !(name in kbui),
);
if (missing.length) throw new Error(`@kbui/react is missing ${missing.join(", ")}`);

const styles = fileURLToPath(import.meta.resolve("@kbui/css/styles.css"));
if (!Bun.file(styles).size) throw new Error(`${styles} is empty`);

console.log(`@kbui/react and @kbui/css installed on ${process.platform}`);
