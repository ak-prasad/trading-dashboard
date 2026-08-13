"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import styles from "./CTADropDown.module.css";

interface Option {
  value: string;
  label: string;
}

interface CTADropDownProps {
  options: Option[];
  selectedValue: string;
  onSelect: (value: string) => void;
  isDark?: boolean;
  width?: string;
}

export default function CTADropDown({
  options,
  selectedValue,
  onSelect,
  isDark = true,
  width = "125px",
}: CTADropDownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = options.find((opt) => opt.value === selectedValue)?.label || selectedValue;

  return (
    <div className={styles.customDropdownContainer} style={{ width }} ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={isDark ? styles.dropdownHeaderDark : styles.dropdownHeaderLight}
      >
        <span>{selectedLabel}</span>
        <ChevronDown size={14} />
      </div>

      {isOpen && (
        <div className={isDark ? styles.dropdownListDark : styles.dropdownListLight}>
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                onSelect(opt.value);
                setIsOpen(false);
              }}
              className={`${styles.dropdownItem} ${
                isDark ? styles.dropdownItemDark : styles.dropdownItemLight
              } ${selectedValue === opt.value ? styles.dropdownItemActive : ""}`}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}