import content from "virtual:kbui-system";
import { Button, Container, Heading, Text } from "@kb.ui/react";
import { useState } from "react";
import { systemGuide } from "../catalog/content";
import type { RecipeReference } from "../catalog/types";
import { StoryPreview } from "./CatalogPreview";
import { CodePanel } from "./CodePanel";
import { GuideContent } from "./GuideContent";
import { SiteFrame, SiteLink, useSiteTheme } from "./SiteFrame";
import "./recipes.css";

function RecipePreview({ src, title }: { src: string; title: string }) {
  const theme = useSiteTheme();
  const [status, setStatus] = useState<"loading" | "ready" | "slow" | "failed">("loading");
  const [generation, setGeneration] = useState(0);
  return (
    <section aria-label="Live recipe example" className="recipe-preview">
      <StoryPreview
        src={src}
        title={title}
        layout={{ width: 1120, minimum: 240 }}
        expanded={false}
        appearance={{ theme }}
        generation={generation}
        pending={status === "loading"}
        status={
          status === "loading"
            ? "Loading live example…"
            : status === "ready"
              ? ""
              : "Preview unavailable. Retry or open the example directly."
        }
        onLoad={() => setStatus("ready")}
        onSlow={() => setStatus("slow")}
        onError={() => setStatus("failed")}
      />
      {(status === "slow" || status === "failed") && (
        <Text>
          <Button
            variant="secondary"
            onClick={() => {
              setStatus("loading");
              setGeneration((value) => value + 1);
            }}
          >
            Retry preview
          </Button>{" "}
          <a href={src}>Open example directly</a>
        </Text>
      )}
    </section>
  );
}

function RecipeDetails({
  recipe,
  state,
  siteRoot,
  storybookRoot,
}: {
  recipe: RecipeReference;
  state: string | null;
  siteRoot: string;
  storybookRoot: string;
}) {
  const story =
    recipe.stories.find((entry) => entry.id === state) ??
    recipe.stories.find((entry) => entry.id === recipe.defaultStoryId);
  if (!story) throw new Error(`Missing recipe example: ${recipe.name}`);
  return (
    <>
      <div className="page-heading">
        <Text className="page-kicker">Recipe · Copy and adapt</Text>
        <Heading level={1}>{recipe.name}</Heading>
        <Text>{recipe.description}</Text>
      </div>
      <Text className="recipe-ownership">
        Copy this recipe into your application. Your application owns its code and future changes;
        component references document the supported package APIs.
      </Text>
      <nav className="recipe-links" aria-label="Recipe references">
        <SiteLink href={`${siteRoot}recipes/`}>Browse recipes</SiteLink>
        <a href={`${storybookRoot}?path=/docs/${recipe.docsId}`}>Open in Storybook</a>
        <a href="#recipe-source">Copy source files</a>
      </nav>
      <nav className="recipe-links" aria-label="Components used">
        {recipe.components.map((name) => (
          <SiteLink key={name} href={`${siteRoot}components/?component=${name.toLowerCase()}`}>
            {name}
          </SiteLink>
        ))}
      </nav>
      <Heading level={2} id="recipe-example">
        Live example
      </Heading>
      <nav className="recipe-links" aria-label="Recipe examples">
        {recipe.stories.map((entry) => (
          <SiteLink
            key={entry.id}
            href={`${siteRoot}recipes/?recipe=${recipe.id}&state=${entry.id}`}
            aria-current={entry.id === story.id ? "true" : undefined}
          >
            {entry.name}
          </SiteLink>
        ))}
      </nav>
      {state && state !== story.id && (
        <Text role="status">That example is unavailable. Showing {story.name}.</Text>
      )}
      <RecipePreview
        key={story.id}
        title={`${recipe.name} — ${story.name} live example`}
        src={`${storybookRoot}iframe.html?id=${story.id}&viewMode=story&embed=true`}
      />
      <GuideContent markdown={recipe.markdown} path={recipe.guide} siteRoot={siteRoot} />
      <section id="recipe-source" aria-label="Recipe source files" className="recipe-sources">
        <Heading level={2}>Copy the source</Heading>
        <Text>
          Copy every file below and keep their local imports together. Import{" "}
          <code>@kb.ui/react/styles.css</code> once at your application entry.
        </Text>
        {recipe.files.map((file) => (
          <section key={file.path} aria-label={file.name}>
            <Heading level={3}>{file.name}</Heading>
            <CodePanel sample={file.sample} name={file.name} language={file.language} />
          </section>
        ))}
      </section>
    </>
  );
}

export function Recipes({
  siteRoot = "../",
  storybookRoot = "../storybook/",
  search = "",
}: {
  siteRoot?: string;
  storybookRoot?: string;
  search?: string;
}) {
  const params = new URLSearchParams(search);
  const requested = params.get("recipe");
  const recipe = content.recipes.find((entry) => entry.id === requested);
  return (
    <SiteFrame
      current="recipes"
      className="kbui-recipes"
      siteRoot={siteRoot}
      storybookRoot={storybookRoot}
    >
      <Container as="main" id="main" className="inner-page">
        {recipe ? (
          <RecipeDetails
            recipe={recipe}
            state={params.get("state")}
            siteRoot={siteRoot}
            storybookRoot={storybookRoot}
          />
        ) : requested ? (
          <div className="page-heading">
            <Heading level={1}>Recipe unavailable</Heading>
            <Text>This recipe does not exist in this documentation build.</Text>
            <SiteLink href={`${siteRoot}recipes/`}>Browse recipes</SiteLink>
          </div>
        ) : (
          <>
            <div className="page-heading">
              <Text className="page-kicker">Compose with kbui</Text>
              <Heading level={1}>Recipes</Heading>
              <Text>
                Copy a complete composition, adapt it to your application, and own the result.
              </Text>
            </div>
            <ul className="recipe-directory" aria-label="Available recipes">
              {content.recipes.map((entry) => (
                <li key={entry.id}>
                  <Heading level={2}>
                    <SiteLink href={`${siteRoot}recipes/?recipe=${entry.id}`}>
                      {entry.name}
                    </SiteLink>
                  </Heading>
                  <Text>{entry.description}</Text>
                  <span>Recipe · Source and required CSS included</span>
                </li>
              ))}
            </ul>
            <section id="system-guide" aria-labelledby="system-guide-title">
              <Heading level={2} id="system-guide-title">
                Components and recipes
              </Heading>
              <GuideContent markdown={content.guide} path={systemGuide} siteRoot={siteRoot} />
            </section>
          </>
        )}
      </Container>
    </SiteFrame>
  );
}
