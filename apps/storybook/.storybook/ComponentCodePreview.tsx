import * as components from "@kb.ui/react";
import * as React from "react";
import type { CodeRequest, CodeResult } from "../site/component-code";

const modules = { react: React, "@kb.ui/react": components };
type Candidate = { request: CodeRequest; Component: React.ComponentType };

class RenderBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode; onError: (error: unknown) => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    this.props.onError(error);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function Commit({ onCommit }: { onCommit: () => void }) {
  React.useLayoutEffect(onCommit, [onCommit]);
  return null;
}

export function ComponentCodePreview({ children }: { children: React.ReactNode }) {
  const [candidate, setCandidate] = React.useState<Candidate | null>(null);
  const working = React.useRef<Candidate | null>(null);
  const previous = React.useRef<Candidate | null>(null);
  const currentRequest = React.useRef<string | null>(null);
  const completed = React.useRef<CodeResult | null>(null);
  const reply = React.useCallback((result: CodeResult) => {
    if (result.id === currentRequest.current) completed.current = result;
    window.parent.postMessage({ type: "kbui:code-result", ...result }, location.origin);
  }, []);
  React.useEffect(() => {
    let active = true;
    const receive = (event: MessageEvent) => {
      if (
        event.source !== window.parent ||
        event.origin !== location.origin ||
        event.data?.type !== "kbui:code" ||
        typeof event.data.id !== "string" ||
        !(event.data.source === null || typeof event.data.source === "string")
      )
        return;
      const request: CodeRequest = { id: event.data.id, source: event.data.source };
      if (request.id === currentRequest.current) {
        if (completed.current?.id === request.id) reply(completed.current);
        return;
      }
      currentRequest.current = request.id;
      completed.current = null;
      if (request.source === null) {
        working.current = null;
        previous.current = null;
        setCandidate(null);
        reply({ id: request.id });
        return;
      }
      void import("../site/component-code")
        .then(({ compileComponentExample }) => {
          if (!active || request.id !== currentRequest.current) return;
          const Component = compileComponentExample(request.source ?? "", modules);
          previous.current = working.current;
          setCandidate({ request, Component });
        })
        .catch((cause: unknown) => {
          if (active && request.id === currentRequest.current)
            reply({
              id: request.id,
              error: cause instanceof Error ? cause.message : String(cause),
            });
        });
    };
    window.addEventListener("message", receive);
    window.parent.postMessage({ type: "kbui:code-ready" }, location.origin);
    return () => {
      active = false;
      window.removeEventListener("message", receive);
    };
  }, [reply]);
  if (!candidate) return children;
  const Previous = previous.current?.Component;
  return (
    <RenderBoundary
      key={candidate.request.id}
      fallback={Previous ? <Previous /> : children}
      onError={(error) =>
        reply({
          id: candidate.request.id,
          error: error instanceof Error ? error.message : String(error),
        })
      }
    >
      <candidate.Component />
      <Commit
        onCommit={() => {
          working.current = candidate;
          reply({ id: candidate.request.id });
        }}
      />
    </RenderBoundary>
  );
}
