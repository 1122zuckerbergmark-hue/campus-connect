/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-24 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="toast-enter glass rounded-2xl px-5 py-4 flex items-center gap-3 shadow-2xl pointer-events-auto min-w-[280px] max-w-md"
          >
            {t.type === 'success' && <CheckCircle className="text-green-400 shrink-0" size={20} />}
            {t.type === 'error' && <XCircle className="text-red-400 shrink-0" size={20} />}
            {t.type === 'info' && <Info className="text-teal shrink-0" size={20} />}
            <span className="text-sm flex-1">{t.message}</span>
            <button onClick={() => removeToast(t.id)} className="text-muted hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);