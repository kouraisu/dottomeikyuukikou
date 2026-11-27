import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Dices, Eraser, FlipHorizontal2, Paintbrush, RotateCcw, Sparkles, X } from 'lucide-react';
import { CUSTOM_ALLY_STYLE_META } from '../game/data';
import { renderCustomAllyColorGrid } from '../game/pixelSprites';
import {
  CustomAllyBody,
  CustomAllyConfig,
  CustomAllyHeadgear,
  CustomAllyStyle,
  CustomAllyWeapon,
} from '../game/types';

interface CustomAllyModalProps {
  config: CustomAllyConfig;
  onSave: (next: CustomAllyConfig) => void;
  onClose: () => void;
}

const COLOR_SWATCHES = [
  { name: 'まっさら白', hex: '#f8fafc' },
  { name: 'クリーム', hex: '#fde68a' },
  { name: 'さくら桃', hex: '#f472b6' },
  { name: 'くれない赤', hex: '#ef4444' },
  { name: 'だいだい', hex: '#f97316' },
  { name: 'こがね金', hex: '#facc15' },
  { name: 'わかば緑', hex: '#10b981' },
  { name: 'そら水色', hex: '#38bdf8' },
  { name: 'あお青', hex: '#2563eb' },
  { name: 'すみれ紫', hex: '#a855f7' },
  { name: 'くるみ茶', hex: '#92400e' },
  { name: 'くろずみ', hex: '#334155' },
];

const PAINT_PALETTE = [
  '#0f1219',
  '#f8fafc',
  '#cbd5e1',
  '#334155',
  '#fbd38d',
  '#92400e',
  '#ef4444',
  '#f97316',
  '#facc15',
  '#10b981',
  '#14b8a6',
  '#38bdf8',
  '#2563eb',
  '#a855f7',
  '#f472b6',
  '#f43f5e',
];

const BODY_OPTIONS: { id: CustomAllyBody; label: string }[] = [
  { id: 'NEKO', label: 'ねこ冒険者' },
  { id: 'HUMANOID', label: 'ちび人型' },
  { id: 'SLIME', label: 'ぷるスライム' },
  { id: 'GOLEM', label: 'プチゴーレム' },
];

const HEADGEAR_OPTIONS: { id: CustomAllyHeadgear; label: string }[] = [
  { id: 'NONE', label: 'なし' },
  { id: 'CAT_EARS', label: 'ねこ耳' },
  { id: 'RIBBON', label: 'リボン' },
  { id: 'WIZARD_HAT', label: '魔法帽' },
  { id: 'CROWN', label: '小さな王冠' },
  { id: 'HORNS', label: 'ツノ飾り' },
];

const WEAPON_OPTIONS: { id: CustomAllyWeapon; label: string }[] = [
  { id: 'NONE', label: '素手・肉球' },
  { id: 'SWORD', label: 'ちいさな剣' },
  { id: 'STAFF', label: 'まほうの杖' },
  { id: 'BOW', label: '木の弓' },
  { id: 'SHIELD', label: 'おまもり盾' },
];

const STYLE_ORDER: CustomAllyStyle[] = ['BALANCED', 'TANK', 'HEALER', 'RANGER', 'MAGE', 'THIEF'];

export const CustomAllyModal: React.FC<CustomAllyModalProps> = ({
  config,
  onSave,
  onClose,
}) => {
  const [draft, setDraft] = useState<CustomAllyConfig>(() => ({
    ...config,
    customPixels: config.customPixels ? [...config.customPixels] : null,
  }));
  const [editorMode, setEditorMode] = useState<'PARTS' | 'PAINT'>(() =>
    config.customPixels ? 'PAINT' : 'PARTS'
  );
  const [paintColor, setPaintColor] = useState<string>('#0f1219');
  const [paintTool, setPaintTool] = useState<'PEN' | 'ERASER'>('PEN');
  const [mirrorX, setMirrorX] = useState(false);
  const isDrawingRef = useRef(false);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const previewPixels = useMemo(() => renderCustomAllyColorGrid(draft), [draft]);
  const styleMeta = CUSTOM_ALLY_STYLE_META[draft.style] ?? CUSTOM_ALLY_STYLE_META.BALANCED;

  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;
    const cell = canvas.width / 16;
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const col = previewPixels[y * 16 + x];
        if (col) {
          ctx.fillStyle = col;
          ctx.fillRect(x * cell, y * cell, cell, cell);
        }
      }
    }
  }, [previewPixels]);

  useEffect(() => {
    const stop = () => {
      isDrawingRef.current = false;
    };
    window.addEventListener('pointerup', stop);
    return () => window.removeEventListener('pointerup', stop);
  }, []);

  const switchToPaintMode = () => {
    if (!draft.customPixels) {
      setDraft((prev) => ({
        ...prev,
        customPixels: renderCustomAllyColorGrid(prev),
      }));
    }
    setEditorMode('PAINT');
  };

  const applyPixelPaint = (x: number, y: number) => {
    setDraft((prev) => {
      const base = prev.customPixels ? [...prev.customPixels] : renderCustomAllyColorGrid(prev);
      const val = paintTool === 'ERASER' ? '' : paintColor;
      base[y * 16 + x] = val;
      if (mirrorX) {
        const mx = 15 - x;
        base[y * 16 + mx] = val;
      }
      return { ...prev, customPixels: base };
    });
  };

  const handleRandomize = () => {
    const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
    setDraft((prev) => ({
      ...prev,
      body: pick(BODY_OPTIONS).id,
      primaryColor: pick(COLOR_SWATCHES).hex,
      secondaryColor: pick(COLOR_SWATCHES).hex,
      accentColor: pick(COLOR_SWATCHES).hex,
      headgear: pick(HEADGEAR_OPTIONS).id,
      weapon: pick(WEAPON_OPTIONS).id,
      style: pick(STYLE_ORDER),
      customPixels: null,
    }));
    setEditorMode('PARTS');
  };

  const handleConfirm = () => {
    onSave({
      ...draft,
      created: true,
      name: draft.name.trim() || 'まっさらちゃん',
      title: draft.title.trim() || 'オリキャラ',
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
      <div className="pixel-panel max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#2b3040] flex items-center justify-between gap-3 bg-[#151923]">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-300 shrink-0" />
            <div>
              <h2 className="font-pixel text-lg sm:text-xl text-white">
                まっさらオリキャラ作成・カスタム
              </h2>
              <p className="text-[11px] text-slate-400">
                自分だけのオリジナル仲間を1人作れます（他の仲間より少し控えめな手軽性能です）
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white cursor-pointer"
            aria-label="閉じる"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Live Preview & Identity */}
          <div className="lg:col-span-5 space-y-4">
            <div className="pixel-slot p-4 flex flex-col items-center gap-3 bg-[#121620]">
              <div className="w-28 h-28 bg-[#0c1018] border-2 border-amber-500/50 flex items-center justify-center">
                <canvas
                  ref={previewCanvasRef}
                  width={96}
                  height={96}
                  className="pixelated"
                  style={{ width: 96, height: 96 }}
                />
              </div>
              <div className="text-center space-y-0.5">
                <div className="font-bold text-base text-amber-200">
                  {draft.name.trim() || 'まっさらちゃん'}
                </div>
                <div className="text-[11px] text-slate-400">
                  {(draft.title.trim() || 'オリキャラ')} · {styleMeta.roleName}
                </div>
              </div>
              <div className="w-full bg-[#0d111a] border border-[#242b3d] px-3 py-2 text-[11px] font-num text-sky-300 flex items-center justify-around">
                <span>基礎HP {styleMeta.baseHp}</span>
                <span>攻撃 {styleMeta.baseAtk}</span>
                <span>防御 {styleMeta.baseDef}</span>
              </div>
              <button
                type="button"
                onClick={handleRandomize}
                className="w-full py-1.5 px-3 text-xs font-bold bg-[#1f2638] hover:bg-[#2a344d] text-amber-200 border border-amber-500/40 inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Dices className="w-3.5 h-3.5" />
                <span>おまかせランダム生成</span>
              </button>
            </div>

            <div className="pixel-slot p-3.5 space-y-3">
              <div>
                <label className="block text-[11px] text-slate-300 font-bold mb-1">
                  キャラクター名（14文字まで）
                </label>
                <input
                  type="text"
                  maxLength={14}
                  value={draft.name}
                  onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="例：まっさらちゃん"
                  className="w-full bg-[#0e1118] border border-[#31384d] px-3 py-1.5 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-300 font-bold mb-1">
                  肩書き・ひとこと（12文字まで）
                </label>
                <input
                  type="text"
                  maxLength={12}
                  value={draft.title}
                  onChange={(e) => setDraft((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="例：気ままな相棒"
                  className="w-full bg-[#0e1118] border border-[#31384d] px-3 py-1.5 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Battle Style */}
            <div className="pixel-slot p-3.5 space-y-2">
              <div className="text-xs font-bold text-slate-200">バトルスタイル（役割）</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {STYLE_ORDER.map((sid) => {
                  const m = CUSTOM_ALLY_STYLE_META[sid];
                  const active = draft.style === sid;
                  return (
                    <button
                      key={sid}
                      type="button"
                      onClick={() => setDraft((prev) => ({ ...prev, style: sid }))}
                      className={`text-left px-2.5 py-2 border transition-colors cursor-pointer ${
                        active
                          ? 'bg-amber-500/15 border-amber-400 text-amber-200'
                          : 'bg-[#111520] border-[#283044] text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      <div className="text-[11px] font-bold leading-tight">{m.label}</div>
                      <div className="text-[10px] font-num text-sky-300 mt-0.5">
                        HP{m.baseHp} · 攻{m.baseAtk} · 防{m.baseDef}
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                {styleMeta.skillDescription}
              </p>
            </div>
          </div>

          {/* Right Column: Appearance Customization or Free 16x16 Pixel Paint */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center gap-2 border-b border-[#2b3040] pb-2.5">
              <button
                type="button"
                onClick={() => setEditorMode('PARTS')}
                className={`px-3.5 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                  editorMode === 'PARTS'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-[#12151d] text-slate-300 hover:text-white border border-[#2b3040]'
                }`}
              >
                かんたん着せ替え
              </button>
              <button
                type="button"
                onClick={switchToPaintMode}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                  editorMode === 'PAINT'
                    ? 'bg-sky-500 text-slate-950'
                    : 'bg-[#12151d] text-slate-300 hover:text-white border border-[#2b3040]'
                }`}
              >
                <Paintbrush className="w-3.5 h-3.5" />
                <span>16×16ドット絵を直接描く</span>
              </button>
              {draft.customPixels && editorMode === 'PARTS' && (
                <span className="text-[10px] text-sky-300 ml-auto">
                  ※現在は手描きドット絵が優先中
                </span>
              )}
            </div>

            {editorMode === 'PARTS' ? (
              <div className="space-y-4">
                {draft.customPixels && (
                  <div className="bg-[#132030] border border-sky-500/50 px-3 py-2 flex items-center justify-between gap-2 text-xs text-sky-200">
                    <span>手描きドット絵モードのデータが適用されています。着せ替えを使う場合はリセットしてください。</span>
                    <button
                      type="button"
                      onClick={() => setDraft((prev) => ({ ...prev, customPixels: null }))}
                      className="px-2.5 py-1 text-[11px] font-bold bg-sky-500 text-slate-950 shrink-0 cursor-pointer"
                    >
                      着せ替えに戻す
                    </button>
                  </div>
                )}

                <div className="pixel-slot p-3.5 space-y-2.5">
                  <div className="text-xs font-bold text-slate-200">ベース種族</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {BODY_OPTIONS.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() =>
                          setDraft((prev) => ({ ...prev, body: b.id, customPixels: null }))
                        }
                        className={`py-2 px-2 text-xs font-bold border transition-colors cursor-pointer ${
                          draft.body === b.id && !draft.customPixels
                            ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                            : 'bg-[#111520] border-[#283044] text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pixel-slot p-3.5 space-y-3">
                  <div>
                    <div className="text-xs font-bold text-slate-200 mb-1.5">
                      メインカラー（体・服）
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {COLOR_SWATCHES.map((sw) => (
                        <button
                          key={`p-${sw.hex}`}
                          type="button"
                          title={sw.name}
                          onClick={() =>
                            setDraft((prev) => ({
                              ...prev,
                              primaryColor: sw.hex,
                              customPixels: null,
                            }))
                          }
                          className={`w-7 h-7 border-2 cursor-pointer transition-transform ${
                            draft.primaryColor === sw.hex
                              ? 'border-amber-300 scale-110'
                              : 'border-[#2f374a]'
                          }`}
                          style={{ backgroundColor: sw.hex }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-slate-200 mb-1.5">
                      サブカラー（髪・模様・耳の中）
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {COLOR_SWATCHES.map((sw) => (
                        <button
                          key={`s-${sw.hex}`}
                          type="button"
                          title={sw.name}
                          onClick={() =>
                            setDraft((prev) => ({
                              ...prev,
                              secondaryColor: sw.hex,
                              customPixels: null,
                            }))
                          }
                          className={`w-7 h-7 border-2 cursor-pointer transition-transform ${
                            draft.secondaryColor === sw.hex
                              ? 'border-amber-300 scale-110'
                              : 'border-[#2f374a]'
                          }`}
                          style={{ backgroundColor: sw.hex }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-slate-200 mb-1.5">
                      アクセントカラー（瞳・飾り）
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {COLOR_SWATCHES.map((sw) => (
                        <button
                          key={`a-${sw.hex}`}
                          type="button"
                          title={sw.name}
                          onClick={() =>
                            setDraft((prev) => ({
                              ...prev,
                              accentColor: sw.hex,
                              customPixels: null,
                            }))
                          }
                          className={`w-7 h-7 border-2 cursor-pointer transition-transform ${
                            draft.accentColor === sw.hex
                              ? 'border-amber-300 scale-110'
                              : 'border-[#2f374a]'
                          }`}
                          style={{ backgroundColor: sw.hex }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="pixel-slot p-3.5 space-y-2">
                    <div className="text-xs font-bold text-slate-200">あたま飾り</div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {HEADGEAR_OPTIONS.map((h) => (
                        <button
                          key={h.id}
                          type="button"
                          onClick={() =>
                            setDraft((prev) => ({
                              ...prev,
                              headgear: h.id,
                              customPixels: null,
                            }))
                          }
                          className={`py-1.5 px-2 text-xs font-medium border cursor-pointer ${
                            draft.headgear === h.id && !draft.customPixels
                              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 font-bold'
                              : 'bg-[#111520] border-[#283044] text-slate-300 hover:border-slate-500'
                          }`}
                        >
                          {h.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pixel-slot p-3.5 space-y-2">
                    <div className="text-xs font-bold text-slate-200">もちもの</div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {WEAPON_OPTIONS.map((w) => (
                        <button
                          key={w.id}
                          type="button"
                          onClick={() =>
                            setDraft((prev) => ({
                              ...prev,
                              weapon: w.id,
                              customPixels: null,
                            }))
                          }
                          className={`py-1.5 px-2 text-xs font-medium border cursor-pointer ${
                            draft.weapon === w.id && !draft.customPixels
                              ? 'bg-sky-500/20 border-sky-400 text-sky-200 font-bold'
                              : 'bg-[#111520] border-[#283044] text-slate-300 hover:border-slate-500'
                          }`}
                        >
                          {w.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="pixel-slot p-3.5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPaintTool('PEN')}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold border cursor-pointer ${
                        paintTool === 'PEN'
                          ? 'bg-sky-500 text-slate-950 border-sky-400'
                          : 'bg-[#111520] text-slate-300 border-[#283044]'
                      }`}
                    >
                      <Paintbrush className="w-3.5 h-3.5" />
                      <span>ペン</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaintTool('ERASER')}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold border cursor-pointer ${
                        paintTool === 'ERASER'
                          ? 'bg-rose-500 text-white border-rose-400'
                          : 'bg-[#111520] text-slate-300 border-[#283044]'
                      }`}
                    >
                      <Eraser className="w-3.5 h-3.5" />
                      <span>消しゴム</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMirrorX((v) => !v)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold border cursor-pointer ${
                        mirrorX
                          ? 'bg-amber-500 text-slate-950 border-amber-400'
                          : 'bg-[#111520] text-slate-300 border-[#283044]'
                      }`}
                    >
                      <FlipHorizontal2 className="w-3.5 h-3.5" />
                      <span>左右対称</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        setDraft((prev) => ({
                          ...prev,
                          customPixels: renderCustomAllyColorGrid({
                            ...prev,
                            customPixels: null,
                          }),
                        }))
                      }
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] bg-[#1a2030] hover:bg-[#252e44] text-slate-200 border border-[#323d56] cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>着せ替えから読込</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDraft((prev) => ({
                          ...prev,
                          customPixels: new Array(256).fill(''),
                        }))
                      }
                      className="px-2.5 py-1 text-[11px] bg-[#24161b] hover:bg-[#361e26] text-rose-200 border border-rose-500/40 cursor-pointer"
                    >
                      全消し
                    </button>
                  </div>
                </div>

                {/* Palette */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {PAINT_PALETTE.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => {
                        setPaintColor(hex);
                        setPaintTool('PEN');
                      }}
                      className={`w-6 h-6 border-2 cursor-pointer ${
                        paintTool === 'PEN' && paintColor === hex
                          ? 'border-amber-300 scale-110'
                          : 'border-[#2f374a]'
                      }`}
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </div>

                {/* 16x16 Interactive Canvas */}
                <div className="flex justify-center py-1">
                  <div
                    className="grid grid-cols-16 border-2 border-[#39425a] bg-[#0b0e15] select-none touch-none"
                    style={{
                      width: 288,
                      height: 288,
                      gridTemplateColumns: 'repeat(16, minmax(0, 1fr))',
                    }}
                    onPointerLeave={() => {
                      isDrawingRef.current = false;
                    }}
                  >
                    {previewPixels.map((col, idx) => {
                      const x = idx % 16;
                      const y = Math.floor(idx / 16);
                      const checker = (x + y) % 2 === 0;
                      return (
                        <div
                          key={idx}
                          onPointerDown={(e) => {
                            e.preventDefault();
                            isDrawingRef.current = true;
                            applyPixelPaint(x, y);
                          }}
                          onPointerEnter={() => {
                            if (isDrawingRef.current) {
                              applyPixelPaint(x, y);
                            }
                          }}
                          className="border-[0.5px] border-white/[0.04] cursor-crosshair"
                          style={{
                            backgroundColor: col || (checker ? '#121622' : '#0d1019'),
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 text-center">
                  マスをクリック・ドラッグして自由に16×16ドット絵を描けます
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-5 py-3.5 border-t border-[#2b3040] bg-[#151923] flex flex-wrap items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold bg-[#252a38] hover:bg-[#31384a] text-slate-200 border border-[#3a4156] cursor-pointer"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer"
          >
            {config.created ? '変更を保存する' : 'このオリキャラを作成する！'}
          </button>
        </div>
      </div>
    </div>
  );
};
