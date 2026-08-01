import { useState } from 'react';
import { PlayerAvatar } from '../PlayerAvatar';
import { AVATAR_EMOJIS } from '../../utils/avatarEmoji';

interface AvatarPickerProps {
  name: string;
  colorKey: string;
  emoji?: string;
  size?: number;
  onChange: (emoji: string | undefined) => void;
}

export function AvatarPicker({ name, colorKey, emoji, size = 26, onChange }: AvatarPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="player-input-wrap-avatar" style={{ position: 'relative' }}>
      <button
        type="button"
        className="avatar-picker-trigger"
        aria-label={`Choose avatar for ${name || 'player'}`}
        onClick={() => setOpen((o) => !o)}
      >
        <PlayerAvatar name={name} colorKey={colorKey} emoji={emoji} size={size} />
      </button>

      {open && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 15 }}
            onClick={() => setOpen(false)}
          />
          <div className="avatar-picker-panel">
            <div className="avatar-picker-label">Choose avatar</div>
            <button
              type="button"
              className={`avatar-picker-initials-btn${!emoji ? ' active' : ''}`}
              onClick={() => {
                onChange(undefined);
                setOpen(false);
              }}
            >
              Aa Initials
            </button>
            <div className="avatar-picker-grid" style={{ marginTop: 8 }}>
              {AVATAR_EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  className={`avatar-picker-option${emoji === e ? ' active' : ''}`}
                  onClick={() => {
                    onChange(e);
                    setOpen(false);
                  }}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
