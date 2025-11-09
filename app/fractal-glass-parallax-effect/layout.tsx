import "./styles.css";
import { NavBar } from "./components/navBar";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <NavBar />
      <main>{children}</main>
    </>
  );
}
