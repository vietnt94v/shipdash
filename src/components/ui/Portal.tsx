import { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';

export interface PortalProps {
  children: React.ReactNode;
  containerId?: string;
}

export const Portal: React.FC<PortalProps> = ({ children, containerId = 'portal-root' }) => {
  const container = useMemo(() => {
    if (typeof document === 'undefined') {
      return null;
    }
    let portalContainer = document.getElementById(containerId);
    if (!portalContainer) {
      portalContainer = document.createElement('div');
      portalContainer.id = containerId;
      document.body.appendChild(portalContainer);
    }
    return portalContainer;
  }, [containerId]);

  useEffect(() => {
    if (!container) return;
    return () => {
      if (container.childNodes.length === 0) {
        container.remove();
      }
    };
  }, [container]);

  if (!container) return null;
  return createPortal(children, container);
};

Portal.displayName = 'Portal';
