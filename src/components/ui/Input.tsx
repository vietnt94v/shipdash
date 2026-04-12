type Size = 'sm' | 'md' | 'lg';

interface InputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
  label?: string;
  id?: string;
  type?: string;
  size?: Size;
}

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

const getInputClassName = (size: Size) => {
  return `w-full bg-white border 
          border-gray-300 rounded-md px-2 py-1 transition-colors 
          outline-none focus:border-blue-500 focus:ring-1 
          focus:ring-blue-500/20 read-only:cursor-default 
          read-only:bg-[#f5f4ed] read-only:text-[#6b6b6b] 
          read-only:focus:border-gray-300 read-only:focus:ring-0 
          ${getSizeClassName(size)}
  `;
};

const Input = ({
  placeholder,
  value,
  onChange,
  disabled,
  readOnly,
  label,
  id,
  type = 'text',
  size = 'md',
}: InputProps) => {
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
      <input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={getInputClassName(size)}
        disabled={disabled}
        readOnly={readOnly}
        id={id}
        type={type}
      />
    </div>
  );
};

export default Input;
