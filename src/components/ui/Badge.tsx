type Size = 'sm' | 'md' | 'lg';
type Variant = 'primary' | 'secondary' | 'danger' | 'warning' | 'info' | 'success';

interface BadgeProps {
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  hasAnchor?: boolean;
}

const sizeClassName = {
  sm: 'text-xs py-1 px-2',
  md: 'text-base py-2 px-4',
  lg: 'text-lg py-3 px-6',
};

const variantClassName = {
  primary: 'border border-blue-500 bg-blue-500/10 text-blue-500',
  secondary: 'border border-gray-500 bg-gray-500/10 text-gray-500',
  danger: 'border border-red-500 bg-red-500/20 text-red-500',
  warning: 'border border-yellow-500 bg-yellow-500/10 text-yellow-500',
  info: 'border border-blue-500 bg-blue-500/10 text-blue-500',
  success: 'border border-green-500 bg-green-500/10 text-green-500',
};

const anchorClassName = {
  primary: 'bg-blue-500',
  secondary: 'bg-gray-500',
  danger: 'bg-red-500',
  warning: 'bg-yellow-500',
  info: 'bg-blue-500',
  success: 'bg-green-500',
};

const Anchor = ({ variant = 'secondary' }: { variant: Variant }) => {
  return <div className={`w-1.5 h-1.5 rounded-full ${anchorClassName[variant]}`}></div>;
};

const Badge = ({ variant = 'secondary', children, size = 'md', hasAnchor = false }: BadgeProps) => {
  return (
    <div
      className={`rounded-md px-2 py-1 flex items-center gap-1 ${variantClassName[variant]} ${sizeClassName[size]}`}
    >
      {hasAnchor && <Anchor variant={variant} />}
      {children}
    </div>
  );
};

export default Badge;
