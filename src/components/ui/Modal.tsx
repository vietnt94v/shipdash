import Button from './Button';
import { Portal } from './Portal';

interface ModalProps {
  children?: React.ReactNode;
  open: boolean;
  onClose: () => void;
  hideCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  children,
  open,
  onClose,
  hideCloseButton = false,
}) => {
  if (!open) {
    return null;
  }

  return (
    <Portal containerId="modal-root">
      <div
        className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
        onClick={onClose}
        role="presentation"
      >
        <div
          className="bg-white p-4 rounded-md min-w-[min(100%-2rem,360px)]"
          onClick={(e) => e.stopPropagation()}
        >
          {!hideCloseButton ? (
            <div className="flex justify-between items-center">
              <Button variant="danger" size="sm" onClick={onClose}>
                Close
              </Button>
            </div>
          ) : null}
          {children}
        </div>
      </div>
    </Portal>
  );
};

export default Modal;
