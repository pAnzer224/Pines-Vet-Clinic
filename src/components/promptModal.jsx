import React from "react";
import { Link } from "react-router-dom";
import { SquareX } from "lucide-react";

const PromptModal = ({ isOpen, onClose, title, message, actionButtons }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-background rounded-2xl p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          {title && <h2 className="text-2xl font-bold text-text">{title}</h2>}
          <button onClick={onClose} className="text-green2 hover:text-green3">
            <SquareX className="size-7" />
          </button>
        </div>

        {message && <p className="text-text/80 mb-8 text-center">{message}</p>}

        {actionButtons ? (
          <div className="flex justify-center gap-4">
            {actionButtons.map((button) => (
              <button
                key={button.text}
                onClick={button.onClick}
                className="px-6 py-2 rounded-full border-[1.6px] border-green2 bg-green3 hover:bg-green3/80 transition-colors text-text"
              >
                {button.text}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center gap-4 font-nunito-bold text-text/80">
            <Link
              to="/login"
              onClick={onClose}
              className="px-6 py-2 text-center rounded-full border-[1.6px] border-green2 bg-green3 hover:bg-green3/80 transition-colors"
            >
              Log in
            </Link>
            <span className="text-text/60">or</span>
            <Link
              to="/signup"
              onClick={onClose}
              className="px-6 py-2 text-center rounded-full border-[1.6px] border-green2 bg-green3 hover:bg-green3/80 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptModal;
