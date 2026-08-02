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
          return;
        } catch (err) {
          if ((err as Error).name === 'AbortError') return;
          // Some browsers (e.g. iOS Chrome) report canShare support but fail
          // when actually sharing — fall through to the download fallback below.
        }
      }

      const url = URL.createObjectURL(blob);
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      if (isIOS) {
        // iOS WebKit (Safari, Chrome, Firefox) ignores the `download` attribute,
        // so open the image directly and let the user long-press to save it.
        window.open(url, '_blank');
        notify('Long-press the image to save it.');
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      } else {
        const link = document.createElement('a');
        link.download = filename;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        notify('✓ Image downloaded!');
      }
    } catch {
      notify('Export failed. Try again.');
    }
  };

  return (
    <button type="button" className="btn btn-ghost" onClick={handleExport}>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        style={{ marginRight: 6 }}
      >
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
      Share
    </button>
  );
}
