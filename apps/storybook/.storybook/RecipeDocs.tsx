import content from "virtual:kbui-system";
import { Canvas, Source } from "@storybook/addon-docs/blocks";
import type { ComponentProps } from "react";
import { GuideContent } from "../site/GuideContent";

export function RecipeDocs({ name, stories }: { name: string; stories: Record<string, unknown> }) {
  const recipe = content.recipes.find((entry) => entry.name === name);
  if (!recipe) throw new Error(`Missing recipe reference: ${name}`);
  return (
    <>
      <p>Recipe · Copy source into your application</p>
      <h1>{recipe.name} recipe</h1>
      <GuideContent
        markdown={recipe.markdown}
        path={recipe.guide}
        siteRoot="../"
        linkTarget="_top"
      />
      <h2>Copy the source</h2>
      <p>
        Copy every file below. Keep local imports together and import the package stylesheet once.
      </p>
      {recipe.files.map((file) => (
        <section key={file.path} aria-label={file.name}>
          <h3>{file.name}</h3>
          <Source code={file.sample.code} language={file.language === "CSS" ? "css" : "tsx"} />
        </section>
      ))}
      <h2>Runnable examples</h2>
      {recipe.stories.map((story) => (
        <section key={story.id} aria-label={story.name}>
          <h3>{story.name}</h3>
          <Canvas of={stories[story.exportName] as ComponentProps<typeof Canvas>["of"]} />
        </section>
      ))}
    </>
  );
}
