import React, { useEffect, useRef, useState } from 'react';
import { getCustomSpriteVersion, getSpriteCanvas, subscribeCustomSprite } from '../game/pixelSprites';

interface PixelSpriteProps {
  id: string;
  size?: number;
  className?: string;
  flipX?: boolean;
}

export const PixelSprite: React.FC<PixelSpriteProps> = ({
  id,
  size = 32,
  className = '',
  flipX = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [customVer, setCustomVer] = useState(() => getCustomSpriteVersion());

  useEffect(() => {
    if (id !== 'ally_custom') return;
    setCustomVer(getCustomSpriteVersion());
    return subscribeCustomSprite(() => {
      setCustomVer(getCustomSpriteVersion());
    });
  }, [id]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const src = getSpriteCanvas(id);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    if (flipX) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(src, 0, 0, canvas.width, canvas.height);
    ctx.restore();
  }, [id, size, flipX, customVer]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className={`pixelated shrink-0 ${className}`}
      aria-hidden="true"
    />
  );
};
