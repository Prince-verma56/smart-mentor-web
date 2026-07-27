"use client";

import { ChevronDown, Search, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

const ROTATION_ANGLE_OPEN = 180;

export interface SearchableDropdownItem {
  description?: string;
  icon?: React.ReactNode;
  id: string | number;
  label: string;
}

export interface SearchableDropdownProps {
  className?: string;
  emptyMessage?: string;
  items: SearchableDropdownItem[];
  label: string;
  onChange?: (item: SearchableDropdownItem) => void;
  onSearchChange?: (value: string) => void;
  placeholder?: string;
  value?: string;
}

export default function SearchableDropdown({
  label,
  items,
  onChange,
  onSearchChange,
  placeholder = "Search...",
  emptyMessage = "No results found",
  className = "",
  value,
}: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] =
    useState<SearchableDropdownItem | null>(null);
  const [internalSearchQuery, setInternalSearchQuery] = useState("");
  const searchQuery = value !== undefined ? value : internalSearchQuery;
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const shouldReduceMotion = useReducedMotion();

  const filteredItems = useMemo(() => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) {
      return items;
    }

    // Cache lowercase query to avoid repeated calls
    const query = trimmedQuery.toLowerCase();
    const itemsLength = items.length;
    const results: typeof items = [];

    // Early exit optimization: use for loop instead of filter for better performance
    for (let i = 0; i < itemsLength; i++) {
      const item = items[i];
      const label = item.label.toLowerCase();
      const description = item.description?.toLowerCase();

      if (label.includes(query) || description?.includes(query)) {
        results.push(item);
      }
    }

    return results;
  }, [items, searchQuery]);

  const handleItemSelect = (item: SearchableDropdownItem) => {
    setSelectedItem(item);
    setIsOpen(false);
    if (value === undefined) setInternalSearchQuery(item.label);
    onChange?.(item);
  };

  const handleClearSearch = () => {
    if (value === undefined) setInternalSearchQuery("");
    onSearchChange?.("");
    inputRef.current?.focus();
  };

  const handleToggle = () => {
    if (!isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  // Update position on scroll/resize when open
  useEffect(() => {
    if (!(isOpen && dropdownRef.current)) {
      return;
    }

    const updatePosition = () => {
      if (dropdownRef.current) {
        const rect = dropdownRef.current.getBoundingClientRect();
        setPosition({
          top: rect.bottom + 4,
          left: rect.left,
          width: rect.width,
        });
      }
    };

    updatePosition(); // Calculate immediately when opened

    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        isOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        portalRef.current &&
        !portalRef.current.contains(target)
      ) {
        setIsOpen(false);
        // Do not clear the search text when clicking outside
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Keyboard navigation with arrow keys, enter, and escape
  const [focusedIndex, setFocusedIndex] = useState(-1);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) {
        // Open dropdown on Enter or Space when input is focused
        if (
          (event.key === "Enter" || event.key === " ") &&
          document.activeElement === inputRef.current
        ) {
          event.preventDefault();
          handleToggle();
        }
        return;
      }

      if (event.key === "Escape") {
        setIsOpen(false);
        setFocusedIndex(-1);
        inputRef.current?.blur();
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        setFocusedIndex((prev) =>
          prev < filteredItems.length - 1 ? prev + 1 : 0
        );
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setFocusedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredItems.length - 1
        );
      } else if (event.key === "Enter" && focusedIndex >= 0) {
        event.preventDefault();
        const item = filteredItems[focusedIndex];
        if (item) {
          handleItemSelect(item);
        }
      } else if (event.key === "Home") {
        event.preventDefault();
        setFocusedIndex(0);
      } else if (event.key === "End") {
        event.preventDefault();
        setFocusedIndex(filteredItems.length - 1);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
    // biome-ignore lint/correctness/useExhaustiveDependencies: Handlers are stable via closure
  }, [isOpen, filteredItems, focusedIndex, handleItemSelect, handleToggle]);

  // Reset focused index when items change
  useEffect(() => {
    setFocusedIndex(-1);
  }, []);

  const dropdownContent = (
    <AnimatePresence>
      {isOpen && (
        <div ref={portalRef}>
          <motion.div
            animate={
              shouldReduceMotion
                ? { opacity: 1 }
                : { opacity: 1, y: 0, scaleY: 1 }
            }
            className="fixed z-50 origin-top overflow-hidden rounded-xl border border-white/[0.1] bg-[#030712]/95 shadow-2xl backdrop-blur-xl"
            exit={
              shouldReduceMotion
                ? { opacity: 0, transition: { duration: 0 } }
                : {
                    opacity: 0,
                    y: -10,
                    scaleY: 0.8,
                    transition: { duration: 0.15 },
                  }
            }
            initial={
              shouldReduceMotion
                ? { opacity: 1 }
                : { opacity: 0, y: -10, scaleY: 0.8 }
            }
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
              width: `${position.width}px`,
            }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : {
                    type: "spring" as const,
                    stiffness: 400,
                    damping: 30,
                    mass: 0.8,
                    duration: 0.25,
                  }
            }
          >
            {/* Items List */}
            <ul
              aria-label="Dropdown options"
              className="max-h-60 overflow-y-auto py-2"
              id="dropdown-items"
            >
              <AnimatePresence mode="popLayout">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item, index) => (
                    <motion.li
                      animate={
                        shouldReduceMotion
                          ? { opacity: 1 }
                          : { opacity: 1, x: 0, filter: "blur(0px)" }
                      }
                      aria-selected={
                        selectedItem?.id === item.id || index === focusedIndex
                      }
                      className="block"
                      exit={
                        shouldReduceMotion
                          ? { opacity: 0, transition: { duration: 0 } }
                          : { opacity: 0, x: -10, filter: "blur(4px)" }
                      }
                      initial={
                        shouldReduceMotion
                          ? { opacity: 1 }
                          : { opacity: 0, x: -10, filter: "blur(4px)" }
                      }
                      key={item.id}
                      layout
                      role="option"
                      transition={
                        shouldReduceMotion
                          ? { duration: 0 }
                          : {
                              type: "spring" as const,
                              stiffness: 400,
                              damping: 28,
                              mass: 0.6,
                              delay: index * 0.02,
                              duration: 0.2,
                            }
                      }
                    >
                      <button
                        aria-label={`${item.label}${item.description ? `, ${item.description}` : ""}`}
                        className={`flex min-h-[44px] w-full items-center px-4 py-2 text-left text-sm transition-colors hover:bg-white/[0.05] focus-visible:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500/50 ${
                          selectedItem?.id === item.id
                            ? "font-medium text-emerald-400"
                            : "text-muted-foreground hover:text-foreground"
                        } ${index === focusedIndex ? "bg-white/[0.05]" : ""}`}
                        onClick={() => handleItemSelect(item)}
                        onMouseEnter={() => setFocusedIndex(index)}
                        type="button"
                      >
                        {item.icon && (
                          <span className="mr-3 shrink-0">{item.icon}</span>
                        )}
                        <div className="min-w-0 flex-1">
                          <span className="block truncate">{item.label}</span>
                          {item.description && (
                            <span className="block truncate text-muted-foreground text-xs">
                              {item.description}
                            </span>
                          )}
                        </div>

                        {selectedItem?.id === item.id && (
                          <motion.span
                            animate={shouldReduceMotion ? {} : { scale: 1 }}
                            className="ml-2 shrink-0"
                            initial={shouldReduceMotion ? {} : { scale: 0 }}
                            transition={
                              shouldReduceMotion
                                ? { duration: 0 }
                                : {
                                    type: "spring" as const,
                                    stiffness: 400,
                                    damping: 25,
                                    mass: 0.5,
                                    duration: 0.2,
                                  }
                            }
                          >
                            <svg
                              className="h-4 w-4 text-brand"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <title>Selected</title>
                              <path
                                d="M5 13l4 4L19 7"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                              />
                            </svg>
                          </motion.span>
                        )}
                      </button>
                    </motion.li>
                  ))
                ) : (
                  <motion.li
                    animate={{ opacity: 1 }}
                    className="px-4 py-8 text-center text-muted-foreground text-sm"
                    initial={
                      shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }
                    }
                    transition={
                      shouldReduceMotion
                        ? { duration: 0 }
                        : {
                            type: "spring" as const,
                            stiffness: 400,
                            damping: 25,
                            duration: 0.2,
                          }
                    }
                  >
                    {emptyMessage}
                  </motion.li>
                )}
              </AnimatePresence>
            </ul>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <div className={`relative inline-block w-full group/search ${className}`} ref={dropdownRef}>
        <div className="relative flex items-center h-10 w-full bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] hover:border-emerald-500/40 hover:bg-white/[0.04] focus-within:border-emerald-500/50 focus-within:bg-white/[0.05] focus-within:ring-1 focus-within:ring-emerald-500/20 rounded-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] overflow-hidden transition-all duration-300">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 group-hover/search:text-primary transition-colors z-10" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              const val = e.target.value;
              if (value === undefined) setInternalSearchQuery(val);
              onSearchChange?.(val);
              if (!isOpen) setIsOpen(true);
              setFocusedIndex(-1);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={label || placeholder}
            className="w-full h-full pl-9 pr-12 text-[13px] bg-transparent text-foreground placeholder:text-muted-foreground/40 outline-none absolute inset-0"
            aria-expanded={isOpen}
            role="combobox"
            aria-autocomplete="list"
            aria-controls="dropdown-items"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 z-10">
            <span className="flex items-center justify-center h-[22px] px-2 rounded-md bg-white/[0.05] text-[10px] font-semibold text-white/50 border border-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] pointer-events-none select-none">
              ⌘K
            </span>
          </div>
        </div>
      </div>
      {typeof window !== "undefined" &&
        createPortal(dropdownContent, document.body)}
    </>
  );
}
