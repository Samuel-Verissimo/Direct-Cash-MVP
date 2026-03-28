import type {
  InputHTMLAttributes,
  LabelHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
  ReactNode,
} from 'react';
import { cx } from './utils';

export const inputClassName =
  'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-400';

export const selectClassName = inputClassName;

export const textareaClassName = cx(inputClassName, 'min-h-[96px] resize-y');

interface FieldLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  hint?: string;
}

export function FieldLabel({ className, hint, children, ...props }: FieldLabelProps) {
  return (
    <label
      className={cx('block text-sm font-medium text-slate-700 dark:text-slate-300', className)}
      {...props}
    >
      <span>{children}</span>
      {hint ? <span className="ml-2 text-xs font-normal text-slate-400">{hint}</span> : null}
    </label>
  );
}

export function AppFormHint({ children }: { children: ReactNode }) {
  return <p className="mt-1.5 text-xs leading-5 text-slate-400 dark:text-slate-500">{children}</p>;
}

export function AppInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cx(inputClassName, className)} {...props} />;
}

export function AppSelect({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cx(selectClassName, className)} {...props} />;
}

export function AppTextarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cx(textareaClassName, className)} {...props} />;
}
