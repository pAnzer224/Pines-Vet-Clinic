import React from "react";

const InputField = ({ label, type, value, onChange, id, required }) => {
  return (
    <div className="relative">
      <input
        type={type}
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        className="peer h-10 w-full px-4 py-4 rounded-xl bg-green3/10 text-text placeholder-transparent focus:outline-none transition-all ease-in-out duration-200 font-medium 
                     pt-2 peer-focus:pt-4 peer-placeholder-shown:pt-2"
        placeholder=" "
        required={required}
      />
      <label
        htmlFor={id}
        className="absolute left-4 -top-5 text-text text-sm font-medium transition-all duration-200 ease-in-out 
                     peer-placeholder-shown:top-2 peer-placeholder-shown:text-base 
                     peer-focus:-top-5 peer-focus:text-sm"
      >
        {label}
      </label>
    </div>
  );
};

export default InputField;
