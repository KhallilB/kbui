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

## How recipes work

A recipe is a whole task over time, not a layout. In a list-and-detail recipe, that means choosing a record, editing it or replying, saving, recovering when a save fails, and knowing where focus lands after each step.

### You own the copy

The recipe's files become part of your app. Change its records, fields, wording and styling as you need. kbui keeps working on its own copy but never changes yours. Compare with the recipe's page when you want a later fix.

### What you supply

A recipe runs on its own with sample records and local defaults, so you can try it before connecting anything. To use it for real, pass your records and replace the defaults through a few documented props, its seams: how the open record maps to your router, how a change is saved, how a draft is validated, and the text it shows and announces. The recipe's guide lists each one.

Every recipe handles a save the same way:

- When validation fails, in the browser or on your server, the draft stays, focus moves to the first field to fix, and nothing is saved.
- When a save fails, the draft stays, and a visible message beside the submit control says what happened. Screen readers hear it too.
- When a save succeeds, the change appears and the draft clears.
- If someone opens another record before a save finishes, focus stays where they are. A failure keeps that record's draft and shows the error when they return.

Your records can change after the recipe loads. The recipe matches them by id, so the open record, drafts and pending saves stay with the right record.

### The flow contract

Every list-and-detail recipe is tested against one shared set of flow rules. They cover where focus goes when you open a record or go back, what browser history does, what survives a resize, and how drafts, saves and errors behave. The rules run as browser tests on kbui's copy of each recipe. When a recipe breaks a rule, or a new rule is added, the tests fail until every recipe meets it or its guide explains why it does not yet.

The contract checks kbui's copy, not yours. After you change flow code in your copy, check focus, history and error recovery yourself.

### Contract-checked recipes

Every recipe is a complete task with tests for each of its states. A contract-checked recipe also passes its family's shared rules, so it behaves like the others in that family, and what you learn from one carries over. ListDetail and Inbox are both contract-checked.

### Preview seams

A guide marks some seams as preview. A preview seam works and is documented, but its name or shape may still change in a release before 1.0, without the old name kept as an alias. Release notes name every such change. Your copy does not update itself, so a change reaches you only when you copy a newer version.

### When a recipe becomes a component

Consider a package component when several real apps need the same behavior or layout, and existing components do not express it clearly. Repeated code alone is not enough: some layouts are easier to keep in each app. Recipe behavior moves into the package only after an app outside kbui uses the recipe and the behavior is the same across recipes. Until then, a different flow is a different recipe, not an option on one component.

When a package component covers a recipe's whole job, the recipe retires. Its page sends you to the component, and copies already in apps keep working.

## Explore an example

Try the demo and inspect its source. Follow links to the components and recipes it uses. Sample content, artwork and demo actions belong to the example; they do not add package features.

## Contribute without duplicating content

Keep API details in the component reference, recipe instructions in its guide, and running examples in source and stories. The content index connects those files to the website and Storybook; keep the guide in one place.

Follow the [recipe contribution steps](../../CONTRIBUTING.md#components-and-recipes) for registration and checks. Mark local work as unreleased until its source and documentation are published.
