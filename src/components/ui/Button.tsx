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

const getVariantClassName = (variant: Variant) => {
  switch (variant) {
    case 'primary':
      return 'border border-blue-500 bg-blue-500 text-white';
    case 'secondary':
      return 'border border-gray-500 bg-gray-500 text-white';
  }
};

const getSizeClassName = (size: Size) => {
  switch (size) {
    case 'sm':
      return 'text-sm py-1 px-2';
    case 'md':
      return 'text-base py-2 px-4';
    case 'lg':
      return 'text-lg py-3 px-6';
  }
};

const getButtonClassName = (variant: Variant, size: Size) => {
  return `rounded-md px-2 py-1 transition-colors cursor-pointer ${getVariantClassName(variant)} ${getSizeClassName(size)}`;
};

const Button = ({ children, onClick, disabled, variant = 'primary', size = 'md' }: ButtonProps) => {
  return (
    <>
      <button
        className={`${getButtonClassName(variant, size)}`}
        onClick={onClick}
        disabled={disabled}
      >
        {children}
      </button>
    </>
  );
};

export default Button;
