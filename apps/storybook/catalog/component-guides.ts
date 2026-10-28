export type ComponentGuide = {
  use: string;
  example: { title: string; description: string };
  tips: string[];
  accessibility: string[];
};

export const componentGuides: Record<string, ComponentGuide> = {
  Container: {
    use: "Align page sections with shared maximum widths and responsive gutters.",
    example: {
      title: "Give a workspace a shared page boundary",
      description:
        "Compose headings, actions and content inside one centered page width. Compare sizes and the composed page example.",
    },
    tips: [
      "Maximum widths include gutters; use the same size across aligned page sections.",
      "Disable gutters when a parent already owns inline padding.",
    ],
    accessibility: [
      "Choose main, section or another native element from document structure.",
      "Container adds no focus stop or interactive role.",
    ],
  },
  Inline: {
    use: "Arrange independent content or actions in a row that wraps when space runs out.",
    example: {
      title: "Keep related actions together",
      description:
        "Actions retain their native tab order while the row wraps. Compare spacing and alignment examples.",
    },
    tips: [
      "Use gap for shared spacing between items and wrapped rows.",
      "Use Toolbar when actions need coordinated arrow-key navigation.",
    ],
    accessibility: [
      "Wrapping preserves source and keyboard order.",
      "Use li children when rendering a native list.",
    ],
  },
  Split: {
    use: "Compose two columns that stack when their available width falls below a shared threshold.",
    example: {
      title: "Pair primary content with supporting context",
      description:
        "Use equal or weighted columns, then compare the same composition inside narrower parents.",
    },
    tips: [
      "Provide two children; Split owns the tracks while content retains its own measure.",
      "Thresholds follow available width; style tracks with classNames.track and use Grid for variable counts.",
    ],
    accessibility: [
      "Place primary content first so stacked reading order remains meaningful.",
      "Split adds no ARIA grid role or keyboard model.",
    ],
  },
  Separator: {
    use: "Divide related content with a horizontal or vertical static rule.",
    example: {
      title: "Separate content groups",
      description: "Compare a native thematic break with a vertical divider in an Inline row.",
    },
    tips: [
      "Use decorative when the rule repeats an existing visual grouping.",
      "Vertical rules stretch inside Inline; Separator provides no resize interaction.",
    ],
    accessibility: [
      "Semantic rules announce their orientation without adding a tab stop.",
      "Decorative rules are hidden from assistive technology.",
    ],
  },
  Badge: {
    use: "Label a role, category, or version beside the thing it describes. Use Status for a state that changes.",
    example: {
      title: "Label a collaborator’s role",
      description:
        "A short role label works alongside a name. Try the tone and appearance controls, then compare case-sensitive identifiers below.",
    },
    tips: [
      "Choose tone to reinforce the text, not to supply its meaning.",
      "Use preserveCase with mono for literal paths and branch names.",
    ],
    accessibility: [
      "Keep the label meaningful without color.",
      "Badge is text, not a button; add a separate action when needed.",
      "Static metadata needs no live region.",
    ],
  },
  Button: {
    use: "Use a Button to save, submit, or start a task. Use Link when the main purpose is navigating to another page.",
    example: {
      title: "Make the next action clear",
      description:
        "Use a specific label such as Save changes. Primary gives the main action emphasis; secondary and ghost leave room for less important actions.",
    },
    tips: [
      "Set type=submit for form submission and type=button for other form actions.",
      "Use danger for destructive actions and size=icon only with an accessible name.",
    ],
    accessibility: [
      "Visible text should describe the action, not say Click here.",
      "Give icon-only buttons an aria-label and hide decorative SVGs.",
      "Keep the focus ring visible; native buttons work with Enter and Space.",
    ],
  },
  Callout: {
    use: "Explain something important near the affected content. Add an action when people can resolve the message.",
    example: {
      title: "Explain a decision before people act",
      description:
        "A short title summarizes the issue; the body gives enough context to choose a next step. The actions example shows where a resolution belongs.",
    },
    tips: [
      "Write the message before choosing its tone.",
      "Set live only for a message that changes while someone is using the page.",
    ],
    accessibility: [
      "Keep meaning in the title and body, not only in color.",
      "The icon slot is decorative and hidden from assistive technology.",
      "live adds a polite status role; it does not move focus or create an urgent alert.",
    ],
  },
  Card: {
    use: "Keep one project, resource, or summary together. Card provides a surface; your content supplies its structure and actions.",
    example: {
      title: "Summarize a project",
      description:
        "A heading and short summary make a useful starting point. Compare the plain appearance for rows and the single-link example for navigation.",
    },
    tips: [
      "Use the default article for a self-contained item, div for generic grouping, or li inside a list.",
      "Use appearance=plain when a raised surface would add too much emphasis.",
    ],
    accessibility: [
      "Choose a heading rank that fits the surrounding page.",
      "Card adds no focus stop or click behavior; use real links and buttons.",
      "Keep secondary controls outside a link that covers the whole card.",
    ],
  },
  Checkbox: {
    use: "Let people select independent options or items. Use RadioGroup when exactly one visible choice is allowed.",
    example: {
      title: "Include records in a selection",
      description:
        "The example owns checked state and updates it in onCheckedChange. The mixed example shows an aggregate selection that is partly checked.",
    },
    tips: [
      "Store checked in your app; a callback alone does not update the control.",
      "Use indeterminate for a partial aggregate, and description for help rather than a placeholder.",
    ],
    accessibility: [
      "Keep a clear label; clicking it and pressing Space activate the checkbox.",
      "Mixed state is announced separately from checked and unchecked.",
      "Read-only keeps the control reachable; disabled removes it from keyboard interaction.",
    ],
  },
  Code: {
    use: "Mark a short command, path, property, or literal value within a sentence. Use a pre/code listing for multiline examples.",
    example: {
      title: "Make a literal value easy to recognize",
      description:
        "Code keeps literal content in the surrounding text flow. The in-text and long-token examples show wrapping without changing the text’s case.",
    },
    tips: [
      "Pass markup as a string when it should be displayed literally.",
      "Code supplies inline styling; highlighting and copy controls belong to a separate listing.",
    ],
    accessibility: [
      "Explain unfamiliar commands in nearby text.",
      "Preserve literal case and whitespace when they matter.",
      "Allow long paths to wrap so small screens do not need horizontal page scrolling.",
    ],
  },
  Dialog: {
    use: "Keep a short, focused task in context, such as confirming an action or editing a small set of fields.",
    example: {
      title: "Confirm a destructive action",
      description:
        "Open the dialog deliberately, read its description, and cancel with the close action or Escape. The example demonstrates the interaction; your app performs the actual deletion.",
    },
    tips: [
      "Use title and description on Content, or compose Title and Description parts, without duplicating them.",
      "Keep submission and error handling in your app; closing a dialog does not save data.",
    ],
    accessibility: [
      "Give every dialog a descriptive title and a visible way to close it.",
      "Base UI manages the focus trap and Escape dismissal; preserve those defaults.",
      "Check initial focus and focus return in your real form, especially for destructive tasks.",
    ],
  },
  FileInput: {
    use: "Choose files, keep the selected list visible, and let people remove individual items before uploading.",
    example: {
      title: "Review files before uploading",
      description:
        "The sample retains a small file list and updates it after removal. Your app owns the File objects, acceptance rules, and upload progress.",
    },
    tips: [
      "Give each retained item a stable id and update items after onRemove.",
      "accept is a picker hint; check your app’s acceptance rules before adding files.",
    ],
    accessibility: [
      "Use a specific field label and actionable rejection text.",
      "Keep filenames in remove action names, including when customizing renderItem.",
      "Confirmed removals from an item’s action announce its name; removing a focused item moves focus to a remaining action or the picker.",
    ],
  },
  Grid: {
    use: "Arrange related items in responsive columns or a single vertical list. Grid is layout, not a spreadsheet widget.",
    example: {
      title: "Arrange project summaries",
      description:
        "Cards share the available width and stack as space gets tighter. Use the list example when the collection should have native list semantics.",
    },
    tips: [
      "Use layout=stack for one column and auto for responsive equal columns.",
      "Use as=ul or ol with li children; adjust gap and minimum width through tokens.",
    ],
    accessibility: [
      "Keep visual order aligned with document and keyboard order.",
      "Grid does not add an ARIA grid role or arrow-key model.",
      "Use real links and buttons inside items rather than making the layout interactive.",
    ],
  },
  Heading: {
    use: "Name a page or section with a real heading. Choose its rank from the document outline, then choose its visual size.",
    example: {
      title: "Name a section clearly",
      description:
        "Change level to set the document rank and size to adjust emphasis. The article example combines headings, text, links, and inline code.",
    },
    tips: [
      "Keep level semantic even when a smaller section needs a large visual heading.",
      "Headings have no margin; use the parent layout to set spacing.",
    ],
    accessibility: [
      "Use one clear page title and nest section ranks in order.",
      "Do not use size alone to imply a section heading.",
      "Write headings that make sense when read as an outline.",
    ],
  },
  Input: {
    use: "Collect text with a persistent label, optional help, and a specific error message. Use NumberField for stepped quantities.",
    example: {
      title: "Collect an email address",
      description:
        "A visible label stays present while someone types. Compare help and error states, then try the search example’s clear action.",
    },
    tips: [
      "Use the native type, name, autoComplete, and required props for the field’s purpose.",
      "Keep editing actions out of disabled and read-only fields; the search example returns focus after clearing.",
    ],
    accessibility: [
      "A placeholder supplements the label; it does not replace it.",
      "description and error are associated with the control; explain how to fix invalid input.",
      "Name icon actions independently and hide decorative icons.",
    ],
  },
  Link: {
    use: "Navigate to a destination with a real anchor. Use Button for an action that changes the current interface.",
    example: {
      title: "Give a destination a useful name",
      description:
        "The link keeps a visible underline and inherits the surrounding type size. The in-text example shows how it reads within a sentence.",
    },
    tips: [
      "Use descriptive link text and a real href.",
      "Your app owns routing, download behavior, and wording for links that open a new tab.",
    ],
    accessibility: [
      "Keep underline and focus styling visible in both themes.",
      "Tab focuses a link and Enter follows it; retain native behavior.",
      "Make repeated destinations distinguishable in context; avoid vague Read more labels.",
    ],
  },
  Menu: {
    use: "Put a short list of related actions behind a named trigger. Use Select for choosing a field value.",
    example: {
      title: "Keep secondary actions close by",
      description:
        "Open Actions to browse a small menu. Disabled items stay unavailable, and separators group related tasks without becoming extra controls.",
    },
    tips: [
      "Compose Trigger, Content, Item, and Separator rather than building popup behavior yourself.",
      "A custom container should carry the intended theme for portaled content.",
    ],
    accessibility: [
      "Give the trigger a meaningful accessible name.",
      "Preserve arrow-key navigation, selection, and Escape dismissal.",
      "Use action text on each item; do not nest another button inside it.",
    ],
  },
  NumberField: {
    use: "Collect a numeric quantity that people can type or adjust with steps. Use Input for identifiers such as postal codes.",
    example: {
      title: "Count returned stock",
      description:
        "The example owns the count and provides a sensible range and step. Empty and invalid states show how to distinguish no answer from an invalid draft.",
    },
    tips: [
      "Use null for an empty value and a positive step for increments.",
      "Bounds guide stepping; your app still validates typed drafts and explains errors.",
    ],
    accessibility: [
      "Include units in the label or description when they affect meaning.",
      "Keep localized increment and decrement labels specific to the quantity.",
      "Preserve keyboard editing and visible focus; use a larger size for touch-heavy tasks.",
    ],
  },
  Panel: {
    use: "Organize a section with a heading, content, and related actions. Use Card for a simpler self-contained item.",
    example: {
      title: "Keep a work section organized",
      description:
        "Header, body, and footer keep a section readable. Compare the tones, then use the collapsible example when people should be able to hide its body.",
    },
    tips: [
      "Choose tone for emphasis and density for spacing; a status rail follows the tone.",
      "Enable collapsible before using open, defaultOpen, or Panel.Toggle.",
    ],
    accessibility: [
      "Name the section with aria-labelledby pointing to its visible heading.",
      "Use Panel.Toggle for collapse behavior and give it clear text.",
      "A tone or rail supplements the content; it does not announce a state change.",
    ],
  },
  Progress: {
    use: "Show completion for a task with a known total. Keep the task name separate from the changing amount.",
    example: {
      title: "Show build progress",
      description:
        "The task label stays stable while value changes. The steps example uses max and valueText for a count rather than a percentage.",
    },
    tips: [
      "Keep value between zero and max; max defaults to 100.",
      "Use valueText when a count such as 3 of 5 files explains progress better than a percentage.",
    ],
    accessibility: [
      "Give the progressbar a visible, specific label.",
      "Keep announced value text consistent with the numeric amount.",
      "Your app owns any separate completion announcement and next action.",
    ],
  },
  RadioGroup: {
    use: "Let people choose one value from a small visible set. Use Select when a longer list belongs in a dropdown.",
    example: {
      title: "Choose a display density",
      description:
        "Compact and Roomy smoothly change option height, padding and spacing. Reset restores the starting density; reduced motion switches instantly.",
    },
    tips: [
      "Give every item a unique value and update value in onValueChange.",
      "Segmented choices are radio options, not tabs with associated panels.",
    ],
    accessibility: [
      "Label the whole group and give each option clear text.",
      "Arrow keys move selection and skip disabled items.",
      "Use null for no selection and explain required choices with help or error text.",
    ],
  },
  ScrollArea: {
    use: "Keep long logs or activity inside a named, height-limited region. Avoid separate scrolling for ordinary page content.",
    example: {
      title: "Review build output",
      description:
        "maxHeight keeps the output from taking over the page. Focus the viewport to scroll with the keyboard as well as with a pointer.",
    },
    tips: [
      "Use a CSS length such as 12rem for maxHeight.",
      "Keep wide content readable and avoid stacking several small scrolling regions.",
    ],
    accessibility: [
      "Give the region a specific label such as Build output.",
      "The viewport is focusable; retain its focus indicator.",
      "Check that keyboard users can reach and read the full content.",
    ],
  },
  Select: {
    use: "Choose one field value from a dropdown. Use Menu for actions and RadioGroup for a small set worth showing at once.",
    example: {
      title: "Choose which records to show",
      description:
        "The example stores a string value and uses null for the placeholder. Unavailable options and an empty list stay visibly distinct from a valid choice.",
    },
    tips: [
      "Use unique option values and update value in onValueChange.",
      "The default popup stays inside the field’s theme; theme any custom portal container too.",
    ],
    accessibility: [
      "Use a persistent field label and explain errors in words.",
      "Arrow keys and typeahead find choices; Enter selects and Escape dismisses.",
      "Read-only prevents edits while remaining reachable; an empty option list disables the trigger.",
    ],
  },
  Stat: {
    use: "Show a headline number or short value with the label that explains it. Use Progress for completion toward a total.",
    example: {
      title: "Make an elapsed time readable",
      description:
        "Keep the label beside the formatted value. Use display for one important figure and the row example for related metrics.",
    },
    tips: [
      "Include a unit or time period when the number needs one.",
      "Use md in groups so several metrics can share the same hierarchy.",
    ],
    accessibility: [
      "The label comes before the value in reading order.",
      "Do not rely on position or color to explain the metric.",
      "Stat is not a live announcement; decide separately whether a changing value needs one.",
    ],
  },
  Status: {
    use: "Describe a current state such as running, blocked, or complete. Use Badge for static metadata.",
    example: {
      title: "Make a work state explicit",
      description:
        "Text carries the meaning; tone and an optional icon reinforce it. Compare plain text with a chip when the state needs more separation.",
    },
    tips: [
      "Use appearance=chip for a tinted surface and compact for tighter layouts.",
      "Set live for changing text that should be announced, not for every static status on a page.",
    ],
    accessibility: [
      "Always include words that explain the state.",
      "Treat the icon as decorative rather than the only label.",
      "live adds role=status without moving focus; keep updates useful and infrequent.",
    ],
  },
  Switch: {
    use: "Turn an immediate preference on or off. Use Checkbox for selecting items or choices submitted together later.",
    example: {
      title: "Turn email updates on or off",
      description:
        "The example stores checked state in the app. The control describes the preference consistently while its on/off state changes.",
    },
    tips: [
      "Update checked in onCheckedChange and let your app handle saving.",
      "Handle controlled form reset explicitly; decorative icon slots should not contain controls.",
    ],
    accessibility: [
      "Use a stable label that names the preference, not its current state.",
      "Space toggles the focused switch; the label is also a target.",
      "Read-only preserves focus and form value; disabled prevents interaction and submission.",
    ],
  },
  Text: {
    use: "Write readable paragraphs, supporting text, and inline fragments with a consistent type scale.",
    example: {
      title: "Write useful supporting copy",
      description:
        "Choose size for hierarchy and tone for emphasis. The inline example combines text with meaningful emphasis, a link, and literal code.",
    },
    tips: [
      "Use span inside a paragraph and div for block children; p is the default.",
      "Text has no margin, so set spacing in the parent layout.",
    ],
    accessibility: [
      "Keep paragraph structure valid; do not nest paragraphs.",
      "Use strong and em when emphasis has meaning.",
      "Muted text still needs readable contrast; avoid lowering opacity further.",
    ],
  },
  Toolbar: {
    use: "Group related actions in a row, such as editing commands. Use normal buttons when actions do not form a coherent group.",
    example: {
      title: "Group editing actions",
      description:
        "A named toolbar keeps related controls together. Use groups and separators to divide tasks without adding extra tab stops.",
    },
    tips: [
      "Toolbar.Button uses the shared Button appearance and defaults to ghost.",
      "Use Checkbox or RadioGroup when a control represents a persistent selection.",
    ],
    accessibility: [
      "Name the toolbar with aria-label so its purpose is clear.",
      "Tab enters the group once; arrow keys navigate the controls.",
      "Give icon-only actions their own accessible names and keep focus visible.",
    ],
  },
  Tooltip: {
    use: "Add an optional, short explanation to an already named control. Put required instructions in visible text.",
    example: {
      title: "Explain an icon action",
      description:
        "Hover or focus the stop action to see a brief hint. The trigger keeps its own accessible name even while the hint is closed.",
    },
    tips: [
      "Use content for the hint and delay for the hover delay in milliseconds.",
      "Use a themed container when the popup belongs to a nested theme.",
    ],
    accessibility: [
      "The trigger needs its own accessible name, especially for an icon-only action.",
      "Keep popup content non-interactive; use a Dialog or Menu for controls.",
      "Do not make a tooltip the only way to find required information on touch devices.",
    ],
  },
};
