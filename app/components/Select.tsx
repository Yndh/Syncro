import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { ReactNode, useEffect, useRef, useState } from "react";

interface Option {
  value: string | number;
  label: ReactNode;
  disabled?: boolean;
}

interface SelectProps {
  options: Option[];
  selectedOption?: Option | null;
  disabled?: boolean;
  id?: string;
  onChange: (option: Option | null) => void;
}

const Select = ({
  options,
  onChange,
  selectedOption,
  disabled = false,
  id = "customSelect",
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [currentSelectedOption, setCurrentSelectedOption] =
    useState<Option | null>(selectedOption || null);
  const selectContainerRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (e: MouseEvent) => {
    if (
      selectContainerRef.current &&
      !selectContainerRef.current.contains(e.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

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
    <div
      className={`select-container ${disabled ? "disabled" : ""}`}
      ref={selectContainerRef}
    >
      <div className="select-header" onClick={toggleDropdown}>
        {currentSelectedOption
          ? currentSelectedOption.label
          : "Select an option"}
        <span className={`dropdown-icon ${isOpen ? "open" : ""}`}>
          <FontAwesomeIcon icon={faChevronDown} />
        </span>
      </div>

      <ul className={`select-options ${isOpen && "visible"}`}>
        {options.map((option) => (
          <li
            key={option.value}
            data-value={option.value}
            onClick={() => handleOptionClick(option)}
            className={`select-option ${
              currentSelectedOption
                ? currentSelectedOption.value === option.value
                  ? "selected"
                  : ""
                : ""
            } ${option.disabled ? "disabled" : ""}`}
            id={
              currentSelectedOption &&
              currentSelectedOption.value === option.value
                ? id
                : ""
            }
          >
            {option.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Select;
