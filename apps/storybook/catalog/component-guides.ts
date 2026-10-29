import { accessibilityGuides } from "./accessibility-guides.ts";
import type { AccessibilityGuide } from "./accessibility-standards";

export type ComponentGuide = {
  use: string;
  example: { title: string; description: string };
  tips: string[];
  accessibility: AccessibilityGuide;
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
    accessibility: accessibilityGuides.Container,
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
    accessibility: accessibilityGuides.Inline,
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
    accessibility: accessibilityGuides.Split,
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
    accessibility: accessibilityGuides.Separator,
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
    accessibility: accessibilityGuides.Badge,
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
    accessibility: accessibilityGuides.Button,
  },
  Toast: {
    use: "Confirm completed background work without interrupting the current task.",
    example: {
      title: "Keep project notifications together",
      description:
        "One provider owns the message list. Compare overflow, actions and timed dismissal; use F6 to reach notifications.",
    },
    tips: [
      "Mount one Viewport per provider; use timeout=0 for important messages and time-sensitive actions.",
      "Limit hides older messages while their timers continue. Keep essential results available in the page or a notification history.",
    ],
    accessibility: accessibilityGuides.Toast,
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
    accessibility: accessibilityGuides.Callout,
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
    accessibility: accessibilityGuides.Card,
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
    accessibility: accessibilityGuides.Checkbox,
  },
  Code: {
    use: "Mark a short command, path, or literal value within a sentence, or render a syntax-highlighted multiline code block with a header, line numbers, and copy action.",
    example: {
      title: "Make literal code easy to read and copy",
      description:
        "Single-line strings stay inline in the surrounding text flow; multiline strings or block props such as language, title, or lineNumbers switch automatically to a framed code block.",
    },
    tips: [
      "Pass multiline strings, language, title, or lineNumbers to render a block listing; set block={false} to force inline rendering.",
      "Set language to tsx, ts, css, html, json, or bash for built-in syntax highlighting, or plain to disable token coloring.",
    ],
    accessibility: accessibilityGuides.Code,
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
    accessibility: accessibilityGuides.Dialog,
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
    accessibility: accessibilityGuides.FileInput,
  },
  Grid: {
    use: "Arrange related items in responsive columns, fixed column counts, or a single vertical list. Grid is layout, not a spreadsheet widget.",
    example: {
      title: "Arrange project summaries",
      description:
        "Cards share the available width and stack as space gets tighter. Compare fixed column counts, minimum item widths, gap presets, and native list semantics.",
    },
    tips: [
      "Use layout=stack or columns=1 for one column, auto for responsive columns, or columns=2, 3, or 4 for equal multi-column rows.",
      "Use minItemWidth (sm, md, lg), gap (none, sm, md, lg), and align (start, center, end, baseline, stretch) before reaching for custom CSS tokens.",
      "Use as=ul or ol with li children when the collection should announce native list semantics.",
    ],
    accessibility: accessibilityGuides.Grid,
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
    accessibility: accessibilityGuides.Heading,
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
    accessibility: accessibilityGuides.Input,
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
    accessibility: accessibilityGuides.Link,
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
    accessibility: accessibilityGuides.Menu,
  },
  Combobox: {
    use: "Let people filter a longer option list by typing before choosing one value. Use Select when the list is short enough to scan without typing.",
    example: {
      title: "Find a deployment region",
      description:
        "Type to narrow the region list, choose a region with the keyboard or pointer, and clear the selection when needed.",
    },
    tips: [
      "Pass null when nothing is selected and update value in onValueChange.",
      "Keep emptyMessage specific so people know whether no options exist or none match their filter.",
    ],
    accessibility: accessibilityGuides.Combobox,
  },
  MultiSelect: {
    use: "Let people search a longer list and keep multiple selected values visible as removable chips. Use Checkbox when every choice should stay visible on the page.",
    example: {
      title: "Assign API permission scopes",
      description:
        "Filter scopes by typing, toggle multiple options in the popup, and remove individual chips with the pointer or keyboard.",
    },
    tips: [
      "Keep option labels concise so multiple chips wrap cleanly inside bounded containers.",
      "Customize removeLabel when option labels need extra context in screen reader announcements.",
    ],
    accessibility: accessibilityGuides.MultiSelect,
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
    accessibility: accessibilityGuides.NumberField,
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
    accessibility: accessibilityGuides.Panel,
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
    accessibility: accessibilityGuides.Progress,
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
    accessibility: accessibilityGuides.RadioGroup,
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
    accessibility: accessibilityGuides.ScrollArea,
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
    accessibility: accessibilityGuides.Select,
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
    accessibility: accessibilityGuides.Stat,
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
    accessibility: accessibilityGuides.Status,
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
      "Use size ('sm', 'md', 'lg') and offTone/onTone or offColor/onColor for bilateral state colors; decorative icon slots should not contain controls.",
    ],
    accessibility: accessibilityGuides.Switch,
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
    accessibility: accessibilityGuides.Text,
  },
  Textarea: {
    use: "Collect multiline notes, summaries, or configuration payloads with a persistent label and validation feedback. Use Input for single-line text.",
    example: {
      title: "Write release notes",
      description: "Type into the textarea or compare helper, error, read-only, and resize states.",
    },
    tips: [
      "Use rows to set the initial height and resize to control whether people can drag-resize the field.",
      "Both native onChange and onValueChange are supported for controlled forms.",
    ],
    accessibility: accessibilityGuides.Textarea,
  },
  Fieldset: {
    use: "Group related controls into an understandable form section using native fieldset and legend semantics.",
    example: {
      title: "Group workspace profile fields",
      description:
        "Related text, multiline, and switch controls share one legend and supporting description.",
    },
    tips: [
      "Use Fieldset when several controls answer a shared question or belong to the same settings section; nested Switch controls default to the compact sm track.",
      "Pass disabled on Fieldset to lock every descendant control during saving or archival states.",
    ],
    accessibility: accessibilityGuides.Fieldset,
  },
  FormActions: {
    use: "Align submit, reset, and cancel buttons at the footer of a form or section with consistent wrapping.",
    example: {
      title: "Finish a form with clear actions",
      description:
        "Compare end-aligned, divided, and split action rows for settings and editing forms.",
    },
    tips: [
      "Set type='submit' on the primary action and type='button' or type='reset' on secondary actions.",
      "Use align='between' when a reset or secondary action sits opposite the primary submit button.",
    ],
    accessibility: accessibilityGuides.FormActions,
  },
  ErrorSummary: {
    use: "Summarize validation problems at the top of a form after submission and link each message to its field.",
    example: {
      title: "Recover from validation errors",
      description:
        "Select an error link in the form recovery example to move keyboard focus directly to the invalid field.",
    },
    tips: [
      "Pass an empty items array before submission or once errors are resolved; ErrorSummary renders nothing when empty.",
      "Focus the ErrorSummary ref when a submit attempt fails so keyboard and screen-reader users hear the summary first.",
    ],
    accessibility: accessibilityGuides.ErrorSummary,
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
    accessibility: accessibilityGuides.Toolbar,
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
    accessibility: accessibilityGuides.Tooltip,
  },
};
