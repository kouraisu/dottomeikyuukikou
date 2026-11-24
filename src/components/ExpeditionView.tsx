import React from 'react';
import { Lock, Repeat } from 'lucide-react';
import { BLESSINGS, ENDLESS_BENCHMARK_LOOP, ITEMS, STAGES } from '../game/data';
import {
  CombatLogEntry,
  DungeonEventDef,
  DungeonEventOption,
  EventChoiceMode,
  ExpeditionResult,
  GameSpeed,
  SaveState,
} from '../game/types';
import {
  DungeonCanvas,
  EventChoiceSelection,
  ExpeditionHudSnapshot,
} from './DungeonCanvas';
import { PixelSprite } from './PixelSprite';

interface ExpeditionViewProps {
  save: SaveState;
  hud: ExpeditionHudSnapshot | null;
  logs: CombatLogEntry[];
  speed: GameSpeed;
  maxUnlockedSpeed: GameSpeed;
  canAutoEvent: boolean;
  canAutoRepeat: boolean;
  autoRepeatEnabled: boolean;
  paused: boolean;
  muted: boolean;
  bgmMuted: boolean;
  eventChoiceMode: EventChoiceMode;
  pendingEvent: DungeonEventDef | null;
  eventSelection: EventChoiceSelection | null;
  retreatSignal: number;
  onChangeSpeed: (s: GameSpeed) => void;
  onTogglePause: () => void;
  onToggleMute: () => void;
  onToggleBgmMute: () => void;
  onToggleAutoRepeat: () => void;
  onLockedNotice: (msg: string) => void;
  onChangeEventMode: (mode: EventChoiceMode) => void;
  onSelectEventOption: (option: DungeonEventOption) => void;
  onHudUpdate: (hud: ExpeditionHudSnapshot) => void;
  onLog: (entry: CombatLogEntry) => void;
  onEventPrompt: (event: DungeonEventDef | null) => void;
  onComplete: (result: ExpeditionResult) => void;
}

const TONE_CLASS: Record<CombatLogEntry['tone'], string> = {
  info: 'text-slate-300',
  combat: 'text-slate-200',
  heal: 'text-emerald-300',
  loot: 'text-amber-300',
  alert: 'text-rose-400',
  blessing: 'text-sky-300',
};

export const ExpeditionView: React.FC<ExpeditionViewProps> = ({
  save,
  hud,
  logs,
  speed,
  maxUnlockedSpeed,
  canAutoEvent,
  canAutoRepeat,
  autoRepeatEnabled,
  paused,
  muted,
  bgmMuted,
  eventChoiceMode,
  pendingEvent,
  eventSelection,
  retreatSignal,
  onChangeSpeed,
  onTogglePause,
  onToggleMute,
  onToggleBgmMute,
  onToggleAutoRepeat,
  onLockedNotice,
  onChangeEventMode,
  onSelectEventOption,
  onHudUpdate,
  onLog,
  onEventPrompt,
  onComplete,
}) => {
  const stage = STAGES.find((s) => s.id === save.selectedStageId) ?? STAGES[0];
  const now = Date.now();
  const availableGold = save.gold + (hud?.goldEarned ?? 0);

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-5 space-y-4">
      {/* Top Expedition Bar */}
      <div className="pixel-panel px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
              <span>
                {hud?.isEndless || stage.isEndless
                  ? `固定チャレンジ · 第${ENDLESS_BENCHMARK_LOOP}周目基準`
                  : `自動攻略中 · 第${save.loopCount}周`}
              </span>
              {hud?.isPracticeRun && !(hud?.isEndless || stage.isEndless) && (
                <span className="px-1.5 py-0.5 bg-purple-950/90 border border-purple-400/75 text-purple-200 font-bold">
                  仮潜入（第{hud.effectiveLoopCount}周倍率 · 低効率G/魔石のみ）
                </span>
              )}
            </div>
            <div className="font-pixel text-lg text-slate-100">
              {stage.name} ·{' '}
              <span className="font-num text-amber-300">
                {hud?.isEndless || stage.isEndless
                  ? `無限 ${hud?.floor ?? 1}F`
                  : `${hud?.floor ?? 1}/${stage.floors}F`}
              </span>
            </div>
          </div>

          <div className="h-7 w-px bg-[#2b3040] hidden sm:block" />

          <div className="text-xs text-slate-300">{hud?.roomLabel ?? '探索開始'}</div>
        </div>

        {/* Loot Counters + Speed & Event Mode Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-3 mr-1 text-xs font-num">
            <span className="text-amber-300 font-bold">
              獲得 {hud?.goldEarned ?? 0} G
            </span>
            <span className="text-slate-300">
              鉄 {hud?.materialsEarned.iron_ore ?? 0} · 魔石{' '}
              {hud?.materialsEarned.magic_stone ?? 0} · 書{' '}
              {hud?.materialsEarned.ancient_scroll ?? 0}
            </span>
          </div>

          <div className="flex items-center gap-1 bg-[#12151d] border border-[#2b3040] p-1">
            {(['MANUAL', 'AUTO'] as const).map((m) => {
              const locked = m === 'AUTO' && !canAutoEvent;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    if (locked) {
                      onLockedNotice('スキルツリーで「イベント自動判断」を解放すると使用できます（1SP）');
                      return;
                    }
                    onChangeEventMode(m);
                  }}
                  className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    locked
                      ? 'text-slate-600 hover:text-slate-400'
                      : eventChoiceMode === m
                        ? 'bg-sky-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {locked && <Lock className="w-2.5 h-2.5 shrink-0" />}
                  <span>{m === 'MANUAL' ? 'イベント手動' : 'イベント自動'}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1 bg-[#12151d] border border-[#2b3040] p-1">
            {([1, 2, 4, 8, 16] as const).map((s) => {
              const locked = s > maxUnlockedSpeed;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    if (locked) {
                      onLockedNotice(
                        s <= 4
                          ? 'スキルツリーで「探索倍速 I（2x·4x）」を解放すると使用できます（1SP）'
                          : s === 8
                            ? 'スキルツリーで「探索倍速 II（8x）」を解放すると使用できます（1SP）'
                            : 'スキルツリーで「探索倍速 III（16x）」を解放すると使用できます（1SP）'
                      );
                      return;
                    }
                    onChangeSpeed(s);
                  }}
                  className={`inline-flex items-center gap-0.5 px-2 py-1 font-num text-xs font-bold transition-colors cursor-pointer ${
                    locked
                      ? 'text-slate-600 hover:text-slate-400'
                      : speed === s
                        ? 'bg-amber-500 text-slate-950'
                        : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {locked && <Lock className="w-2.5 h-2.5 shrink-0" />}
                  <span>{s}x</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => {
              if (!canAutoRepeat) {
                onLockedNotice('スキルツリーで「連続自動周回＆自動補充」を解放すると使用できます（1SP）');
                return;
              }
              onToggleAutoRepeat();
            }}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium border cursor-pointer whitespace-nowrap ${
              !canAutoRepeat
                ? 'bg-[#171a23] text-slate-500 border-[#2b3040] hover:text-slate-300'
                : autoRepeatEnabled
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 font-bold'
                  : 'bg-[#252a38] hover:bg-[#31384a] text-slate-300 border-[#3a4156]'
            }`}
          >
            {canAutoRepeat ? (
              <Repeat className="w-3 h-3 shrink-0" />
            ) : (
              <Lock className="w-3 h-3 shrink-0" />
            )}
            <span>{canAutoRepeat ? (autoRepeatEnabled ? '連続周回ON' : '連続周回OFF') : '連続周回'}</span>
          </button>

          <button
            type="button"
            onClick={onTogglePause}
            className="px-3 py-1.5 text-xs font-medium bg-[#252a38] hover:bg-[#31384a] text-slate-200 border border-[#3a4156] cursor-pointer whitespace-nowrap"
          >
            {paused ? '再開' : '一時停止'}
          </button>

          <button
            type="button"
            onClick={onToggleBgmMute}
            disabled={muted}
            className={`px-3 py-1.5 text-xs font-medium border whitespace-nowrap ${
              muted
                ? 'bg-[#171a23] text-slate-600 border-[#2b3040] cursor-not-allowed'
                : 'bg-[#252a38] hover:bg-[#31384a] text-slate-200 border-[#3a4156] cursor-pointer'
            }`}
          >
            {muted || bgmMuted ? 'BGM OFF' : 'BGM ON'}
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            className="px-3 py-1.5 text-xs font-medium bg-[#252a38] hover:bg-[#31384a] text-slate-200 border border-[#3a4156] cursor-pointer whitespace-nowrap"
          >
            {muted ? '音OFF' : '音ON'}
          </button>
        </div>
      </div>

      {/* Stage Special Gimmick Banner */}
      <div className="bg-[#141822] border border-[#2b3040] px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-amber-300">
            特殊ギミック · {stage.gimmick.name}
          </span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-300">{stage.gimmick.description}</span>
        </div>
        {(hud?.gimmickStackCount ?? 0) > 0 && (
          <span className="font-num text-sky-300 font-bold shrink-0">
            蓄積効果 +{hud!.gimmickStackCount}層
          </span>
        )}
      </div>

      {/* Boss Bar (if active) */}
      {hud?.bossInfo && (
        <div
          className={`pixel-panel px-4 py-2.5 flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4 ${
            hud.isBossIntro
              ? 'boss-warning-pulse bg-[#210d12] border-rose-500'
              : hud.isBossRush || stage.isBossRush
                ? 'bg-[#1f0e16] border-amber-400/90 shadow-[0_0_16px_rgba(244,63,94,0.28)]'
                : 'border-amber-500/70'
          }`}
        >
          <div className="flex items-center gap-2 shrink-0">
            {hud.isBossIntro && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-rose-600 text-white border border-rose-300 tracking-wider">
                WARNING
              </span>
            )}
            {(hud.isBossRush || stage.isBossRush) && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-500 text-slate-950 border border-amber-200">
                極BOSS · {hud.floor}/{hud.totalFloors}
              </span>
            )}
            {(hud.isEndless || stage.isEndless) && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-purple-600 text-white border border-purple-300">
                無限BOSS · {hud.floor}F
              </span>
            )}
            <span
              className={`font-pixel text-sm ${
                hud.isBossIntro
                  ? 'text-rose-300'
                  : hud.isBossRush || stage.isBossRush
                    ? 'text-amber-300'
                    : 'text-amber-300'
              }`}
            >
              BOSS · {hud.bossInfo.name}
            </span>
          </div>
          <div
            className={`flex-1 min-w-[140px] h-3.5 bg-[#101218] overflow-hidden ${
              hud.isBossRush || stage.isBossRush
                ? 'border border-amber-400/70'
                : 'border border-[#2b3040]'
            }`}
          >
            <div
              className={`h-full transition-all duration-150 ${
                hud.isBossRush || stage.isBossRush
                  ? 'bg-gradient-to-r from-rose-600 via-rose-500 to-amber-400'
                  : 'bg-rose-600'
              }`}
              style={{
                width: `${Math.max(0, Math.min(100, (hud.bossInfo.hp / hud.bossInfo.maxHp) * 100))}%`,
              }}
            />
          </div>
          <span className="font-num text-xs text-slate-200 shrink-0">
            {hud.bossInfo.hp} / {hud.bossInfo.maxHp}
          </span>
        </div>
      )}

      {/* Main Pixel Dungeon Viewport + Manual Event Choice Overlay */}
      <div className="relative">
        <DungeonCanvas
          save={save}
          speed={speed}
          paused={paused}
          eventChoiceMode={eventChoiceMode}
          retreatSignal={retreatSignal}
          eventSelection={eventSelection}
          onHudUpdate={onHudUpdate}
          onLog={onLog}
          onEventPrompt={onEventPrompt}
          onComplete={onComplete}
        />

        {pendingEvent && (
          <div className="absolute inset-0 bg-black/75 flex items-center justify-center p-4 z-20">
            <div className="pixel-panel max-w-lg w-full p-5 space-y-4 border-amber-400">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 bg-[#12151d] border-2 border-[#2e3446] flex items-center justify-center shrink-0">
                  <PixelSprite id={pendingEvent.spriteId} size={36} />
                </div>
                <div>
                  <div className="text-[11px] text-amber-300">
                    道中イベント発生（手動選択）
                  </div>
                  <h3 className="font-pixel text-lg text-white">
                    {pendingEvent.title}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {pendingEvent.description}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {pendingEvent.options.map((opt) => {
                  const cannotAfford =
                    opt.goldCost !== undefined && availableGold < opt.goldCost;

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={cannotAfford}
                      onClick={() => onSelectEventOption(opt)}
                      className="w-full text-left px-3.5 py-2.5 bg-[#12151d] hover:bg-[#1f2536] border-2 border-[#2e3446] hover:border-amber-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <div className="text-xs sm:text-sm font-bold text-slate-100">
                        {opt.label}
                        {cannotAfford ? '（ゴールド不足）' : ''}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {opt.hint}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Panels: Party + 5 Carried Items | Combat Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7 space-y-4">
          {/* Party Status */}
          <div className="pixel-panel p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-pixel text-sm text-slate-200">パーティ状況</h3>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                {save.activeBlessings.map((bId) => {
                  const b = BLESSINGS.find((x) => x.id === bId);
                  return b ? <span key={bId}>{b.name}</span> : null;
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {(hud?.party ?? []).map((member) => {
                const pct = Math.max(0, Math.min(100, (member.hp / member.maxHp) * 100));
                return (
                  <div
                    key={member.id}
                    className={`pixel-slot p-2.5 flex items-center gap-2.5 ${
                      member.hp <= 0 ? 'opacity-45' : ''
                    }`}
                  >
                    <PixelSprite id={member.spriteId} size={28} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 text-xs">
                        <span className="font-bold text-slate-100 truncate">
                          {member.name}
                        </span>
                        <span className="text-[10px] text-amber-300 shrink-0">
                          {member.positionLabel}
                        </span>
                      </div>
                      <div className="h-2 bg-[#0d0f15] border border-[#2b3040] mt-1 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-150 ${
                            member.hp <= 0
                              ? 'bg-slate-600'
                              : pct < 35
                                ? 'bg-rose-500'
                                : member.isHero
                                  ? 'bg-emerald-500'
                                  : 'bg-sky-500'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="font-num text-[11px] text-slate-300 mt-0.5">
                        HP {member.hp} / {member.maxHp}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {hud?.hasUnison && (
              <div className="pt-2 border-t border-[#232836] flex items-center gap-3 text-xs">
                <span className="text-sky-300 font-bold shrink-0">連携奥義ゲージ</span>
                <div className="flex-1 h-2 bg-[#0d0f15] border border-[#2b3040] overflow-hidden">
                  <div
                    className="h-full bg-sky-400 transition-all duration-150"
                    style={{ width: `${Math.min(100, hud.unisonGauge)}%` }}
                  />
                </div>
                <span className="font-num text-slate-300 shrink-0">
                  {hud.unisonGauge}/100%
                </span>
              </div>
            )}
          </div>

          {/* 5 Carried Items Live Status */}
          <div className="pixel-panel p-4 space-y-2.5">
            <h3 className="font-pixel text-sm text-slate-200">
              持ち込みアイテム（使用したアイテムは帰還時に消費）
            </h3>
            {(!hud || hud.carriedSlots.length === 0) ? (
              <div className="text-xs text-slate-500">持ち込みアイテムなし</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {hud.carriedSlots.map((slot) => {
                  const justTriggered = now - slot.lastTriggeredAt < 1200;
                  const depleted = slot.isConsumable && slot.remainingUses <= 0;

                  return (
                    <div
                      key={slot.slotIndex}
                      className={`pixel-slot p-2 flex flex-col items-center text-center gap-1 transition-colors ${
                        justTriggered
                          ? 'border-amber-400 bg-amber-500/15'
                          : depleted
                            ? 'opacity-45'
                            : ''
                      }`}
                    >
                      <PixelSprite id={slot.spriteId} size={26} />
                      <div className="text-[11px] font-medium text-slate-200 truncate w-full">
                        {slot.name}
                      </div>
                      <div className="font-num text-[10px] text-amber-300">
                        {slot.isConsumable
                          ? slot.usedInRun
                            ? `残 ${slot.remainingUses}/${slot.maxUses} · 消費済`
                            : `残 ${slot.remainingUses}/${slot.maxUses}`
                          : slot.usedInRun
                            ? '使用中（帰還時消費）'
                            : '未使用'}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {hud && hud.lootedItems.length > 0 && (
              <div className="pt-2 border-t border-[#232836] flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-400">今回の発見品:</span>
                {hud.lootedItems.map((itemId, i) => {
                  const item = ITEMS[itemId];
                  if (!item) return null;
                  return (
                    <span
                      key={`${itemId}-${i}`}
                      className="inline-flex items-center gap-1 text-amber-300"
                    >
                      <PixelSprite id={item.spriteId} size={16} />
                      {item.name}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Live Combat Log */}
        <div className="lg:col-span-5 pixel-panel p-4 flex flex-col h-[270px]">
          <h3 className="font-pixel text-sm text-slate-200 mb-2.5 shrink-0">
            冒険ログ
          </h3>
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 text-xs">
            {logs.map((entry) => (
              <div key={entry.id} className="flex items-start gap-2 leading-relaxed">
                <span className="font-num text-[11px] text-slate-500 shrink-0">
                  {entry.timeText}
                </span>
                <span className={TONE_CLASS[entry.tone]}>{entry.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
