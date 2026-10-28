import { compile } from "tailwindcss";

export async function compileComponentStyle(mode: "css" | "tailwind", source: string, theme = "") {
  const input =
    mode === "css"
      ? source
      : `${theme}\n@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));\n@tailwind utilities;`;
  const compiler = await compile(input);
  return compiler.build(mode === "tailwind" ? source.split(/\s+/).filter(Boolean) : []);
}
