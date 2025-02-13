import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Menu } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import NotificationButton from "./NotificationButton";

function MainHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const firstName = currentUser?.displayName
    ? currentUser.displayName.split(" ")[0]
    : "User";

  const handleProfileClick = () => {
    navigate("/user/profile");
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate("/login");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[60px] bg-background py-4 px-4 sm:px-8 md:px-20 flex justify-between items-center border-b font-nunito-bold tracking-wide">
      <Link to="/">
        <img
          src="/images/PVClogo.svg"
          alt="Pines Vet Clinic Logo"
          className="h-8 md:h-12"
        />
      </Link>

      <div className="flex items-center gap-2">
        {currentUser && (
          <div className="flex items-center">
            <NotificationButton />
          </div>
        )}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-green2"
        >
          <Menu size={24} />
        </button>
        <div
          className={`${
            isMenuOpen ? "flex" : "hidden"
          }  md:flex flex-col md:flex-row items-center gap-3 md:gap-2 text-sm
          absolute md:static top-[60px] right-0 bg-background md:bg-transparent p-4 md:p-0
          border-b md:border-b-0 w-48 md:w-auto rounded-bl-xl`}
        >
          {!currentUser ? (
            <>
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
            </>
          ) : (
            <>
              <div className="relative group md:hover-trigger">
                <Link
                  to="/user/profile"
                  className="flex items-center gap-2 text-green2 hover:text-primary w-full md:w-auto justify-center"
                >
                  <img
                    src="/images/profile.svg"
                    alt="Profile"
                    className="size-6 mb-[0.4px]"
                  />
                  <span>Hi, {firstName}</span>
                </Link>
                <div className="hidden md:group-hover:block absolute top-full left-0 pt-2">
                  <button
                    className="w-full bg-background border border-background rounded-md p-2 shadow-md flex items-center justify-center text-green2 hover:text-background hover:bg-[#A5D4AE] whitespace-nowrap"
                    onClick={handleProfileClick}
                  >
                    <span>View Profile</span>
                  </button>
                </div>
                <button
                  className="md:hidden ml-[5px] w-[157px] mt-4 bg-background border-2 border-green2 rounded-md p-2 flex items-center justify-center text-green2 hover:text-primary"
                  onClick={handleProfileClick}
                >
                  <span>View Profile</span>
                </button>
              </div>

              <button
                onClick={handleLogout}
                className="ml-1 text-background hover:text-primary flex items-center gap-1 border-2  px-5 py-2 rounded-md bg-green3 hover:bg-green3/80 w-full md:w-auto justify-center"
              >
                <span>Log out</span>
                <ArrowRight className="size-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default MainHeader;
