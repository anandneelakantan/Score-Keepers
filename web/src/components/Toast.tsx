import { useToast } from '../context/ToastContext';

export function Toast() {
  const { message } = useToast();
  if (!message) return null;
  return (
    <div className="notif" data-testid="toast">
      {message}
    </div>
  );
}
