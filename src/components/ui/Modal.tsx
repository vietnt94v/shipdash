import Button from './Button';
import { Portal } from './Portal';

type ModalConfirmVariant = 'primary' | 'danger';

interface ModalProps {
  children?: React.ReactNode;
  open: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title?: string;
  showFooter?: boolean;
  hideCloseButton?: boolean;
  cancelLabel?: string;
  confirmLabel?: string;
  confirmVariant?: ModalConfirmVariant;
  confirmDisabled?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  children,
  open,
  onClose,
  onConfirm,
  title,
  showFooter = true,
  hideCloseButton = false,
  cancelLabel = 'Cancel',
  confirmLabel = 'Confirm',
  confirmVariant = 'primary',
  confirmDisabled = false,
}) => {
  if (!open) {
    return null;
  }

  return (
    <Portal containerId="modal-root">
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        onClick={onClose}
        role="presentation"
      >
        <div
          className="relative max-w-[calc(100vw-2rem)] min-w-[min(100%,360px)] rounded-lg bg-white shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {!hideCloseButton ? (
            <button
              type="button"
              className="absolute top-2 right-2 z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 cursor-pointer"
              onClick={onClose}
              aria-label="Close"
            >
              <span className="text-2xl leading-none -mt-1" aria-hidden>
                ×
              </span>
            </button>
          ) : null}
          <div className="p-4">
            {title ? (
              <h3 className={`font-semibold text-lg ${hideCloseButton ? '' : 'pe-10'}`}>{title}</h3>
            ) : null}
            <div className="py-3">{children}</div>
            {showFooter ? (
              <footer className="border-t border-gray-200 pt-4">
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" outline onClick={onClose}>
                    {cancelLabel}
                  </Button>
                  <Button
                    variant={confirmVariant}
                    disabled={confirmDisabled}
                    onClick={() => onConfirm?.()}
                  >
                    {confirmLabel}
                  </Button>
                </div>
              </footer>
            ) : null}
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default Modal;
