import React from "react";

const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center w-full min-h-[420px]">
      <div className="half-circle-spinner">
        <div className="circle circle-1"></div>
        <div className="circle circle-2"></div>
      </div>
      <style jsx>{`
        .half-circle-spinner,
        .half-circle-spinner * {
          box-sizing: border-box;
        }
        .half-circle-spinner {
          width: 60px;
          height: 60px;
          border-radius: 100%;
          position: relative;
        }
        .half-circle-spinner .circle {
          content: "";
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 100%;
          border: calc(60px / 10) solid transparent;
        }
        .half-circle-spinner .circle.circle-1 {
          border-top-color: #5b9279;
          animation: half-circle-spinner-animation 1s infinite;
        }
        .half-circle-spinner .circle.circle-2 {
          border-bottom-color: #8fcb9b;
          animation: half-circle-spinner-animation 1s infinite alternate;
        }
        @keyframes half-circle-spinner-animation {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
