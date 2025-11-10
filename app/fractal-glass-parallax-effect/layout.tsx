import "../globals.css";
import { NavBar } from "./components/navBar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavBar />
      <div>{children}</div>
    </>
  );
}
