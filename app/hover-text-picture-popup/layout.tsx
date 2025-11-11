import "../globals.css";
import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="m-0 box-border bg-white p-0 font-sans">{children}</div>
    </>
  );
}
