import html2canvas from 'html2canvas-pro';
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
    const bgColor = effectiveTheme === 'light' ? '#ffffff' : '#0d0d13';

    try {
      const canvas = await html2canvas(captureRef.current, {
        backgroundColor: bgColor,
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('toBlob failed');

      const filename = `leaderboard_round${game.rounds.length}.png`;
      const file = new File([blob], filename, { type: 'image/png' });

      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: game.name });
          notify('✓ Shared!');
        } catch (err) {
          if ((err as Error).name !== 'AbortError') notify('Share failed. Try again.');
        }
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = filename;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
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
