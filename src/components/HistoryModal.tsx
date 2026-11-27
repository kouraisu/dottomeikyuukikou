import React, { useEffect, useState } from 'react';
import { Clock, Coins, History, Package, Shield, Sparkles, Swords, X } from 'lucide-react';
import { getAchievementBonuses, getCompendiumStats, INITIAL_LIFETIME_STATS } from '../game/data';
import { SaveState } from '../game/types';

interface HistoryModalProps {
  save: SaveState;
  onClose: () => void;
}

function formatPlayTime(totalSeconds: number): string {
  const sec = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) {
    return `${h}時間 ${String(m).padStart(2, '0')}分 ${String(s).padStart(2, '0')}秒`;
  }
  return `${m}分 ${String(s).padStart(2, '0')}秒`;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ save, onClose }) => {
  const [subTab, setSubTab] = useState<'STATS' | 'RUNS'>('STATS');
  const [elapsedSinceOpen, setElapsedSinceOpen] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        setElapsedSinceOpen((prev) => prev + 1);
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const stats = save.lifetimeStats ?? INITIAL_LIFETIME_STATS;
  const compStats = getCompendiumStats(save);
  const achBonus = getAchievementBonuses(save);

  const livePlaySec = stats.playTimeSeconds + elapsedSinceOpen;
  const clearRate =
    save.totalRuns > 0 ? Math.round((save.totalClears / save.totalRuns) * 100) : 0;
  const netGold = stats.totalGoldEarned - stats.totalGoldSpent;
  const recentRuns = stats.recentRuns ?? [];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
      <div className="pixel-panel max-w-3xl w-full p-5 sm:p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between gap-3 border-b border-[#2b3040] pb-3">
          <div className="flex items-center gap-2.5">
            <History className="w-5 h-5 text-amber-300 shrink-0" />
            <div>
              <h2 className="font-pixel text-xl text-amber-300">冒険履歴・累計戦績</h2>
              <p className="text-[11px] text-slate-400">
                これまでの累計プレイ時間・収支・強化・アイテム使用・遠征記録を確認できます
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-[#252a38] hover:bg-[#31384a] text-slate-200 border border-[#3a4156] cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" />
            <span>閉じる</span>
          </button>
        </div>

        {/* Highlight KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          <div className="bg-[#12151d] border border-[#2b3040] p-3 space-y-1 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-1.5 text-[11px] text-sky-300">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>プレイ時間</span>
            </div>
            <div className="font-num text-sm font-bold text-white leading-tight">
              {formatPlayTime(livePlaySec)}
            </div>
          </div>

          <div className="bg-[#12151d] border border-[#2b3040] p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] text-amber-300">
              <Coins className="w-3.5 h-3.5 shrink-0" />
              <span>合計取得金額</span>
            </div>
            <div className="font-num text-sm font-bold text-amber-200">
              {stats.totalGoldEarned.toLocaleString()} G
            </div>
          </div>

          <div className="bg-[#12151d] border border-[#2b3040] p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] text-rose-300">
              <Coins className="w-3.5 h-3.5 shrink-0" />
              <span>合計使用金額</span>
            </div>
            <div className="font-num text-sm font-bold text-rose-200">
              {stats.totalGoldSpent.toLocaleString()} G
            </div>
          </div>

          <div className="bg-[#12151d] border border-[#2b3040] p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-300">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>合計強化回数</span>
            </div>
            <div className="font-num text-sm font-bold text-emerald-200">
              {stats.totalUpgrades.toLocaleString()} 回
            </div>
          </div>

          <div className="bg-[#12151d] border border-[#2b3040] p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] text-purple-300">
              <Package className="w-3.5 h-3.5 shrink-0" />
              <span>合計アイテム使用</span>
            </div>
            <div className="font-num text-sm font-bold text-purple-200">
              {stats.totalItemsUsed.toLocaleString()} 回
            </div>
          </div>
        </div>

        {/* Sub-tab switch */}
        <div className="flex items-center gap-2 border-b border-[#232836] pb-2">
          <button
            type="button"
            onClick={() => setSubTab('STATS')}
            className={`px-3.5 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
              subTab === 'STATS'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-[#12151d] text-slate-300 hover:text-white border border-[#2b3040]'
            }`}
          >
            累計データ一覧
          </button>
          <button
            type="button"
            onClick={() => setSubTab('RUNS')}
            className={`px-3.5 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
              subTab === 'RUNS'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-[#12151d] text-slate-300 hover:text-white border border-[#2b3040]'
            }`}
          >
            直近の遠征履歴 ({recentRuns.length}件)
          </button>
        </div>

        {subTab === 'STATS' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Economy & Upgrades */}
            <div className="bg-[#12151d] border border-[#2b3040] p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300 border-b border-[#232836] pb-1.5">
                <Coins className="w-4 h-4" />
                <span>経済・育成・鍛冶履歴</span>
              </div>
              <div className="space-y-1.5 text-xs">
                {[
                  {
                    label: 'ゴールド純収支 (取得 - 使用)',
                    val: `${netGold >= 0 ? '+' : ''}${netGold.toLocaleString()} G`,
                    cls: netGold >= 0 ? 'text-emerald-300' : 'text-rose-300',
                  },
                  {
                    label: '合計強化回数（全育成・精錬・鍛錬）',
                    val: `${stats.totalUpgrades.toLocaleString()} 回`,
                    cls: 'text-emerald-300',
                  },
                  {
                    label: '勇者修行レベルアップ回数',
                    val: `${stats.totalHeroLevelsGained.toLocaleString()} 回`,
                    cls: 'text-slate-100',
                  },
                  {
                    label: '仲間訓練レベルアップ回数',
                    val: `${stats.totalAllyLevelsGained.toLocaleString()} 回`,
                    cls: 'text-slate-100',
                  },
                  {
                    label: '装備精錬 (+強化) 累計段階',
                    val: `${stats.totalItemsRefined.toLocaleString()} 回`,
                    cls: 'text-sky-300',
                  },
                  {
                    label: '鍛冶屋 鍛造回数',
                    val: `${stats.totalItemsCrafted.toLocaleString()} 回`,
                    cls: 'text-amber-200',
                  },
                  {
                    label: '道具屋 購入総数',
                    val: `${stats.totalItemsBought.toLocaleString()} 個`,
                    cls: 'text-slate-100',
                  },
                  {
                    label: '装備分解・売却総数',
                    val: `${stats.totalItemsSalvaged.toLocaleString()} 個`,
                    cls: 'text-slate-300',
                  },
                  {
                    label: '消費アイテム発動回数（戦闘中）',
                    val: `${stats.totalConsumableActivations.toLocaleString()} 回`,
                    cls: 'text-purple-300',
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between gap-2 py-1 border-b border-[#1c2130] last:border-b-0"
                  >
                    <span className="text-slate-400">{row.label}</span>
                    <span className={`font-num font-bold ${row.cls}`}>{row.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Combat & Exploration */}
            <div className="bg-[#12151d] border border-[#2b3040] p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-300 border-b border-[#232836] pb-1.5">
                <Swords className="w-4 h-4" />
                <span>戦闘・探索・到達記録</span>
              </div>
              <div className="space-y-1.5 text-xs">
                {[
                  {
                    label: '総出撃 / 総踏破（踏破率）',
                    val: `${save.totalRuns.toLocaleString()}回 / ${save.totalClears.toLocaleString()}回 (${clearRate}%)`,
                    cls: 'text-amber-200',
                  },
                  {
                    label: '現在周回 / 最高クリア周回 / 転生回数',
                    val: `第${save.loopCount}周 / 第${save.highestClearedLoop}周 / ${stats.totalReincarnations}回`,
                    cls: 'text-slate-100',
                  },
                  {
                    label: '無限回廊 最高到達階層',
                    val: `${save.bestEndlessFloor ?? 0} F`,
                    cls: 'text-purple-300',
                  },
                  {
                    label: '強化ボスラッシュ踏破回数',
                    val: `${save.bossRushClears ?? 0} 回`,
                    cls: 'text-rose-300',
                  },
                  {
                    label: '累計討伐モンスター数 (うちボス)',
                    val: `${stats.totalEnemiesDefeated.toLocaleString()}体 (${stats.totalBossesDefeated.toLocaleString()}体)`,
                    cls: 'text-slate-100',
                  },
                  {
                    label: '最大一撃ダメージ',
                    val: `${(save.bestSingleHit ?? 0).toLocaleString()} DMG`,
                    cls: 'text-amber-300',
                  },
                  {
                    label: '累計与ダメージ',
                    val: `${stats.totalDamageDealt.toLocaleString()} DMG`,
                    cls: 'text-slate-100',
                  },
                  {
                    label: '累計回復量',
                    val: `${stats.totalHealingDone.toLocaleString()} HP`,
                    cls: 'text-emerald-300',
                  },
                  {
                    label: '累計獲得「踏破の証」 / 累計素材',
                    val: `証 ${stats.totalCrestsEarned.toLocaleString()} / 素材 ${stats.totalMaterialsEarned.toLocaleString()}`,
                    cls: 'text-sky-300',
                  },
                  {
                    label: '図鑑コンプ / 実績達成',
                    val: `${compStats.overallPct}% · 通常${achBonus.unlockedCount}/${achBonus.totalCount}${achBonus.secretUnlockedCount > 0 ? ` · 裏${achBonus.secretUnlockedCount}/${achBonus.secretTotalCount}` : ''}`,
                    cls: 'text-emerald-200',
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between gap-2 py-1 border-b border-[#1c2130] last:border-b-0"
                  >
                    <span className="text-slate-400">{row.label}</span>
                    <span className={`font-num font-bold ${row.cls}`}>{row.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {recentRuns.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400 border border-dashed border-[#2b3040]">
                まだ遠征履歴がありません。ダンジョンに出発して帰還すると最新20件の記録が残ります。
              </div>
            ) : (
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {recentRuns.map((run) => {
                  const badge = run.isPracticeRun
                    ? { text: '仮潜入', cls: 'bg-purple-950 border-purple-400/70 text-purple-200' }
                    : run.isEndless
                      ? { text: '無限帰還', cls: 'bg-purple-950 border-purple-400/70 text-purple-200' }
                      : run.victory
                        ? { text: '踏破', cls: 'bg-emerald-950 border-emerald-400/70 text-emerald-200' }
                        : { text: '撤退', cls: 'bg-rose-950 border-rose-400/70 text-rose-200' };

                  return (
                    <div
                      key={run.id}
                      className="bg-[#12151d] border border-[#2b3040] px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`px-2 py-0.5 text-[10px] font-bold border shrink-0 ${badge.cls}`}>
                          {badge.text}
                        </span>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-100 truncate">
                            {run.stageName}
                            <span className="ml-2 font-num text-[11px] text-slate-400">
                              第{run.loopCount}周 ·{' '}
                              {run.isEndless
                                ? `${run.reachedFloor}F到達`
                                : `${run.reachedFloor}/${run.totalFloors}F`}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 font-num text-[11px] shrink-0">
                        <span className="text-amber-300">+{run.goldEarned.toLocaleString()}G</span>
                        <span className="text-slate-300">討伐 {run.enemiesDefeated}</span>
                        <span className="text-rose-300">最大 {run.maxHitDamage.toLocaleString()}</span>
                        <span className="text-slate-400">{run.durationSec}秒</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#232836] text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-slate-500" />
            <span>これらの履歴は転生してもそのまま引き継がれます。</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
