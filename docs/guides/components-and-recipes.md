# Components and recipes

Choose a component when you want a supported package API. Choose a recipe when you want source to adapt to your application. Browse examples to see how those pieces work together.

## What each part provides

| Part | What it provides | How you use it |
| --- | --- | --- |
| Foundations and guides | Tokens, themes, styling, setup and shared accessibility guidance | Learn and configure |
| Components | Supported package APIs with documented behavior and customization | Import from `@kb.ui/react` |
| Recipes | Maintained compositions using public components and native HTML | Copy the source and required CSS into your application |
| Examples | Larger demonstrations connecting components, recipes and application state | Explore, inspect source and follow references |

Layout is a component category. A component can compose other components; its size or JSX shape does not make it a recipe. The distinction is the delivery and ownership contract.

## Import a component

kbui maintains component implementation, tests, documented accessibility support and compatibility across package releases. Your application supplies content, handlers and any responsibilities identified in the reference. Use the component reference for its props, parts and supported states.

Package updates carry component fixes into your application when you upgrade. Check the release notes for changes and migrations. An available primitive or automated accessibility scan does not establish accessibility of a complete page.

A recipe may share a name with a package component. Follow the import path and reference: package compatibility applies to the package API, while a copied implementation belongs to your application.

## Copy a recipe

Copy every listed source file, keep its local imports working, and import the package stylesheet once at your application entry. Recipe pages show the exact maintained source and runnable examples. Adapt the local files to your content, layout and product behavior.

Your application owns the copied implementation and its future changes. Later recipe edits do not update your copy automatically. Review upstream changes deliberately, especially after upgrading the components it uses. A recipe reference describes its local inputs; it does not add an export to `@kb.ui/react`.

Keep routing, permissions, data loading, validation policy, submission, pending work and error recovery with the application that owns them. Check the recipe's documented boundaries rather than assuming it implements a complete workflow.

## Explore an example

Examples demonstrate a composition and its represented interactions. Follow their component and recipe links for supported APIs or reusable source. Decorative artwork and fictional application behavior belong to the example; their presence does not add package capability.

## When a recipe becomes a component

Promote a recipe only when repeated real uses establish a stable shared behavior or layout contract worth maintaining in the package. Confirm existing primitives cannot express that contract clearly. Reuse alone is insufficient: application-specific composition can remain a useful recipe.

## Contribute without duplicating content

Component Markdown owns the API and usage reference. Recipe Markdown owns its explanation, boundaries and verification guidance. Executable source and stories own the running examples. The content index links those sources to the website and Storybook; their presentation wrappers do not repeat the guide.

Follow [contribution guidance](../../CONTRIBUTING.md#components-and-recipes) for registration, source ownership and checks. Published documentation describes available behavior; locally prepared recipes remain unreleased until their source and documentation are published.
