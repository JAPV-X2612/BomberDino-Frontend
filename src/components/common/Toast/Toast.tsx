import { useEffect, type FC } from 'react';
import './Toast.css';

interface ToastProps {
    message: string;
    type?: 'error' | 'success' | 'warning';
    onClose: () => void;
    duration?: number;
}

/**
 * Toast notification component.
 * Auto-dismisses after specified duration.
 */
export const Toast: FC<ToastProps> = ({
                                          message,
                                          type = 'error',
                                          onClose,
                                          duration = 5000
                                      }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [onClose, duration]);

    return (
        <div className={`toast toast-${type}`}>
            <span className="toast-message">{message}</span>
            <button className="toast-close" onClick={onClose}>×</button>
        </div>
    );
};
