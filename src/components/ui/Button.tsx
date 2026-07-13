import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'disabled';

interface ButtonProps {
  variant?: ButtonVariant;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-secondary', // Falls back to secondary layout
  disabled: 'btn-disabled',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  children,
  onClick,
  disabled = false,
  className = '',
  type = 'button',
}) => {
  const effectiveVariant: ButtonVariant = disabled ? 'disabled' : variant;

  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`btn ${variantClasses[effectiveVariant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
