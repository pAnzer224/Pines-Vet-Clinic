import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Menu } from "lucide-react";

function MainHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[60px] bg-background py-4 px-4 sm:px-8 md:px-20 flex justify-between items-center border-b font-nunito-bold tracking-wide">
      <Link to="/">
        <img
          src="/images/HPLogo.svg" // Change to actual logo
          alt="Highland Petvibes temp logo"
          className="h-8 md:h-12"
        />
      </Link>

      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="md:hidden text-green2"
      >
        <Menu size={24} />
      </button>

      <div
        className={`${
          isMenuOpen ? "flex" : "hidden"
        } md:flex flex-col md:flex-row items-center gap-3 md:gap-5 text-sm
        absolute md:static top-[60px] left-0 right-0 bg-background md:bg-transparent p-4 md:p-0
        border-b md:border-b-0`}
      >
        <Link
          to="/login"
          className="text-green2 hover:text-primary flex items-center gap-1 w-full md:w-auto justify-center"
          onClick={() => setIsMenuOpen(false)}
        >
          <span>Log in</span>
        </Link>
        <Link
          to="/signup"
          className="text-background hover:text-primary flex items-center gap-1 border px-5 py-2 rounded-md bg-green3 hover:bg-green3/80 w-full md:w-auto justify-center"
          onClick={() => setIsMenuOpen(false)}
        >
          <span>Join Now</span>
          <ArrowRight className="size-5" />
        </Link>
      </div>
    </header>
  );
}

export default MainHeader;
