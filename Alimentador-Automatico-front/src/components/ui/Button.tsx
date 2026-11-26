import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { commonStrings } from '../../strings/pt-br';

type ButtonVariant = 'primary' | 'secondary' | 'social';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  isLoading?: boolean;
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-zinc-700 text-white hover:bg-zinc-800 active:bg-zinc-900 disabled:bg-zinc-400',
  secondary:
    'bg-zinc-200 text-zinc-800 hover:bg-zinc-300 active:bg-zinc-400 disabled:bg-zinc-100 disabled:text-zinc-400',
  social:
    'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 disabled:bg-zinc-100 disabled:text-zinc-400 disabled:cursor-not-allowed',
};

export function Button({
  variant = 'primary',
  fullWidth = false,
  leftIcon,
  isLoading = false,
  disabled,
  children,
  className = '',
  type = 'button',
  ...rest
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed';
  const width = fullWidth ? 'w-full' : '';
  const variantClass = variantClasses[variant];

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`${base} ${variantClass} ${width} ${className}`.trim()}
      {...rest}
    >
      {leftIcon && <span className="text-lg leading-none">{leftIcon}</span>}
      <span>{isLoading ? commonStrings.loading : children}</span>
    </button>
  );
}

export default Button;
