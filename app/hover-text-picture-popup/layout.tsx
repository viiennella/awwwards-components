import "../globals.css";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="m-0 box-border bg-white p-0 font-sans">{children}</div>
    </>
  );
}
