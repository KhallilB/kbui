import "@kbui/css/styles.css";
import { Button, Card, Dialog, Grid, Input } from "@kbui/react";

export const App = () => (
  <Grid>
    <Card>
      <Dialog>
        <Dialog.Trigger render={<Button />}>Delete</Dialog.Trigger>
        <Dialog.Content title="Delete project" description="This cannot be undone.">
          <Input label="Type the project name" />
          <Dialog.Actions>
            <Dialog.Close render={<Button variant="ghost" />}>Cancel</Dialog.Close>
            <Button variant="danger">Delete</Button>
          </Dialog.Actions>
        </Dialog.Content>
      </Dialog>
    </Card>
  </Grid>
);
