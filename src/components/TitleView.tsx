import React, { useEffect, useRef, useState } from 'react';
import { Lock, Play, RotateCcw, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { getCompendiumStats } from '../game/data';
import { getSpriteCanvas, syncCustomAllySprite } from '../game/pixelSprites';
import { sound } from '../game/sound';
import { SaveState } from '../game/types';

interface TitleViewProps {
  save: SaveState;
  muted: boolean;
  bgmMuted: boolean;
  onContinue: () => void;
  onNewGame: () => void;
  onWatchOpening: () => void;
  onWatchEnding: () => void;
  onToggleMute: () => void;
  onToggleBgmMute: () => void;
}

type PixelSymbol = 'heart' | 'note' | 'sparkle' | 'sweat' | 'bang';

type TrailKind =
  | 'none'
  | 'dust'
  | 'sparkle'
  | 'heart'
  | 'snow'
  | 'fire'
  | 'void'
  | 'forge'
  | 'gold';

type ActorBehavior =
  | 'walk'
  | 'skip'
  | 'stomp'
  | 'sprint'
  | 'hop_chase'
  | 'fly_wave'
  | 'fly_loop'
  | 'glide'
  | 'dance'
  | 'float_orbit'
  | 'mega_bounce'
  | 'nervous_guard';

interface VignetteActor {
  spriteId: string;
  scale: number;
  x: number;
  y: number;
  baseY: number;
  vx: number;
  vy: number;
  facing: 1 | -1;
  dir: 1 | -1;
  behavior: ActorBehavior;
  phase: number;
  hopAmp: number;
  hopSpeed: number;
  trail: TrailKind;
  trailAccum: number;
  symbol: PixelSymbol | null;
  symbolColor: string;
  symbolTimer: number;
  symbolPeriod: number;
  defaultSymbol: PixelSymbol | null;
  defaultSymbolColor: string;
  squashX: number;
  squashY: number;
  pauseAtX?: number;
  pauseDuration?: number;
  pauseTimer: number;
  didPause: boolean;
  shootArrow?: boolean;
  didShoot?: boolean;
  flipTurnAtX?: number;
  didFlipTurn?: boolean;
  stompSync?: boolean;
  prop?: 'coin_bag' | 'star_orb';
}

interface TitleParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  gravity: number;
}

interface TitleStarOrb {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
  kind: 'star' | 'arrow';
}

interface VignetteSpec {
  id: string;
  dir: 1 | -1;
  build: (startEdgeX: number) => VignetteActor[];
}

interface AmbientWeatherParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number;
  color: string;
  size: number;
  kind: 'sakura' | 'leaf' | 'snow' | 'firefly';
  life: number;
  maxLife: number;
}

const CANVAS_W = 520;
const CANVAS_H = 224;

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const n = parseInt(clean, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function lerpColor(a: string, b: string, t: number): string {
  const clamped = Math.max(0, Math.min(1, t));
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  const r = Math.round(r1 + (r2 - r1) * clamped);
  const g = Math.round(g1 + (g2 - g1) * clamped);
  const bl = Math.round(b1 + (b2 - b1) * clamped);
  return `rgb(${r},${g},${bl})`;
}

interface SkyKeyframe {
  t: number;
  bands: [string, string, string, string, string];
  mountain: string;
  cloud: string;
  nightAlpha: number;
}

const SKY_KEYFRAMES: SkyKeyframe[] = [
  // 0.00 Dawn
  {
    t: 0.0,
    bands: ['#1e3a5f', '#3b6ca8', '#7c8db5', '#e5989b', '#fcd5ce'],
    mountain: '#353e5c',
    cloud: '#fed7aa',
    nightAlpha: 0.25,
  },
  // 0.22 Morning -> Bright Day
  {
    t: 0.22,
    bands: ['#0284c7', '#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd'],
    mountain: '#2f4b6e',
    cloud: '#f8fafc',
    nightAlpha: 0.0,
  },
  // 0.44 Afternoon Day
  {
    t: 0.44,
    bands: ['#0369a1', '#0284c7', '#38bdf8', '#7dd3fc', '#e0f2fe'],
    mountain: '#334e70',
    cloud: '#ffffff',
    nightAlpha: 0.0,
  },
  // 0.60 Golden Sunset
  {
    t: 0.6,
    bands: ['#1e1b4b', '#581c87', '#be185d', '#ea580c', '#fbbf24'],
    mountain: '#3b243f',
    cloud: '#fdba74',
    nightAlpha: 0.35,
  },
  // 0.74 Deep Dusk -> Night
  {
    t: 0.74,
    bands: ['#090d1c', '#111936', '#18244a', '#24325e', '#333b68'],
    mountain: '#19223b',
    cloud: '#475569',
    nightAlpha: 0.92,
  },
  // 0.90 Midnight
  {
    t: 0.9,
    bands: ['#070b18', '#0e152e', '#162044', '#212d56', '#2c3560'],
    mountain: '#151d33',
    cloud: '#334155',
    nightAlpha: 1.0,
  },
];

function sampleSky(dayPhase: number) {
  const p = ((dayPhase % 1) + 1) % 1;
  let k0 = SKY_KEYFRAMES[SKY_KEYFRAMES.length - 1];
  let k1 = SKY_KEYFRAMES[0];
  let span = 1 - k0.t + k1.t;
  let dist = p >= k0.t ? p - k0.t : 1 - k0.t + p;

  for (let i = 0; i < SKY_KEYFRAMES.length - 1; i++) {
    if (p >= SKY_KEYFRAMES[i].t && p < SKY_KEYFRAMES[i + 1].t) {
      k0 = SKY_KEYFRAMES[i];
      k1 = SKY_KEYFRAMES[i + 1];
      span = k1.t - k0.t;
      dist = p - k0.t;
      break;
    }
  }
  const u = span > 0 ? dist / span : 0;
  const bands = k0.bands.map((col, idx) => lerpColor(col, k1.bands[idx], u));
  const mountain = lerpColor(k0.mountain, k1.mountain, u);
  const cloud = lerpColor(k0.cloud, k1.cloud, u);
  const nightAlpha = k0.nightAlpha + (k1.nightAlpha - k0.nightAlpha) * u;
  return { bands, mountain, cloud, nightAlpha };
}

interface SeasonPalette {
  grassTop: string;
  grassShade: string;
  treePrimary: string;
  treeHighlight: string;
  pathTint: string;
  snowCapAlpha: number;
}

const SEASON_PALETTES: SeasonPalette[] = [
  // 0: Spring (Sakura & Fresh Green)
  {
    grassTop: '#2d6a4f',
    grassShade: '#40916c',
    treePrimary: '#f472b6',
    treeHighlight: '#fbcfe8',
    pathTint: '#2d3345',
    snowCapAlpha: 0,
  },
  // 1: Summer (Lush Emerald)
  {
    grassTop: '#15803d',
    grassShade: '#22c55e',
    treePrimary: '#166534',
    treeHighlight: '#4ade80',
    pathTint: '#2d3345',
    snowCapAlpha: 0,
  },
  // 2: Autumn (Amber & Maple Crimson)
  {
    grassTop: '#854d0e',
    grassShade: '#ca8a04',
    treePrimary: '#c2410c',
    treeHighlight: '#fb923c',
    pathTint: '#362e38',
    snowCapAlpha: 0,
  },
  // 3: Winter (Frost & Snow)
  {
    grassTop: '#cbd5e1',
    grassShade: '#f8fafc',
    treePrimary: '#64748b',
    treeHighlight: '#e2e8f0',
    pathTint: '#334155',
    snowCapAlpha: 1,
  },
];

function sampleSeason(seasonPhase: number) {
  const s = ((seasonPhase % 4) + 4) % 4;
  const i0 = Math.floor(s);
  const i1 = (i0 + 1) % 4;
  const u = s - i0;
  const p0 = SEASON_PALETTES[i0];
  const p1 = SEASON_PALETTES[i1];
  return {
    seasonIdx: i0,
    nextSeasonIdx: i1,
    blend: u,
    grassTop: lerpColor(p0.grassTop, p1.grassTop, u),
    grassShade: lerpColor(p0.grassShade, p1.grassShade, u),
    treePrimary: lerpColor(p0.treePrimary, p1.treePrimary, u),
    treeHighlight: lerpColor(p0.treeHighlight, p1.treeHighlight, u),
    pathTint: lerpColor(p0.pathTint, p1.pathTint, u),
    snowCapAlpha: p0.snowCapAlpha + (p1.snowCapAlpha - p0.snowCapAlpha) * u,
  };
}

function drawPixelSymbol(
  ctx: CanvasRenderingContext2D,
  sym: PixelSymbol,
  cx: number,
  cy: number,
  color: string
) {
  const x = Math.round(cx);
  const y = Math.round(cy);

  const px = (dx: number, dy: number, w = 2, h = 2, fill = color) => {
    ctx.fillStyle = '#090b10';
    ctx.fillRect(x + dx - 1, y + dy - 1, w + 2, h + 2);
    ctx.fillStyle = fill;
    ctx.fillRect(x + dx, y + dy, w, h);
  };

  if (sym === 'heart') {
    const pts = [
      [-4, -3],
      [-2, -3],
      [2, -3],
      [4, -3],
      [-5, -1],
      [-3, -1],
      [-1, -1],
      [1, -1],
      [3, -1],
      [-3, 1],
      [-1, 1],
      [1, 1],
      [-1, 3],
    ];
    ctx.fillStyle = '#090b10';
    pts.forEach(([dx, dy]) => ctx.fillRect(x + dx - 1, y + dy - 1, 4, 4));
    ctx.fillStyle = color;
    pts.forEach(([dx, dy]) => ctx.fillRect(x + dx, y + dy, 2, 2));
  } else if (sym === 'note') {
    ctx.fillStyle = '#090b10';
    ctx.fillRect(x - 4, y - 5, 9, 10);
    ctx.fillStyle = color;
    ctx.fillRect(x - 1, y - 4, 2, 7);
    ctx.fillRect(x + 1, y - 4, 3, 2);
    ctx.fillRect(x - 3, y + 1, 4, 3);
  } else if (sym === 'sparkle') {
    px(-1, -5, 2, 10);
    px(-5, -1, 10, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - 1, y - 1, 2, 2);
  } else if (sym === 'sweat') {
    px(-1, -4, 2, 2);
    px(-2, -2, 4, 4);
  } else if (sym === 'bang') {
    px(-1, -5, 2, 5);
    px(-1, 2, 2, 2);
  }
}

function makeActor(partial: Partial<VignetteActor> & { spriteId: string }): VignetteActor {
  const dir = partial.dir ?? 1;
  const baseY = partial.baseY ?? 172;
  return {
    spriteId: partial.spriteId,
    scale: partial.scale ?? 1.65,
    x: partial.x ?? -30,
    y: partial.y ?? baseY,
    baseY,
    vx: partial.vx ?? dir * 1.1,
    vy: partial.vy ?? 0,
    facing: partial.facing ?? dir,
    dir,
    behavior: partial.behavior ?? 'walk',
    phase: partial.phase ?? Math.random() * Math.PI * 2,
    hopAmp: partial.hopAmp ?? 4,
    hopSpeed: partial.hopSpeed ?? 0.011,
    trail: partial.trail ?? 'dust',
    trailAccum: 0,
    symbol: partial.symbol ?? null,
    symbolColor: partial.symbolColor ?? '#fde047',
    symbolTimer: partial.symbolTimer ?? 0,
    symbolPeriod: partial.symbolPeriod ?? 1700,
    defaultSymbol: partial.defaultSymbol ?? null,
    defaultSymbolColor: partial.defaultSymbolColor ?? '#fde047',
    squashX: 1,
    squashY: 1,
    pauseAtX: partial.pauseAtX,
    pauseDuration: partial.pauseDuration ?? 700,
    pauseTimer: 0,
    didPause: false,
    shootArrow: partial.shootArrow,
    didShoot: false,
    flipTurnAtX: partial.flipTurnAtX,
    didFlipTurn: false,
    stompSync: partial.stompSync,
    prop: partial.prop,
  };
}

function buildVignetteDeck(includeCustom: boolean): VignetteSpec[] {
  const specs: VignetteSpec[] = [
    // 1. Classic Party Friendly Walk (Hero + Cleric + Knight)
    {
      id: 'stroll_party',
      dir: 1,
      build: (sx) => [
        makeActor({
          spriteId: 'ally_knight',
          dir: 1,
          x: sx,
          baseY: 170,
          vx: 1.05,
          scale: 1.68,
          behavior: 'walk',
          hopAmp: 3.5,
          pauseAtX: 280,
          pauseDuration: 680,
          defaultSymbol: 'note',
          defaultSymbolColor: '#38bdf8',
          symbolPeriod: 1850,
        }),
        makeActor({
          spriteId: 'hero',
          dir: 1,
          x: sx - 38,
          baseY: 174,
          vx: 1.08,
          scale: 1.75,
          behavior: 'skip',
          hopAmp: 6.5,
          trail: 'sparkle',
          defaultSymbol: 'sparkle',
          defaultSymbolColor: '#fde047',
          symbolPeriod: 1500,
        }),
        makeActor({
          spriteId: 'ally_cleric',
          dir: 1,
          x: sx - 74,
          baseY: 168,
          vx: 1.05,
          scale: 1.62,
          behavior: 'walk',
          hopAmp: 4,
          trail: 'heart',
          defaultSymbol: 'heart',
          defaultSymbolColor: '#fb7185',
          symbolPeriod: 1600,
        }),
      ],
    },

    // 2. Tag / Chase: Hero playfully chasing two bouncy Slimes
    {
      id: 'tag_hero_slimes',
      dir: 1,
      build: (sx) => [
        makeActor({
          spriteId: 'enemy_slime',
          dir: 1,
          x: sx,
          baseY: 176,
          vx: 1.62,
          scale: 1.5,
          behavior: 'hop_chase',
          hopAmp: 12,
          hopSpeed: 0.015,
          defaultSymbol: 'note',
          defaultSymbolColor: '#38bdf8',
          symbolPeriod: 1300,
        }),
        makeActor({
          spriteId: 'enemy_slime',
          dir: 1,
          x: sx - 30,
          baseY: 164,
          vx: 1.54,
          scale: 1.32,
          behavior: 'hop_chase',
          hopAmp: 10,
          hopSpeed: 0.017,
          phase: 1.4,
          defaultSymbol: 'sweat',
          defaultSymbolColor: '#7dd3fc',
          symbolPeriod: 1550,
        }),
        makeActor({
          spriteId: 'hero',
          dir: 1,
          x: sx - 78,
          baseY: 174,
          vx: 1.66,
          scale: 1.75,
          behavior: 'sprint',
          hopAmp: 7,
          hopSpeed: 0.018,
          trail: 'dust',
          defaultSymbol: 'bang',
          defaultSymbolColor: '#facc15',
          symbolPeriod: 1400,
        }),
      ],
    },

    // 3. Flying Trio Across the Sky: Bat + Imp + Gargoyle (Right -> Left)
    {
      id: 'sky_bat_imp_gargoyle',
      dir: -1,
      build: (sx) => [
        makeActor({
          spriteId: 'enemy_bat',
          dir: -1,
          x: sx,
          baseY: 82,
          vx: -1.68,
          scale: 1.5,
          behavior: 'fly_loop',
          hopAmp: 14,
          hopSpeed: 0.009,
          trail: 'none',
          defaultSymbol: 'note',
          defaultSymbolColor: '#c084fc',
          symbolPeriod: 1500,
        }),
        makeActor({
          spriteId: 'enemy_imp',
          dir: -1,
          x: sx + 38,
          baseY: 96,
          vx: -1.6,
          scale: 1.55,
          behavior: 'fly_wave',
          hopAmp: 11,
          hopSpeed: 0.008,
          phase: 1.2,
          trail: 'fire',
          defaultSymbol: 'sparkle',
          defaultSymbolColor: '#fb923c',
          symbolPeriod: 1450,
        }),
        makeActor({
          spriteId: 'enemy_gargoyle',
          dir: -1,
          x: sx + 80,
          baseY: 76,
          vx: -1.5,
          scale: 1.75,
          behavior: 'glide',
          hopAmp: 7,
          hopSpeed: 0.005,
          trail: 'void',
        }),
      ],
    },

    // 4. Treasure Tag: Thief sprints with coin bag chased by Mimic & Goblin
    {
      id: 'tag_thief_mimic',
      dir: 1,
      build: (sx) => [
        makeActor({
          spriteId: 'ally_thief',
          dir: 1,
          x: sx,
          baseY: 174,
          vx: 1.76,
          scale: 1.65,
          behavior: 'sprint',
          hopAmp: 6,
          trail: 'gold',
          prop: 'coin_bag',
          defaultSymbol: 'note',
          defaultSymbolColor: '#facc15',
          symbolPeriod: 1300,
        }),
        makeActor({
          spriteId: 'enemy_mimic',
          dir: 1,
          x: sx - 48,
          baseY: 175,
          vx: 1.7,
          scale: 1.62,
          behavior: 'hop_chase',
          hopAmp: 13,
          hopSpeed: 0.015,
          trail: 'dust',
          defaultSymbol: 'bang',
          defaultSymbolColor: '#f43f5e',
          symbolPeriod: 1200,
        }),
        makeActor({
          spriteId: 'enemy_goblin',
          dir: 1,
          x: sx - 88,
          baseY: 168,
          vx: 1.64,
          scale: 1.55,
          behavior: 'sprint',
          hopAmp: 7,
          defaultSymbol: 'sweat',
          defaultSymbolColor: '#38bdf8',
          symbolPeriod: 1350,
        }),
      ],
    },

    // 5. Magic Sky & Ground Dance: Mage + Ice Wisp + Star Elemental
    {
      id: 'sky_mage_spirits',
      dir: 1,
      build: (sx) => [
        makeActor({
          spriteId: 'enemy_star_elemental',
          dir: 1,
          x: sx + 8,
          baseY: 100,
          vx: 1.24,
          scale: 1.55,
          behavior: 'float_orbit',
          hopAmp: 13,
          hopSpeed: 0.006,
          trail: 'sparkle',
          defaultSymbol: 'sparkle',
          defaultSymbolColor: '#fde047',
          symbolPeriod: 1400,
        }),
        makeActor({
          spriteId: 'ally_mage',
          dir: 1,
          x: sx - 26,
          baseY: 170,
          vx: 1.24,
          scale: 1.65,
          behavior: 'skip',
          hopAmp: 5.5,
          trail: 'void',
          prop: 'star_orb',
          defaultSymbol: 'note',
          defaultSymbolColor: '#e879f9',
          symbolPeriod: 1600,
        }),
        makeActor({
          spriteId: 'enemy_ice_wisp',
          dir: 1,
          x: sx - 60,
          baseY: 108,
          vx: 1.26,
          scale: 1.5,
          behavior: 'fly_loop',
          hopAmp: 11,
          hopSpeed: 0.007,
          phase: 2.1,
          trail: 'snow',
        }),
      ],
    },

    // 6. Frost Parade (Right -> Left): Ice Wisp + Frost Queen + Frost Knight
    {
      id: 'frost_parade',
      dir: -1,
      build: (sx) => [
        makeActor({
          spriteId: 'enemy_ice_wisp',
          dir: -1,
          x: sx,
          baseY: 120,
          vx: -1.18,
          scale: 1.45,
          behavior: 'fly_wave',
          hopAmp: 9,
          trail: 'snow',
          defaultSymbol: 'sparkle',
          defaultSymbolColor: '#7dd3fc',
          symbolPeriod: 1600,
        }),
        makeActor({
          spriteId: 'boss_frost_queen',
          dir: -1,
          x: sx + 38,
          baseY: 166,
          vx: -1.16,
          scale: 1.9,
          behavior: 'glide',
          hopAmp: 4,
          trail: 'snow',
          defaultSymbol: 'heart',
          defaultSymbolColor: '#bae6fd',
          symbolPeriod: 1900,
        }),
        makeActor({
          spriteId: 'enemy_frost_knight',
          dir: -1,
          x: sx + 78,
          baseY: 174,
          vx: -1.16,
          scale: 1.65,
          behavior: 'walk',
          hopAmp: 3,
          trail: 'snow',
        }),
      ],
    },

    // 7. Heavy Stomp Comedy: Golem + Orc + Bouncing Goblin
    {
      id: 'heavy_stomp_trio',
      dir: 1,
      build: (sx) => [
        makeActor({
          spriteId: 'boss_golem',
          dir: 1,
          x: sx,
          baseY: 176,
          vx: 0.92,
          scale: 2.0,
          behavior: 'stomp',
          hopAmp: 3,
          hopSpeed: 0.007,
          trail: 'dust',
          stompSync: true,
        }),
        makeActor({
          spriteId: 'enemy_goblin',
          dir: 1,
          x: sx - 42,
          baseY: 172,
          vx: 0.93,
          scale: 1.45,
          behavior: 'hop_chase',
          hopAmp: 12,
          hopSpeed: 0.011,
          defaultSymbol: 'bang',
          defaultSymbolColor: '#fde047',
          symbolPeriod: 1500,
        }),
        makeActor({
          spriteId: 'enemy_orc',
          dir: 1,
          x: sx - 80,
          baseY: 176,
          vx: 0.92,
          scale: 1.72,
          behavior: 'stomp',
          hopAmp: 4,
          hopSpeed: 0.008,
          trail: 'dust',
        }),
      ],
    },

    // 8. Sky Dragon Flight Show: Abyss Dragon + Bat + Imp
    {
      id: 'dragon_sky_show',
      dir: -1,
      build: (sx) => [
        makeActor({
          spriteId: 'enemy_imp',
          dir: -1,
          x: sx,
          baseY: 88,
          vx: -1.52,
          scale: 1.5,
          behavior: 'fly_loop',
          hopAmp: 12,
          trail: 'fire',
          defaultSymbol: 'note',
          defaultSymbolColor: '#fb923c',
          symbolPeriod: 1400,
        }),
        makeActor({
          spriteId: 'boss_dragon',
          dir: -1,
          x: sx + 54,
          baseY: 96,
          vx: -1.46,
          scale: 2.15,
          behavior: 'fly_wave',
          hopAmp: 9,
          hopSpeed: 0.0045,
          trail: 'fire',
        }),
        makeActor({
          spriteId: 'enemy_bat',
          dir: -1,
          x: sx + 102,
          baseY: 74,
          vx: -1.56,
          scale: 1.4,
          behavior: 'fly_wave',
          hopAmp: 10,
          phase: 1.8,
          trail: 'none',
        }),
      ],
    },

    // 9. King Slime Bounce Parade (3-Slime Family)
    {
      id: 'king_slime_parade',
      dir: 1,
      build: (sx) => [
        makeActor({
          spriteId: 'enemy_slime',
          dir: 1,
          x: sx,
          baseY: 174,
          vx: 1.2,
          scale: 1.4,
          behavior: 'hop_chase',
          hopAmp: 10,
          hopSpeed: 0.013,
          defaultSymbol: 'note',
          defaultSymbolColor: '#38bdf8',
          symbolPeriod: 1650,
        }),
        makeActor({
          spriteId: 'boss_king_slime',
          dir: 1,
          x: sx - 42,
          baseY: 178,
          vx: 1.2,
          scale: 2.0,
          behavior: 'mega_bounce',
          hopAmp: 18,
          hopSpeed: 0.0085,
          trail: 'dust',
          defaultSymbol: 'heart',
          defaultSymbolColor: '#7dd3fc',
          symbolPeriod: 1800,
        }),
        makeActor({
          spriteId: 'enemy_slime',
          dir: 1,
          x: sx - 84,
          baseY: 170,
          vx: 1.2,
          scale: 1.35,
          behavior: 'hop_chase',
          hopAmp: 10,
          hopSpeed: 0.013,
          phase: 0.8,
        }),
      ],
    },

    // 10. Ranger Sky-Hunting Playful Bat & Imp
    {
      id: 'ranger_sky_tag',
      dir: 1,
      build: (sx) => [
        makeActor({
          spriteId: 'enemy_bat',
          dir: 1,
          x: sx,
          baseY: 96,
          vx: 1.54,
          scale: 1.5,
          behavior: 'fly_loop',
          hopAmp: 13,
          trail: 'none',
          defaultSymbol: 'note',
          defaultSymbolColor: '#f472b6',
          symbolPeriod: 1400,
        }),
        makeActor({
          spriteId: 'ally_ranger',
          dir: 1,
          x: sx - 46,
          baseY: 174,
          vx: 1.54,
          scale: 1.68,
          behavior: 'sprint',
          hopAmp: 7,
          trail: 'dust',
          shootArrow: true,
          defaultSymbol: 'sparkle',
          defaultSymbolColor: '#34d399',
          symbolPeriod: 1500,
        }),
        makeActor({
          spriteId: 'ally_thief',
          dir: 1,
          x: sx - 86,
          baseY: 168,
          vx: 1.56,
          scale: 1.6,
          behavior: 'skip',
          hopAmp: 7,
          trail: 'sparkle',
        }),
      ],
    },

    // 11. Town Craftsmen Parade: Merchant + Blacksmith + Knight
    {
      id: 'town_craftsmen_walk',
      dir: 1,
      build: (sx) => [
        makeActor({
          spriteId: 'npc_merchant',
          dir: 1,
          x: sx,
          baseY: 172,
          vx: 1.05,
          scale: 1.62,
          behavior: 'skip',
          hopAmp: 4.5,
          trail: 'gold',
          defaultSymbol: 'note',
          defaultSymbolColor: '#facc15',
          symbolPeriod: 1600,
        }),
        makeActor({
          spriteId: 'npc_blacksmith',
          dir: 1,
          x: sx - 40,
          baseY: 176,
          vx: 1.05,
          scale: 1.7,
          behavior: 'stomp',
          hopAmp: 3.5,
          trail: 'forge',
          defaultSymbol: 'sparkle',
          defaultSymbolColor: '#fb923c',
          symbolPeriod: 1500,
        }),
        makeActor({
          spriteId: 'ally_knight',
          dir: 1,
          x: sx - 80,
          baseY: 170,
          vx: 1.05,
          scale: 1.66,
          behavior: 'walk',
          hopAmp: 3.5,
          trail: 'sparkle',
        }),
      ],
    },

    // 12. Royal Stroll: King + Villager + Nervous Soldier (Right -> Left)
    {
      id: 'king_royal_stroll',
      dir: -1,
      build: (sx) => [
        makeActor({
          spriteId: 'npc_villager_b',
          dir: -1,
          x: sx,
          baseY: 168,
          vx: -1.0,
          scale: 1.58,
          behavior: 'skip',
          hopAmp: 5.5,
          trail: 'heart',
          defaultSymbol: 'heart',
          defaultSymbolColor: '#f472b6',
          symbolPeriod: 1700,
        }),
        makeActor({
          spriteId: 'npc_king',
          dir: -1,
          x: sx + 38,
          baseY: 174,
          vx: -1.0,
          scale: 1.82,
          behavior: 'walk',
          hopAmp: 3,
          trail: 'gold',
          defaultSymbol: 'note',
          defaultSymbolColor: '#fde047',
          symbolPeriod: 1600,
        }),
        makeActor({
          spriteId: 'npc_soldier',
          dir: -1,
          x: sx + 78,
          baseY: 172,
          vx: -1.0,
          scale: 1.62,
          behavior: 'nervous_guard',
          hopAmp: 6,
          defaultSymbol: 'sweat',
          defaultSymbolColor: '#38bdf8',
          symbolPeriod: 1300,
        }),
      ],
    },

    // 13. Rival Knights Tag: Shadow Knight vs Ally Knight + Cleric
    {
      id: 'rival_knights_race',
      dir: 1,
      build: (sx) => [
        makeActor({
          spriteId: 'enemy_shadow_knight',
          dir: 1,
          x: sx,
          baseY: 170,
          vx: 1.56,
          scale: 1.72,
          behavior: 'sprint',
          hopAmp: 5,
          trail: 'void',
          defaultSymbol: 'bang',
          defaultSymbolColor: '#c084fc',
          symbolPeriod: 1500,
        }),
        makeActor({
          spriteId: 'ally_knight',
          dir: 1,
          x: sx - 32,
          baseY: 176,
          vx: 1.6,
          scale: 1.72,
          behavior: 'sprint',
          hopAmp: 5,
          trail: 'dust',
          defaultSymbol: 'bang',
          defaultSymbolColor: '#38bdf8',
          symbolPeriod: 1400,
        }),
        makeActor({
          spriteId: 'ally_cleric',
          dir: 1,
          x: sx - 76,
          baseY: 166,
          vx: 1.56,
          scale: 1.6,
          behavior: 'skip',
          hopAmp: 6,
          trail: 'heart',
          defaultSymbol: 'heart',
          defaultSymbolColor: '#34d399',
          symbolPeriod: 1500,
        }),
      ],
    },

    // 14. Cosmic Floating Trio: Star Warden + Void Reaper + Chaos Chimera (Right -> Left)
    {
      id: 'cosmic_float_trio',
      dir: -1,
      build: (sx) => [
        makeActor({
          spriteId: 'enemy_void_reaper',
          dir: -1,
          x: sx,
          baseY: 112,
          vx: -1.24,
          scale: 1.68,
          behavior: 'float_orbit',
          hopAmp: 12,
          trail: 'void',
        }),
        makeActor({
          spriteId: 'boss_star_warden',
          dir: -1,
          x: sx + 48,
          baseY: 96,
          vx: -1.22,
          scale: 1.92,
          behavior: 'fly_wave',
          hopAmp: 10,
          phase: 1.3,
          trail: 'sparkle',
          defaultSymbol: 'sparkle',
          defaultSymbolColor: '#fde047',
          symbolPeriod: 1500,
        }),
        makeActor({
          spriteId: 'enemy_chaos_chimera',
          dir: -1,
          x: sx + 96,
          baseY: 118,
          vx: -1.24,
          scale: 1.68,
          behavior: 'fly_loop',
          hopAmp: 11,
          phase: 2.4,
          trail: 'fire',
        }),
      ],
    },

    // 15. Cheerful Undead Dance March: Skeleton + Dark Priest + Bat
    {
      id: 'undead_dance_march',
      dir: 1,
      build: (sx) => [
        makeActor({
          spriteId: 'enemy_skeleton',
          dir: 1,
          x: sx,
          baseY: 174,
          vx: 1.12,
          scale: 1.62,
          behavior: 'dance',
          hopAmp: 8,
          hopSpeed: 0.015,
          trail: 'dust',
          defaultSymbol: 'note',
          defaultSymbolColor: '#e2e8f0',
          symbolPeriod: 1350,
        }),
        makeActor({
          spriteId: 'enemy_dark_priest',
          dir: 1,
          x: sx - 42,
          baseY: 164,
          vx: 1.12,
          scale: 1.65,
          behavior: 'glide',
          hopAmp: 5,
          trail: 'void',
          defaultSymbol: 'sparkle',
          defaultSymbolColor: '#c084fc',
          symbolPeriod: 1650,
        }),
        makeActor({
          spriteId: 'enemy_bat',
          dir: 1,
          x: sx - 20,
          baseY: 108,
          vx: 1.14,
          scale: 1.4,
          behavior: 'fly_loop',
          hopAmp: 10,
          trail: 'none',
        }),
      ],
    },

    // 16. Table-Turning Tag: Death Knight & Hero (Right -> Left, Hero flips tables!)
    {
      id: 'death_knight_hero_tag',
      dir: -1,
      build: (sx) => [
        makeActor({
          spriteId: 'hero',
          dir: -1,
          x: sx,
          baseY: 174,
          vx: -1.62,
          scale: 1.75,
          behavior: 'sprint',
          hopAmp: 7,
          trail: 'sparkle',
          flipTurnAtX: 255,
          defaultSymbol: 'sweat',
          defaultSymbolColor: '#38bdf8',
          symbolPeriod: 1300,
        }),
        makeActor({
          spriteId: 'boss_death_knight',
          dir: -1,
          x: sx + 48,
          baseY: 172,
          vx: -1.62,
          scale: 1.88,
          behavior: 'hop_chase',
          hopAmp: 7,
          trail: 'void',
          flipTurnAtX: 295,
          defaultSymbol: 'bang',
          defaultSymbolColor: '#f43f5e',
          symbolPeriod: 1400,
        }),
      ],
    },

    // 17. Endgame Overlords Leisurely Walk: Crimson Archfiend + Chrono Titan + Imp
    {
      id: 'overlords_leisure_walk',
      dir: -1,
      build: (sx) => [
        makeActor({
          spriteId: 'enemy_imp',
          dir: -1,
          x: sx,
          baseY: 118,
          vx: -1.04,
          scale: 1.45,
          behavior: 'fly_loop',
          hopAmp: 12,
          trail: 'fire',
          defaultSymbol: 'note',
          defaultSymbolColor: '#fde047',
          symbolPeriod: 1500,
        }),
        makeActor({
          spriteId: 'boss_crimson_archfiend',
          dir: -1,
          x: sx + 44,
          baseY: 174,
          vx: -1.02,
          scale: 1.95,
          behavior: 'walk',
          hopAmp: 3.5,
          trail: 'fire',
        }),
        makeActor({
          spriteId: 'boss_chrono_titan',
          dir: -1,
          x: sx + 92,
          baseY: 176,
          vx: -1.02,
          scale: 1.98,
          behavior: 'stomp',
          hopAmp: 3,
          trail: 'sparkle',
        }),
      ],
    },

    // 18. Mage Trick Show with Hero & Villager A
    {
      id: 'mage_trick_show',
      dir: 1,
      build: (sx) => [
        makeActor({
          spriteId: 'ally_mage',
          dir: 1,
          x: sx,
          baseY: 170,
          vx: 1.18,
          scale: 1.68,
          behavior: 'skip',
          hopAmp: 5,
          pauseAtX: 270,
          pauseDuration: 720,
          trail: 'sparkle',
          prop: 'star_orb',
          defaultSymbol: 'sparkle',
          defaultSymbolColor: '#e879f9',
          symbolPeriod: 1400,
        }),
        makeActor({
          spriteId: 'npc_villager_a',
          dir: 1,
          x: sx - 40,
          baseY: 174,
          vx: 1.18,
          scale: 1.58,
          behavior: 'skip',
          hopAmp: 6,
          trail: 'heart',
          defaultSymbol: 'heart',
          defaultSymbolColor: '#fb7185',
          symbolPeriod: 1600,
        }),
        makeActor({
          spriteId: 'hero',
          dir: 1,
          x: sx - 78,
          baseY: 172,
          vx: 1.18,
          scale: 1.75,
          behavior: 'walk',
          hopAmp: 5,
          trail: 'sparkle',
        }),
      ],
    },
  ];

  if (includeCustom) {
    specs.push(
      // 19. Custom Ally + Hero + Ranger Happy Dash
      {
        id: 'custom_ally_adventure',
        dir: 1,
        build: (sx) => [
          makeActor({
            spriteId: 'ally_custom',
            dir: 1,
            x: sx,
            baseY: 174,
            vx: 1.42,
            scale: 1.78,
            behavior: 'skip',
            hopAmp: 7,
            pauseAtX: 275,
            pauseDuration: 600,
            trail: 'sparkle',
            defaultSymbol: 'heart',
            defaultSymbolColor: '#f472b6',
            symbolPeriod: 1350,
          }),
          makeActor({
            spriteId: 'hero',
            dir: 1,
            x: sx - 42,
            baseY: 170,
            vx: 1.42,
            scale: 1.75,
            behavior: 'skip',
            hopAmp: 6.5,
            trail: 'sparkle',
            defaultSymbol: 'note',
            defaultSymbolColor: '#fde047',
            symbolPeriod: 1500,
          }),
          makeActor({
            spriteId: 'ally_ranger',
            dir: 1,
            x: sx - 82,
            baseY: 176,
            vx: 1.42,
            scale: 1.65,
            behavior: 'sprint',
            hopAmp: 6,
            trail: 'dust',
          }),
        ],
      },
      // 20. Custom Ally Playing Tag with Slimes
      {
        id: 'custom_ally_slime_tag',
        dir: -1,
        build: (sx) => [
          makeActor({
            spriteId: 'enemy_slime',
            dir: -1,
            x: sx,
            baseY: 175,
            vx: -1.55,
            scale: 1.45,
            behavior: 'hop_chase',
            hopAmp: 11,
            defaultSymbol: 'note',
            defaultSymbolColor: '#38bdf8',
            symbolPeriod: 1400,
          }),
          makeActor({
            spriteId: 'ally_custom',
            dir: -1,
            x: sx + 44,
            baseY: 172,
            vx: -1.58,
            scale: 1.78,
            behavior: 'sprint',
            hopAmp: 7.5,
            trail: 'heart',
            defaultSymbol: 'sparkle',
            defaultSymbolColor: '#fde047',
            symbolPeriod: 1350,
          }),
          makeActor({
            spriteId: 'enemy_slime',
            dir: -1,
            x: sx + 86,
            baseY: 164,
            vx: -1.52,
            scale: 1.35,
            behavior: 'hop_chase',
            hopAmp: 9,
            phase: 1.5,
          }),
        ],
      }
    );
  }

  return specs;
}

export const TitleView: React.FC<TitleViewProps> = ({
  save,
  muted,
  bgmMuted,
  onContinue,
  onNewGame,
  onWatchOpening,
  onWatchEnding,
  onToggleMute,
  onToggleBgmMute,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [confirmNewGame, setConfirmNewGame] = useState(false);

  const hasProgress =
    save.totalRuns > 0 ||
    save.highestClearedStage > 0 ||
    save.loopCount > 1 ||
    Boolean(save.seenStoryOpening);
  const endingUnlocked =
    save.highestClearedStage >= 6 ||
    save.highestClearedLoop >= 1 ||
    Boolean(save.seenStoryEnding);
  const compStats = getCompendiumStats(save);

  useEffect(() => {
    syncCustomAllySprite(save.customAlly);
  }, [save.customAlly]);

  useEffect(() => {
    const canShowCustom = save.loopCount >= 2 && Boolean(save.customAlly?.created);
    const deckTemplate = buildVignetteDeck(canShowCustom);
    let shuffledQueue: VignetteSpec[] = [];
    let lastId = '';

    const nextVignette = (): VignetteActor[] => {
      if (shuffledQueue.length === 0) {
        shuffledQueue = [...deckTemplate].sort(() => Math.random() - 0.5);
        if (shuffledQueue.length > 1 && shuffledQueue[0].id === lastId) {
          const first = shuffledQueue.shift()!;
          shuffledQueue.push(first);
        }
      }
      const spec = shuffledQueue.shift()!;
      lastId = spec.id;
      const startEdge = spec.dir === 1 ? -28 : CANVAS_W + 28;
      return spec.build(startEdge);
    };

    let activeGroup: VignetteActor[] = nextVignette();
    // Nudge the first troupe slightly closer to frame-in immediately
    activeGroup.forEach((a) => {
      a.x += a.dir * 22;
    });

    const particles: TitleParticle[] = [];
    const weatherParticles: AmbientWeatherParticle[] = [];
    const orbs: TitleStarOrb[] = [];
    const stars = Array.from({ length: 34 }, (_, i) => ({
      x: ((i * 73) % (CANVAS_W - 20)) + 10,
      y: ((i * 29) % 88) + 8,
      phase: i * 0.9,
      size: i % 5 === 0 ? 2 : 1,
    }));
    const clouds = Array.from({ length: 4 }, (_, i) => ({
      x: i * 145 + Math.random() * 40,
      y: 26 + (i % 2) * 18 + Math.random() * 8,
      w: 36 + (i % 3) * 12,
      speed: 0.14 + (i % 2) * 0.06,
    }));

    // Random starting time of day (0..1) and season (0..4) each visit
    let dayPhase = Math.random();
    let seasonPhase = Math.random() * 4;

    const spawnBurst = (
      x: number,
      y: number,
      colors: string[],
      count = 6,
      gravity = 0.04
    ) => {
      for (let i = 0; i < count; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = 0.35 + Math.random() * 1.25;
        particles.push({
          x,
          y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd - 0.65,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() < 0.6 ? 2 : 3,
          life: 400 + Math.random() * 320,
          gravity,
        });
      }
    };

    const spawnTrail = (a: VignetteActor) => {
      if (a.trail === 'none') return;
      if (a.trail === 'dust') {
        particles.push({
          x: a.x - a.facing * 8,
          y: a.baseY - 2,
          vx: -a.facing * (0.2 + Math.random() * 0.3),
          vy: -0.25 - Math.random() * 0.2,
          color: '#cbd5e1',
          size: 2,
          life: 320,
          gravity: 0.01,
        });
      } else if (a.trail === 'sparkle') {
        particles.push({
          x: a.x + (Math.random() - 0.5) * 14,
          y: a.y - 12 + (Math.random() - 0.5) * 12,
          vx: -a.vx * 0.2,
          vy: -0.35,
          color: Math.random() < 0.5 ? '#fde047' : '#ffffff',
          size: 2,
          life: 420,
          gravity: 0,
        });
      } else if (a.trail === 'heart') {
        particles.push({
          x: a.x + (Math.random() - 0.5) * 12,
          y: a.y - 18,
          vx: (Math.random() - 0.5) * 0.25,
          vy: -0.45,
          color: Math.random() < 0.5 ? '#fb7185' : '#f472b6',
          size: 2,
          life: 480,
          gravity: -0.005,
        });
      } else if (a.trail === 'snow') {
        particles.push({
          x: a.x + (Math.random() - 0.5) * 18,
          y: a.y - 16 + (Math.random() - 0.5) * 12,
          vx: (Math.random() - 0.5) * 0.3,
          vy: 0.3 + Math.random() * 0.3,
          color: Math.random() < 0.5 ? '#e0f2fe' : '#38bdf8',
          size: 2,
          life: 520,
          gravity: 0.01,
        });
      } else if (a.trail === 'fire') {
        particles.push({
          x: a.x - a.facing * 10,
          y: a.y - 12 + (Math.random() - 0.5) * 8,
          vx: -a.facing * 0.4,
          vy: -0.3 - Math.random() * 0.3,
          color: Math.random() < 0.5 ? '#f97316' : '#facc15',
          size: 2,
          life: 360,
          gravity: -0.01,
        });
      } else if (a.trail === 'void') {
        particles.push({
          x: a.x + (Math.random() - 0.5) * 14,
          y: a.y - 10 + (Math.random() - 0.5) * 10,
          vx: -a.vx * 0.15,
          vy: -0.2,
          color: Math.random() < 0.5 ? '#a855f7' : '#6366f1',
          size: 2,
          life: 420,
          gravity: 0,
        });
      } else if (a.trail === 'forge') {
        particles.push({
          x: a.x + a.facing * 6,
          y: a.y - 14,
          vx: (Math.random() - 0.5) * 1.1,
          vy: -0.9 - Math.random() * 0.6,
          color: Math.random() < 0.5 ? '#fb923c' : '#fde047',
          size: 2,
          life: 380,
          gravity: 0.05,
        });
      } else if (a.trail === 'gold') {
        particles.push({
          x: a.x + (Math.random() - 0.5) * 12,
          y: a.y - 14,
          vx: (Math.random() - 0.5) * 0.4,
          vy: -0.5,
          color: Math.random() < 0.5 ? '#facc15' : '#fef08a',
          size: 2,
          life: 440,
          gravity: 0.02,
        });
      }
    };

    const canvas = canvasRef.current;
    const handlePointer = (ev: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const cx = ((ev.clientX - rect.left) / rect.width) * CANVAS_W;
      const cy = ((ev.clientY - rect.top) / rect.height) * CANVAS_H;
      spawnBurst(cx, cy, ['#fde047', '#38bdf8', '#fb7185'], 10);
      activeGroup.forEach((a) => {
        if (Math.hypot(a.x - cx, a.y - cy) < 90) {
          a.squashX = 0.8;
          a.squashY = 1.25;
          a.symbol = a.defaultSymbol ?? 'heart';
          a.symbolColor = '#fde047';
          a.symbolTimer = 900;
        }
      });
    };
    canvas?.addEventListener('click', handlePointer);

    let rafId = 0;
    let lastTime = performance.now();
    let clock = 0;
    let handoffPause = 0;

    const tick = (now: number) => {
      const dt = Math.min(48, now - lastTime);
      lastTime = now;
      clock += dt;

      // Advance time-of-day (~42s full day/night cycle) & seasons (~26s per season)
      dayPhase = (dayPhase + dt / 42000) % 1;
      seasonPhase = (seasonPhase + dt / 26000) % 4;
      const skyNow = sampleSky(dayPhase);
      const seasonNow = sampleSeason(seasonPhase);

      // Update drifting clouds
      clouds.forEach((c) => {
        c.x += c.speed * (dt / 16);
        if (c.x > CANVAS_W + 40) c.x = -c.w - 20;
      });

      // Spawn leisurely seasonal weather particles
      const activeSeason =
        seasonNow.blend > 0.5 ? seasonNow.nextSeasonIdx : seasonNow.seasonIdx;
      if (weatherParticles.length < 36) {
        if (activeSeason === 0 && Math.random() < 0.22 * (dt / 16)) {
          // Spring: Sakura petals
          weatherParticles.push({
            x: Math.random() * (CANVAS_W + 40) - 20,
            y: -4,
            vx: 0.28 + Math.random() * 0.35,
            vy: 0.32 + Math.random() * 0.28,
            phase: Math.random() * Math.PI * 2,
            color: Math.random() < 0.5 ? '#fbcfe8' : '#f9a8d4',
            size: 2,
            kind: 'sakura',
            life: 6000,
            maxLife: 6000,
          });
        } else if (
          activeSeason === 1 &&
          skyNow.nightAlpha > 0.45 &&
          Math.random() < 0.14 * (dt / 16)
        ) {
          // Summer Night: Fireflies
          weatherParticles.push({
            x: 20 + Math.random() * (CANVAS_W - 40),
            y: 122 + Math.random() * 68,
            vx: (Math.random() - 0.5) * 0.35,
            vy: -0.15 + (Math.random() - 0.5) * 0.25,
            phase: Math.random() * Math.PI * 2,
            color: '#bef264',
            size: 2,
            kind: 'firefly',
            life: 2400 + Math.random() * 1400,
            maxLife: 3800,
          });
        } else if (activeSeason === 2 && Math.random() < 0.2 * (dt / 16)) {
          // Autumn: Falling leaves
          const leafColors = ['#f97316', '#ef4444', '#facc15'];
          weatherParticles.push({
            x: Math.random() * (CANVAS_W + 40) - 20,
            y: -4,
            vx: -0.22 - Math.random() * 0.35,
            vy: 0.38 + Math.random() * 0.32,
            phase: Math.random() * Math.PI * 2,
            color: leafColors[Math.floor(Math.random() * leafColors.length)],
            size: Math.random() < 0.5 ? 2 : 3,
            kind: 'leaf',
            life: 5500,
            maxLife: 5500,
          });
        } else if (activeSeason === 3 && Math.random() < 0.34 * (dt / 16)) {
          // Winter: Snowflakes
          weatherParticles.push({
            x: Math.random() * (CANVAS_W + 20) - 10,
            y: -4,
            vx: (Math.random() - 0.5) * 0.25,
            vy: 0.34 + Math.random() * 0.35,
            phase: Math.random() * Math.PI * 2,
            color: Math.random() < 0.65 ? '#ffffff' : '#e0f2fe',
            size: Math.random() < 0.75 ? 2 : 3,
            kind: 'snow',
            life: 6200,
            maxLife: 6200,
          });
        }
      }

      for (let i = weatherParticles.length - 1; i >= 0; i--) {
        const w = weatherParticles[i];
        w.phase += 0.004 * dt;
        w.x += (w.vx + Math.sin(w.phase) * 0.22) * (dt / 16);
        w.y += w.vy * (dt / 16);
        w.life -= dt;
        if (w.life <= 0 || w.y > CANVAS_H - 10) {
          weatherParticles.splice(i, 1);
        }
      }

      // Update particles & playful star orbs
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx * (dt / 16);
        p.y += p.vy * (dt / 16);
        p.vy += p.gravity * (dt / 16);
        p.life -= dt;
        if (p.life <= 0) particles.splice(i, 1);
      }

      for (let i = orbs.length - 1; i >= 0; i--) {
        const o = orbs[i];
        o.x += o.vx * (dt / 16);
        o.y += o.vy * (dt / 16);
        o.life -= dt;
        if (o.life <= 0 || o.y < -10) {
          spawnBurst(o.x, o.y, [o.color, '#ffffff'], 5, 0.01);
          orbs.splice(i, 1);
        }
      }

      if (handoffPause > 0) {
        handoffPause -= dt;
        if (handoffPause <= 0) {
          activeGroup = nextVignette();
        }
      } else {
        let allExited = true;

        activeGroup.forEach((a) => {
          a.phase += a.hopSpeed * dt;
          a.squashX += (1 - a.squashX) * 0.14;
          a.squashY += (1 - a.squashY) * 0.14;

          if (a.symbolTimer > 0) {
            a.symbolTimer -= dt;
            if (a.symbolTimer <= 0) a.symbol = null;
          } else if (a.defaultSymbol && Math.random() < 0.008 * (dt / 16)) {
            a.symbol = a.defaultSymbol;
            a.symbolColor = a.defaultSymbolColor;
            a.symbolTimer = a.symbolPeriod * 0.65;
          }

          // Optional mid-stage pause to interact/wave/show magic
          if (a.pauseAtX !== undefined && !a.didPause) {
            const reached = a.dir === 1 ? a.x >= a.pauseAtX : a.x <= a.pauseAtX;
            if (reached) {
              a.didPause = true;
              a.pauseTimer = a.pauseDuration ?? 650;
              a.facing = (-a.dir) as 1 | -1;
              a.symbol = a.defaultSymbol ?? 'heart';
              a.symbolColor = '#fde047';
              a.symbolTimer = 750;
              if (a.prop === 'star_orb') {
                for (let k = 0; k < 4; k++) {
                  orbs.push({
                    x: a.x,
                    y: a.y - 16,
                    vx: (k - 1.5) * 0.6,
                    vy: -1.6 - Math.random() * 0.6,
                    color: ['#facc15', '#e879f9', '#38bdf8', '#34d399'][k],
                    life: 700,
                    kind: 'star',
                  });
                }
              }
            }
          }

          // Optional table-turning chase reversal
          if (a.flipTurnAtX !== undefined && !a.didFlipTurn && a.x <= a.flipTurnAtX) {
            a.didFlipTurn = true;
            a.vx = -a.vx;
            a.dir = (-a.dir) as 1 | -1;
            a.facing = a.dir;
            a.squashX = 0.78;
            a.squashY = 1.28;
            a.symbol = 'bang';
            a.symbolColor = a.spriteId === 'hero' ? '#fde047' : '#38bdf8';
            a.symbolTimer = 950;
            spawnBurst(a.x, a.y - 14, ['#fde047', '#ffffff'], 7);
          }

          if (a.shootArrow && !a.didShoot && a.x >= 220) {
            a.didShoot = true;
            a.squashX = 0.85;
            a.squashY = 1.18;
            orbs.push({
              x: a.x + 4,
              y: a.y - 18,
              vx: a.vx * 0.85,
              vy: -2.4,
              color: '#34d399',
              life: 620,
              kind: 'arrow',
            });
          }

          if (a.pauseTimer > 0) {
            a.pauseTimer -= dt;
            if (a.pauseTimer <= 0) {
              a.facing = a.dir;
              a.squashX = 0.84;
              a.squashY = 1.18;
            }
          } else {
            a.x += a.vx * (dt / 16);
          }

          // Behavior-specific vertical motion & squash/stretch
          if (a.behavior === 'fly_wave') {
            a.y = a.baseY + Math.sin(a.phase * 1.4) * a.hopAmp;
          } else if (a.behavior === 'fly_loop') {
            const loop = Math.sin(a.phase * 1.8);
            a.y = a.baseY + loop * a.hopAmp;
            a.x += Math.cos(a.phase * 1.8) * 0.35 * (dt / 16);
          } else if (a.behavior === 'float_orbit') {
            a.y = a.baseY + Math.sin(a.phase * 1.5) * a.hopAmp;
          } else if (a.behavior === 'glide') {
            a.y = a.baseY + Math.sin(a.phase) * a.hopAmp;
          } else if (a.behavior === 'mega_bounce') {
            const arc = Math.abs(Math.sin(a.phase));
            a.y = a.baseY - arc * a.hopAmp;
            if (arc < 0.08) {
              a.squashX = 1.24;
              a.squashY = 0.78;
            }
          } else if (a.behavior === 'stomp') {
            const step = Math.abs(Math.sin(a.phase));
            a.y = a.baseY - step * a.hopAmp;
            if (a.stompSync && step < 0.06 && Math.random() < 0.35) {
              spawnBurst(a.x, a.baseY, ['#cbd5e1', '#94a3b8'], 3, 0.02);
            }
          } else if (a.behavior === 'nervous_guard') {
            a.y = a.baseY - Math.abs(Math.sin(a.phase * 1.5)) * a.hopAmp;
            if (Math.sin(clock / 260) > 0.85 && a.pauseTimer <= 0) {
              a.facing = (-a.dir) as 1 | -1;
            } else if (a.pauseTimer <= 0) {
              a.facing = a.dir;
            }
          } else if (a.behavior === 'dance') {
            a.y = a.baseY - Math.abs(Math.sin(a.phase * 1.4)) * a.hopAmp;
            a.facing = Math.sin(a.phase * 0.7) > -0.45 ? a.dir : ((-a.dir) as 1 | -1);
          } else {
            // walk / skip / sprint / hop_chase
            const prevArc = Math.abs(Math.sin(a.phase - a.hopSpeed * dt));
            const arc = Math.abs(Math.sin(a.phase));
            a.y = a.baseY - arc * a.hopAmp;
            if (prevArc > 0.14 && arc <= 0.14) {
              a.squashX = 1.15;
              a.squashY = 0.86;
            }
          }

          a.trailAccum += dt;
          const trailInterval =
            a.trail === 'dust' || a.trail === 'forge' ? 130 : a.trail === 'none' ? 9999 : 110;
          if (a.trailAccum >= trailInterval && a.x > -10 && a.x < CANVAS_W + 10) {
            a.trailAccum = 0;
            spawnTrail(a);
          }

          // Check whether actor is still inside or approaching stage
          const offMargin = 62;
          const exited =
            a.dir === 1 ? a.x > CANVAS_W + offMargin : a.x < -offMargin;
          if (!exited) allExited = false;
        });

        if (allExited) {
          handoffPause = 240;
        }
      }

      // === RENDER SCENE ===
      const ctx = canvas?.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = false;

        // Dynamic Sky Gradient Bands (Dawn -> Day -> Sunset -> Night)
        const bandH = 30;
        skyNow.bands.forEach((col, idx) => {
          ctx.fillStyle = col;
          ctx.fillRect(0, idx * bandH, CANVAS_W, bandH + 1);
        });

        // Twinkling Stars (fade in during dusk/night)
        if (skyNow.nightAlpha > 0.08) {
          stars.forEach((s) => {
            const twinkle = 0.35 + 0.65 * Math.abs(Math.sin(clock / 650 + s.phase));
            const alpha = twinkle * skyNow.nightAlpha;
            ctx.fillStyle = `rgba(248, 250, 252, ${alpha.toFixed(2)})`;
            ctx.fillRect(s.x, s.y, s.size, s.size);
          });
        }

        // Sun Arc (Dawn -> Sunset: dayPhase 0.0..0.66)
        if (dayPhase < 0.66) {
          const sunT = dayPhase / 0.66;
          const sunX = Math.round(48 + sunT * (CANVAS_W - 96));
          const sunY = Math.round(108 - Math.sin(sunT * Math.PI) * 82);
          ctx.fillStyle = 'rgba(253, 224, 71, 0.22)';
          ctx.fillRect(sunX - 13, sunY - 13, 26, 26);
          ctx.fillStyle = dayPhase > 0.52 || dayPhase < 0.08 ? '#fb923c' : '#fde047';
          ctx.fillRect(sunX - 9, sunY - 9, 18, 18);
          ctx.fillStyle = '#fef9c3';
          ctx.fillRect(sunX - 5, sunY - 5, 10, 10);
        }

        // Crescent Moon Arc (Dusk -> Dawn: dayPhase 0.64..1.0)
        if (dayPhase >= 0.62) {
          const moonT = (dayPhase - 0.62) / 0.38;
          const moonX = Math.round(70 + moonT * (CANVAS_W - 140));
          const moonY = Math.round(98 - Math.sin(moonT * Math.PI) * 72);
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(moonX - 8, moonY - 8, 16, 16);
          ctx.fillStyle = skyNow.bands[0];
          ctx.fillRect(moonX - 2, moonY - 8, 10, 11);
        }

        // Drifting Pixel Clouds (tinted by sky light)
        clouds.forEach((c) => {
          const cx = Math.round(c.x);
          const cy = Math.round(c.y);
          ctx.fillStyle = skyNow.cloud;
          ctx.globalAlpha = skyNow.nightAlpha > 0.6 ? 0.35 : 0.85;
          ctx.fillRect(cx, cy, c.w, 8);
          ctx.fillRect(cx + 6, cy - 5, c.w - 14, 6);
          ctx.globalAlpha = 1;
        });

        // Distant mountains (season/night tinted + winter snow caps)
        ctx.fillStyle = skyNow.mountain;
        for (let mx = -10; mx < CANVAS_W + 40; mx += 64) {
          ctx.beginPath();
          ctx.moveTo(mx, 142);
          ctx.lineTo(mx + 32, 92);
          ctx.lineTo(mx + 64, 142);
          ctx.fill();
          if (seasonNow.snowCapAlpha > 0.15) {
            ctx.fillStyle = `rgba(241, 245, 249, ${(seasonNow.snowCapAlpha * 0.85).toFixed(2)})`;
            ctx.beginPath();
            ctx.moveTo(mx + 20, 110);
            ctx.lineTo(mx + 32, 92);
            ctx.lineTo(mx + 44, 110);
            ctx.fill();
            ctx.fillStyle = skyNow.mountain;
          }
        }

        // Seasonal Trees along backdrop
        const drawSeasonTree = (tx: number, ty: number, scale = 1) => {
          const w = Math.round(18 * scale);
          const h = Math.round(16 * scale);
          ctx.fillStyle = '#4a2e1b';
          ctx.fillRect(tx - 2, ty - 10, 5, 12);
          ctx.fillStyle = seasonNow.treePrimary;
          ctx.fillRect(tx - w / 2, ty - 10 - h, w, h);
          ctx.fillStyle = seasonNow.treeHighlight;
          ctx.fillRect(tx - w / 2 + 2, ty - 10 - h + 2, w - 6, Math.max(4, h / 2));
          if (seasonNow.snowCapAlpha > 0.2) {
            ctx.fillStyle = `rgba(248, 250, 252, ${seasonNow.snowCapAlpha.toFixed(2)})`;
            ctx.fillRect(tx - w / 2 + 1, ty - 11 - h, w - 2, 4);
          }
        };
        drawSeasonTree(100, 142, 1.0);
        drawSeasonTree(156, 142, 0.85);
        drawSeasonTree(358, 142, 0.95);
        drawSeasonTree(408, 142, 0.85);

        // Left: Royal Castle silhouette with warm evening/night windows
        ctx.fillStyle = '#242b42';
        ctx.fillRect(24, 78, 56, 66);
        ctx.fillRect(16, 66, 16, 78);
        ctx.fillRect(72, 66, 16, 78);
        ctx.fillRect(42, 54, 20, 90);
        ctx.fillStyle = '#b91c1c';
        ctx.fillRect(14, 58, 20, 8);
        ctx.fillRect(70, 58, 20, 8);
        ctx.fillRect(40, 44, 24, 10);
        if (seasonNow.snowCapAlpha > 0.15) {
          ctx.fillStyle = `rgba(248, 250, 252, ${seasonNow.snowCapAlpha.toFixed(2)})`;
          ctx.fillRect(14, 56, 20, 3);
          ctx.fillRect(70, 56, 20, 3);
          ctx.fillRect(40, 42, 24, 3);
        }
        ctx.fillStyle = '#facc15';
        ctx.fillRect(50, 36, 4, 8);
        const winColor = skyNow.nightAlpha > 0.35 ? '#fde047' : '#64748b';
        ctx.fillStyle = winColor;
        ctx.fillRect(22, 76, 4, 6);
        ctx.fillRect(78, 76, 4, 6);
        ctx.fillRect(49, 68, 6, 8);

        // Right: Dark Labyrinth Gate silhouette
        ctx.fillStyle = '#1b1d2b';
        ctx.fillRect(424, 82, 74, 62);
        ctx.fillRect(436, 68, 50, 76);
        if (seasonNow.snowCapAlpha > 0.15) {
          ctx.fillStyle = `rgba(226, 232, 240, ${(seasonNow.snowCapAlpha * 0.9).toFixed(2)})`;
          ctx.fillRect(436, 66, 50, 3);
          ctx.fillRect(424, 80, 12, 3);
          ctx.fillRect(486, 80, 12, 3);
        }
        ctx.fillStyle = '#090b10';
        ctx.fillRect(448, 98, 26, 46);
        const runeGlow = (0.35 + 0.5 * skyNow.nightAlpha) * (0.55 + 0.45 * Math.sin(clock / 320));
        ctx.fillStyle = `rgba(168, 85, 247, ${Math.min(1, runeGlow).toFixed(2)})`;
        ctx.fillRect(432, 96, 4, 16);
        ctx.fillRect(486, 96, 4, 16);
        ctx.fillRect(458, 78, 6, 6);

        // Seasonal Grass & Scenic Stone Path
        ctx.fillStyle = seasonNow.grassTop;
        ctx.fillRect(0, 140, CANVAS_W, 12);
        ctx.fillStyle = seasonNow.grassShade;
        for (let gx = 0; gx < CANVAS_W; gx += 18) {
          ctx.fillRect(gx + 2, 142, 8, 3);
        }
        ctx.fillStyle = seasonNow.pathTint;
        ctx.fillRect(0, 152, CANVAS_W, 72);
        ctx.fillStyle = '#212636';
        for (let gx = 0; gx < CANVAS_W; gx += 24) {
          ctx.fillRect(gx, 156 + ((gx / 24) % 2) * 8, 18, 4);
          ctx.fillRect(gx + 8, 182 + ((gx / 24) % 2) * 6, 16, 4);
        }
        ctx.fillStyle = '#141722';
        ctx.fillRect(0, 208, CANVAS_W, 16);

        // Path torches (subtle in day, warm glow at dusk/night)
        [118, 258, 392].forEach((tx, idx) => {
          ctx.fillStyle = '#5c2d16';
          ctx.fillRect(tx, 124, 4, 18);
          const flk = Math.sin(clock / 90 + idx * 2) > 0 ? 1 : 0;
          if (skyNow.nightAlpha > 0.25) {
            ctx.fillStyle = `rgba(251, 146, 60, ${(skyNow.nightAlpha * 0.22).toFixed(2)})`;
            ctx.fillRect(tx - 6, 111, 16, 16);
          }
          ctx.fillStyle = '#f97316';
          ctx.fillRect(tx - 1, 117 - flk, 6, 7);
          ctx.fillStyle = '#facc15';
          ctx.fillRect(tx, 118 - flk, 4, 4);
        });

        // Draw active vignette troupe sorted by baseY
        const sorted = [...activeGroup].sort((a, b) => a.baseY - b.baseY);
        sorted.forEach((a) => {
          const sprite = getSpriteCanvas(a.spriteId);
          const baseSz = Math.round(16 * a.scale);
          const drawW = Math.round(baseSz * a.squashX);
          const drawH = Math.round(baseSz * a.squashY);
          const drawX = Math.round(a.x - drawW / 2);
          const drawY = Math.round(a.y - drawH);

          // Ground shadow (scales softly when airborne)
          const heightAbove = Math.max(0, a.baseY - a.y);
          const shadowScale = Math.max(0.45, 1 - heightAbove / 90);
          const shadowW = Math.round(baseSz * 0.72 * shadowScale);
          ctx.fillStyle = 'rgba(0,0,0,0.42)';
          ctx.fillRect(
            Math.round(a.x - shadowW / 2),
            Math.round((a.baseY > 135 ? a.baseY : 168) - 2),
            shadowW,
            3
          );

          ctx.save();
          if (a.facing < 0) {
            ctx.translate(drawX + drawW, drawY);
            ctx.scale(-1, 1);
            ctx.drawImage(sprite, 0, 0, drawW, drawH);
          } else {
            ctx.drawImage(sprite, drawX, drawY, drawW, drawH);
          }
          ctx.restore();

          // Optional tiny pixel prop (strictly non-text)
          if (a.prop === 'coin_bag') {
            const charm = getSpriteCanvas('item_charm_gold');
            ctx.drawImage(charm, Math.round(a.x + a.facing * 8 - 6), Math.round(drawY + 6), 12, 12);
          } else if (a.prop === 'star_orb') {
            const orbX = a.x + Math.cos(clock / 180) * 14;
            const orbY = drawY + 4 + Math.sin(clock / 180) * 5;
            drawPixelSymbol(ctx, 'sparkle', orbX, orbY, '#e879f9');
          }

          // Strictly wordless pixel-art emotion symbol
          if (a.symbol) {
            drawPixelSymbol(ctx, a.symbol, a.x, drawY - 8, a.symbolColor);
          }
        });

        // Playful star orbs & ranger arrows
        orbs.forEach((o) => {
          if (o.kind === 'arrow') {
            ctx.fillStyle = '#090b10';
            ctx.fillRect(Math.round(o.x) - 2, Math.round(o.y) - 5, 4, 10);
            ctx.fillStyle = o.color;
            ctx.fillRect(Math.round(o.x) - 1, Math.round(o.y) - 4, 2, 8);
          } else {
            drawPixelSymbol(ctx, 'sparkle', o.x, o.y, o.color);
          }
        });

        // Pixel particles
        particles.forEach((p) => {
          ctx.fillStyle = p.color;
          ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
        });

        // Seasonal ambient weather (sakura petals, summer night fireflies, autumn leaves, winter snow)
        weatherParticles.forEach((w) => {
          if (w.kind === 'firefly') {
            const pulse = 0.25 + 0.75 * Math.abs(Math.sin(w.phase * 2.2));
            ctx.fillStyle = `rgba(190, 242, 100, ${pulse.toFixed(2)})`;
            ctx.fillRect(Math.round(w.x), Math.round(w.y), 2, 2);
          } else {
            ctx.fillStyle = w.color;
            ctx.fillRect(Math.round(w.x), Math.round(w.y), w.size, w.size);
          }
        });
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      canvas?.removeEventListener('click', handlePointer);
    };
  }, [save.loopCount, save.customAlly?.created]);

  return (
    <div className="min-h-screen bg-[#101218] text-[#eceff4] flex flex-col items-center justify-center px-4 py-8">
      <div className="max-w-3xl w-full space-y-5">
        {/* Top Audio Strip */}
        <div className="flex items-center justify-between gap-3 text-xs text-slate-400">
          <span>ドット絵オートダンジョンRPG</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleBgmMute}
              disabled={muted}
              className={`px-3 py-1.5 font-medium border transition-colors whitespace-nowrap ${
                muted
                  ? 'bg-[#171a23] text-slate-600 border-[#2b3040] cursor-not-allowed'
                  : 'bg-[#181b24] hover:bg-[#252a38] text-slate-200 border-[#2e3446] cursor-pointer'
              }`}
            >
              {muted || bgmMuted ? 'BGM OFF' : 'BGM ON'}
            </button>
            <button
              type="button"
              onClick={onToggleMute}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 font-medium bg-[#181b24] hover:bg-[#252a38] text-slate-200 border border-[#2e3446] cursor-pointer whitespace-nowrap"
            >
              {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{muted ? '音OFF' : '音ON'}</span>
            </button>
          </div>
        </div>

        {/* Main Title Card */}
        <div className="pixel-panel overflow-hidden">
          {/* Kirby Star Allies-style Wordless Vignette Diorama */}
          <div className="relative border-b-2 border-[#2b3040] bg-[#0b1021]">
            <canvas
              ref={canvasRef}
              width={CANVAS_W}
              height={CANVAS_H}
              className="w-full h-auto block pixelated cursor-pointer"
            />
            <div className="absolute inset-x-0 top-0 pt-5 pb-3 px-4 bg-gradient-to-b from-[#0b1021]/85 via-[#0b1021]/45 to-transparent text-center pointer-events-none">
              <h1 className="font-pixel text-3xl sm:text-5xl text-amber-300 tracking-wider drop-shadow-[0_3px_0_#090b10]">
                ドット迷宮紀行
              </h1>
              <p className="text-xs sm:text-sm text-slate-200 mt-1.5 drop-shadow-[0_1px_0_#090b10]">
                5つの持ち物と仲間を率いて深淵の魔王を討つ、自動攻略ドット絵RPG
              </p>
            </div>
          </div>

          {/* Action Menu */}
          <div className="p-5 sm:p-6 space-y-5">
            {hasProgress ? (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300 font-num">
                  <span>現在の記録</span>
                  <span>
                    第{save.loopCount}周 · 所持金 {save.gold.toLocaleString()}G · 踏破 {save.totalClears}回 · 図鑑 {compStats.overallPct}%
                  </span>
                </div>

                <button
                  type="button"
                  onClick={onContinue}
                  className="w-full py-3.5 px-6 bg-amber-500 hover:bg-amber-400 text-slate-950 font-pixel text-lg sm:text-xl font-bold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Play className="w-5 h-5 shrink-0 fill-current" />
                  <span>冒険をつづける</span>
                </button>

                {!confirmNewGame ? (
                  <button
                    type="button"
                    onClick={() => {
                      sound.click();
                      setConfirmNewGame(true);
                    }}
                    className="w-full py-2.5 px-4 bg-[#12151d] hover:bg-[#1f2536] text-slate-300 border border-[#2e3446] text-xs sm:text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                    <span>最初から遊ぶ（王宮の出立イベントから）</span>
                  </button>
                ) : (
                  <div className="bg-[#231419] border border-rose-500/75 p-3.5 space-y-2.5">
                    <div className="text-xs text-rose-200 font-bold text-center">
                      現在のセーブデータを初期化して最初から始めますか？
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          sound.click();
                          setConfirmNewGame(false);
                        }}
                        className="py-2 px-3 bg-[#252a38] hover:bg-[#31384a] text-slate-200 text-xs font-medium cursor-pointer"
                      >
                        キャンセル
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmNewGame(false);
                          onNewGame();
                        }}
                        className="py-2 px-3 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
                      >
                        初期化して出発する
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={onNewGame}
                  className="w-full py-4 px-6 bg-amber-500 hover:bg-amber-400 text-slate-950 font-pixel text-xl font-bold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Play className="w-5 h-5 shrink-0 fill-current" />
                  <span>冒険をはじめる</span>
                </button>
                <p className="text-xs text-slate-400 text-center">
                  まずは王宮で国王から支度金120Gを受け取り、迷宮へ旅立とう！
                </p>
              </div>
            )}

            {/* Story Scene Theater Replay */}
            <div className="pt-4 border-t border-[#232836] flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-slate-400">ストーリーイベント回想</span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={onWatchOpening}
                  className="px-3 py-1.5 text-xs font-medium bg-[#12151d] hover:bg-[#1f2536] text-amber-200 border border-[#2e3446] transition-colors cursor-pointer whitespace-nowrap"
                >
                  王宮での出立（OP）
                </button>
                <button
                  type="button"
                  onClick={endingUnlocked ? onWatchEnding : undefined}
                  disabled={!endingUnlocked}
                  title={
                    endingUnlocked
                      ? '魔王討伐の祝賀イベントを再生'
                      : 'ステージ6「深淵の玉座」の魔王を討伐すると解放されます'
                  }
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border whitespace-nowrap ${
                    endingUnlocked
                      ? 'bg-[#12151d] hover:bg-[#1f2536] text-emerald-300 border-[#2e3446] cursor-pointer'
                      : 'bg-[#12151d] text-slate-500 border-[#232836] cursor-not-allowed'
                  }`}
                >
                  {endingUnlocked ? (
                    <Sparkles className="w-3 h-3 shrink-0" />
                  ) : (
                    <Lock className="w-3 h-3 shrink-0" />
                  )}
                  <span>
                    {endingUnlocked ? '魔王討伐の祝賀（ED）' : '魔王討伐の祝賀（6面クリアで解放）'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
