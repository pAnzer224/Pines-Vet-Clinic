import React from "react";

const InputField = ({
  label,
  type,
  value,
  onChange,
  name,
  required,
  error,
}) => {
  return (
    <div className="relative">
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={`peer h-10 w-full px-4 py-4 rounded-xl bg-green3/10 text-text placeholder-transparent focus:outline-none transition-all ease-in-out duration-200 font-medium 
                     pt-2 peer-focus:pt-4 peer-placeholder-shown:pt-2
                     ${
                       error ? "border-2 border-red-500" : "border-transparent"
                     }`}
        placeholder=" "
        required={required}
      />
      <label
        htmlFor={name}
        className="absolute left-4 -top-5 text-text text-sm font-medium transition-all duration-200 ease-in-out 
                     peer-placeholder-shown:top-2 peer-placeholder-shown:text-base 
                     peer-focus:-top-4 peer-focus:text-xs"
      >
        {label}
      </label>
      {error && (
        <p className="text-red-500 text-xs mt-1 absolute left-4">{error}</p>
      )}
    </div>
  );
};

export default InputField;
