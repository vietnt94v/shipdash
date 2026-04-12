interface CardItemProps {
  children?: React.ReactNode;
  onClick?: () => void;
  isSelected?: boolean;
}

const CardItem: React.FC<CardItemProps> = ({
  onClick,
  children,
  isSelected = false,
}: CardItemProps) => {
  return (
    <>
      <div
        onClick={onClick}
        className={`cursor-pointer border-b border-gray-200 hover:bg-gray-100 px-3.5 py-2 shrink-0
           ${isSelected ? 'border-l-2 border-l-gray-700 bg-gray-300 hover:bg-gray-300 pl-3' : ''}
        `}
      >
        {children}
      </div>
    </>
  );
};

export default CardItem;
