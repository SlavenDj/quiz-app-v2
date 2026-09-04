import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "./cn";

/**
 * Search field used in filter bars (ModuleGrid, ModuleDetail, Leaderboard).
 * Includes a search icon and a clear button.
 */
export interface SearchInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  onClear?: () => void;
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
      aria-hidden
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput({ value, onClear, className = "", ...props }, ref) {
    const showClear = value != null && String(value).length > 0;
    return (
      <label
        className={cn(
          "flex flex-1 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 transition-colors",
          "focus-within:border-brand-nav focus-within:bg-white",
          "dark:border-zinc-700 dark:bg-zinc-800 dark:focus-within:bg-zinc-900 dark:focus-within:border-brand-nav",
          className
        )}
      >
        <span aria-hidden className="shrink-0 text-gray-400 dark:text-zinc-500">
          <SearchIcon />
        </span>
        <input
          ref={ref}
          type="search"
          value={value}
          className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-zinc-100 dark:placeholder:text-zinc-500 [&::-webkit-search-cancel-button]:hidden"
          {...props}
        />
        {showClear && (
          <button
            type="button"
            onClick={onClear}
            className="flex shrink-0 items-center justify-center rounded-md p-0.5 text-gray-400 transition-colors hover:bg-gray-200/70 hover:text-gray-700 dark:text-zinc-500 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
            aria-label="Obriši pretragu"
          >
            <ClearIcon />
          </button>
        )}
      </label>
    );
  }
);
