import "../globals.css";
import type { ReactNode } from "react";
import { NavBar } from "./components/navBar";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="scroll-motion-slider">
      <NavBar />
      {children}
    </div>
  );
}
