type Variant = 'primary' | 'secondary' | 'danger' | 'warning' | 'info' | 'success';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  variant?: Variant;
  size?: Size;
}

const variantClassName = {
  primary: 'border border-blue-500 bg-blue-500 text-white',
  secondary: 'border border-gray-500 bg-gray-500 text-white',
  danger: 'border border-red-500 bg-red-500 text-white',
  warning: 'border border-yellow-500 bg-yellow-500 text-white',
  info: 'border border-cyan-500 bg-cyan-500 text-white',
  success: 'border border-green-500 bg-green-500 text-white',
};

const sizeClassName = {
  sm: 'text-sm py-1 px-2',
  md: 'text-base py-2 px-4',
  lg: 'text-lg py-3 px-6',
};

const Button = ({ children, onClick, disabled, variant = 'primary', size = 'md' }: ButtonProps) => {
  return (
    <>
      <button
        className={`rounded-md px-2 py-1 transition-colors cursor-pointer ${variantClassName[variant]} ${sizeClassName[size]}`}
        onClick={onClick}
        disabled={disabled}
      >
        {children}
      </button>
    </>
  );
};

export default Button;
