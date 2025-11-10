"use client";
export function NavBar() {
  return (
    <nav className="fixed w-full p-8 flex justify-between items-start z-2">
      <div className="logo">
        <a href="#">&#8486; Glass form</a>
      </div>

      <div className="flex gap-3.5">
        <a href="#">Experiments</a>
        <a href="#">Objects</a>
        <a href="#">Exhibits</a>
      </div>
    </nav>
  );
}
