import markUrl from "./logo.svg?no-inline";

export function Brand() {
  return (
    <>
      <span className="brand-symbol">
        <img src={markUrl} alt="" width="36" height="36" />
      </span>
      <span>kbui</span>
    </>
  );
}
