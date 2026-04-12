type Variant = 'primary' | 'secondary' | 'danger' | 'warning' | 'info' | 'success';
type Size = 'sm' | 'md' | 'lg';

interface SelectProps {
  children: React.ReactNode;
  label?: string;
  id?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  variant?: Variant;
  size?: Size;
}

const variantClassName = {
  primary: 'border border-blue-500 bg-blue-500/10 text-blue-500',
  secondary: 'border border-gray-500 bg-gray-500/10 text-gray-500',
  danger: 'border border-red-500 bg-red-500/20 text-red-500',
  warning: 'border border-yellow-500 bg-yellow-500/10 text-yellow-500',
  info: 'border border-blue-500 bg-blue-500/10 text-blue-500',
  success: 'border border-green-500 bg-green-500/10 text-green-500',
};

const sizeClassName = {
  sm: 'text-sm py-1 px-2',
  md: 'text-base py-2 px-4',
  lg: 'text-lg py-3 px-6',
};

const getSelectClassName = (variant: Variant, size: Size) => {
  return `w-full bg-white border border-gray-300 rounded-md px-2 py-1
          transition-colors outline-none focus:border-blue-500 focus:ring-1
          focus:ring-blue-500/20 read-only:cursor-default
          read-only:focus:border-gray-300 read-only:focus:ring-0
          ${sizeClassName[size]} ${variantClassName[variant]}`;
};

const Select = ({
  children,
  label,
  id,
  value,
  onChange,
  disabled,
  variant = 'primary',
  size = 'md',
}: SelectProps) => {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={id}
          className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider"
        >
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={getSelectClassName(variant, size)}
        id={id}
      >
        {children}
      </select>
    </div>
  );
};

export default Select;
