import React, { useEffect, useState } from 'react';
import { Award, Play, Repeat, RotateCcw, Sparkles, Unlock } from 'lucide-react';
import {
  BASE_MATERIAL_IDS,
  ENDLESS_BENCHMARK_LOOP,
  ENDLESS_RARE_PART_IDS,
  FeatureUnlockDef,
  getLoopEnemyStatMult,
  getMaxStageForLoop,
  ITEMS,
  MATERIAL_INFO,
} from '../game/data';
import { AchievementDef, ExpeditionResult, HighlightKind } from '../game/types';
import { PixelSprite } from './PixelSprite';

interface SummaryViewProps {
  result: ExpeditionResult;
  compendiumPct?: number;
  newlyUnlocked?: FeatureUnlockDef[];
  newlyUnlockedAchievements?: AchievementDef[];
  allAchievementsCompleted?: boolean;
  endlessJustUnlocked?: boolean;
  abyssJustUnlocked?: boolean;
  trueEndgameJustUnlocked?: boolean;
  canReincarnate?: boolean;
  canAutoRepeat?: boolean;
  autoRepeatEnabled?: boolean;
  onToggleAutoRepeat?: () => void;
  onRetryStage?: () => void;
  onAdvanceLoop?: () => void;
  onReturnToTown: () => void;
}

const HIGHLIGHT_META: Record<HighlightKind, { label: string; color: string }> = {
  BOSS_KILL: { label: 'ボス撃破', color: 'text-amber-300' },
  RARE_LOOT: { label: '希少獲得', color: 'text-sky-300' },
  CLOSE_CALL: { label: '危機一髪', color: 'text-rose-300' },
  TRAP_EVADE: { label: '罠回避', color: 'text-emerald-300' },
  BIG_CRIT: { label: '渾身の一撃', color: 'text-amber-200' },
};

export const SummaryView: React.FC<SummaryViewProps> = ({
  result,
  compendiumPct,
  newlyUnlocked,
  newlyUnlockedAchievements,
  allAchievementsCompleted,
  endlessJustUnlocked,
  abyssJustUnlocked,
  trueEndgameJustUnlocked,
  canReincarnate,
  canAutoRepeat,
  autoRepeatEnabled,
  onToggleAutoRepeat,
  onRetryStage,
  onAdvanceLoop,
  onReturnToTown,
}) => {
  const [confirmReincarnate, setConfirmReincarnate] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const highlights = result.highlights ?? [];
  const unlockedList = newlyUnlocked ?? [];
  const achList = newlyUnlockedAchievements ?? [];
  const nextLoop = result.loopCount + 1;
  const maxStage = getMaxStageForLoop(result.loopCount);

  useEffect(() => {
    if (!canAutoRepeat || !autoRepeatEnabled || !onRetryStage) return;
    setCountdown(3);
    const id = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [canAutoRepeat, autoRepeatEnabled, onRetryStage]);

  useEffect(() => {
    if (!canAutoRepeat || !autoRepeatEnabled || !onRetryStage) return;
    if (countdown === 0) {
      onRetryStage();
    }
  }, [countdown, canAutoRepeat, autoRepeatEnabled, onRetryStage]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="pixel-panel p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2 border-b border-[#2b3040] pb-5">
          <div className="text-xs text-slate-400">
            {result.isEndless
              ? `チャレンジ（第${ENDLESS_BENCHMARK_LOOP}周目基準 · 固定難易度）`
              : `第${result.loopCount}周${result.isPracticeRun ? `（仮潜入：第${result.effectiveLoopCount}周倍率）` : ''}`}{' '}
            · {result.stageName} ·{' '}
            {result.isEndless
              ? `無限到達 ${result.reachedFloor}F`
              : `到達 ${result.reachedFloor}/${result.totalFloors}F`}
            {compendiumPct !== undefined ? ` · 図鑑 ${compendiumPct}%` : ''}
          </div>
          <h2
            className={`font-pixel text-2xl sm:text-3xl ${
              result.isPracticeRun
                ? 'text-purple-300'
                : result.isEndless
                  ? 'text-purple-300'
                  : result.victory
                    ? 'text-amber-300'
                    : 'text-rose-300'
            }`}
          >
            {result.isPracticeRun
              ? result.victory
                ? '模擬踏破（仮潜入）'
                : '模擬撤退（仮潜入）'
              : result.isEndless
                ? result.wasManualRetreat
                  ? `無限回廊 任意撤退（${result.reachedFloor}F）`
                  : `無限回廊 敗北帰還（${result.reachedFloor}F）`
                : result.victory
                  ? 'ステージ踏破！'
                  : result.wasManualRetreat
                    ? '任意撤退・拠点へ帰還'
                    : '敗北・拠点へ帰還'}
          </h2>
          <p className="text-sm text-slate-300">{result.causeOfReturn}</p>
        </div>

        {result.isPracticeRun && (
          <div className="bg-[#1b1428] border-2 border-purple-400/75 px-4 py-3 text-xs text-purple-100 leading-relaxed">
            <span className="font-bold text-purple-300">
              【仮潜入モード（第{result.effectiveLoopCount}周目の敵倍率）】
            </span>{' '}
            過去に戦った強化倍率での仮潜入です。極めて低効率ですがゴールドと魔石は持ち帰れます（装備ドロップ・鉄鉱石・古文書・踏破の証・実績・進行記録・アイテム消費は対象外）。
          </div>
        )}

        {/* Auto-Repeat Countdown Banner */}
        {canAutoRepeat && autoRepeatEnabled && onRetryStage && (
          <div className="bg-[#13221d] border-2 border-emerald-500/80 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-emerald-300">
              <Repeat className="w-4 h-4 shrink-0" />
              <span>
                連続自動周回中：あと <span className="font-num text-amber-300">{countdown}</span> 秒で再出撃します…
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {onToggleAutoRepeat && (
                <button
                  type="button"
                  onClick={onToggleAutoRepeat}
                  className="px-3 py-1.5 text-xs font-bold bg-rose-700 hover:bg-rose-600 text-white cursor-pointer whitespace-nowrap"
                >
                  自動周回を停止
                </button>
              )}
              <button
                type="button"
                onClick={onRetryStage}
                className="px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer whitespace-nowrap"
              >
                今すぐ再出撃
              </button>
            </div>
          </div>
        )}

        {/* Endless Corridor Unlocked Banner */}
        {endlessJustUnlocked && (
          <div className="bg-[#18122b] border-2 border-purple-400 p-4 space-y-2">
            <div className="flex items-center gap-2 text-purple-300 font-pixel text-base">
              <Sparkles className="w-4 h-4 shrink-0 text-amber-300" />
              <span>新コンテンツ解放：【無限】終わらぬ深淵回廊！</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              第5周目完全制覇おめでとうございます！周回倍率や仮潜入に影響されない「第{ENDLESS_BENCHMARK_LOOP}周目基準（{getLoopEnemyStatMult(ENDLESS_BENCHMARK_LOOP)}倍）」の固定難易度から始まる最高難易度チャレンジ迷宮がステージ選択に解放されました！
            </p>
          </div>
        )}

        {/* Abyss Tab (Endless 10F+) Unlocked Banner */}
        {abyssJustUnlocked && (
          <div className="bg-[#17122b] border-2 border-purple-400 p-4 space-y-2">
            <div className="flex items-center gap-2 text-purple-300 font-pixel text-base">
              <Sparkles className="w-4 h-4 shrink-0 text-amber-300" />
              <span>新強化タブ解放：無限回廊 10F 到達！「深淵強化」解禁！</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              無限回廊の10階を突破しました！拠点に「深淵強化」タブが解放され、転生してもリセットされない5系統の恒久強化（勇者火力・耐久軽減・味方強化・魂脈回復・星冠速度）を鍛えられるようになりました！
            </p>
          </div>
        )}

        {/* True Endgame (Endless 50F+) Unlocked Banner */}
        {trueEndgameJustUnlocked && (
          <div className="bg-[#1c102b] border-2 border-amber-400 p-4 space-y-2">
            <div className="flex items-center gap-2 text-amber-300 font-pixel text-base">
              <Sparkles className="w-4 h-4 shrink-0 text-purple-300" />
              <span>真のエンドコンテンツ解放：無限回廊 50F 突破！</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              深淵の50階を突破しました！①永続強化「裏実績（全6種）」②鍛冶屋限定の究極装備4種
              ③通常スキルツリー全開放後に大量SPを消費して圧倒的な力と「32倍速(10SP) / 64倍速(20SP)」を解放できる新スキルツリー「深淵超越の道」が解禁されました！
            </p>
          </div>
        )}

        {/* Reincarnation Unlocked Banner */}
        {!result.isPracticeRun && result.victory && canReincarnate && onAdvanceLoop && (
          <div className="bg-[#18162a] border-2 border-amber-400/85 p-4 space-y-3">
            <div className="flex items-center gap-2 text-amber-300 font-pixel text-base">
              <RotateCcw className="w-4 h-4 shrink-0" />
              <span>
                {result.loopCount === 1
                  ? `魔王討伐達成！転生（第${nextLoop}周目）が解放されました！`
                  : `第${result.loopCount}周目完全制覇！転生（第${nextLoop}周目）が可能です！`}
              </span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              現在の周回で挑戦できる全ステージを踏破したため、未開放の【裏】ステージが残っていてもそのまま転生できます。
              図鑑・達成ボーナス・踏破の証(+2)を引き継ぎ、初期SP <span className="font-num text-amber-300 font-bold">{nextLoop * 2}SP</span> で開始。
              敵強さ <span className="font-num text-rose-300">{getLoopEnemyStatMult(nextLoop)}倍</span> になり、
              {nextLoop <= 4
                ? `新たな裏ステージ「ステージ${maxStage + 1}」が開放されます！`
                : nextLoop === 5
                  ? '鍛冶屋の新強化「秘紋刻印（アイテム刻印）」が解放されます！'
                  : result.loopCount === 5
                    ? '第5周目制覇報酬「【無限】終わらぬ深淵回廊」も解禁されます！'
                    : '全裏ステージがさらに強敵化して開放されます！'}
            </p>
            <div className="text-[11px] text-rose-300/90">
              ※ 所持金・素材・アイテム・道具屋品揃え・勇者Lv・仲間・加護・メーター上限・習得スキルはリセットされます。
            </div>
            {!confirmReincarnate ? (
              <button
                type="button"
                onClick={() => setConfirmReincarnate(true)}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer"
              >
                転生して第{nextLoop}周目へ進む
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmReincarnate(false)}
                  className="py-2 px-3 bg-[#252a38] hover:bg-[#31384a] text-slate-200 text-xs font-medium cursor-pointer"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmReincarnate(false);
                    onAdvanceLoop();
                  }}
                  className="py-2 px-3 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
                >
                  リセットして転生する
                </button>
              </div>
            )}
          </div>
        )}

        {/* Newly Unlocked Achievements Banner */}
        {achList.length > 0 && (
          <div className="bg-[#1b172a] border-2 border-amber-400/80 p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-amber-300 font-pixel text-base">
                <Award className="w-4 h-4 shrink-0" />
                <span>チャレンジ実績を解除！（{achList.length}件）</span>
              </div>
              <span className="font-num text-xs text-emerald-300 font-bold">
                累積ランク+{achList.length}（攻防HP+{achList.length * 3}%）
              </span>
            </div>
            <div className="space-y-2">
              {achList.map((ach) => (
                <div
                  key={ach.id}
                  className="bg-[#12101d] border border-amber-500/35 px-3 py-2 flex items-center gap-3"
                >
                  <div className="w-9 h-9 bg-[#1b1f2b] border border-[#2e3446] flex items-center justify-center shrink-0">
                    <PixelSprite id={ach.spriteId} size={24} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-amber-200">{ach.title}</div>
                    <div className="text-[11px] text-emerald-300 font-num mt-0.5">
                      永続効果: {ach.rewardText}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {allAchievementsCompleted && (
              <div className="bg-[#23192d] border border-purple-400/75 px-3.5 py-2.5 text-xs text-purple-100 leading-relaxed">
                <span className="font-bold text-amber-300">全実績制覇達成！</span>{' '}
                究極ステージ「<span className="text-rose-300 font-bold">【極】終焉の強化ボスラッシュ</span>」が開放されました！
                強化ボスラッシュ踏破時に2%の超低確率で最強装備4種（ジェネシス・イージス・覇王冠・アンブロシア）のいずれか1つが出現します（確定ドロップなし・裏ダンジョン踏破時0.5%／無限回廊15F以降ボス0.8%でも出現）。
              </div>
            )}
          </div>
        )}

        {/* Newly Unlocked Facilities (Loop 1 progression) */}
        {unlockedList.length > 0 && (
          <div className="bg-[#14231d] border-2 border-emerald-500/80 p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-300 font-pixel text-base">
              <Unlock className="w-4 h-4 shrink-0" />
              <span>新たに拠点の錠前が解除されました！</span>
            </div>
            <div className="space-y-2">
              {unlockedList.map((u) => (
                <div
                  key={u.tab}
                  className="bg-[#0f1714] border border-emerald-500/40 px-3 py-2 space-y-0.5"
                >
                  <div className="text-xs font-bold text-amber-300">
                    「{u.label}」タブが開放
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {u.lockDescription}
                  </p>
                </div>
              ))}
              {result.stageId === 1 && (
                <div className="bg-[#0f1714] border border-emerald-500/40 px-3 py-2 space-y-0.5">
                  <div className="text-xs font-bold text-amber-300">
                    「メーター上限開放」が開放
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    獲得したゴールドや踏破の証を使って、持ち込み枠のキャパシティ上限を増やせるようになりました。
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loot Brought Back */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="pixel-slot p-3 text-center">
            <div className="text-[11px] text-slate-400">獲得ゴールド</div>
            <div className="font-num text-lg font-bold text-amber-300 mt-1">
              +{result.goldEarned} G
            </div>
          </div>
          <div className="pixel-slot p-3 text-center">
            <div className="text-[11px] text-slate-400">踏破の証</div>
            <div className="font-num text-lg font-bold text-emerald-300 mt-1">
              +{result.crestsEarned}
            </div>
          </div>
          <div className="pixel-slot p-3 text-center">
            <div className="text-[11px] text-slate-400">討伐した敵</div>
            <div className="font-num text-lg font-bold text-slate-100 mt-1">
              {result.enemiesDefeated} 体
            </div>
          </div>
          <div className="pixel-slot p-3 text-center">
            <div className="text-[11px] text-slate-400">到達階層</div>
            <div className="font-num text-lg font-bold text-slate-100 mt-1">
              {result.reachedFloor} F
            </div>
          </div>
          <div className="pixel-slot p-3 text-center col-span-2 sm:col-span-1">
            <div className="text-[11px] text-slate-400">冒険時間</div>
            <div className="font-num text-lg font-bold text-slate-100 mt-1">
              {result.durationSec} 秒
            </div>
          </div>
        </div>

        {/* Party DPS & Contribution Graph */}
        {(result.partyContributions?.length ?? 0) > 0 && (() => {
          const list = result.partyContributions!;
          const maxDmg = Math.max(1, ...list.map((c) => c.damageDealt));
          const totalDmg = Math.max(
            1,
            result.totalDamageDealt ?? list.reduce((s, c) => s + c.damageDealt, 0)
          );
          const duration = Math.max(1, result.durationSec);
          const sorted = [...list].sort((a, b) => b.damageDealt - a.damageDealt);

          return (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-pixel text-sm text-slate-200">
                  パーティ貢献度リザルト（DPS · 与ダメ · 被ダメ · 回復）
                </h3>
                <span className="font-num text-xs text-slate-400">
                  総与ダメージ {totalDmg.toLocaleString()} · 全体DPS {Math.round(totalDmg / duration)}/s
                </span>
              </div>
              <div className="pixel-slot p-3.5 space-y-3">
                {sorted.map((c) => {
                  const dps = Math.round(c.damageDealt / duration);
                  const sharePct = Math.round((c.damageDealt / totalDmg) * 100);
                  const barPct = Math.max(
                    c.damageDealt > 0 ? 4 : 0,
                    Math.round((c.damageDealt / maxDmg) * 100)
                  );
                  return (
                    <div
                      key={c.id}
                      className="bg-[#12151d] border border-[#2b3040] p-2.5 space-y-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 bg-[#1a1f2c] border border-[#2e3446] flex items-center justify-center shrink-0">
                            <PixelSprite id={c.spriteId} size={22} />
                          </div>
                          <span className="text-xs font-bold text-slate-100 truncate">
                            {c.name}
                          </span>
                        </div>
                        <div className="font-num text-xs font-bold text-amber-300 shrink-0">
                          DPS {dps.toLocaleString()}/s{' '}
                          <span className="text-slate-400 font-normal">({sharePct}%)</span>
                        </div>
                      </div>

                      <div className="h-2.5 bg-[#0b0d12] border border-[#252a38] overflow-hidden">
                        <div
                          className={`h-full transition-all duration-200 ${
                            c.isHero ? 'bg-amber-400' : 'bg-sky-400'
                          }`}
                          style={{ width: `${barPct}%` }}
                        />
                      </div>

                      <div className="grid grid-cols-4 gap-2 text-[11px] font-num">
                        <div>
                          <span className="text-slate-400">与ダメ </span>
                          <span className="text-rose-300 font-bold">
                            {c.damageDealt.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400">被ダメ </span>
                          <span className="text-slate-200">
                            {c.damageTaken.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400">回復 </span>
                          <span className="text-emerald-300 font-bold">
                            {c.healingDone.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400">撃破 </span>
                          <span className="text-amber-200 font-bold">{c.kills}体</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* Expedition Highlights */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-pixel text-sm text-slate-200">今回の探索ハイライト</h3>
            <span className="font-num text-xs text-slate-400">
              {highlights.length} 件の記録
            </span>
          </div>
          {highlights.length === 0 ? (
            <div className="pixel-slot p-4 text-center text-xs text-slate-400">
              特筆すべきハイライトはありませんでした。次の探索に備えましょう。
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {highlights.map((h) => {
                const meta = HIGHLIGHT_META[h.kind];
                return (
                  <div
                    key={h.id}
                    className="pixel-slot p-3 flex items-start gap-3"
                  >
                    <div className="w-10 h-10 bg-[#12151d] border border-[#2e3446] flex items-center justify-center shrink-0">
                      <PixelSprite id={h.spriteId ?? 'hero'} size={28} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-[11px] font-num">
                        <span className={`font-bold ${meta.color}`}>{meta.label}</span>
                        <span className="text-slate-500">·</span>
                        <span className="text-slate-400">{h.floor}F</span>
                        <span className="text-slate-500">·</span>
                        <span className="text-slate-400">{h.timeText}</span>
                      </div>
                      <div className="text-sm font-bold text-slate-100 mt-0.5">
                        {h.title}
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                        {h.detail}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Materials & Discovered Items */}
        <div className="space-y-3">
          <h3 className="font-pixel text-sm text-slate-200">持ち帰った素材・戦利品</h3>
          <div className="pixel-slot p-4 space-y-3">
            <div className="flex flex-wrap items-center gap-6">
              {BASE_MATERIAL_IDS.map((mKey) => (
                <div key={mKey} className="flex items-center gap-2">
                  <PixelSprite id={MATERIAL_INFO[mKey].spriteId} size={22} />
                  <span className="text-xs text-slate-300">
                    {MATERIAL_INFO[mKey].name}
                  </span>
                  <span className="font-num text-sm font-bold text-sky-300">
                    +{result.materialsEarned[mKey] ?? 0}
                  </span>
                </div>
              ))}
            </div>

            {(result.isEndless ||
              ENDLESS_RARE_PART_IDS.some((pKey) => (result.materialsEarned[pKey] ?? 0) > 0)) && (
              <div className="pt-2.5 border-t border-[#232836] flex flex-wrap items-center gap-5">
                {ENDLESS_RARE_PART_IDS.map((pKey) => (
                  <div key={pKey} className="flex items-center gap-2">
                    <PixelSprite id={MATERIAL_INFO[pKey].spriteId} size={20} />
                    <span className="text-xs text-purple-200">
                      {MATERIAL_INFO[pKey].name}
                    </span>
                    <span
                      className={`font-num text-sm font-bold ${
                        (result.materialsEarned[pKey] ?? 0) > 0
                          ? 'text-amber-300'
                          : 'text-slate-500'
                      }`}
                    >
                      +{result.materialsEarned[pKey] ?? 0}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {result.lootedItems.length > 0 && (
              <div className="pt-3 border-t border-[#232836]">
                <div className="text-xs text-slate-400 mb-2">新しく手に入れたアイテム</div>
                <div className="flex flex-wrap gap-2.5">
                  {result.lootedItems.map((id, i) => {
                    const item = ITEMS[id];
                    if (!item) return null;
                    return (
                      <div
                        key={`${id}-${i}`}
                        className="flex items-center gap-2 bg-[#1b1f2b] border border-[#2e3446] px-2.5 py-1.5"
                      >
                        <PixelSprite id={item.spriteId} size={22} />
                        <span className="text-xs font-medium text-amber-200">
                          {item.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {result.consumedItems.length > 0 && (
              <div className="pt-3 border-t border-[#232836] text-xs text-slate-400">
                今回の探索で使用・消費したアイテム:{' '}
                {result.consumedItems
                  .map((id) => ITEMS[id]?.name)
                  .filter(Boolean)
                  .join('、')}
              </div>
            )}

            {(result.autoPurchasedItems?.length ?? 0) > 0 && (
              <div className="pt-3 border-t border-[#232836] text-xs text-sky-300">
                自動補充（道具屋から自動購入 -{result.autoPurchasedGold ?? 0}G）:{' '}
                {result.autoPurchasedItems!
                  .map((id) => ITEMS[id]?.name)
                  .filter(Boolean)
                  .join('、')}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {onRetryStage && (
            <button
              type="button"
              onClick={onRetryStage}
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-pixel text-base sm:text-lg font-bold transition-colors cursor-pointer"
            >
              <Play className="w-4 h-4 shrink-0" />
              <span>同じステージへ再出撃</span>
            </button>
          )}
          <button
            type="button"
            onClick={onReturnToTown}
            className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-pixel text-base sm:text-lg font-bold transition-colors cursor-pointer"
          >
            拠点へ戻って次の5つを整える
          </button>
        </div>
      </div>
    </div>
  );
};
