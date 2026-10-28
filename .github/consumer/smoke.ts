// Runtime half of the install check; app.tsx covers types.
import { fileURLToPath } from "node:url";
import * as kbui from "@kb.ui/react";

const missing = ["Button", "Dialog", "Input", "Status", "Card", "Grid", "kb"].filter(
  (name) => !(name in kbui),
);
if (missing.length) throw new Error(`@kb.ui/react is missing ${missing.join(", ")}`);

const styles = fileURLToPath(import.meta.resolve("@kb.ui/react/styles.css"));
if (!Bun.file(styles).size) throw new Error(`${styles} is empty`);

console.log(`@kb.ui/react and its stylesheet installed on ${process.platform}`);
