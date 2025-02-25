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

  const scrollToSection = (elementId, headerOffset = 120) => {
    const element = document.getElementById(elementId);
    if (element) {
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;
      smoothScroll(offsetPosition, 700);
    }
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
      // Add this line to scroll to top after navigation
      setTimeout(() => window.scrollTo(0, 0), 100);
      return;
    }

    // Handle standalone pages navigation
    if (standalonePages.includes(item)) {
      navigate(`/${item.toLowerCase()}`);
      return;
    }

    // Special handling for Services
    if (item === "Services") {
      if (location.pathname === "/home") {
        // On home page - use 120px offset
        scrollToSection("services", 120);
      } else {
        // From other pages - navigate to home and use correct offset
        navigate("/home");
        setTimeout(() => {
          // Use different offset when coming from other pages
          scrollToSection("services", 180);
        }, 100);
      }
      return;
    }

    // Handle other sections (if any)
    const sectionId = item.toLowerCase().replace(/ & /g, "-");
    if (location.pathname !== "/home") {
      navigate("/home");
      setTimeout(() => {
        scrollToSection(sectionId, 180);
      }, 100);
    } else {
      scrollToSection(sectionId, 120);
    }
  };

  return (
    <nav
      className={`fixed top-[60px] left-0 right-0 py-4 px-6 flex justify-center items-center transition-all duration-300 z-40 ${
        isScrolled
          ? "bg-background/80 backdrop-blur-lg"
          : "bg-green3 backdrop-filter-none"
      }`}
    >
      <ul className="flex space-x-10 text-sm font-nunito-semibold tracking-wider">
        {["Home", "Services", "Shop", "Appointments"].map((item) => (
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
