import { forwardRef, useId } from "react";
import type { InputHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: LucideIcon;
  error?: string;
}

const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(function AuthInput(
  { label, icon: Icon, error, id, ...inputProps },
  ref,
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <label className="block" htmlFor={fieldId}>
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>

      <div className="relative">
        <span
          className={`pointer-events-none absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-2xl ${
            error ? "text-rose-500" : "text-slate-400"
          }`}
        >
          <Icon className="h-5 w-5" />
        </span>

        <input
          ref={ref}
          id={fieldId}
          className={`w-full rounded-3xl border px-4 py-4 pl-16 text-sm text-slate-900 shadow-sm outline-none transition duration-200 placeholder:text-slate-400 ${
            error
              ? "border-rose-300 bg-rose-50/80 focus:border-rose-400 focus:bg-white focus:ring-4 focus:ring-rose-100"
              : "border-white/60 bg-white/80 backdrop-blur-sm focus:border-amber-300 focus:bg-white focus:ring-4 focus:ring-amber-100"
          }`}
          aria-invalid={Boolean(error)}
          {...inputProps}
        />
      </div>

      {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
    </label>
  );
});

export default AuthInput;
