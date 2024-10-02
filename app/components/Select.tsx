import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { ReactNode, useState } from "react";

interface Option {
  value: string;
  label: ReactNode;
}

interface SelectProps {
  options: Option[];
  onChange: (option: Option | null) => void;
  selectedOption?: Option | null;
}

const Select = ({ options, onChange, selectedOption }: SelectProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [currentSelectedOption, setCurrentSelectedOption] =
    useState<Option | null>(selectedOption || null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleOptionClick = (option: Option) => {
    setCurrentSelectedOption(option);
    setIsOpen(false);
    onChange(option);
  };

  return (
    <div className="select-container">
      <div className="select-header" onClick={toggleDropdown}>
        {currentSelectedOption
          ? currentSelectedOption.label
          : "Select an option"}
        <span className={`dropdown-icon ${isOpen ? "open" : ""}`}>
          <FontAwesomeIcon icon={faChevronDown} />
        </span>
      </div>

      {isOpen && (
        <ul className="select-options">
          {options.map((option) => (
            <li
              key={option.value}
              onClick={() => handleOptionClick(option)}
              className={`select-option ${
                currentSelectedOption &&
                currentSelectedOption.value === option.value
                  ? "selected"
                  : ""
              }`}
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
