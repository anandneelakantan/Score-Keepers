import html2canvas from 'html2canvas';
import type { RefObject } from 'react';
import type { GameRecord } from '../storage/types';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

interface ExportImageButtonProps {
  captureRef: RefObject<HTMLDivElement | null>;
  game: GameRecord;
}

export function ExportImageButton({ captureRef, game }: ExportImageButtonProps) {
  const { theme } = useTheme();
  const { notify } = useToast();

  const handleExport = async () => {
    if (!game.rounds.length) {
      notify('Submit at least one round first.');
      return;
    }
    if (!captureRef.current) return;
    notify('📷 Generating image...');

    let effectiveTheme = theme;
    if (effectiveTheme === 'auto') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    const bgColor = effectiveTheme === 'light' ? '#ffffff' : '#13131a';

    try {
      const canvas = await html2canvas(captureRef.current, {
        backgroundColor: bgColor,
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `leaderboard_round${game.rounds.length}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      notify('✓ Image downloaded!');
    } catch {
      notify('Export failed. Try again.');
    }
  };

  return (
    <button type="button" className="btn btn-ghost" onClick={handleExport}>
      📷 Export as Image
    </button>
  );
}
