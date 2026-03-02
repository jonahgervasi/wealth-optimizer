import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  prefix?: string;
  suffix?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, prefix, suffix, className = "", id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-slate-300">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {prefix && (
            <span className="absolute left-3 text-slate-400 text-sm select-none">{prefix}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full bg-navy-700 border rounded-lg text-white placeholder-slate-500
              focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
              transition-colors duration-200 text-sm
              ${error ? "border-red-500" : "border-navy-500 hover:border-navy-400"}
              ${prefix ? "pl-7" : "pl-3"}
              ${suffix ? "pr-12" : "pr-3"}
              py-2
              ${className}
            `}
            {...props}
          />
          {suffix && (
            <span className="absolute right-3 text-slate-400 text-sm select-none">{suffix}</span>
          )}
        </div>
        {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
