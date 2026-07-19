import { useTheme } from '../context/ThemeContext';
import type { Theme } from '../context/ThemeContext';

const OPTIONS: { id: Theme; icon: string; label: string; title: string }[] = [
  { id: 'dark', icon: '🌙', label: 'Dark', title: 'Dark mode' },
  { id: 'auto', icon: '⚙️', label: 'Auto', title: 'Follow system' },
  { id: 'light', icon: '☀️', label: 'Light', title: 'Light mode' },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="theme-toggle" role="group" aria-label="Theme">
      {OPTIONS.map((opt) => (
        <button
          key={opt.id}
          type="button"
          className={`theme-btn${theme === opt.id ? ' active' : ''}`}
          onClick={() => setTheme(opt.id)}
          title={opt.title}
          data-testid={`theme-${opt.id}`}
        >
          <span className="theme-icon">{opt.icon}</span>
          <span>{opt.label}</span>
        </button>
      ))}
    </div>
  );
}
