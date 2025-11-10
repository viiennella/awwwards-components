import Link from "next/link";

interface NavLink {
  href: string;
  label: string;
}
export default function Home() {
  const links: NavLink[] = [
    {
      href: "/fractal-glass-parallax-effect",
      label: "Fractal Glass Parallax Effect",
    },
  ];
  return (
    <div>
      {links.map((link) => (
        <Link
          href={link.href}
          key={link.href}
          className="block text-blue-500 hover:underline"
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}
