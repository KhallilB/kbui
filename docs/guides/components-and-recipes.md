# Components and recipes

Import a component when you want a package API. Copy a recipe when you want code to adapt to your app. Examples show those pieces working together.

## What each part provides

| You need | Start with |
| --- | --- |
| Tokens, themes, styling or setup | Foundations and guides |
| A supported API to import from `@kb.ui/react` | Components |
| Source code you can copy and change | Recipes |
| A working demo to explore | Examples |

Layout is a component category. A component can use other components; size alone does not make it a recipe. What matters is whether you import a maintained package API or copy code into your app.

## Import a component

kbui maintains the component, its tests, documentation and compatibility across releases. Your app supplies content, handlers and anything the component reference asks you to handle.

Upgrade the package to get component fixes. Check release notes for changes and migration steps. You still need to check accessibility in your own page.

A recipe can share a name with a package component. Check its import path and reference. Package updates maintain the imported API; your app maintains any copied recipe.

## Copy a recipe

Copy every listed file and keep its local imports working. Import the package stylesheet once. Each recipe page has the source, required CSS and examples you can try.

Your app now maintains that copy. Upgrading kbui does not update the copied code. Check upstream recipe changes when useful, especially after a package upgrade.

Keep routing, permissions, data loading, validation, saving and error recovery in your app. Read the recipe's limits before using it for a real workflow.

## Explore an example

Try the demo and inspect its source. Follow links to the components and recipes it uses. Sample content, artwork and demo actions belong to the example; they do not add package features.

## When a recipe becomes a component

Consider a package component when several real apps need the same behavior or layout, and existing components do not express it clearly. Repeated code alone is not enough: some layouts are easier to keep in each app.

## Contribute without duplicating content

Keep API details in the component reference, recipe instructions in its guide, and running examples in source and stories. The content index connects those files to the website and Storybook; keep the guide in one place.

Follow the [recipe contribution steps](../../CONTRIBUTING.md#components-and-recipes) for registration and checks. Mark local work as unreleased until its source and documentation are published.
