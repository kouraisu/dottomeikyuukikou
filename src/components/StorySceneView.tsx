import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronRight, SkipForward } from 'lucide-react';
import { getSpriteCanvas, syncCustomAllySprite } from '../game/pixelSprites';
import { sound } from '../game/sound';
import { SaveState } from '../game/types';
import { PixelSprite } from './PixelSprite';

export type StorySceneMode = 'OPENING' | 'ENDING';

interface StorySceneViewProps {
  mode: StorySceneMode;
  save: SaveState;
  isReplay?: boolean;
  onFinish: () => void;
}

interface StoryBeat {
  id: string;
  speaker: string;
  speakerRole: string;
  spriteId: string;
  text: string;
  activeActorKey: string;
  giftGold?: number;
  celebrateBurst?: boolean;
}

const CANVAS_W = 480;
const CANVAS_H = 212;

export const StorySceneView: React.FC<StorySceneViewProps> = ({
  mode,
  save,
  isReplay = false,
  onFinish,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [typedLen, setTypedLen] = useState(0);

  const beats = useMemo<StoryBeat[]>(() => {
    if (mode === 'OPENING') {
      return [
        {
          id: 'op_1',
          speaker: 'ナレーション',
          speakerRole: '王都アルカディア · 玉座の間',
          spriteId: 'npc_soldier',
          text: '重厚な王宮の扉が開かれ、一人の若き冒険者が赤い絨毯を進み出た。王国はいま、東の迷宮最深部に迫る闇の脅威に揺れている。',
          activeActorKey: 'hero',
        },
        {
          id: 'op_2',
          speaker: '国王アルカディア12世',
          speakerRole: '王宮 · 国王',
          spriteId: 'npc_king',
          text: 'よくぞ参った、勇者よ！ 遥か東の迷宮最深部『深淵の玉座』にて、魔王アビスドラゴンが再び目覚めようとしておるのだ。',
          activeActorKey: 'king',
        },
        {
          id: 'op_3',
          speaker: '国王アルカディア12世',
          speakerRole: '王宮 · 国王',
          spriteId: 'npc_king',
          text: 'このままでは王国も城下町も闇に呑まれてしまう……。どうか酒場で仲間を募り、魔王を討伐しにいってくれ！',
          activeActorKey: 'king',
        },
        {
          id: 'op_4',
          speaker: '国王アルカディア12世',
          speakerRole: '王室支度金の贈呈',
          spriteId: 'item_charm_gold',
          text: 'これは旅立ちの支度金じゃ。勇者よ、120ゴールドを贈呈しよう！ まずは持ち物5つを整えて、最初の迷宮へ挑むのだ！',
          activeActorKey: 'king',
          giftGold: 120,
        },
        {
          id: 'op_5',
          speaker: '勇者',
          speakerRole: '旅立ちの決意',
          spriteId: 'hero',
          text: 'ありがたく頂戴いたします、陛下！ 道具と仲間を鍛え上げ、必ずや魔王アビスドラゴンを討伐してまいります！',
          activeActorKey: 'hero',
        },
      ];
    }

    const customCreated = Boolean(save.customAlly?.created);
    const customName = save.customAlly?.name || '相棒';

    return [
      {
        id: 'ed_1',
        speaker: 'ナレーション',
        speakerRole: '王都凱旋 · 祝賀広場',
        spriteId: 'boss_dragon',
        text: '魔王アビスドラゴンはついに打ち倒され、世界を覆っていた深淵の闇は晴れ渡った。王都の広場には凱旋した勇者を讃える大歓声が響き渡る！',
        activeActorKey: 'hero',
        celebrateBurst: true,
      },
      {
        id: 'ed_2',
        speaker: '国王アルカディア12世',
        speakerRole: '王宮 · 国王',
        spriteId: 'npc_king',
        text: 'おおっ、見事じゃ勇者よ！ 120ゴールドの支度金から始まり、ここまで成長して王国を救うとは！ 最大の賛辞と祝福を贈ろう！',
        activeActorKey: 'king',
        celebrateBurst: true,
      },
      {
        id: 'ed_3',
        speaker: '道具屋＆鍛冶屋の親方',
        speakerRole: '城下町の職人たち',
        spriteId: 'npc_blacksmith',
        text: '勇者さん、魔王討伐おめでとう！ あんたが選んだ5つの持ち物と鍛え上げた装備、最高に輝いてたぜ！ 今夜は城下町じゅうでお祭りだ！',
        activeActorKey: 'blacksmith',
        celebrateBurst: true,
      },
      {
        id: 'ed_4',
        speaker: '街の人々＆王宮兵士',
        speakerRole: '王都の住民たち',
        spriteId: 'npc_villager_b',
        text: '勇者様バンザーイ！！ もう魔物に怯えずに眠れるのですね……！ 本当に、本当にありがとうございました！',
        activeActorKey: 'villager_b',
        celebrateBurst: true,
      },
      {
        id: 'ed_5',
        speaker: customCreated ? `酒場の仲間たち＆${customName}` : '酒場の仲間たち',
        speakerRole: '共に戦ったパーティ',
        spriteId: customCreated ? 'ally_custom' : 'ally_cleric',
        text: 'ここまで一緒に冒険できて誇りだよ！ ……でも噂では、さらに奥深い『転生』や未知の裏迷宮・無限回廊も待ち受けているらしい。これからも一緒に進もう！',
        activeActorKey: customCreated ? 'custom' : 'cleric',
        celebrateBurst: true,
      },
      {
        id: 'ed_6',
        speaker: 'ナレーション',
        speakerRole: '新たな伝説の幕開け',
        spriteId: 'hero',
        text: 'こうして勇者と仲間たちの名は王国中に語り継がれた。祝福の拍手を背に、さらなる強敵と未知の財宝を求める新たな冒険がいま始まる！',
        activeActorKey: 'hero',
        celebrateBurst: true,
      },
    ];
  }, [mode, save.customAlly?.created, save.customAlly?.name]);

  const currentBeat = beats[Math.min(stepIdx, beats.length - 1)];
  const isLastStep = stepIdx >= beats.length - 1;
  const stepIdxRef = useRef(stepIdx);
  const currentBeatRef = useRef(currentBeat);
  stepIdxRef.current = stepIdx;
  currentBeatRef.current = currentBeat;

  useEffect(() => {
    syncCustomAllySprite(save.customAlly);
  }, [save.customAlly]);

  useEffect(() => {
    setStepIdx(0);
    setTypedLen(0);
  }, [mode]);

  useEffect(() => {
    setTypedLen(0);
    if (currentBeat?.giftGold) {
      sound.coin();
    } else if (currentBeat?.celebrateBurst && stepIdx === 0) {
      sound.victory();
    }
  }, [stepIdx, currentBeat?.giftGold, currentBeat?.celebrateBurst]);

  // Smooth typewriter reveal
  useEffect(() => {
    const fullLen = currentBeat.text.length;
    if (typedLen >= fullLen) return;
    const t = window.setTimeout(() => {
      setTypedLen((n) => Math.min(fullLen, n + 2));
    }, 24);
    return () => window.clearTimeout(t);
  }, [typedLen, currentBeat.text.length]);

  const handleAdvance = useCallback(() => {
    if (typedLen < currentBeat.text.length) {
      sound.click();
      setTypedLen(currentBeat.text.length);
      return;
    }
    if (isLastStep) {
      sound.victory();
      onFinish();
      return;
    }
    sound.click();
    setStepIdx((i) => Math.min(beats.length - 1, i + 1));
  }, [typedLen, currentBeat.text.length, isLastStep, onFinish, beats.length]);

  const handleSkip = useCallback(() => {
    sound.click();
    onFinish();
  }, [onFinish]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleAdvance();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleSkip();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleAdvance, handleSkip]);

  // Animated Pixel Cutscene Canvas
  useEffect(() => {
    interface SceneParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      size: number;
      life: number;
      gravity: number;
    }
    const particles: SceneParticle[] = [];
    let rafId = 0;
    let lastTime = performance.now();
    let clock = 0;
    let heroWalkProgress = mode === 'OPENING' ? 0 : 1;
    let fireworkTimer = 300;
    let goldBurstDone = false;

    const spawnParticles = (
      x: number,
      y: number,
      colors: string[],
      count: number,
      speed = 1.4,
      gravity = 0.04
    ) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = 0.4 + Math.random() * speed;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd - 0.9,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() < 0.5 ? 2 : 3,
          life: 600 + Math.random() * 550,
          gravity,
        });
      }
    };

    const tick = (now: number) => {
      const dt = Math.min(48, now - lastTime);
      lastTime = now;
      clock += dt;

      const beatNow = currentBeatRef.current;
      const stepNow = stepIdxRef.current;

      if (mode === 'OPENING' && heroWalkProgress < 1) {
        heroWalkProgress = Math.min(1, heroWalkProgress + dt / 1450);
      }

      if (mode === 'OPENING' && beatNow.giftGold && !goldBurstDone) {
        goldBurstDone = true;
        spawnParticles(240, 128, ['#facc15', '#fde047', '#f59e0b', '#ffffff'], 26, 1.9, 0.05);
      }

      if (mode === 'ENDING') {
        fireworkTimer -= dt;
        if (fireworkTimer <= 0) {
          fireworkTimer = 550 + Math.random() * 650;
          const fx = 60 + Math.random() * (CANVAS_W - 120);
          const fy = 26 + Math.random() * 56;
          const palette = [
            ['#facc15', '#fde047', '#ffffff'],
            ['#38bdf8', '#a855f7', '#f43f5e'],
            ['#34d399', '#facc15', '#fb923c'],
          ][Math.floor(Math.random() * 3)];
          spawnParticles(fx, fy, palette, 20, 1.8, 0.025);
        }
        if (Math.random() < 0.25 * (dt / 16)) {
          const confColors = ['#facc15', '#f43f5e', '#38bdf8', '#34d399', '#a855f7'];
          particles.push({
            x: Math.random() * CANVAS_W,
            y: -4,
            vx: (Math.random() - 0.5) * 0.45,
            vy: 0.45 + Math.random() * 0.55,
            color: confColors[Math.floor(Math.random() * confColors.length)],
            size: 2,
            life: 2400,
            gravity: 0,
          });
        }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx * (dt / 16);
        p.y += p.vy * (dt / 16);
        p.vy += p.gravity * (dt / 16);
        p.life -= dt;
        if (p.life <= 0 || p.y > CANVAS_H + 8) particles.splice(i, 1);
      }

      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = false;

        if (mode === 'OPENING') {
          // === PALACE THRONE ROOM ===
          ctx.fillStyle = '#141726';
          ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

          // Stone wall back
          ctx.fillStyle = '#20263b';
          ctx.fillRect(0, 18, CANVAS_W, 114);
          ctx.fillStyle = '#2b334e';
          for (let wx = 0; wx < CANVAS_W; wx += 48) {
            ctx.fillRect(wx + 2, 24, 42, 16);
            ctx.fillRect(wx + 22, 46, 42, 16);
          }

          // Tall stained-glass castle windows with golden sunbeams
          [110, 240, 370].forEach((wx) => {
            ctx.fillStyle = '#0f1320';
            ctx.fillRect(wx - 16, 26, 32, 62);
            ctx.fillStyle = '#1d4ed8';
            ctx.fillRect(wx - 13, 29, 26, 56);
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(wx - 9, 34, 8, 22);
            ctx.fillStyle = '#facc15';
            ctx.fillRect(wx + 1, 34, 8, 22);
            ctx.fillStyle = '#a855f7';
            ctx.fillRect(wx - 9, 59, 18, 20);
            // Soft diagonal sunlight beam
            ctx.fillStyle = 'rgba(250, 204, 21, 0.06)';
            ctx.fillRect(wx - 14, 88, 28, 86);
          });

          // Stone Pillars
          [42, 174, 306, 438].forEach((px) => {
            ctx.fillStyle = '#36415e';
            ctx.fillRect(px - 10, 16, 20, 122);
            ctx.fillStyle = '#4a587d';
            ctx.fillRect(px - 12, 16, 24, 8);
            ctx.fillRect(px - 12, 130, 24, 8);
          });

          // Flickering wall torches
          [76, 404].forEach((tx, idx) => {
            ctx.fillStyle = '#5c2d16';
            ctx.fillRect(tx - 2, 74, 4, 16);
            const flk = Math.sin(clock / 85 + idx * 3) > 0 ? 1 : 0;
            ctx.fillStyle = '#f97316';
            ctx.fillRect(tx - 4, 65 - flk, 8, 9);
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(tx - 2, 67 - flk, 4, 5);
          });

          // Marble Floor
          ctx.fillStyle = '#2b3042';
          ctx.fillRect(0, 132, CANVAS_W, 80);
          for (let fy = 132; fy < CANVAS_H; fy += 16) {
            for (let fx = 0; fx < CANVAS_W; fx += 24) {
              if (((fx / 24) + (fy / 16)) % 2 === 0) {
                ctx.fillStyle = '#333a50';
                ctx.fillRect(fx, fy, 24, 16);
              }
            }
          }

          // Royal Crimson Carpet & Gold Trim
          ctx.fillStyle = '#eab308';
          ctx.fillRect(194, 132, 92, 80);
          ctx.fillStyle = '#991b1b';
          ctx.fillRect(198, 132, 84, 80);
          ctx.fillStyle = '#b91c1c';
          ctx.fillRect(204, 132, 72, 80);

          // Dais / Golden Throne Platform
          ctx.fillStyle = '#475569';
          ctx.fillRect(176, 114, 128, 22);
          ctx.fillStyle = '#facc15';
          ctx.fillRect(176, 114, 128, 3);
          // Throne backrest
          ctx.fillStyle = '#7f1d1d';
          ctx.fillRect(222, 62, 36, 48);
          ctx.fillStyle = '#facc15';
          ctx.fillRect(220, 58, 40, 6);
          ctx.fillRect(220, 58, 4, 52);
          ctx.fillRect(256, 58, 4, 52);

          // Cast
          const drawSpriteActor = (
            spriteId: string,
            x: number,
            y: number,
            scale: number,
            facing: 1 | -1,
            isActive: boolean,
            emote?: string
          ) => {
            const sp = getSpriteCanvas(spriteId);
            const sz = Math.round(16 * scale);
            const bob = isActive ? Math.abs(Math.sin(clock / 180)) * 4 : Math.sin(clock / 420) * 0.8;
            const dx = Math.round(x - sz / 2);
            const dy = Math.round(y - sz - bob);

            ctx.fillStyle = 'rgba(0,0,0,0.42)';
            ctx.fillRect(Math.round(x - sz * 0.35), Math.round(y - 2), Math.round(sz * 0.7), 3);

            ctx.save();
            if (facing < 0) {
              ctx.translate(dx + sz, dy);
              ctx.scale(-1, 1);
              ctx.drawImage(sp, 0, 0, sz, sz);
            } else {
              ctx.drawImage(sp, dx, dy, sz, sz);
            }
            ctx.restore();

            if (emote) {
              ctx.font = 'bold 11px "DotGothic16", monospace';
              ctx.textAlign = 'center';
              ctx.fillStyle = '#090b10';
              ctx.fillText(emote, x + 1, dy - 4);
              ctx.fillStyle = '#facc15';
              ctx.fillText(emote, x, dy - 5);
            }
          };

          // Royal Guards
          drawSpriteActor('npc_soldier', 148, 138, 1.85, 1, false);
          drawSpriteActor('npc_soldier', 332, 138, 1.85, -1, false);

          // King on Throne
          drawSpriteActor(
            'npc_king',
            240,
            116,
            2.15,
            1,
            beatNow.activeActorKey === 'king',
            beatNow.giftGold ? '120G!' : beatNow.activeActorKey === 'king' ? '!' : undefined
          );

          // Hero walks up carpet from bottom to center
          const heroY = 198 - heroWalkProgress * 40;
          const walkHop = heroWalkProgress < 1 ? Math.abs(Math.sin(clock / 90)) * 3 : 0;
          drawSpriteActor(
            'hero',
            240,
            heroY - walkHop,
            2.05,
            1,
            beatNow.activeActorKey === 'hero',
            beatNow.activeActorKey === 'hero' && stepNow >= 4 ? '!' : undefined
          );

          // Gold Gift Visual on step 4
          if (beatNow.giftGold) {
            const charm = getSpriteCanvas('item_charm_gold');
            const gy = 128 + Math.sin(clock / 160) * 3;
            ctx.drawImage(charm, 228, gy, 24, 24);
            ctx.font = 'bold 13px "JetBrains Mono", monospace';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#090b10';
            ctx.fillText('+120 G', 241, gy - 5);
            ctx.fillStyle = '#fde047';
            ctx.fillText('+120 G', 240, gy - 6);
          }
        } else {
          // === DEMON KING VICTORY CELEBRATION PLAZA ===
          const sky = ['#0f172a', '#1e293b', '#312e81', '#4c1d95'];
          sky.forEach((col, idx) => {
            ctx.fillStyle = col;
            ctx.fillRect(0, idx * 24, CANVAS_W, 25);
          });

          // Distant Castle & Banner Flags
          ctx.fillStyle = '#1e2438';
          ctx.fillRect(160, 48, 160, 74);
          ctx.fillRect(142, 34, 28, 88);
          ctx.fillRect(310, 34, 28, 88);
          ctx.fillRect(216, 20, 48, 102);
          ctx.fillStyle = '#b91c1c';
          ctx.fillRect(138, 24, 36, 10);
          ctx.fillRect(306, 24, 36, 10);
          ctx.fillRect(212, 10, 56, 12);
          ctx.fillStyle = '#facc15';
          ctx.fillRect(237, 2, 6, 8);
          ctx.fillRect(232, 62, 16, 20);

          // Festival Bunting Flags
          const flagColors = ['#ef4444', '#facc15', '#38bdf8', '#34d399', '#a855f7'];
          for (let fx = 12; fx < CANVAS_W - 12; fx += 20) {
            ctx.fillStyle = flagColors[(fx / 20) % flagColors.length];
            const sag = Math.round(Math.sin((fx / CANVAS_W) * Math.PI) * 10);
            ctx.fillRect(fx, 86 + sag, 10, 7);
          }

          // Cobblestone Plaza Ground
          ctx.fillStyle = '#293245';
          ctx.fillRect(0, 120, CANVAS_W, 92);
          ctx.fillStyle = '#334155';
          for (let gx = 0; gx < CANVAS_W; gx += 28) {
            ctx.fillRect(gx + 2, 128, 22, 6);
            ctx.fillRect(gx + 10, 154, 22, 6);
            ctx.fillRect(gx + 4, 184, 22, 6);
          }
          ctx.fillStyle = '#991b1b';
          ctx.fillRect(204, 120, 72, 92);
          ctx.fillStyle = '#facc15';
          ctx.fillRect(202, 120, 2, 92);
          ctx.fillRect(276, 120, 2, 92);

          // Draw cheering crowd
          const customCreated = Boolean(save.customAlly?.created);
          const crowd: {
            key: string;
            spriteId: string;
            x: number;
            y: number;
            scale: number;
            facing: 1 | -1;
            phase: number;
            emote?: string;
          }[] = [
            { key: 'king', spriteId: 'npc_king', x: 240, y: 138, scale: 2.0, facing: 1, phase: 0.2, emote: '祝' },
            { key: 'soldier_l', spriteId: 'npc_soldier', x: 186, y: 136, scale: 1.7, facing: 1, phase: 0.8 },
            { key: 'soldier_r', spriteId: 'npc_soldier', x: 294, y: 136, scale: 1.7, facing: -1, phase: 1.4 },
            { key: 'merchant', spriteId: 'npc_merchant', x: 118, y: 156, scale: 1.75, facing: 1, phase: 2.1, emote: '♪' },
            { key: 'blacksmith', spriteId: 'npc_blacksmith', x: 74, y: 172, scale: 1.8, facing: 1, phase: 2.7, emote: '★' },
            { key: 'villager_a', spriteId: 'npc_villager_a', x: 358, y: 156, scale: 1.75, facing: -1, phase: 3.3 },
            { key: 'villager_b', spriteId: 'npc_villager_b', x: 404, y: 172, scale: 1.75, facing: -1, phase: 3.9, emote: '!' },
            { key: 'cleric', spriteId: 'ally_cleric', x: 162, y: 174, scale: 1.8, facing: 1, phase: 1.1 },
            { key: 'knight', spriteId: 'ally_knight', x: 318, y: 174, scale: 1.8, facing: -1, phase: 1.9 },
            { key: 'ranger', spriteId: 'ally_ranger', x: 116, y: 196, scale: 1.75, facing: 1, phase: 2.5 },
            { key: 'mage', spriteId: 'ally_mage', x: 364, y: 196, scale: 1.75, facing: -1, phase: 3.0 },
            { key: 'thief', spriteId: 'ally_thief', x: 48, y: 198, scale: 1.7, facing: 1, phase: 4.1 },
            ...(customCreated
              ? [{ key: 'custom', spriteId: 'ally_custom', x: 428, y: 198, scale: 1.8, facing: -1 as const, phase: 0.5, emote: '♪' }]
              : []),
            { key: 'hero', spriteId: 'hero', x: 240, y: 184, scale: 2.1, facing: 1, phase: 0, emote: '★' },
          ];

          crowd
            .sort((a, b) => a.y - b.y)
            .forEach((c) => {
              const isActive = beatNow.activeActorKey === c.key;
              const jump = isActive
                ? Math.abs(Math.sin(clock / 130 + c.phase)) * 8
                : Math.abs(Math.sin(clock / 230 + c.phase)) * 3.5;
              const sp = getSpriteCanvas(c.spriteId);
              const sz = Math.round(16 * c.scale);
              const dx = Math.round(c.x - sz / 2);
              const dy = Math.round(c.y - sz - jump);

              ctx.fillStyle = 'rgba(0,0,0,0.4)';
              ctx.fillRect(Math.round(c.x - sz * 0.35), Math.round(c.y - 2), Math.round(sz * 0.7), 3);

              ctx.save();
              if (c.facing < 0) {
                ctx.translate(dx + sz, dy);
                ctx.scale(-1, 1);
                ctx.drawImage(sp, 0, 0, sz, sz);
              } else {
                ctx.drawImage(sp, dx, dy, sz, sz);
              }
              ctx.restore();

              if (isActive || c.emote) {
                const label = isActive ? '★' : c.emote!;
                ctx.font = 'bold 10px "DotGothic16", monospace';
                ctx.textAlign = 'center';
                ctx.fillStyle = isActive ? '#fde047' : '#38bdf8';
                ctx.fillText(label, c.x, dy - 4);
              }
            });
        }

        // Particles (confetti / fireworks / gold bursts)
        particles.forEach((p) => {
          ctx.fillStyle = p.color;
          ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
        });
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [mode, save.customAlly?.created]);

  return (
    <div className="min-h-screen bg-[#101218] text-[#eceff4] flex flex-col items-center justify-center px-4 py-6">
      <div className="max-w-3xl w-full space-y-4">
        {/* Top Bar: Scene Label & Skip Button */}
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs sm:text-sm text-slate-300 font-pixel">
            {mode === 'OPENING' ? '序章 · 王宮の出立' : '祝賀 · 魔王討伐の凱旋'}
            {isReplay && <span className="ml-2 text-xs text-slate-400">（回想）</span>}
          </div>
          <button
            type="button"
            onClick={handleSkip}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-[#181b24] hover:bg-[#252a38] text-slate-200 border border-[#3a4156] transition-colors cursor-pointer whitespace-nowrap"
          >
            <SkipForward className="w-3.5 h-3.5 shrink-0" />
            <span>スキップ</span>
          </button>
        </div>

        {/* Scene Visual + RPG Dialogue Box */}
        <div className="pixel-panel overflow-hidden">
          <div className="relative bg-[#0c0e14] border-b-2 border-[#2b3040]">
            <canvas
              ref={canvasRef}
              width={CANVAS_W}
              height={CANVAS_H}
              className="w-full h-auto block pixelated"
            />
            {currentBeat.giftGold && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-[#1b160a]/95 border-2 border-amber-400 text-amber-300 font-pixel text-sm sm:text-base shadow-lg whitespace-nowrap">
                国王からの贈呈：旅立ちの支度金 +{currentBeat.giftGold} G
              </div>
            )}
          </div>

          <div
            onClick={handleAdvance}
            className="p-5 sm:p-6 space-y-4 cursor-pointer select-none hover:bg-[#1a1e29]/60 transition-colors"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 bg-[#12151d] border-2 border-[#3a4156] flex items-center justify-center shrink-0">
                <PixelSprite id={currentBeat.spriteId} size={36} />
              </div>
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-pixel text-base sm:text-lg text-amber-300">
                      {currentBeat.speaker}
                    </span>
                    <span className="text-[11px] text-slate-400">{currentBeat.speakerRole}</span>
                  </div>
                  <span className="font-num text-[11px] text-slate-500">
                    {stepIdx + 1} / {beats.length}
                  </span>
                </div>
                <p className="text-sm sm:text-base text-slate-100 leading-relaxed min-h-[3.25rem]">
                  {currentBeat.text.slice(0, typedLen)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#232836]">
              <span className="text-[11px] text-slate-400">
                クリックまたは Enter / Space で次へ（Esc でスキップ）
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAdvance();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <span>
                  {typedLen < currentBeat.text.length
                    ? '全文表示'
                    : isLastStep
                      ? mode === 'OPENING'
                        ? isReplay
                          ? 'タイトルへ戻る'
                          : '120Gを受け取り拠点へ'
                        : isReplay
                          ? 'タイトルへ戻る'
                          : 'リザルトへ進む'
                      : '次へ'}
                </span>
                <ChevronRight className="w-4 h-4 shrink-0" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
