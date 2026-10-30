import type { Meta } from "@storybook/react-vite";
import { placementStory } from "../../protocol/placement-story";
import { Button } from "../Button/Button";
import { Panel } from "./Panel";
import { placement } from "./Panel.placement";

const meta = { title: "Placement/Panel", tags: ["!dev", "!autodocs"] } satisfies Meta;
export default meta;

const actions = () => (
  <Panel aria-labelledby="members-title">
    <Panel.Header>
      <h3 id="members-title">Workspace members and pending invitations</h3>
      <Panel.Toolbar>
        <Button variant="ghost" size="sm">
          Filter
        </Button>
        <Button variant="secondary" size="sm">
          Export
        </Button>
      </Panel.Toolbar>
    </Panel.Header>
    <Panel.Body>People who can open this workspace.</Panel.Body>
    <Panel.Footer>
      <Button variant="ghost">Cancel</Button>
      <Button variant="primary">Save</Button>
    </Panel.Footer>
  </Panel>
);

const toggle = () => (
  <Panel collapsible defaultOpen aria-labelledby="activity-title">
    <Panel.Header>
      <h3 id="activity-title">Recent workspace activity and audit history</h3>
      <Panel.Toggle>Toggle</Panel.Toggle>
    </Panel.Header>
    <Panel.Body>Only the body collapses.</Panel.Body>
  </Panel>
);

export const PlacementCompact = placementStory(placement[0], "compact", actions);
export const PlacementMedium = placementStory(placement[0], "medium", actions);
export const PlacementWide = placementStory(placement[0], "wide", actions);
export const ToggleCompact = placementStory(placement[1], "compact", toggle);
export const ToggleMedium = placementStory(placement[1], "medium", toggle);
export const ToggleWide = placementStory(placement[1], "wide", toggle);
