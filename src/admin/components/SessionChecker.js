import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SessionChecker = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = () => {
      const isAuthenticated =
        localStorage.getItem("adminAuthenticated") === "true";

      if (isAuthenticated) {
        const authTime = parseInt(localStorage.getItem("adminAuthTime") || "0");
        const timeoutMinutes = parseInt(
          localStorage.getItem("sessionTimeout") || "30"
        );
        const currentTime = new Date().getTime();

        if (currentTime - authTime > timeoutMinutes * 60 * 1000) {
          localStorage.removeItem("adminAuthenticated");
          localStorage.removeItem("adminAuthTime");
          navigate("/admin/login");
          alert("Your session has expired. Please log in again.");
        }
      }
    };

    const interval = setInterval(checkSession, 60 * 1000);
    checkSession();

    return () => clearInterval(interval);
  }, [navigate]);

  useEffect(() => {
    const resetTimer = () => {
      const isAuthenticated =
        localStorage.getItem("adminAuthenticated") === "true";
      if (isAuthenticated) {
        localStorage.setItem("adminAuthTime", new Date().getTime().toString());
      }
    };

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);
    window.addEventListener("scroll", resetTimer);

    return () => {
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
      window.removeEventListener("scroll", resetTimer);
    };
  }, []);

  return null;
};

export default SessionChecker;
