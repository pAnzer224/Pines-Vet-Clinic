import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function SubHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 88);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const smoothScroll = (targetPosition, duration = 700) => {
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;

    function animation(currentTime) {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);

      const easeInOutCubic = (progress) => {
        return progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      };

      window.scrollTo(0, startPosition + distance * easeInOutCubic(progress));

      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      }
    }

    requestAnimationFrame(animation);
  };

  const handleClick = async (item) => {
    // Define pages that should always navigate to their standalone versions
    const standalonePages = ["Shop", "Appointments", "Login", "Signup"];

    // Handle Home navigation
    if (item === "Home") {
      if (location.pathname !== "/home") {
        navigate("/home");
        setTimeout(() => window.scrollTo(0, 0), 100);
      } else {
        smoothScroll(0, 700);
      }
      return;
    }

    // Handle standalone pages navigation
    if (standalonePages.includes(item)) {
      navigate(`/${item.toLowerCase()}`);
      return;
    }

    // Special handling for Grooming & Boarding
    if (item === "Grooming & Boarding") {
      const currentPath = location.pathname.toLowerCase();
      const nonHomePages = ["/shop", "/appointments", "/login", "/signup"];

      if (currentPath === "/home") {
        // On home page - scroll to section
        const element = document.getElementById("grooming-boarding");
        if (element) {
          const headerOffset = 120;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition =
            elementPosition + window.pageYOffset - headerOffset;
          smoothScroll(offsetPosition, 700);
        }
      } else if (currentPath === "/grooming-boarding") {
        // Already on standalone page - do nothing or scroll to top
        window.scrollTo(0, 0);
      } else if (nonHomePages.includes(currentPath)) {
        // From other pages - navigate to standalone page
        navigate("/grooming-boarding", { state: { fromHome: true } });
      } else {
        // From any other location - navigate to home and scroll
        navigate("/home");
        setTimeout(() => {
          const element = document.getElementById("grooming-boarding");
          if (element) {
            const headerOffset = 120;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition =
              elementPosition + window.pageYOffset - headerOffset;
            smoothScroll(offsetPosition, 700);
          }
        }, 100);
      }
      return;
    }

    // Handle other sections (if any)
    const sectionId = item.toLowerCase().replace(/ & /g, "-");
    if (location.pathname !== "/home") {
      navigate("/home");
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          const headerOffset = 120;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition =
            elementPosition + window.pageYOffset - headerOffset;
          smoothScroll(offsetPosition, 700);
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        const headerOffset = 120;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - headerOffset;
        smoothScroll(offsetPosition, 700);
      }
    }
  };

  return (
    <nav
      className={`fixed top-[60px] left-0 right-0 py-4 px-6 flex justify-center items-center transition-all duration-300 z-40 ${
        isScrolled
          ? "bg-background/85 backdrop-blur-lg"
          : "bg-green3 backdrop-filter-none"
      }`}
    >
      <ul className="flex space-x-10 text-sm font-nunito-medium tracking-wider">
        {["Home", "Grooming & Boarding", "Shop", "Appointments"].map((item) => (
          <li key={item}>
            <button
              onClick={() => handleClick(item)}
              className={`transition-colors ${
                isScrolled
                  ? "text-green2 hover:text-primary"
                  : "text-background hover:text-background/80"
              }`}
            >
              {item}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default SubHeader;
