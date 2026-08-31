import React, { useState, useRef, useEffect, useCallback } from "react";

/**
 * SDG Goals data — used as default nested options for "SDG" parent.
 */
export const SDG_GOALS = [
  "SDG 1: No Poverty",
  "SDG 2: Zero Hunger",
  "SDG 3: Good Health and Well-being",
  "SDG 4: Quality Education",
  "SDG 5: Gender Equality",
  "SDG 6: Clean Water and Sanitation",
  "SDG 7: Affordable and Clean Energy",
  "SDG 8: Decent Work and Economic Growth",
  "SDG 9: Industry, Innovation and Infrastructure",
  "SDG 10: Reduced Inequalities",
  "SDG 11: Sustainable Cities and Communities",
  "SDG 12: Responsible Consumption and Production",
  "SDG 13: Climate Action",
  "SDG 14: Life Below Water",
  "SDG 15: Life on Land",
  "SDG 16: Peace, Justice and Strong Institutions",
  "SDG 17: Partnerships for the Goals",
];

export default function CustomSelect({
  label,
  options = [],
  value,
  onChange,
  required,
  labelBg = "#16162A",
  borderColor = "#3A3A5A",
  readOnly = false,
  placeholder = "",
  multi = false,
  searchable = false,
  nestedOptions = {},   // e.g. { "SDG": ["SDG 1: No Poverty", ...] }
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [expandedParent, setExpandedParent] = useState(null);
  const [focusIndex, setFocusIndex] = useState(-1);
  const ref = useRef(null);
  const searchRef = useRef(null);
  const listRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
        setExpandedParent(null);
        setFocusIndex(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus search when dropdown opens
  useEffect(() => {
    if (open && (searchable || multi) && searchRef.current) {
      searchRef.current.focus();
    }
    if (!open) {
      setFocusIndex(-1);
      setExpandedParent(null);
    }
  }, [open, searchable, multi]);

  // Normalize value for multi mode
  const selectedArr = multi
    ? Array.isArray(value) ? value : value ? [value] : []
    : [];

  const filteredOptions = (searchable || multi)
    ? options.filter((o) => {
        const matchesSelf = o.toLowerCase().includes(search.toLowerCase());
        // Also keep parent if any nested child matches
        const nested = nestedOptions[o];
        if (nested) {
          const childMatch = nested.some(c => c.toLowerCase().includes(search.toLowerCase()));
          return matchesSelf || childMatch;
        }
        return matchesSelf;
      })
    : options;

  const derivedPlaceholder =
    placeholder ||
    (label ? `Select ${label.replace(/\s*\*$/, "").toLowerCase()}` : "Select");

  // Build a flat list of visible items for keyboard nav
  const buildFlatList = useCallback(() => {
    const items = [];
    const opts = multi ? (() => {
      const sorted = [
        ...filteredOptions.filter((o) => {
          if (nestedOptions[o]) {
            const nested = nestedOptions[o];
            return nested.some(c => selectedArr.includes(c));
          }
          return selectedArr.includes(o);
        }),
        ...filteredOptions.filter((o) => {
          if (nestedOptions[o]) {
            const nested = nestedOptions[o];
            return !nested.some(c => selectedArr.includes(c));
          }
          return !selectedArr.includes(o);
        }),
      ];
      return sorted;
    })() : filteredOptions;

    for (const opt of opts) {
      items.push({ type: "option", value: opt });
      if (nestedOptions[opt] && expandedParent === opt) {
        const filteredNested = search
          ? nestedOptions[opt].filter(c => c.toLowerCase().includes(search.toLowerCase()))
          : nestedOptions[opt];
        for (const child of filteredNested) {
          items.push({ type: "nested", parent: opt, value: child });
        }
      }
    }
    return items;
  }, [filteredOptions, expandedParent, nestedOptions, search, multi, selectedArr]);

  // ── Single-select ─────────────────────────────────────────────────────────
  if (!multi) {
    return (
      <div className="relative w-full" ref={ref}>
        <span
          className="absolute left-3 -top-[9px] text-xs text-white px-1 z-10 pointer-events-none"
          style={{ backgroundColor: labelBg }}
        >
          {label} {required && "*"}
        </span>

        <div
          onClick={() => {
            if (!readOnly) {
              setOpen(!open);
            }
          }}
          className={`w-full bg-transparent border rounded-lg p-3.5 flex items-center justify-between transition-colors duration-200 ${
              readOnly
                ? "cursor-not-allowed opacity-70"
                : "cursor-pointer"
            }`}
          style={{
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor: open ? "#a855f7" : borderColor,
            height: "47px",
          }}
        >
          <span className={value ? "text-white text-sm" : "text-gray-500 text-sm"}>
            {value || <span className="text-gray-500">{derivedPlaceholder}</span>}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16" height="16"
            viewBox="0 0 24 24"
            fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>

        {open && (
          <div className="absolute top-full mt-1 w-full bg-[#1E1E2F] border border-[#3A3A5A] rounded-lg z-20 max-h-60 overflow-hidden flex flex-col">
            {searchable && (
              <div className="p-2 border-b border-[#3A3A5A]">
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full bg-[#16162A] text-white text-sm rounded-md px-3 py-1.5 focus:outline-none border border-[#3A3A5A] focus:border-purple-500 placeholder-gray-500"
                />
              </div>
            )}
            <div className="overflow-y-auto max-h-48 custom-scrollbar">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500">No results</div>
              ) : (
                filteredOptions.map((opt, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      if (readOnly) return;

                      onChange(opt);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                      value === opt
                        ? "bg-purple-600 text-white"
                        : "text-white hover:bg-purple-500/30"
                    }`}
                  >
                    {opt}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Multi-select with nested support ──────────────────────────────────────

  const hasNested = (opt) => nestedOptions[opt] && nestedOptions[opt].length > 0;

  const getNestedChildren = (opt) => {
    if (!hasNested(opt)) return [];
    if (search) {
      return nestedOptions[opt].filter(c =>
        c.toLowerCase().includes(search.toLowerCase())
      );
    }
    return nestedOptions[opt];
  };

  // Check if a parent's children are all selected
  const allChildrenSelected = (parentOpt) => {
    const children = nestedOptions[parentOpt] || [];
    return children.length > 0 && children.every(c => selectedArr.includes(c));
  };

  // Check if some (but not all) children are selected
  const someChildrenSelected = (parentOpt) => {
    const children = nestedOptions[parentOpt] || [];
    return children.some(c => selectedArr.includes(c)) && !allChildrenSelected(parentOpt);
  };

  const toggleOption = (opt) => {
    // If this option has nested children, toggle all children
    if (hasNested(opt)) {
      const children = nestedOptions[opt];
      if (allChildrenSelected(opt)) {
        // Deselect all children
        const next = selectedArr.filter(s => !children.includes(s));
        onChange(next);
      } else {
        // Select all children
        const next = [...new Set([...selectedArr, ...children])];
        onChange(next);
      }
      return;
    }

    const next = selectedArr.includes(opt)
      ? selectedArr.filter((s) => s !== opt)
      : [...selectedArr, opt];
    onChange(next);
  };

  const toggleNestedChild = (child) => {
    const next = selectedArr.includes(child)
      ? selectedArr.filter((s) => s !== child)
      : [...selectedArr, child];
    onChange(next);
  };

  // Sort: selected items first (for parents, check if any child is selected)
  const sortedOptions = [
    ...filteredOptions.filter((o) => {
      if (hasNested(o)) {
        return (nestedOptions[o] || []).some(c => selectedArr.includes(c));
      }
      return selectedArr.includes(o);
    }),
    ...filteredOptions.filter((o) => {
      if (hasNested(o)) {
        return !(nestedOptions[o] || []).some(c => selectedArr.includes(c));
      }
      return !selectedArr.includes(o);
    }),
  ];

  // Build display value — show nested selections grouped
  const buildDisplayValue = () => {
    const parts = [];
    for (const opt of options) {
      if (hasNested(opt)) {
        const selectedChildren = (nestedOptions[opt] || []).filter(c => selectedArr.includes(c));
        if (selectedChildren.length > 0) {
          if (allChildrenSelected(opt)) {
            parts.push(`${opt} (All)`);
          } else {
            // Show short labels: "SDG 1, 3, 5"
            const nums = selectedChildren.map(c => {
              const match = c.match(/^SDG\s+(\d+)/);
              return match ? match[1] : c;
            });
            parts.push(`${opt} ${nums.join(", ")}`);
          }
        }
      } else if (selectedArr.includes(opt)) {
        parts.push(opt);
      }
    }
    return parts.join(" / ");
  };

  const displayValue = buildDisplayValue();

  // Keyboard handler
  const handleKeyDown = (e) => {
    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }

    const flatList = buildFlatList();
    const maxIdx = flatList.length - 1;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusIndex(prev => Math.min(prev + 1, maxIdx));
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusIndex(prev => Math.max(prev - 1, 0));
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (focusIndex >= 0 && focusIndex <= maxIdx) {
          const item = flatList[focusIndex];
          if (item.type === "option") {
            if (hasNested(item.value)) {
              setExpandedParent(prev => prev === item.value ? null : item.value);
            } else {
              toggleOption(item.value);
            }
          } else if (item.type === "nested") {
            toggleNestedChild(item.value);
          }
        }
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        setSearch("");
        setExpandedParent(null);
        setFocusIndex(-1);
        break;
      case "ArrowRight":
        if (focusIndex >= 0 && focusIndex <= maxIdx) {
          const item = flatList[focusIndex];
          if (item.type === "option" && hasNested(item.value)) {
            e.preventDefault();
            setExpandedParent(item.value);
          }
        }
        break;
      case "ArrowLeft":
        if (expandedParent) {
          e.preventDefault();
          setExpandedParent(null);
        }
        break;
      default:
        break;
    }
  };

  // Scroll focused item into view
  useEffect(() => {
    if (focusIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll("[data-dropdown-item]");
      if (items[focusIndex]) {
        items[focusIndex].scrollIntoView({ block: "nearest" });
      }
    }
  }, [focusIndex]);

  // Build flat index for rendering
  let flatIndex = -1;

  // Checkbox component
  const Checkbox = ({ checked, indeterminate, size = 14 }) => (
    <span
      className="inline-flex items-center justify-center flex-shrink-0 rounded transition-all duration-150"
      style={{
        width: size,
        height: size,
        border: checked || indeterminate ? "none" : "1.5px solid #6b7280",
        background: checked
          ? "linear-gradient(135deg, #a855f7, #7c3aed)"
          : indeterminate
          ? "linear-gradient(135deg, #a855f7, #7c3aed)"
          : "transparent",
      }}
    >
      {checked && (
        <svg width={size - 4} height={size - 4} viewBox="0 0 12 12" fill="none">
          <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {indeterminate && !checked && (
        <svg width={size - 4} height={size - 4} viewBox="0 0 12 12" fill="none">
          <path d="M2 6H10" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )}
    </span>
  );

  return (
    <div
      className="relative w-full"
      ref={ref}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="combobox"
      aria-expanded={open}
      aria-haspopup="listbox"
    >
      <span
        className="absolute left-3 -top-[9px] text-xs text-white px-1 z-10 pointer-events-none"
        style={{ backgroundColor: labelBg }}
      >
        {label} {required && "*"}
      </span>

      <div
        onClick={() => {
          if (!readOnly) {
            setOpen(!open);
          }
        }}
        className={`w-full bg-transparent border rounded-lg p-3.5 flex items-center justify-between transition-colors duration-200 ${
          readOnly
            ? "cursor-not-allowed opacity-70"
            : "cursor-pointer"
        }`}
        style={{
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: open ? "#a855f7" : borderColor,
        }}
      >
        <span className={selectedArr.length > 0 ? "text-white text-sm truncate pr-2" : "text-gray-500 text-sm"}>
          {selectedArr.length > 0 ? displayValue : derivedPlaceholder}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16" height="16"
          viewBox="0 0 24 24"
          fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {open && (
        <div
          className="absolute top-full mt-1 w-full z-30"
          style={{
            filter: "drop-shadow(0 10px 25px rgba(0,0,0,0.5))",
          }}
          role="listbox"
          aria-multiselectable="true"
        >
          {/* Main Dropdown Panel */}
          <div className="w-full bg-[#1E1E2F] border border-[#3A3A5A] rounded-lg overflow-hidden flex flex-col max-h-72">
            {/* Search input */}
            <div className="p-2 border-b border-[#3A3A5A]/50">
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full bg-[#16162A] text-white text-sm rounded-md px-3 py-1.5 focus:outline-none border border-[#3A3A5A] focus:border-purple-500 placeholder-gray-500"
                aria-label="Search options"
              />
            </div>

            {/* Options list */}
            <div className="overflow-y-auto max-h-56 custom-scrollbar" ref={listRef}>
              {sortedOptions.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500">No results</div>
              ) : (
                sortedOptions.map((opt, i) => {
                  const hasChildren = hasNested(opt);
                  const isSelected = hasChildren
                    ? allChildrenSelected(opt)
                    : selectedArr.includes(opt);
                  const isIndeterminate = hasChildren && someChildrenSelected(opt);

                  flatIndex++;
                  const parentFlatIdx = flatIndex;

                  return (
                    <div
                      key={i}
                      data-dropdown-item
                      onMouseEnter={() => {
                        if (hasChildren) {
                          setExpandedParent(opt);
                        } else {
                          setExpandedParent(null);
                        }
                      }}
                      onClick={() => {
                        if (readOnly) return;
                        toggleOption(opt);
                      }}
                      className={`px-4 py-2.5 text-sm cursor-pointer transition-all duration-150 flex items-center gap-3 ${
                        focusIndex === parentFlatIdx
                          ? "bg-purple-500/20 outline outline-1 outline-purple-500/50"
                          : isSelected
                          ? "bg-purple-600/15"
                          : isIndeterminate
                          ? "bg-purple-600/10"
                          : "hover:bg-purple-500/10"
                      }`}
                      role="option"
                      aria-selected={isSelected}
                    >
                      {/* Checkbox */}
                      <Checkbox checked={isSelected} indeterminate={isIndeterminate} />

                      {/* Label */}
                      <span className={`flex-1 ${isSelected || isIndeterminate ? "text-white font-medium" : "text-gray-200"}`}>
                        {opt}
                      </span>

                      {/* Count badge + arrow for nested parent */}
                      {hasChildren && (
                        <div className="flex items-center gap-1.5">
                          {(isSelected || isIndeterminate) && (
                            <span className="text-[10px] text-purple-400 bg-purple-500/20 px-1.5 py-0.5 rounded-full font-medium">
                              {(nestedOptions[opt] || []).filter(c => selectedArr.includes(c)).length}/{(nestedOptions[opt] || []).length}
                            </span>
                          )}
                          {/* Right arrow indicating flyout */}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14" height="14"
                            viewBox="0 0 24 24"
                            fill="none" stroke="#a855f7"
                            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                          >
                            <polyline points="9 6 15 12 9 18" />
                          </svg>
                        </div>
                      )}

                      {/* Checkmark for non-nested selected items */}
                      {!hasChildren && isSelected && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Nested Flyout Panel — Rendered completely OUTSIDE to the right */}
          {expandedParent && hasNested(expandedParent) && (
            <div
              className="absolute left-[calc(100%+8px)] top-0 w-72 bg-[#1E1E2F] border border-[#3A3A5A] rounded-lg z-40 overflow-hidden flex flex-col"
              style={{
                boxShadow: "0 12px 35px rgba(0,0,0,0.6), 0 0 0 1px rgba(168,85,247,0.2)",
              }}
              onMouseEnter={() => setExpandedParent(expandedParent)}
            >
              {/* Flyout Header */}
              <div className="px-3 py-2.5 bg-[#16162A] border-b border-[#3A3A5A]/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-purple-400 font-semibold tracking-wide uppercase">
                    {expandedParent} Goals
                  </span>
                  <span className="text-[10px] text-gray-400 bg-purple-500/10 px-1.5 py-0.5 rounded">
                    {(nestedOptions[expandedParent] || []).filter(c => selectedArr.includes(c)).length}/{(nestedOptions[expandedParent] || []).length}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleOption(expandedParent);
                  }}
                  className="text-[11px] text-purple-300 hover:text-purple-100 bg-purple-600/30 hover:bg-purple-600/50 px-2 py-0.5 rounded transition-colors"
                >
                  {allChildrenSelected(expandedParent) ? "Deselect All" : "Select All"}
                </button>
              </div>

              {/* Flyout Items List */}
              <div className="overflow-y-auto max-h-64 custom-scrollbar">
                {getNestedChildren(expandedParent).length === 0 ? (
                  <div className="px-4 py-3 text-xs text-gray-500">No matching items</div>
                ) : (
                  getNestedChildren(expandedParent).map((child, ci) => {
                    const childSelected = selectedArr.includes(child);
                    flatIndex++;
                    const childFlatIdx = flatIndex;

                    return (
                      <div
                        key={ci}
                        data-dropdown-item
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!readOnly) toggleNestedChild(child);
                        }}
                        className={`px-3.5 py-2 text-sm cursor-pointer transition-all duration-150 flex items-center gap-2.5 ${
                          focusIndex === childFlatIdx
                            ? "bg-purple-500/20"
                            : childSelected
                            ? "bg-purple-600/15 text-white"
                            : "hover:bg-purple-500/10 text-gray-300"
                        }`}
                        role="option"
                        aria-selected={childSelected}
                      >
                        {/* Checkbox */}
                        <Checkbox checked={childSelected} size={14} />

                        {/* Label without color dots */}
                        <span className={`flex-1 text-[13px] leading-tight ${childSelected ? "text-white font-medium" : "text-gray-300"}`}>
                          {child}
                        </span>

                        {/* Check icon */}
                        {childSelected && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}