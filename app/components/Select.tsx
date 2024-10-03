import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { ReactNode, useState } from "react";

interface Option {
  value: string | number;
  label: ReactNode;
  disabled?: boolean;
}

interface SelectProps {
  options: Option[];
  selectedOption?: Option | null;
  disabled?: boolean;
  onChange: (option: Option | null) => void;
}

const Select = ({
  options,
  onChange,
  selectedOption,
  disabled = false,
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [currentSelectedOption, setCurrentSelectedOption] =
    useState<Option | null>(selectedOption || null);

  const toggleDropdown = () => {
    if (!disabled) setIsOpen(!isOpen);
  };

  const handleOptionClick = (option: Option) => {
    if (option.disabled) {
      return;
    }

    setCurrentSelectedOption(option);
    setIsOpen(false);
    onChange(option);
  };

  return (
    <div className={`select-container ${disabled && "disabled"}`}>
      <div className="select-header" onClick={toggleDropdown}>
        {currentSelectedOption
          ? currentSelectedOption.label
          : "Select an option"}
        <span className={`dropdown-icon ${isOpen ? "open" : ""}`}>
          <FontAwesomeIcon icon={faChevronDown} />
        </span>
      </div>

      {isOpen && (
        <ul className="select-options ${}">
          {options.map((option) => (
            <li
              key={option.value}
              onClick={() => handleOptionClick(option)}
              className={`select-option ${
                currentSelectedOption &&
                currentSelectedOption.value === option.value
                  ? "selected"
                  : ""
              } ${option.disabled && "disabled"}`}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Select;
