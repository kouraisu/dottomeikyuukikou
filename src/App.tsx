/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Lock, Sparkles } from 'lucide-react';
import {
  EventChoiceSelection,
  ExpeditionHudSnapshot,
} from './components/DungeonCanvas';
import { ExpeditionView } from './components/ExpeditionView';
import { HistoryModal } from './components/HistoryModal';
import { PixelSprite } from './components/PixelSprite';
import { SettingsModal } from './components/SettingsModal';
import { SummaryView } from './components/SummaryView';
import { TownView } from './components/TownView';
import {
  ACHIEVEMENTS,
  ALL_ACHIEVEMENT_IDS,
  ALL_SECRET_ACHIEVEMENT_IDS,
  ALLIES,
  areAllAchievementsUnlocked,
  AUTO_EQUIP_STYLE_META,
  BLESSINGS,
  buildAutoEquipPouch,
  canReincarnate,
  clampSpeedToUnlocked,
  CONVENIENCE_UPGRADE_IDS,
  createDefaultPresets,
  CREST_EXCHANGE_OPTIONS,
  FEATURE_UNLOCKS,
  FeatureAnnouncementDef,
  FeatureUnlockDef,
  FORGE_EXCLUSIVE_ITEM_IDS,
  FORGE_RECIPES,
  getAllyGearCost,
  getAllyTrainBulkCost,
  getAllyTrainStepCost,
  getCompendiumStats,
  getEffectiveTotalMeterCap,
  getEffectiveTypeMeterCap,
  getHeroTrainBulkCost,
  getHeroTrainStepCost,
  getItemMeterCost,
  getItemRefineCost,
  getItemRefineRangeCost,
  getItemSalvageReward,
  getMaxTotalMeterCeiling,
  getMaxTypeMeterCeiling,
  getMaxUnlockedSpeed,
  getNextHeroMilestoneSteps,
  getPendingFeatureAnnouncements,
  getPouchMeterUsage,
  getShopMaxStock,
  getTotalMeterExpandCost,
  getTypeMeterExpandCost,
  hasConvenience,
  INITIAL_LIFETIME_STATS,
  INITIAL_SAVE_STATE,
  INITIAL_TYPE_METER_CAPS,
  isEndlessUnlocked,
  isItemUnlockedInShop,
  isStageUnlockedForPlay,
  isTabUnlocked,
  isTrueEndgameUnlocked,
  ITEMS,
  MAX_ITEM_REFINE,
  MAX_POUCH_SLOTS,
  MAX_PRESET_SLOTS,
  refillConsumedPouchSlots,
  SECRET_ACHIEVEMENTS,
  SKILL_TREE,
  STAGES,
} from './game/data';
import {
  mergeUnique,
  reconcilePartyOrder,
  sanitizeSaveState,
} from './game/saveCodec';
import { BgmTrack, BGM_TRACK_LABELS, sound } from './game/sound';
import {
  AchievementDef,
  AutoEquipPlaystyle,
  CombatLogEntry,
  ConvenienceUpgradeId,
  DungeonEventDef,
  DungeonEventOption,
  EventChoiceMode,
  ExpeditionResult,
  GameScreen,
  GameSpeed,
  ItemCategory,
  LifetimeStats,
  RunHistoryEntry,
  SaveState,
  TownTab,
} from './game/types';

const STORAGE_KEY = 'pixel_labyrinth_save_v2';

function loadSaveState(): SaveState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_SAVE_STATE;
    return sanitizeSaveState(JSON.parse(raw) as Partial<SaveState>);
  } catch {
    return INITIAL_SAVE_STATE;
  }
}

export default function App() {
  const [save, setSave] = useState<SaveState>(loadSaveState);
  const [screen, setScreen] = useState<GameScreen>('TOWN');
  const [townTab, setTownTab] = useState<TownTab>('PREP');
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [bgmMuted, setBgmMuted] = useState(() => sound.bgmMuted);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [retreatSignal, setRetreatSignal] = useState(0);
  const [hud, setHud] = useState<ExpeditionHudSnapshot | null>(null);
  const [logs, setLogs] = useState<CombatLogEntry[]>([]);
  const [pendingEvent, setPendingEvent] = useState<DungeonEventDef | null>(null);
  const [eventSelection, setEventSelection] = useState<EventChoiceSelection | null>(null);
  const [summary, setSummary] = useState<ExpeditionResult | null>(null);
  const [summaryUnlocked, setSummaryUnlocked] = useState<FeatureUnlockDef[]>([]);
  const [summaryAchievements, setSummaryAchievements] = useState<AchievementDef[]>([]);
  const [summaryEndlessUnlocked, setSummaryEndlessUnlocked] = useState(false);
  const [summaryTrueEndgameUnlocked, setSummaryTrueEndgameUnlocked] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [expeditionRunId, setExpeditionRunId] = useState(0);
  const lastPlayTickRef = useRef<number>(Date.now());

  const addLifetimeDelta = (
    prevStats: LifetimeStats | undefined,
    delta: Partial<Omit<LifetimeStats, 'recentRuns'>>,
    newRun?: RunHistoryEntry
  ): LifetimeStats => {
    const base = prevStats ?? INITIAL_LIFETIME_STATS;
    return {
      playTimeSeconds: base.playTimeSeconds + (delta.playTimeSeconds ?? 0),
      totalGoldEarned: base.totalGoldEarned + (delta.totalGoldEarned ?? 0),
      totalGoldSpent: base.totalGoldSpent + (delta.totalGoldSpent ?? 0),
      totalUpgrades: base.totalUpgrades + (delta.totalUpgrades ?? 0),
      totalItemsUsed: base.totalItemsUsed + (delta.totalItemsUsed ?? 0),
      totalConsumableActivations:
        base.totalConsumableActivations + (delta.totalConsumableActivations ?? 0),
      totalItemsBought: base.totalItemsBought + (delta.totalItemsBought ?? 0),
      totalItemsCrafted: base.totalItemsCrafted + (delta.totalItemsCrafted ?? 0),
      totalItemsRefined: base.totalItemsRefined + (delta.totalItemsRefined ?? 0),
      totalItemsSalvaged: base.totalItemsSalvaged + (delta.totalItemsSalvaged ?? 0),
      totalHeroLevelsGained: base.totalHeroLevelsGained + (delta.totalHeroLevelsGained ?? 0),
      totalAllyLevelsGained: base.totalAllyLevelsGained + (delta.totalAllyLevelsGained ?? 0),
      totalEnemiesDefeated: base.totalEnemiesDefeated + (delta.totalEnemiesDefeated ?? 0),
      totalBossesDefeated: base.totalBossesDefeated + (delta.totalBossesDefeated ?? 0),
      totalDamageDealt: base.totalDamageDealt + (delta.totalDamageDealt ?? 0),
      totalHealingDone: base.totalHealingDone + (delta.totalHealingDone ?? 0),
      totalCrestsEarned: base.totalCrestsEarned + (delta.totalCrestsEarned ?? 0),
      totalMaterialsEarned: base.totalMaterialsEarned + (delta.totalMaterialsEarned ?? 0),
      totalReincarnations: base.totalReincarnations + (delta.totalReincarnations ?? 0),
      recentRuns: newRun ? [newRun, ...(base.recentRuns ?? [])].slice(0, 20) : base.recentRuns ?? [],
    };
  };

  const flushPlayTime = useCallback(() => {
    const now = Date.now();
    const elapsedSec = Math.floor((now - lastPlayTickRef.current) / 1000);
    if (elapsedSec <= 0) return;
    lastPlayTickRef.current += elapsedSec * 1000;
    const capped = Math.min(elapsedSec, 120);
    setSave((prev) => ({
      ...prev,
      lifetimeStats: addLifetimeDelta(prev.lifetimeStats, { playTimeSeconds: capped }),
    }));
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        flushPlayTime();
      } else {
        lastPlayTickRef.current = Date.now();
      }
    }, 15000);
    const onVis = () => {
      if (document.visibilityState === 'hidden') {
        flushPlayTime();
      } else {
        lastPlayTickRef.current = Date.now();
      }
    };
    const onUnload = () => flushPlayTime();
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('beforeunload', onUnload);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('beforeunload', onUnload);
    };
  }, [flushPlayTime]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
    } catch {
      // Ignore storage quota errors
    }
  }, [save]);

  useEffect(() => {
    const unlock = () => {
      sound.unlockAudio();
    };
    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  const currentBgmTrack: BgmTrack = (() => {
    if (screen === 'TOWN') return 'TOWN';
    if (screen === 'SUMMARY') {
      return summary?.victory || summary?.isEndless ? 'VICTORY' : 'DEFEAT';
    }
    const stage = STAGES.find((s) => s.id === save.selectedStageId) ?? STAGES[0];
    if (stage.isBossRush) return 'BOSS_RUSH';
    if (hud?.bossInfo) {
      return stage.isEndless && (hud.floor ?? 1) >= 15 ? 'BOSS_RUSH' : 'BOSS';
    }
    return stage.id >= 4 ? 'DUNGEON_DEEP' : 'DUNGEON_EARLY';
  })();

  useEffect(() => {
    sound.setBgmTrack(currentBgmTrack);
  }, [currentBgmTrack]);

  useEffect(() => {
    sound.setBgmDucked(screen === 'EXPEDITION' && paused);
  }, [screen, paused]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 2400);
    return () => clearTimeout(t);
  }, [notice]);

  const showNotice = useCallback((msg: string) => {
    setNotice(msg);
  }, []);

  const handleEquipToPouch = useCallback(
    (itemId: string) => {
      const item = ITEMS[itemId];
      if (!item) return;
      setSave((prev) => {
        const emptyIdx = prev.pouch.findIndex((x) => x === null);
        if (emptyIdx === -1) return prev;
        const owned = prev.inventory[itemId] ?? 0;
        const currentlyUsed = prev.pouch.filter((x) => x === itemId).length;
        if (currentlyUsed >= owned) return prev;

        const usage = getPouchMeterUsage(prev.pouch);
        const cost = getItemMeterCost(itemId);
        const effectiveTotalCap = getEffectiveTotalMeterCap(prev);
        const effectiveTypeCap = getEffectiveTypeMeterCap(prev, item.category);
        if (usage.byCategory[item.category] + cost > effectiveTypeCap) {
          showNotice('タイプ別メーターの上限を超えるため装備できません');
          return prev;
        }
        if (usage.total + cost > effectiveTotalCap) {
          showNotice('全体キャパシティメーターが不足しています');
          return prev;
        }

        const nextPouch = [...prev.pouch];
        nextPouch[emptyIdx] = itemId;
        sound.equip();
        return { ...prev, pouch: nextPouch };
      });
    },
    [showNotice]
  );

  const handleRemoveFromPouch = useCallback((slotIndex: number) => {
    setSave((prev) => {
      if (!prev.pouch[slotIndex]) return prev;
      const nextPouch = [...prev.pouch];
      nextPouch[slotIndex] = null;
      sound.click();
      return { ...prev, pouch: nextPouch };
    });
  }, []);

  const handleChangeAutoEquipStyle = useCallback((style: AutoEquipPlaystyle) => {
    sound.click();
    setSave((prev) => ({ ...prev, autoEquipStyle: style }));
  }, []);

  const handleClearPouch = useCallback(() => {
    setSave((prev) => {
      if (!hasConvenience(prev, 'conv_auto_equip')) {
        showNotice('「スマート編成（オート装備）」をスキルツリーで解放してください');
        return prev;
      }
      if (!prev.pouch.some(Boolean)) return prev;
      sound.click();
      showNotice('持ち込み袋をすべて空にしました');
      return { ...prev, pouch: Array(MAX_POUCH_SLOTS).fill(null) };
    });
  }, [showNotice]);

  const handleAutoFillPouch = useCallback(() => {
    setSave((prev) => {
      if (!hasConvenience(prev, 'conv_auto_equip')) {
        showNotice('「スマート編成（オート装備）」をスキルツリー（1SP）で解放してください');
        return prev;
      }
      const style = prev.autoEquipStyle ?? 'OFFENSE';
      const nextPouch = buildAutoEquipPouch(prev, style);
      const count = nextPouch.filter(Boolean).length;
      sound.equip();
      showNotice(
        `【${AUTO_EQUIP_STYLE_META[style].label}】方針で${count}個のアイテムをセットしました`
      );
      return { ...prev, pouch: nextPouch };
    });
  }, [showNotice]);

  const handleSavePreset = useCallback(
    (slotIndex: number, customName?: string) => {
      if (slotIndex < 0 || slotIndex >= MAX_PRESET_SLOTS) return;
      setSave((prev) => {
        if (prev.loopCount < 3) {
          showNotice('編成プリセットは第3周目到達で解放されます');
          return prev;
        }
        const basePresets = prev.presets ?? createDefaultPresets();
        const nextPresets = Array.from({ length: MAX_PRESET_SLOTS }, (_, i) => ({
          ...(basePresets[i] ?? createDefaultPresets()[i]),
        }));
        const existing = nextPresets[slotIndex];
        const nextName = (customName ?? existing.name).trim() || `マイセット ${slotIndex + 1}`;
        nextPresets[slotIndex] = {
          id: existing.id || `preset_${slotIndex + 1}`,
          name: nextName.slice(0, 24),
          saved: true,
          pouch: [...prev.pouch],
          activeAllies: [...prev.activeAllies],
          partyOrder: [...prev.partyOrder],
          activeBlessings: [...prev.activeBlessings],
          autoEquipStyle: prev.autoEquipStyle ?? 'OFFENSE',
        };
        sound.equip();
        showNotice(`「${nextName}」に現在の装備・仲間・加護を保存しました`);
        return { ...prev, presets: nextPresets };
      });
    },
    [showNotice]
  );

  const handleRenamePreset = useCallback((slotIndex: number, name: string) => {
    if (slotIndex < 0 || slotIndex >= MAX_PRESET_SLOTS) return;
    setSave((prev) => {
      const basePresets = prev.presets ?? createDefaultPresets();
      const nextPresets = Array.from({ length: MAX_PRESET_SLOTS }, (_, i) => ({
        ...(basePresets[i] ?? createDefaultPresets()[i]),
      }));
      nextPresets[slotIndex] = {
        ...nextPresets[slotIndex],
        name: name.slice(0, 24),
      };
      return { ...prev, presets: nextPresets };
    });
  }, []);

  const handleLoadPreset = useCallback(
    (slotIndex: number) => {
      if (slotIndex < 0 || slotIndex >= MAX_PRESET_SLOTS) return;
      setSave((prev) => {
        if (prev.loopCount < 3) {
          showNotice('編成プリセットは第3周目到達で解放されます');
          return prev;
        }
        const presets = prev.presets ?? createDefaultPresets();
        const preset = presets[slotIndex];
        if (!preset || !preset.saved) {
          showNotice('このマイセットにはまだ編成が保存されていません');
          return prev;
        }

        const effectiveTotalCap = getEffectiveTotalMeterCap(prev);
        const typeUsed: Record<ItemCategory, number> = {
          WEAPON: 0,
          ARMOR: 0,
          CONSUMABLE: 0,
          RELIC: 0,
        };
        let totalUsed = 0;
        const usedCounts: Record<string, number> = {};
        const nextPouch: (string | null)[] = Array(MAX_POUCH_SLOTS).fill(null);
        let nextSlot = 0;
        let skippedItems = 0;

        for (const itemId of preset.pouch) {
          if (!itemId) continue;
          const item = ITEMS[itemId];
          if (!item) {
            skippedItems += 1;
            continue;
          }
          const owned = prev.inventory[itemId] ?? 0;
          const alreadyPicked = usedCounts[itemId] ?? 0;
          const cost = getItemMeterCost(itemId);
          const typeCap = getEffectiveTypeMeterCap(prev, item.category);
          if (
            nextSlot >= MAX_POUCH_SLOTS ||
            alreadyPicked >= owned ||
            totalUsed + cost > effectiveTotalCap ||
            typeUsed[item.category] + cost > typeCap
          ) {
            skippedItems += 1;
            continue;
          }
          nextPouch[nextSlot++] = itemId;
          usedCounts[itemId] = alreadyPicked + 1;
          totalUsed += cost;
          typeUsed[item.category] += cost;
        }

        const nextAllies = preset.activeAllies
          .filter((id) => (prev.hiredAllies[id] ?? 0) > 0)
          .slice(0, 2);
        const nextOrder = reconcilePartyOrder(preset.partyOrder, nextAllies);
        const nextBlessings = preset.activeBlessings
          .filter((id) => (prev.unlockedBlessings[id] ?? 0) > 0)
          .slice(0, prev.maxBlessingSlots);

        sound.equip();
        if (skippedItems > 0) {
          showNotice(`「${preset.name}」を呼び出しました（未所持/枠超過 ${skippedItems}個を除外）`);
        } else {
          showNotice(`「${preset.name}」の装備・仲間・加護を呼び出しました`);
        }

        return {
          ...prev,
          pouch: nextPouch,
          activeAllies: nextAllies,
          partyOrder: nextOrder,
          activeBlessings: nextBlessings,
          autoEquipStyle: preset.autoEquipStyle ?? prev.autoEquipStyle,
        };
      });
    },
    [showNotice]
  );

  const handleExpandTotalMeter = useCallback(() => {
    setSave((prev) => {
      const ceiling = getMaxTotalMeterCeiling(prev.loopCount);
      if (prev.totalMeterCap >= ceiling) return prev;
      const cost = getTotalMeterExpandCost(prev.totalMeterCap);
      if (
        prev.gold < cost.gold ||
        prev.clearCrests < cost.crests ||
        prev.materials.magic_stone < cost.magicStone
      ) {
        return prev;
      }
      sound.heal();
      showNotice(`全体キャパシティ上限が ${prev.totalMeterCap + 1} に開放されました！`);
      return {
        ...prev,
        gold: prev.gold - cost.gold,
        clearCrests: prev.clearCrests - cost.crests,
        materials: {
          ...prev.materials,
          magic_stone: prev.materials.magic_stone - cost.magicStone,
        },
        totalMeterCap: prev.totalMeterCap + 1,
        lifetimeStats: addLifetimeDelta(prev.lifetimeStats, {
          totalGoldSpent: cost.gold,
          totalUpgrades: 1,
        }),
      };
    });
  }, [showNotice]);

  const handleExpandTypeMeter = useCallback(
    (category: ItemCategory) => {
      setSave((prev) => {
        const ceiling = getMaxTypeMeterCeiling(prev.loopCount);
        const current = prev.typeMeterCaps[category];
        if (current >= ceiling) return prev;
        const cost = getTypeMeterExpandCost(category, current);
        if (
          prev.gold < cost.gold ||
          prev.clearCrests < cost.crests ||
          prev.materials.magic_stone < cost.magicStone
        ) {
          return prev;
        }
        sound.heal();
        showNotice(`タイプ上限が ${current + 1} に開放されました！`);
        return {
          ...prev,
          gold: prev.gold - cost.gold,
          clearCrests: prev.clearCrests - cost.crests,
          materials: {
            ...prev.materials,
            magic_stone: prev.materials.magic_stone - cost.magicStone,
          },
          typeMeterCaps: {
            ...prev.typeMeterCaps,
            [category]: current + 1,
          },
          lifetimeStats: addLifetimeDelta(prev.lifetimeStats, {
            totalGoldSpent: cost.gold,
            totalUpgrades: 1,
          }),
        };
      });
    },
    [showNotice]
  );

  const evaluateAchievements = useCallback(
    (
      nextSave: SaveState,
      runResult?: ExpeditionResult
    ): {
      save: SaveState;
      newlyUnlocked: AchievementDef[];
      masterJustUnlocked: boolean;
    } => {
      const currentSet = new Set(nextSave.unlockedAchievements ?? []);
      const newlyUnlocked: AchievementDef[] = [];

      const epicDiscoveredCount = (nextSave.discoveredItems ?? []).filter(
        (id) => ITEMS[id]?.rarity === 'EPIC'
      ).length;

      const hasAllyMaster = Object.keys(nextSave.hiredAllies ?? {}).some(
        (id) =>
          ((nextSave.allyGearLevels ?? {})[id] ?? 0) >= 3 &&
          (nextSave.allyAwakenings[id] ?? 0) >= 2
      );

      const checks: Record<string, boolean> = {
        ach_stage1:
          Boolean(runResult?.victory && runResult.stageId >= 1) ||
          nextSave.highestClearedStage >= 1,
        ach_minimalist: Boolean(runResult?.victory && runResult.pouchItemCount <= 2),
        ach_no_consumable: Boolean(
          runResult?.victory && runResult.stageId >= 2 && runResult.usedConsumablesCount === 0
        ),
        ach_perfect_trio: Boolean(
          runResult?.victory &&
            runResult.stageId >= 3 &&
            runResult.hadFullParty &&
            runResult.allPartySurvived
        ),
        ach_speed_clear: Boolean(runResult?.victory && runResult.durationSec <= 40),
        ach_heavy_hitter: (nextSave.bestSingleHit ?? 0) >= 180,
        ach_high_hp_boss: Boolean(
          runResult?.victory && runResult.stageId >= 4 && runResult.heroHpPct >= 80
        ),
        ach_demon_slayer:
          Boolean(runResult?.victory && runResult.stageId === 6) ||
          nextSave.highestClearedStage >= 6,
        ach_reincarnate: nextSave.loopCount >= 2,
        ach_ally_master: hasAllyMaster,
        ach_epic_collector: epicDiscoveredCount >= 3,
        ach_secret_clear: Boolean(
          runResult?.victory && runResult.stageId >= 7 && runResult.stageId <= 9
        ),
      };

      ACHIEVEMENTS.forEach((ach) => {
        if (!currentSet.has(ach.id) && checks[ach.id]) {
          currentSet.add(ach.id);
          newlyUnlocked.push(ach);
        }
      });

      if (isTrueEndgameUnlocked(nextSave)) {
        const secretChecks: Record<string, boolean> = {
          sach_endless_100: (nextSave.bestEndlessFloor ?? 0) >= 100,
          sach_endless_150: (nextSave.bestEndlessFloor ?? 0) >= 150,
          sach_endless_200: (nextSave.bestEndlessFloor ?? 0) >= 200,
          sach_god_slayer: (nextSave.bestSingleHit ?? 0) >= 10000,
          sach_forge_mythic: FORGE_EXCLUSIVE_ITEM_IDS.some(
            (id) => (nextSave.discoveredItems ?? []).includes(id) || (nextSave.inventory[id] ?? 0) > 0
          ),
          sach_transcendent_master: SKILL_TREE.some(
            (n) => n.branch === 'TRANSCENDENT' && (nextSave.unlockedSkills ?? []).includes(n.id)
          ),
        };
        SECRET_ACHIEVEMENTS.forEach((ach) => {
          if (!currentSet.has(ach.id) && secretChecks[ach.id]) {
            currentSet.add(ach.id);
            newlyUnlocked.push(ach);
          }
        });
      }

      const unlockedList = [...ALL_ACHIEVEMENT_IDS, ...ALL_SECRET_ACHIEVEMENT_IDS].filter((id) =>
        currentSet.has(id)
      );
      let evaluatedSave: SaveState = {
        ...nextSave,
        unlockedAchievements: unlockedList,
      };

      let masterJustUnlocked = false;
      if (
        areAllAchievementsUnlocked(evaluatedSave) &&
        (evaluatedSave.claimedAllAchievementsInLoop ?? 0) < evaluatedSave.loopCount
      ) {
        masterJustUnlocked = true;
        evaluatedSave = {
          ...evaluatedSave,
          claimedAllAchievementsInLoop: evaluatedSave.loopCount,
        };
      }

      return { save: evaluatedSave, newlyUnlocked, masterJustUnlocked };
    },
    []
  );

  const handleAdvanceLoop = useCallback(() => {
    setSave((prev) => {
      if (!canReincarnate(prev)) return prev;
      const nextLoop = prev.loopCount + 1;
      const startingSp = nextLoop * 2;
      const baseNext: SaveState = {
        ...INITIAL_SAVE_STATE,
        materials: { ...INITIAL_SAVE_STATE.materials },
        inventory: { ...INITIAL_SAVE_STATE.inventory },
        pouch: [...INITIAL_SAVE_STATE.pouch],
        typeMeterCaps: { ...INITIAL_TYPE_METER_CAPS },
        loopCount: nextLoop,
        highestClearedLoop: Math.max(prev.highestClearedLoop ?? 0, prev.loopCount),
        bestEndlessFloor: prev.bestEndlessFloor ?? 0,
        cycleClears: 0,
        skillPoints: startingSp,
        unlockedSkills: [],
        spMasteryLevel: 0,
        stageClearsThisLoop: [],
        clearCrests: prev.clearCrests + 2,
        eventChoiceMode: 'MANUAL',
        autoEquipStyle: prev.autoEquipStyle,
        totalRuns: prev.totalRuns,
        totalClears: prev.totalClears,
        discoveredEnemies: [...prev.discoveredEnemies],
        discoveredEvents: [...prev.discoveredEvents],
        discoveredItems: mergeUnique(prev.discoveredItems, INITIAL_SAVE_STATE.discoveredItems),
        seenGuides: [...(prev.seenGuides ?? [])],
        unlockedAchievements: [...(prev.unlockedAchievements ?? [])],
        claimedAllAchievementsInLoop: 0,
        bossRushClears: prev.bossRushClears ?? 0,
        bestSingleHit: prev.bestSingleHit ?? 0,
        unlockedConveniences: [],
        preferredSpeed: 1,
        autoRepeatEnabled: false,
        autoRestockOnReturn: false,
        practiceLoopCount: null,
        presets: (prev.presets ?? createDefaultPresets()).map((p) => ({
          ...p,
          pouch: [...p.pouch],
          activeAllies: [...p.activeAllies],
          partyOrder: [...p.partyOrder],
          activeBlessings: [...p.activeBlessings],
        })),
        itemRefineLevels: {},
        seenAnnouncements: [...(prev.seenAnnouncements ?? [])],
        lifetimeStats: addLifetimeDelta(prev.lifetimeStats, {
          totalReincarnations: 1,
        }),
      };
      const evaluated = evaluateAchievements(baseNext);
      sound.victory();
      showNotice(
        evaluated.masterJustUnlocked
          ? `第${nextLoop}周目へ転生！全実績制覇済のため「【極】強化ボスラッシュ」へ再挑戦できます！`
          : `第${nextLoop}周目へ転生！道具屋や装備はリセットされ、敵強化・裏ステージ・初期${startingSp}SPが解放！`
      );
      return evaluated.save;
    });
    setSummary(null);
    setSummaryUnlocked([]);
    setSummaryAchievements([]);
    setSummaryEndlessUnlocked(false);
    setSummaryTrueEndgameUnlocked(false);
    setScreen('TOWN');
    setTownTab('PREP');
  }, [evaluateAchievements, showNotice]);

  const handleBuyItem = useCallback(
    (itemId: string) => {
      const item = ITEMS[itemId];
      if (!item) return;
      setSave((prev) => {
        if (!isItemUnlockedInShop(item, prev.cycleClears)) return prev;
        const maxStock = getShopMaxStock(item, prev.cycleClears);
        const bought = prev.shopBoughtThisCycle[itemId] ?? 0;
        if (bought >= maxStock) return prev;
        if (prev.gold < item.price) return prev;

        sound.buy();
        const nextSave: SaveState = {
          ...prev,
          gold: prev.gold - item.price,
          inventory: {
            ...prev.inventory,
            [itemId]: (prev.inventory[itemId] ?? 0) + 1,
          },
          shopBoughtThisCycle: {
            ...prev.shopBoughtThisCycle,
            [itemId]: bought + 1,
          },
          discoveredItems: mergeUnique(prev.discoveredItems, [itemId]),
          lifetimeStats: addLifetimeDelta(prev.lifetimeStats, {
            totalGoldSpent: item.price,
            totalItemsBought: 1,
          }),
        };
        const evaluated = evaluateAchievements(nextSave);
        if (evaluated.masterJustUnlocked) {
          showNotice(`${item.name}を購入！全実績制覇で【極】強化ボスラッシュが開放！`);
        } else if (evaluated.newlyUnlocked.length > 0) {
          showNotice(`${item.name}を購入 · 実績「${evaluated.newlyUnlocked[0].title}」解除！`);
        } else {
          showNotice(`${item.name} を購入しました`);
        }
        return evaluated.save;
      });
    },
    [evaluateAchievements, showNotice]
  );

  const handleSellItem = useCallback((itemId: string) => {
    const item = ITEMS[itemId];
    if (!item) return;
    setSave((prev) => {
      const owned = prev.inventory[itemId] ?? 0;
      const inPouch = prev.pouch.filter((x) => x === itemId).length;
      if (owned - inPouch <= 0) return prev;
      sound.coin();
      return {
        ...prev,
        gold: prev.gold + item.sellPrice,
        inventory: {
          ...prev.inventory,
          [itemId]: owned - 1,
        },
        lifetimeStats: addLifetimeDelta(prev.lifetimeStats, {
          totalGoldEarned: item.sellPrice,
          totalItemsSalvaged: 1,
        }),
      };
    });
  }, []);

  const handleSellSurplusCommons = useCallback(() => {
    setSave((prev) => {
      if (!hasConvenience(prev, 'conv_bulk_ops')) {
        showNotice('「一括育成＆ショップ補充」をスキルツリーで解放してください');
        return prev;
      }
      const nextInv = { ...prev.inventory };
      let soldCount = 0;
      let earnedGold = 0;
      Object.entries(prev.inventory).forEach(([id, qty]) => {
        const it = ITEMS[id];
        if (!it || it.rarity !== 'COMMON' || it.isUltimate) return;
        const inPouch = prev.pouch.filter((x) => x === id).length;
        const available = qty - inPouch;
        const sellable = Math.max(0, available - 2);
        if (sellable > 0) {
          nextInv[id] = qty - sellable;
          soldCount += sellable;
          earnedGold += sellable * it.sellPrice;
        }
      });
      if (soldCount === 0) return prev;
      sound.coin();
      showNotice(`余剰COMMONアイテム ${soldCount}個を一括売却しました (+${earnedGold}G)`);
      return {
        ...prev,
        gold: prev.gold + earnedGold,
        inventory: nextInv,
        lifetimeStats: addLifetimeDelta(prev.lifetimeStats, {
          totalGoldEarned: earnedGold,
          totalItemsSalvaged: soldCount,
        }),
      };
    });
  }, [showNotice]);

  const handleQuickRestockConsumables = useCallback(() => {
    setSave((prev) => {
      if (!hasConvenience(prev, 'conv_bulk_ops')) {
        showNotice('「一括育成＆ショップ補充」をスキルツリーで解放してください');
        return prev;
      }
      let remainingGold = prev.gold;
      const nextInv = { ...prev.inventory };
      const nextBought = { ...prev.shopBoughtThisCycle };
      const newlyBoughtIds: string[] = [];
      let totalBought = 0;
      let totalSpent = 0;

      const candidates = Object.values(ITEMS)
        .filter((it) => isItemUnlockedInShop(it, prev.cycleClears))
        .sort((a, b) => a.price - b.price);

      for (const item of candidates) {
        const maxStock = getShopMaxStock(item, prev.cycleClears);
        const bought = nextBought[item.id] ?? 0;
        const stockLeft = Math.max(0, maxStock - bought);
        for (let i = 0; i < stockLeft; i++) {
          if (remainingGold >= item.price) {
            remainingGold -= item.price;
            nextInv[item.id] = (nextInv[item.id] ?? 0) + 1;
            nextBought[item.id] = (nextBought[item.id] ?? 0) + 1;
            newlyBoughtIds.push(item.id);
            totalBought += 1;
            totalSpent += item.price;
          } else {
            break;
          }
        }
      }

      if (totalBought === 0) return prev;
      sound.buy();
      const nextSave: SaveState = {
        ...prev,
        gold: remainingGold,
        inventory: nextInv,
        shopBoughtThisCycle: nextBought,
        discoveredItems: mergeUnique(prev.discoveredItems, newlyBoughtIds),
        lifetimeStats: addLifetimeDelta(prev.lifetimeStats, {
          totalGoldSpent: totalSpent,
          totalItemsBought: totalBought,
        }),
      };
      const evaluated = evaluateAchievements(nextSave);
      showNotice(`ショップ商品 ${totalBought}個をまとめて購入しました (-${totalSpent}G)`);
      return evaluated.save;
    });
  }, [evaluateAchievements, showNotice]);

  const handleCraftRecipe = useCallback(
    (recipeId: string) => {
      const rec = FORGE_RECIPES.find((r) => r.id === recipeId);
      if (!rec) return;
      const item = ITEMS[rec.resultItemId];
      if (!item) return;

      setSave((prev) => {
        if (rec.requiredStageCleared && prev.highestClearedStage < rec.requiredStageCleared) {
          return prev;
        }
        if (rec.requiredEndlessFloor && (prev.bestEndlessFloor ?? 0) < rec.requiredEndlessFloor) {
          return prev;
        }
        if (prev.gold < rec.goldCost) return prev;
        if (
          prev.materials.iron_ore < (rec.materials.iron_ore ?? 0) ||
          prev.materials.magic_stone < (rec.materials.magic_stone ?? 0) ||
          prev.materials.ancient_scroll < (rec.materials.ancient_scroll ?? 0) ||
          (prev.materials.abyss_shard ?? 0) < (rec.materials.abyss_shard ?? 0) ||
          (prev.materials.void_gear ?? 0) < (rec.materials.void_gear ?? 0) ||
          (prev.materials.chaos_prism ?? 0) < (rec.materials.chaos_prism ?? 0)
        ) {
          return prev;
        }
        if (
          rec.requiredItems?.some(
            (req) => (prev.inventory[req.itemId] ?? 0) < req.count
          )
        ) {
          return prev;
        }
        sound.buy();
        const nextInv: Record<string, number> = { ...prev.inventory };
        rec.requiredItems?.forEach((req) => {
          nextInv[req.itemId] = Math.max(0, (nextInv[req.itemId] ?? 0) - req.count);
        });
        nextInv[item.id] = (nextInv[item.id] ?? 0) + 1;

        // Reconcile pouch if a consumed base equipment was equipped
        const remainingToAssign: Record<string, number> = { ...nextInv };
        const nextPouch = prev.pouch.map((pId) => {
          if (!pId) return null;
          if ((remainingToAssign[pId] ?? 0) > 0) {
            remainingToAssign[pId] -= 1;
            return pId;
          }
          return null;
        });

        const nextSave: SaveState = {
          ...prev,
          gold: prev.gold - rec.goldCost,
          materials: {
            iron_ore: prev.materials.iron_ore - (rec.materials.iron_ore ?? 0),
            magic_stone: prev.materials.magic_stone - (rec.materials.magic_stone ?? 0),
            ancient_scroll:
              prev.materials.ancient_scroll - (rec.materials.ancient_scroll ?? 0),
            abyss_shard: (prev.materials.abyss_shard ?? 0) - (rec.materials.abyss_shard ?? 0),
            void_gear: (prev.materials.void_gear ?? 0) - (rec.materials.void_gear ?? 0),
            chaos_prism: (prev.materials.chaos_prism ?? 0) - (rec.materials.chaos_prism ?? 0),
          },
          inventory: nextInv,
          pouch: nextPouch,
          discoveredItems: mergeUnique(prev.discoveredItems, [item.id]),
          lifetimeStats: addLifetimeDelta(prev.lifetimeStats, {
            totalGoldSpent: rec.goldCost,
            totalItemsCrafted: 1,
          }),
        };
        const evaluated = evaluateAchievements(nextSave);
        if (evaluated.masterJustUnlocked) {
          showNotice(`${item.name}を鍛造！全実績制覇で【極】強化ボスラッシュが開放！`);
        } else if (evaluated.newlyUnlocked.length > 0) {
          showNotice(`${item.name}を鍛造 · 実績「${evaluated.newlyUnlocked[0].title}」解除！`);
        } else {
          showNotice(`${item.name} を鍛造しました！`);
        }
        return evaluated.save;
      });
    },
    [evaluateAchievements, showNotice]
  );

  const handleRefineItem = useCallback(
    (itemId: string, toMax = false) => {
      const item = ITEMS[itemId];
      if (!item) return;
      setSave((prev) => {
        const owned = prev.inventory[itemId] ?? 0;
        const lv = (prev.itemRefineLevels ?? {})[itemId] ?? 0;
        if (owned <= 0 || lv >= MAX_ITEM_REFINE) return prev;
        const targetLv = toMax ? MAX_ITEM_REFINE : lv + 1;
        const cost = getItemRefineRangeCost(itemId, lv, targetLv);
        if (
          cost.steps <= 0 ||
          prev.gold < cost.gold ||
          prev.materials.iron_ore < cost.iron ||
          prev.materials.magic_stone < cost.stone ||
          prev.materials.ancient_scroll < cost.scroll
        ) {
          return prev;
        }
        sound.heal();
        showNotice(
          cost.steps > 1
            ? `${item.name} を +${lv}→+${targetLv} まで一括精錬しました！（効果 +${targetLv * 15}%）`
            : `${item.name} を +${targetLv} に精錬しました！（効果 +${targetLv * 15}%）`
        );
        return {
          ...prev,
          gold: prev.gold - cost.gold,
          materials: {
            ...prev.materials,
            iron_ore: prev.materials.iron_ore - cost.iron,
            magic_stone: prev.materials.magic_stone - cost.stone,
            ancient_scroll: prev.materials.ancient_scroll - cost.scroll,
          },
          itemRefineLevels: {
            ...(prev.itemRefineLevels ?? {}),
            [itemId]: targetLv,
          },
          lifetimeStats: addLifetimeDelta(prev.lifetimeStats, {
            totalGoldSpent: cost.gold,
            totalUpgrades: cost.steps,
            totalItemsRefined: cost.steps,
          }),
        };
      });
    },
    [showNotice]
  );

  const handleBulkRefinePouch = useCallback(() => {
    setSave((prev) => {
      const equippedIds = Array.from(
        new Set(prev.pouch.filter((id): id is string => Boolean(id && ITEMS[id])))
      );
      if (equippedIds.length === 0) return prev;

      let remGold = prev.gold;
      let remIron = prev.materials.iron_ore;
      let remStone = prev.materials.magic_stone;
      let remScroll = prev.materials.ancient_scroll;
      const nextRefine = { ...(prev.itemRefineLevels ?? {}) };
      let totalSteps = 0;
      let totalGoldSpent = 0;
      const upgradedItemIds = new Set<string>();

      for (const id of equippedIds) {
        let curLv = nextRefine[id] ?? 0;
        while (curLv < MAX_ITEM_REFINE) {
          const stepCost = getItemRefineCost(id, curLv);
          if (
            remGold < stepCost.gold ||
            remIron < stepCost.iron ||
            remStone < stepCost.stone ||
            remScroll < stepCost.scroll
          ) {
            break;
          }
          remGold -= stepCost.gold;
          remIron -= stepCost.iron;
          remStone -= stepCost.stone;
          remScroll -= stepCost.scroll;
          curLv += 1;
          nextRefine[id] = curLv;
          totalSteps += 1;
          totalGoldSpent += stepCost.gold;
          upgradedItemIds.add(id);
        }
      }

      if (totalSteps === 0) {
        showNotice('持ち込み装備をさらに精錬するためのゴールドまたは素材が不足しています');
        return prev;
      }

      sound.heal();
      showNotice(
        `持ち込み装備 ${upgradedItemIds.size}種をまとめて精錬しました（計+${totalSteps}段階 / -${totalGoldSpent.toLocaleString()}G）`
      );
      return {
        ...prev,
        gold: remGold,
        materials: {
          ...prev.materials,
          iron_ore: remIron,
          magic_stone: remStone,
          ancient_scroll: remScroll,
        },
        itemRefineLevels: nextRefine,
        lifetimeStats: addLifetimeDelta(prev.lifetimeStats, {
          totalGoldSpent,
          totalUpgrades: totalSteps,
          totalItemsRefined: totalSteps,
        }),
      };
    });
  }, [showNotice]);

  const handleSalvageItem = useCallback(
    (itemId: string) => {
      const item = ITEMS[itemId];
      if (!item) return;
      setSave((prev) => {
        const owned = prev.inventory[itemId] ?? 0;
        const inPouch = prev.pouch.filter((x) => x === itemId).length;
        if (owned - inPouch <= 0) return prev;
        const reward = getItemSalvageReward(itemId);
        sound.coin();
        showNotice(
          `${item.name} を1個分解し、${reward.gold}Gと素材を獲得しました`
        );
        return {
          ...prev,
          gold: prev.gold + reward.gold,
          materials: {
            ...prev.materials,
            iron_ore: prev.materials.iron_ore + reward.materials.iron_ore,
            magic_stone: prev.materials.magic_stone + reward.materials.magic_stone,
            ancient_scroll: prev.materials.ancient_scroll + reward.materials.ancient_scroll,
          },
          inventory: {
            ...prev.inventory,
            [itemId]: owned - 1,
          },
          lifetimeStats: addLifetimeDelta(prev.lifetimeStats, {
            totalGoldEarned: reward.gold,
            totalItemsSalvaged: 1,
            totalMaterialsEarned:
              reward.materials.iron_ore +
              reward.materials.magic_stone +
              reward.materials.ancient_scroll,
          }),
        };
      });
    },
    [showNotice]
  );

  const handleBulkSalvageSurplus = useCallback(() => {
    setSave((prev) => {
      const nextInv = { ...prev.inventory };
      let totalCount = 0;
      let gold = 0;
      let iron = 0;
      let stone = 0;
      let scroll = 0;

      Object.entries(prev.inventory).forEach(([id, qty]) => {
        const it = ITEMS[id];
        if (!it || it.isUltimate) return;
        const inPouch = prev.pouch.filter((x) => x === id).length;
        const salvageable = Math.max(0, qty - inPouch - 2);
        if (salvageable <= 0) return;
        const reward = getItemSalvageReward(id);
        nextInv[id] = qty - salvageable;
        totalCount += salvageable;
        gold += reward.gold * salvageable;
        iron += reward.materials.iron_ore * salvageable;
        stone += reward.materials.magic_stone * salvageable;
        scroll += reward.materials.ancient_scroll * salvageable;
      });

      if (totalCount === 0) return prev;
      sound.coin();
      showNotice(
        `余剰装備 ${totalCount}個を一括分解！（+${gold}G · 鉄+${iron} · 魔石+${stone} · 書+${scroll}）`
      );
      return {
        ...prev,
        gold: prev.gold + gold,
        materials: {
          ...prev.materials,
          iron_ore: prev.materials.iron_ore + iron,
          magic_stone: prev.materials.magic_stone + stone,
          ancient_scroll: prev.materials.ancient_scroll + scroll,
        },
        inventory: nextInv,
        lifetimeStats: addLifetimeDelta(prev.lifetimeStats, {
          totalGoldEarned: gold,
          totalItemsSalvaged: totalCount,
          totalMaterialsEarned: iron + stone + scroll,
        }),
      };
    });
  }, [showNotice]);

  const handleExchangeCrest = useCallback(
    (optionId: string) => {
      const opt = CREST_EXCHANGE_OPTIONS.find((o) => o.id === optionId);
      if (!opt) return;
      setSave((prev) => {
        if (prev.clearCrests < opt.crestCost) return prev;
        let nextGold = prev.gold;
        const nextMats = { ...prev.materials };
        let detail = '';

        if (opt.rewardKind === 'IRON') {
          nextMats.iron_ore += opt.amount;
          detail = `鉄鉱石 +${opt.amount}`;
        } else if (opt.rewardKind === 'STONE') {
          nextMats.magic_stone += opt.amount;
          detail = `魔石 +${opt.amount}`;
        } else if (opt.rewardKind === 'SCROLL') {
          nextMats.ancient_scroll += opt.amount;
          detail = `古文書 +${opt.amount}`;
        } else if (opt.rewardKind === 'GOLD') {
          const gained = opt.amount * Math.max(1, prev.loopCount);
          nextGold += gained;
          detail = `+${gained}G`;
        }

        sound.heal();
        showNotice(`踏破の証 ${opt.crestCost}枚を「${opt.title}」(${detail}) と交換しました！`);
        return {
          ...prev,
          clearCrests: prev.clearCrests - opt.crestCost,
          gold: nextGold,
          materials: nextMats,
          lifetimeStats: addLifetimeDelta(prev.lifetimeStats, {
            totalGoldEarned: opt.rewardKind === 'GOLD' ? opt.amount * Math.max(1, prev.loopCount) : 0,
            totalMaterialsEarned:
              opt.rewardKind === 'IRON' || opt.rewardKind === 'STONE' || opt.rewardKind === 'SCROLL'
                ? opt.amount
                : 0,
          }),
        };
      });
    },
    [showNotice]
  );

  const handleUnlockOrUpgradeBlessing = useCallback(
    (blessingId: string) => {
      const b = BLESSINGS.find((x) => x.id === blessingId);
      if (!b) return;
      setSave((prev) => {
        const lv = prev.unlockedBlessings[blessingId] ?? 0;
        if (lv >= b.maxLevel) return prev;
        const goldCost = lv === 0 ? b.unlockCostGold : b.upgradeBaseGold * lv;
        const stoneCost = lv === 0 ? b.unlockCostStones : b.upgradeBaseStones + (lv - 1);
        if (prev.gold < goldCost || prev.materials.magic_stone < stoneCost) return prev;

        sound.heal();
        const nextActive = [...prev.activeBlessings];
        if (lv === 0 && nextActive.length < prev.maxBlessingSlots) {
          nextActive.push(blessingId);
        }
        showNotice(`${b.name} Lv.${lv + 1} を授かりました`);
        return {
          ...prev,
          gold: prev.gold - goldCost,
          materials: {
            ...prev.materials,
            magic_stone: prev.materials.magic_stone - stoneCost,
          },
          unlockedBlessings: {
            ...prev.unlockedBlessings,
            [blessingId]: lv + 1,
          },
          activeBlessings: nextActive,
          lifetimeStats: addLifetimeDelta(prev.lifetimeStats, {
            totalGoldSpent: goldCost,
            totalUpgrades: 1,
          }),
        };
      });
    },
    [showNotice]
  );

  const handleToggleBlessing = useCallback((blessingId: string) => {
    setSave((prev) => {
      if ((prev.unlockedBlessings[blessingId] ?? 0) <= 0) return prev;
      const exists = prev.activeBlessings.includes(blessingId);
      if (exists) {
        sound.click();
        return {
          ...prev,
          activeBlessings: prev.activeBlessings.filter((id) => id !== blessingId),
        };
      }
      const next = [...prev.activeBlessings];
      if (next.length >= prev.maxBlessingSlots) {
        next.shift();
      }
      next.push(blessingId);
      sound.equip();
      return { ...prev, activeBlessings: next };
    });
  }, []);

  const handleExpandBlessingSlot = useCallback(() => {
    setSave((prev) => {
      if (prev.maxBlessingSlots >= 3) return prev;
      if (prev.gold < 240 || prev.materials.magic_stone < 3) return prev;
      sound.heal();
      showNotice('加護の同時発動枠が 3 に増えました！');
      return {
        ...prev,
        gold: prev.gold - 240,
        materials: {
          ...prev.materials,
          magic_stone: prev.materials.magic_stone - 3,
        },
        maxBlessingSlots: 3,
        lifetimeStats: addLifetimeDelta(prev.lifetimeStats, {
          totalGoldSpent: 240,
          totalUpgrades: 1,
        }),
      };
    });
  }, [showNotice]);

  const handleHireOrUpgradeAlly = useCallback(
    (allyId: string) => {
      const ally = ALLIES.find((a) => a.id === allyId);
      if (!ally) return;
      setSave((prev) => {
        const lv = prev.hiredAllies[allyId] ?? 0;
        const cost = getAllyTrainStepCost(ally, lv);
        if (prev.gold < cost) return prev;

        sound.buy();
        const nextActive = [...prev.activeAllies];
        if (lv === 0 && nextActive.length < 2) {
          nextActive.push(allyId);
        }
        showNotice(
          lv === 0
            ? `${ally.name} が仲間になりました`
            : `${ally.name} が Lv.${lv + 1} に成長しました`
        );
        return {
          ...prev,
          gold: prev.gold - cost,
          hiredAllies: {
            ...prev.hiredAllies,
            [allyId]: lv + 1,
          },
          activeAllies: nextActive,
          partyOrder: reconcilePartyOrder(prev.partyOrder, nextActive),
          lifetimeStats: addLifetimeDelta(prev.lifetimeStats, {
            totalGoldSpent: cost,
            totalUpgrades: 1,
            totalAllyLevelsGained: 1,
          }),
        };
      });
    },
    [showNotice]
  );

  const handleBulkTrainAlly = useCallback(
    (allyId: string) => {
      const ally = ALLIES.find((a) => a.id === allyId);
      if (!ally) return;
      setSave((prev) => {
        if (!hasConvenience(prev, 'conv_bulk_ops')) {
          showNotice('「一括育成＆ショップ補充」をスキルツリーで解放してください');
          return prev;
        }
        const lv = prev.hiredAllies[allyId] ?? 0;
        if (lv <= 0) return prev;
        const cost = getAllyTrainBulkCost(ally, lv, 5);
        if (prev.gold < cost) return prev;
        sound.buy();
        showNotice(`${ally.name} を +5Lv 一括訓練し Lv.${lv + 5} に成長しました！`);
        return {
          ...prev,
          gold: prev.gold - cost,
          hiredAllies: {
            ...prev.hiredAllies,
            [allyId]: lv + 5,
          },
          lifetimeStats: addLifetimeDelta(prev.lifetimeStats, {
            totalGoldSpent: cost,
            totalUpgrades: 5,
            totalAllyLevelsGained: 5,
          }),
        };
      });
    },
    [showNotice]
  );

  const handleAwakenAlly = useCallback(
    (allyId: string) => {
      const ally = ALLIES.find((a) => a.id === allyId);
      if (!ally) return;
      setSave((prev) => {
        const lv = prev.hiredAllies[allyId] ?? 0;
        const rank = prev.allyAwakenings[allyId] ?? 0;
        if (lv <= 0 || rank >= 3) return prev;
        const awGold = 75 + rank * 75;
        const awIron = 1 + rank;
        const awStone = 1 + rank;
        const awScroll = rank >= 2 ? 1 : 0;
        if (
          prev.gold < awGold ||
          prev.materials.iron_ore < awIron ||
          prev.materials.magic_stone < awStone ||
          prev.materials.ancient_scroll < awScroll
        ) {
          return prev;
        }
        sound.heal();
        const nextSave: SaveState = {
          ...prev,
          gold: prev.gold - awGold,
          materials: {
            ...prev.materials,
            iron_ore: prev.materials.iron_ore - awIron,
            magic_stone: prev.materials.magic_stone - awStone,
            ancient_scroll: prev.materials.ancient_scroll - awScroll,
          },
          allyAwakenings: {
            ...prev.allyAwakenings,
            [allyId]: rank + 1,
          },
          lifetimeStats: addLifetimeDelta(prev.lifetimeStats, {
            totalGoldSpent: awGold,
            totalUpgrades: 1,
          }),
        };
        const evaluated = evaluateAchievements(nextSave);
        if (evaluated.masterJustUnlocked) {
          showNotice(`${ally.name}が★${rank + 1}覚醒！全実績制覇で【極】強化ボスラッシュが開放！`);
        } else if (evaluated.newlyUnlocked.length > 0) {
          showNotice(`${ally.name}が★${rank + 1}覚醒 · 実績「${evaluated.newlyUnlocked[0].title}」解除！`);
        } else {
          showNotice(`${ally.name} の特技が ★${rank + 1} に覚醒しました！`);
        }
        return evaluated.save;
      });
    },
    [evaluateAchievements, showNotice]
  );

  const handleUpgradeAllyGear = useCallback(
    (allyId: string) => {
      const ally = ALLIES.find((a) => a.id === allyId);
      if (!ally) return;
      setSave((prev) => {
        const lv = prev.hiredAllies[allyId] ?? 0;
        const gearLv = (prev.allyGearLevels ?? {})[allyId] ?? 0;
        if (lv <= 0 || gearLv >= 5) return prev;
        const cost = getAllyGearCost(gearLv);
        if (
          prev.gold < cost.gold ||
          prev.materials.iron_ore < cost.iron ||
          prev.materials.magic_stone < cost.stone ||
          prev.materials.ancient_scroll < cost.scroll
        ) {
          return prev;
        }
        sound.heal();
        const nextSave: SaveState = {
          ...prev,
          gold: prev.gold - cost.gold,
          materials: {
            ...prev.materials,
            iron_ore: prev.materials.iron_ore - cost.iron,
            magic_stone: prev.materials.magic_stone - cost.stone,
            ancient_scroll: prev.materials.ancient_scroll - cost.scroll,
          },
          allyGearLevels: {
            ...(prev.allyGearLevels ?? {}),
            [allyId]: gearLv + 1,
          },
          lifetimeStats: addLifetimeDelta(prev.lifetimeStats, {
            totalGoldSpent: cost.gold,
            totalUpgrades: 1,
          }),
        };
        const evaluated = evaluateAchievements(nextSave);
        if (evaluated.masterJustUnlocked) {
          showNotice(`${ally.name}の専属武具が+${gearLv + 1}へ！全実績制覇で【極】強化ボスラッシュが開放！`);
        } else if (evaluated.newlyUnlocked.length > 0) {
          showNotice(
            `${ally.name}の専属武具が+${gearLv + 1}に強化 · 実績「${evaluated.newlyUnlocked[0].title}」解除！`
          );
        } else {
          showNotice(`${ally.name} の専属武具を +${gearLv + 1} に鍛錬しました！`);
        }
        return evaluated.save;
      });
    },
    [evaluateAchievements, showNotice]
  );

  const handleToggleAlly = useCallback((allyId: string) => {
    setSave((prev) => {
      if ((prev.hiredAllies[allyId] ?? 0) <= 0) return prev;
      const exists = prev.activeAllies.includes(allyId);
      if (exists) {
        sound.click();
        const nextActive = prev.activeAllies.filter((id) => id !== allyId);
        return {
          ...prev,
          activeAllies: nextActive,
          partyOrder: reconcilePartyOrder(prev.partyOrder, nextActive),
        };
      }
      const next = [...prev.activeAllies];
      if (next.length >= 2) {
        next.shift();
      }
      next.push(allyId);
      sound.equip();
      return {
        ...prev,
        activeAllies: next,
        partyOrder: reconcilePartyOrder(prev.partyOrder, next),
      };
    });
  }, []);

  const handleMovePartyMember = useCallback(
    (memberId: string, direction: 'FORWARD' | 'BACKWARD') => {
      setSave((prev) => {
        const order = reconcilePartyOrder(prev.partyOrder, prev.activeAllies);
        const idx = order.indexOf(memberId);
        if (idx === -1) return prev;
        const targetIdx = direction === 'FORWARD' ? idx - 1 : idx + 1;
        if (targetIdx < 0 || targetIdx >= order.length) return prev;
        const nextOrder = [...order];
        [nextOrder[idx], nextOrder[targetIdx]] = [nextOrder[targetIdx], nextOrder[idx]];
        sound.click();
        return { ...prev, partyOrder: nextOrder };
      });
    },
    []
  );

  const handleTrainHero = useCallback(() => {
    setSave((prev) => {
      const cost = getHeroTrainStepCost(prev.heroUpgradeLevel);
      if (prev.gold < cost) return prev;
      const nextLv = prev.heroUpgradeLevel + 1;
      const gainedSp = nextLv % 5 === 0 ? 1 : 0;
      sound.heal();
      if (gainedSp > 0) {
        showNotice(`勇者が Lv.${nextLv} に成長し、5レベル到達ボーナスで +1 SP を獲得！`);
      } else {
        const nextSpLv = Math.floor(nextLv / 5) * 5 + 5;
        showNotice(`勇者が Lv.${nextLv} に成長！（次のSP獲得は Lv.${nextSpLv}）`);
      }
      return {
        ...prev,
        gold: prev.gold - cost,
        heroUpgradeLevel: nextLv,
        skillPoints: prev.skillPoints + gainedSp,
        lifetimeStats: addLifetimeDelta(prev.lifetimeStats, {
          totalGoldSpent: cost,
          totalUpgrades: 1,
          totalHeroLevelsGained: 1,
        }),
      };
    });
  }, [showNotice]);

  const handleBulkTrainHero = useCallback(() => {
    setSave((prev) => {
      if (!hasConvenience(prev, 'conv_bulk_ops')) {
        showNotice('「一括育成＆ショップ補充」をスキルツリーで解放してください');
        return prev;
      }
      const steps = getNextHeroMilestoneSteps(prev.heroUpgradeLevel);
      const cost = getHeroTrainBulkCost(prev.heroUpgradeLevel, steps);
      if (prev.gold < cost) return prev;
      const nextLv = prev.heroUpgradeLevel + steps;
      const gainedSp = Math.floor(nextLv / 5) - Math.floor(prev.heroUpgradeLevel / 5);
      sound.heal();
      showNotice(
        `勇者を +${steps}Lv 一括修行して Lv.${nextLv} に成長！${gainedSp > 0 ? ` (+${gainedSp} SP獲得)` : ''}`
      );
      return {
        ...prev,
        gold: prev.gold - cost,
        heroUpgradeLevel: nextLv,
        skillPoints: prev.skillPoints + gainedSp,
        lifetimeStats: addLifetimeDelta(prev.lifetimeStats, {
          totalGoldSpent: cost,
          totalUpgrades: steps,
          totalHeroLevelsGained: steps,
        }),
      };
    });
  }, [showNotice]);

  const handleUnlockSkill = useCallback(
    (skillId: string) => {
      const node = SKILL_TREE.find((n) => n.id === skillId);
      if (!node) return;
      setSave((prev) => {
        if (node.branch === 'TRANSCENDENT' && !isTrueEndgameUnlocked(prev)) {
          return prev;
        }
        const isConv =
          node.branch === 'CONVENIENCE' ||
          CONVENIENCE_UPGRADE_IDS.includes(skillId as ConvenienceUpgradeId);
        const unlocked = prev.unlockedSkills ?? [];
        const convList = prev.unlockedConveniences ?? [];
        if (unlocked.includes(skillId) || (isConv && convList.includes(skillId as ConvenienceUpgradeId))) {
          return prev;
        }
        if (node.exclusiveWith && unlocked.includes(node.exclusiveWith)) return prev;
        if (
          node.requiresAny &&
          !node.requiresAny.some(
            (req) => unlocked.includes(req) || convList.includes(req as ConvenienceUpgradeId)
          )
        ) {
          return prev;
        }
        if (prev.skillPoints < node.costSp) return prev;

        sound.heal();
        let nextPreferredSpeed = prev.preferredSpeed ?? 1;
        if (skillId === 'conv_speed_4x' && nextPreferredSpeed < 2) nextPreferredSpeed = 2;
        if (skillId === 'conv_speed_8x' && nextPreferredSpeed < 8) nextPreferredSpeed = 8;
        if (skillId === 'conv_speed_16x' && nextPreferredSpeed < 16) nextPreferredSpeed = 16;
        if (skillId === 'conv_speed_32x' && nextPreferredSpeed < 32) nextPreferredSpeed = 32;
        if (skillId === 'conv_speed_64x') nextPreferredSpeed = 64;

        const nextSave: SaveState = {
          ...prev,
          skillPoints: prev.skillPoints - node.costSp,
          unlockedSkills: mergeUnique(unlocked, [skillId]),
          unlockedConveniences: isConv
            ? (mergeUnique(convList, [skillId]) as ConvenienceUpgradeId[])
            : convList,
          preferredSpeed: nextPreferredSpeed,
          lifetimeStats: addLifetimeDelta(prev.lifetimeStats, { totalUpgrades: 1 }),
        };
        const evaluated = evaluateAchievements(nextSave);
        if (evaluated.newlyUnlocked.length > 0) {
          showNotice(
            `スキル「${node.name}」習得 · 裏実績「${evaluated.newlyUnlocked[0].title}」解除！`
          );
        } else {
          showNotice(`スキル「${node.name}」を習得しました！`);
        }
        return evaluated.save;
      });
    },
    [evaluateAchievements, showNotice]
  );

  const handleUpgradeSpMastery = useCallback(
    (steps = 1) => {
      setSave((prev) => {
        if (prev.skillPoints < 1) return prev;
        const actualSteps = Math.min(Math.max(1, Math.floor(steps)), prev.skillPoints);
        const nextLv = (prev.spMasteryLevel ?? 0) + actualSteps;
        sound.heal();
        showNotice(
          `SP極限鍛錬が +${actualSteps} → Lv.${nextLv} に上昇！（累計: 勇者攻防HP+${nextLv * 8}% · 仲間+${nextLv * 6}% · 獲得G+${nextLv * 6}%）`
        );
        return {
          ...prev,
          skillPoints: prev.skillPoints - actualSteps,
          spMasteryLevel: nextLv,
          lifetimeStats: addLifetimeDelta(prev.lifetimeStats, {
            totalUpgrades: actualSteps,
          }),
        };
      });
    },
    [showNotice]
  );

  const handleResetSkills = useCallback(() => {
    setSave((prev) => {
      const unlocked = mergeUnique(prev.unlockedSkills, prev.unlockedConveniences);
      const mastery = prev.spMasteryLevel ?? 0;
      if (unlocked.length === 0 && mastery === 0) return prev;
      const treeRefund = unlocked.reduce((sum, id) => {
        const node = SKILL_TREE.find((n) => n.id === id);
        return sum + (node?.costSp ?? 1);
      }, 0);
      const refund = treeRefund + mastery;

      // Trim trailing pouch slots if resetting extraMeterCap / extraTypeMeterCap exceeds base caps
      const nextPouch = [...prev.pouch];
      const exceedsBaseCaps = () => {
        const usage = getPouchMeterUsage(nextPouch);
        if (usage.total > prev.totalMeterCap) return true;
        return (['WEAPON', 'ARMOR', 'CONSUMABLE', 'RELIC'] as const).some(
          (cat) => usage.byCategory[cat] > prev.typeMeterCaps[cat]
        );
      };
      while (exceedsBaseCaps()) {
        let removed = false;
        for (let i = nextPouch.length - 1; i >= 0; i--) {
          if (nextPouch[i]) {
            nextPouch[i] = null;
            removed = true;
            break;
          }
        }
        if (!removed) break;
      }

      sound.click();
      showNotice(`スキルと極限鍛錬を振り直しました (+${refund} SP 返却)`);
      return {
        ...prev,
        skillPoints: prev.skillPoints + refund,
        unlockedSkills: [],
        unlockedConveniences: [],
        preferredSpeed: 1,
        autoRepeatEnabled: false,
        autoRestockOnReturn: false,
        eventChoiceMode: 'MANUAL',
        spMasteryLevel: 0,
        pouch: nextPouch,
      };
    });
  }, [showNotice]);

  const handleChangeSpeed = useCallback(
    (nextSpeed: GameSpeed) => {
      setSave((prev) => {
        const maxSpd = getMaxUnlockedSpeed(prev);
        if (nextSpeed > maxSpd) {
          showNotice(`「${nextSpeed}x」速度はスキルツリーから解放できます`);
          return prev;
        }
        sound.click();
        return { ...prev, preferredSpeed: nextSpeed };
      });
    },
    [showNotice]
  );

  const handleToggleAutoRepeat = useCallback(() => {
    setSave((prev) => {
      if (!hasConvenience(prev, 'conv_auto_repeat')) {
        showNotice('「連続自動周回＆自動補充」をスキルツリーから解放してください');
        return prev;
      }
      const nextVal = !prev.autoRepeatEnabled;
      sound.click();
      showNotice(nextVal ? '連続自動周回をONにしました' : '連続自動周回をOFFにしました');
      return { ...prev, autoRepeatEnabled: nextVal };
    });
  }, [showNotice]);

  const handleToggleAutoRestock = useCallback(() => {
    setSave((prev) => {
      if (!hasConvenience(prev, 'conv_auto_repeat')) {
        showNotice('「連続自動周回＆自動補充」をスキルツリーから解放してください');
        return prev;
      }
      const nextVal = !prev.autoRestockOnReturn;
      sound.click();
      showNotice(nextVal ? '帰還時の消費枠自動補充をONにしました' : '帰還時自動補充をOFFにしました');
      return { ...prev, autoRestockOnReturn: nextVal };
    });
  }, [showNotice]);

  const handleSelectStage = useCallback((stageId: number) => {
    sound.click();
    setSave((prev) => ({ ...prev, selectedStageId: stageId }));
  }, []);

  const handleSelectPracticeLoop = useCallback((targetLoop: number | null) => {
    sound.click();
    setSave((prev) => {
      if (
        targetLoop === null ||
        prev.loopCount < 2 ||
        targetLoop < 1 ||
        targetLoop >= prev.loopCount
      ) {
        return { ...prev, practiceLoopCount: null };
      }
      return { ...prev, practiceLoopCount: Math.floor(targetLoop) };
    });
  }, []);

  const handleChangeEventMode = useCallback(
    (mode: EventChoiceMode) => {
      setSave((prev) => {
        if (mode === 'AUTO' && !hasConvenience(prev, 'conv_auto_event')) {
          showNotice('「イベント自動判断」をスキルツリー（1SP）で解放してください');
          return prev;
        }
        sound.click();
        return { ...prev, eventChoiceMode: mode };
      });
    },
    [showNotice]
  );

  const handleStartExpedition = useCallback(() => {
    sound.click();
    setLogs([]);
    setHud(null);
    setSummary(null);
    setPendingEvent(null);
    setEventSelection(null);
    setPaused(false);
    setRetreatSignal(0);
    setExpeditionRunId((id) => id + 1);
    setScreen('EXPEDITION');
  }, []);

  const handleRetryExpedition = useCallback(() => {
    sound.click();
    setLogs([]);
    setHud(null);
    setSummary(null);
    setPendingEvent(null);
    setEventSelection(null);
    setPaused(false);
    setRetreatSignal(0);
    setExpeditionRunId((id) => id + 1);
    setScreen('EXPEDITION');
  }, []);

  const handleSelectEventOption = useCallback((option: DungeonEventOption) => {
    sound.click();
    setEventSelection({ nonce: Date.now() + Math.random(), option });
    setPendingEvent(null);
  }, []);

  const handleLog = useCallback((entry: CombatLogEntry) => {
    setLogs((prev) => [entry, ...prev].slice(0, 70));
  }, []);

  const handleExpeditionComplete = useCallback(
    (result: ExpeditionResult) => {
      flushPlayTime();
      setPendingEvent(null);
      const matsTotal =
        (result.materialsEarned.iron_ore ?? 0) +
        (result.materialsEarned.magic_stone ?? 0) +
        (result.materialsEarned.ancient_scroll ?? 0) +
        (result.materialsEarned.abyss_shard ?? 0) +
        (result.materialsEarned.void_gear ?? 0) +
        (result.materialsEarned.chaos_prism ?? 0);
      const consumableActs = result.consumableActivations ?? result.usedConsumablesCount ?? 0;
      const nonConsumableUsed = result.consumedItems.filter(
        (id) => ITEMS[id]?.category !== 'CONSUMABLE'
      ).length;
      const runHistoryEntry: RunHistoryEntry = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        timestamp: Date.now(),
        stageId: result.stageId,
        stageName: result.stageName,
        loopCount: result.effectiveLoopCount ?? result.loopCount,
        victory: result.victory,
        isEndless: result.isEndless,
        isBossRush: result.isBossRush,
        isPracticeRun: result.isPracticeRun,
        reachedFloor: result.reachedFloor,
        totalFloors: result.totalFloors,
        goldEarned: result.goldEarned,
        enemiesDefeated: result.enemiesDefeated,
        maxHitDamage: result.maxHitDamage ?? 0,
        durationSec: result.durationSec,
      };

      if (result.isPracticeRun) {
        setSave((prev) => ({
          ...prev,
          gold: Math.max(0, prev.gold + result.goldEarned),
          materials: {
            ...prev.materials,
            magic_stone: prev.materials.magic_stone + (result.materialsEarned.magic_stone ?? 0),
          },
          lifetimeStats: addLifetimeDelta(
            prev.lifetimeStats,
            {
              totalGoldEarned: result.goldEarned,
              totalEnemiesDefeated: result.enemiesDefeated,
              totalBossesDefeated: result.bossesDefeated ?? 0,
              totalDamageDealt: result.totalDamageDealt ?? 0,
              totalHealingDone: result.totalHealingDone ?? 0,
              totalMaterialsEarned: matsTotal,
              totalItemsUsed: consumableActs,
              totalConsumableActivations: consumableActs,
            },
            runHistoryEntry
          ),
        }));
        setSummaryUnlocked([]);
        setSummaryAchievements([]);
        setSummaryEndlessUnlocked(false);
        setSummaryTrueEndgameUnlocked(false);
        setSummary(result);
        setScreen('SUMMARY');
        return;
      }

      const wasEndlessUnlocked = isEndlessUnlocked(save);
      const wasTrueEndgame = isTrueEndgameUnlocked(save);
      const prevCleared = save.highestClearedStage;
      const isBossRushRun = Boolean(result.isBossRush || result.stageId === 10);
      const isEndlessRun = Boolean(result.isEndless || result.stageId === 11);
      const unlockedNow =
        result.victory &&
        save.loopCount === 1 &&
        !isBossRushRun &&
        !isEndlessRun &&
        result.stageId > prevCleared
          ? Object.values(FEATURE_UNLOCKS).filter(
              (def) =>
                def.requiredStageCleared > prevCleared &&
                def.requiredStageCleared <= result.stageId
            )
          : [];
      setSummaryUnlocked(unlockedNow);

      const nextInv = { ...save.inventory };
      result.lootedItems.forEach((id) => {
        nextInv[id] = (nextInv[id] ?? 0) + 1;
      });
      result.consumedItems.forEach((id) => {
        if ((nextInv[id] ?? 0) > 0) {
          nextInv[id] -= 1;
        }
      });

      const remainingToAssign: Record<string, number> = { ...nextInv };
      const reconciledPouch = save.pouch.map((itemId) => {
        if (!itemId) return null;
        if ((remainingToAssign[itemId] ?? 0) > 0) {
          remainingToAssign[itemId] -= 1;
          return itemId;
        }
        return null;
      });

      const nextHighest =
        result.victory && !isBossRushRun && !isEndlessRun && result.stageId > save.highestClearedStage
          ? result.stageId
          : save.highestClearedStage;
      const alreadyClearedInLoop = (save.stageClearsThisLoop ?? []).includes(result.stageId);
      const clearedForSp = isEndlessRun ? result.reachedFloor >= 10 : result.victory;
      const earnedClearSp = clearedForSp && !alreadyClearedInLoop ? 1 : 0;
      const nextStageClearsThisLoop =
        clearedForSp && !alreadyClearedInLoop
          ? [...(save.stageClearsThisLoop ?? []), result.stageId]
          : save.stageClearsThisLoop ?? [];

      const baseUpdatedSavePreLoop: SaveState = {
        ...save,
        gold: Math.max(0, save.gold + result.goldEarned),
        clearCrests: save.clearCrests + result.crestsEarned,
        materials: {
          iron_ore: save.materials.iron_ore + result.materialsEarned.iron_ore,
          magic_stone: save.materials.magic_stone + result.materialsEarned.magic_stone,
          ancient_scroll:
            save.materials.ancient_scroll + result.materialsEarned.ancient_scroll,
          abyss_shard:
            (save.materials.abyss_shard ?? 0) + (result.materialsEarned.abyss_shard ?? 0),
          void_gear:
            (save.materials.void_gear ?? 0) + (result.materialsEarned.void_gear ?? 0),
          chaos_prism:
            (save.materials.chaos_prism ?? 0) + (result.materialsEarned.chaos_prism ?? 0),
        },
        inventory: nextInv,
        pouch: reconciledPouch,
        shopBoughtThisCycle: {},
        highestClearedStage: nextHighest,
        bestEndlessFloor: Math.max(
          save.bestEndlessFloor ?? 0,
          isEndlessRun ? result.reachedFloor : 0
        ),
        bossRushClears:
          (save.bossRushClears ?? 0) + (result.victory && isBossRushRun ? 1 : 0),
        bestSingleHit: Math.max(save.bestSingleHit ?? 0, result.maxHitDamage ?? 0),
        totalRuns: save.totalRuns + 1,
        totalClears: save.totalClears + (result.victory && !isEndlessRun ? 1 : 0),
        cycleClears: save.cycleClears + (result.victory || (isEndlessRun && result.reachedFloor >= 5) ? 1 : 0),
        skillPoints: save.skillPoints + earnedClearSp,
        stageClearsThisLoop: nextStageClearsThisLoop,
        discoveredEnemies: mergeUnique(save.discoveredEnemies, result.encounteredEnemyIds),
        discoveredEvents: mergeUnique(save.discoveredEvents, result.encounteredEventIds),
        discoveredItems: mergeUnique(save.discoveredItems, result.lootedItems),
        lifetimeStats: addLifetimeDelta(
          save.lifetimeStats,
          {
            totalGoldEarned: result.goldEarned,
            totalEnemiesDefeated: result.enemiesDefeated,
            totalBossesDefeated: result.bossesDefeated ?? 0,
            totalDamageDealt: result.totalDamageDealt ?? 0,
            totalHealingDone: result.totalHealingDone ?? 0,
            totalCrestsEarned: result.crestsEarned,
            totalMaterialsEarned: matsTotal,
            totalItemsUsed: consumableActs + nonConsumableUsed,
            totalConsumableActivations: consumableActs,
          },
          runHistoryEntry
        ),
      };

      const baseUpdatedSave: SaveState = {
        ...baseUpdatedSavePreLoop,
        highestClearedLoop: canReincarnate(baseUpdatedSavePreLoop)
          ? Math.max(save.highestClearedLoop ?? 0, save.loopCount)
          : (save.highestClearedLoop ?? 0),
      };

      const evaluated = evaluateAchievements(baseUpdatedSave, result);
      let finalSave = evaluated.save;
      let summaryResult = result;

      if (finalSave.autoRestockOnReturn && hasConvenience(finalSave, 'conv_auto_repeat')) {
        const restock = refillConsumedPouchSlots(save.pouch, reconciledPouch, finalSave);
        finalSave = {
          ...finalSave,
          pouch: restock.pouch,
          gold: Math.max(0, finalSave.gold - restock.goldSpent),
          inventory: restock.nextInventory,
          shopBoughtThisCycle: restock.nextShopBought,
          discoveredItems: mergeUnique(finalSave.discoveredItems, restock.boughtItemIds),
          lifetimeStats: addLifetimeDelta(finalSave.lifetimeStats, {
            totalGoldSpent: restock.goldSpent,
            totalItemsBought: restock.boughtItemIds.length,
          }),
        };
        if (restock.boughtItemIds.length > 0) {
          summaryResult = {
            ...result,
            autoPurchasedItems: restock.boughtItemIds,
            autoPurchasedGold: restock.goldSpent,
          };
          showNotice(
            `道具屋から消費枠 ${restock.boughtItemIds.length}個を自動購入・再補充しました (-${restock.goldSpent}G)`
          );
        }
      }

      const keepSameStageForRepeat =
        finalSave.autoRepeatEnabled && hasConvenience(finalSave, 'conv_auto_repeat');
      const candidateNextStage = STAGES.find((s) => s.id === result.stageId + 1);
      if (
        !keepSameStageForRepeat &&
        result.victory &&
        !isBossRushRun &&
        !isEndlessRun &&
        candidateNextStage &&
        isStageUnlockedForPlay(candidateNextStage, finalSave)
      ) {
        finalSave = { ...finalSave, selectedStageId: candidateNextStage.id };
      }

      setSave(finalSave);
      setSummaryAchievements(evaluated.newlyUnlocked);
      setSummaryEndlessUnlocked(!wasEndlessUnlocked && isEndlessUnlocked(finalSave));
      setSummaryTrueEndgameUnlocked(!wasTrueEndgame && isTrueEndgameUnlocked(finalSave));
      setSummary(summaryResult);
      setScreen('SUMMARY');
    },
    [evaluateAchievements, flushPlayTime, save, showNotice]
  );

  const handleDismissGuide = useCallback((tab: TownTab) => {
    sound.click();
    setSave((prev) => ({
      ...prev,
      seenGuides: mergeUnique(prev.seenGuides, [tab]),
    }));
  }, []);

  const handleReopenGuide = useCallback((tab: TownTab) => {
    sound.click();
    setSave((prev) => ({
      ...prev,
      seenGuides: (prev.seenGuides ?? []).filter((x) => x !== tab),
    }));
  }, []);

  const handleAcknowledgeAnnouncements = useCallback(
    (ids: string[], jumpTab?: TownTab) => {
      sound.click();
      setSave((prev) => ({
        ...prev,
        seenAnnouncements: mergeUnique(prev.seenAnnouncements, ids),
      }));
      if (jumpTab) {
        setTownTab(jumpTab);
      }
    },
    []
  );

  const handleToggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      sound.setMuted(next);
      return next;
    });
  }, []);

  const handleToggleBgmMute = useCallback(() => {
    setBgmMuted((prev) => {
      const next = !prev;
      sound.setBgmMuted(next);
      return next;
    });
  }, []);

  const handleImportSave = useCallback(
    (imported: SaveState) => {
      sound.heal();
      setSave(imported);
      setSummary(null);
      setScreen('TOWN');
      setTownTab('PREP');
      showNotice('セーブ文字列から冒険データを復元しました');
    },
    [showNotice]
  );

  const handleResetSave = useCallback(() => {
    sound.click();
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
    setSave(INITIAL_SAVE_STATE);
    setSummary(null);
    setScreen('TOWN');
    setTownTab('PREP');
    showNotice('すべてのセーブデータを初期化しました');
  }, [showNotice]);

  const townNavItems: { id: TownTab; label: string }[] = [
    { id: 'PREP', label: '持ち込み' },
    { id: 'SHOP', label: '道具屋' },
    { id: 'SHRINE', label: '祭壇' },
    { id: 'SKILLS', label: 'スキル' },
    { id: 'TAVERN', label: '酒場' },
    { id: 'ACHIEVEMENTS', label: '実績' },
    { id: 'COMPENDIUM', label: '図鑑' },
    { id: 'FORGE', label: '鍛冶屋' },
  ];

  const currentSpeed = clampSpeedToUnlocked(save.preferredSpeed, save);
  const maxUnlockedSpeed = getMaxUnlockedSpeed(save);
  const canAutoEvent = hasConvenience(save, 'conv_auto_event');
  const canAutoRepeat = hasConvenience(save, 'conv_auto_repeat');
  const pendingAnnouncements: FeatureAnnouncementDef[] =
    screen === 'TOWN' && !settingsOpen ? getPendingFeatureAnnouncements(save) : [];

  return (
    <div className="min-h-screen flex flex-col bg-[#101218] text-[#eceff4]">
      {/* TOP BAR CONTRACT: 3-Zone Header */}
      <header className="border-b-2 border-[#232836] bg-[#141720]">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
          <button
            type="button"
            onClick={() => {
              if (screen === 'TOWN') setTownTab('PREP');
            }}
            className="font-pixel text-xl text-amber-300 tracking-wider whitespace-nowrap shrink-0 cursor-pointer"
          >
            ドット迷宮紀行
          </button>

          {screen === 'TOWN' ? (
            <nav className="hidden md:flex items-center gap-3 lg:gap-4">
              {townNavItems.map((tab) => {
                const active = townTab === tab.id;
                const unlocked = isTabUnlocked(tab.id, save);
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      sound.click();
                      setTownTab(tab.id);
                    }}
                    className={`inline-flex items-center gap-1 py-1 text-xs lg:text-sm font-medium transition-colors whitespace-nowrap shrink-0 border-b-2 cursor-pointer ${
                      active
                        ? 'text-amber-300 border-amber-400'
                        : unlocked
                          ? 'text-slate-300 border-transparent hover:text-white'
                          : 'text-slate-500 border-transparent hover:text-slate-300'
                    }`}
                  >
                    {!unlocked && <Lock className="w-3 h-3 shrink-0 opacity-80" />}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          ) : (
            <nav className="hidden md:flex items-center gap-6 text-sm text-slate-400">
              <span className="whitespace-nowrap shrink-0">
                {screen === 'EXPEDITION' ? 'ダンジョン自動攻略中' : '遠征リザルト'}
              </span>
            </nav>
          )}

          <div className="shrink-0">
            {screen === 'TOWN' ? (
              <button
                type="button"
                onClick={handleStartExpedition}
                className="px-4 py-2 text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                ダンジョンへ出発
              </button>
            ) : screen === 'EXPEDITION' ? (
              <button
                type="button"
                onClick={() => setRetreatSignal((n) => n + 1)}
                className="px-4 py-2 text-xs sm:text-sm font-bold bg-rose-700 hover:bg-rose-600 text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                拠点へ撤退
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  sound.click();
                  setScreen('TOWN');
                  setTownTab('PREP');
                }}
                className="px-4 py-2 text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                拠点へ戻る
              </button>
            )}
          </div>
        </div>

        {screen === 'TOWN' && (
          <div className="md:hidden border-t border-[#232836] px-4 py-2 flex items-center gap-4 overflow-x-auto">
            {townNavItems.map((tab) => {
              const unlocked = isTabUnlocked(tab.id, save);
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    sound.click();
                    setTownTab(tab.id);
                  }}
                  className={`inline-flex items-center gap-1 text-xs font-medium whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
                    townTab === tab.id
                      ? 'text-amber-300 border-amber-400'
                      : unlocked
                        ? 'text-slate-400 border-transparent'
                        : 'text-slate-600 border-transparent'
                  }`}
                >
                  {!unlocked && <Lock className="w-3 h-3 shrink-0 opacity-80" />}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </header>

      <main className="flex-1">
        {screen === 'TOWN' && (
          <TownView
            save={save}
            activeTab={townTab}
            onSelectTab={(t) => {
              sound.click();
              setTownTab(t);
            }}
            onEquipToPouch={handleEquipToPouch}
            onRemoveFromPouch={handleRemoveFromPouch}
            onClearPouch={handleClearPouch}
            onAutoFillPouch={handleAutoFillPouch}
            onSavePreset={handleSavePreset}
            onLoadPreset={handleLoadPreset}
            onRenamePreset={handleRenamePreset}
            onChangeAutoEquipStyle={handleChangeAutoEquipStyle}
            onSellSurplusCommons={handleSellSurplusCommons}
            onQuickRestockConsumables={handleQuickRestockConsumables}
            onExpandTotalMeter={handleExpandTotalMeter}
            onExpandTypeMeter={handleExpandTypeMeter}
            onAdvanceLoop={handleAdvanceLoop}
            onBuyItem={handleBuyItem}
            onSellItem={handleSellItem}
            onCraftRecipe={handleCraftRecipe}
            onRefineItem={handleRefineItem}
            onBulkRefinePouch={handleBulkRefinePouch}
            onSalvageItem={handleSalvageItem}
            onBulkSalvageSurplus={handleBulkSalvageSurplus}
            onExchangeCrest={handleExchangeCrest}
            onUnlockOrUpgradeBlessing={handleUnlockOrUpgradeBlessing}
            onToggleBlessing={handleToggleBlessing}
            onExpandBlessingSlot={handleExpandBlessingSlot}
            onHireOrUpgradeAlly={handleHireOrUpgradeAlly}
            onBulkTrainAlly={handleBulkTrainAlly}
            onAwakenAlly={handleAwakenAlly}
            onUpgradeAllyGear={handleUpgradeAllyGear}
            onToggleAlly={handleToggleAlly}
            onMovePartyMember={handleMovePartyMember}
            onTrainHero={handleTrainHero}
            onBulkTrainHero={handleBulkTrainHero}
            onUnlockSkill={handleUnlockSkill}
            onUpgradeSpMastery={handleUpgradeSpMastery}
            onResetSkills={handleResetSkills}
            onSelectStage={handleSelectStage}
            onSelectPracticeLoop={handleSelectPracticeLoop}
            onChangeEventMode={handleChangeEventMode}
            onToggleAutoRepeat={handleToggleAutoRepeat}
            onToggleAutoRestock={handleToggleAutoRestock}
            onStartExpedition={handleStartExpedition}
            onOpenHistory={() => {
              sound.click();
              flushPlayTime();
              setHistoryOpen(true);
            }}
            onOpenSettings={() => {
              sound.click();
              flushPlayTime();
              setSettingsOpen(true);
            }}
            onDismissGuide={handleDismissGuide}
            onReopenGuide={handleReopenGuide}
          />
        )}

        {screen === 'EXPEDITION' && (
          <ExpeditionView
            key={expeditionRunId}
            save={save}
            hud={hud}
            logs={logs}
            speed={currentSpeed}
            maxUnlockedSpeed={maxUnlockedSpeed}
            canAutoEvent={canAutoEvent}
            canAutoRepeat={canAutoRepeat}
            autoRepeatEnabled={Boolean(save.autoRepeatEnabled)}
            paused={paused}
            muted={muted}
            bgmMuted={bgmMuted}
            eventChoiceMode={save.eventChoiceMode}
            pendingEvent={pendingEvent}
            eventSelection={eventSelection}
            retreatSignal={retreatSignal}
            onChangeSpeed={handleChangeSpeed}
            onTogglePause={() => {
              sound.click();
              setPaused((p) => !p);
            }}
            onToggleMute={handleToggleMute}
            onToggleBgmMute={handleToggleBgmMute}
            onToggleAutoRepeat={handleToggleAutoRepeat}
            onLockedNotice={showNotice}
            onChangeEventMode={handleChangeEventMode}
            onSelectEventOption={handleSelectEventOption}
            onHudUpdate={setHud}
            onLog={handleLog}
            onEventPrompt={setPendingEvent}
            onComplete={handleExpeditionComplete}
          />
        )}

        {screen === 'SUMMARY' && summary && (
          <SummaryView
            result={summary}
            compendiumPct={getCompendiumStats(save).overallPct}
            newlyUnlocked={summaryUnlocked}
            newlyUnlockedAchievements={summaryAchievements}
            allAchievementsCompleted={areAllAchievementsUnlocked(save)}
            endlessJustUnlocked={summaryEndlessUnlocked}
            trueEndgameJustUnlocked={summaryTrueEndgameUnlocked}
            canReincarnate={canReincarnate(save)}
            canAutoRepeat={canAutoRepeat}
            autoRepeatEnabled={Boolean(save.autoRepeatEnabled)}
            onToggleAutoRepeat={handleToggleAutoRepeat}
            onRetryStage={handleRetryExpedition}
            onAdvanceLoop={handleAdvanceLoop}
            onReturnToTown={() => {
              sound.click();
              setScreen('TOWN');
              setTownTab('PREP');
            }}
          />
        )}
      </main>

      {pendingAnnouncements.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="pixel-panel max-w-xl w-full p-5 sm:p-6 space-y-4 border-amber-400 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between gap-3 border-b border-[#2b3040] pb-3">
              <div className="flex items-center gap-2 text-amber-300">
                <Sparkles className="w-5 h-5 shrink-0" />
                <div>
                  <div className="text-[10px] font-num tracking-wider text-sky-300 font-bold">
                    NEW FEATURE UNLOCKED
                  </div>
                  <h2 className="font-pixel text-lg sm:text-xl text-white">
                    新機能・コンテンツ解放のお知らせ！
                  </h2>
                </div>
              </div>
              <span className="font-num text-xs px-2 py-0.5 bg-amber-500/20 border border-amber-400/60 text-amber-200 shrink-0">
                {pendingAnnouncements.length}件
              </span>
            </div>

            <div className="space-y-3">
              {pendingAnnouncements.map((ann) => {
                const badgeTone =
                  ann.accent === 'purple'
                    ? 'bg-purple-950 border-purple-400/75 text-purple-200'
                    : ann.accent === 'emerald'
                      ? 'bg-emerald-950 border-emerald-400/75 text-emerald-200'
                      : ann.accent === 'sky'
                        ? 'bg-sky-950 border-sky-400/75 text-sky-200'
                        : ann.accent === 'rose'
                          ? 'bg-rose-950 border-rose-400/75 text-rose-200'
                          : 'bg-amber-950 border-amber-400/75 text-amber-200';
                const allIds = pendingAnnouncements.map((x) => x.id);

                return (
                  <div
                    key={ann.id}
                    className="bg-[#12151d] border-2 border-[#2b3040] p-3.5 flex items-start gap-3.5"
                  >
                    <div className="w-12 h-12 bg-[#1a1f2b] border border-[#323a4f] flex items-center justify-center shrink-0">
                      <PixelSprite id={ann.spriteId} size={34} />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-0.5 text-[10px] font-bold border ${badgeTone}`}>
                          {ann.badge}
                        </span>
                      </div>
                      <div className="font-pixel text-sm sm:text-base text-amber-200 leading-snug">
                        {ann.title}
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{ann.description}</p>
                      {ann.targetTab && (
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => handleAcknowledgeAnnouncements(allIds, ann.targetTab)}
                            className="px-3 py-1 text-[11px] font-bold bg-[#1f2536] hover:bg-amber-500 hover:text-slate-950 text-amber-300 border border-amber-500/50 transition-colors cursor-pointer"
                          >
                            {ann.actionLabel ?? '移動する'} →
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-[#2b3040] flex justify-end">
              <button
                type="button"
                onClick={() =>
                  handleAcknowledgeAnnouncements(pendingAnnouncements.map((x) => x.id))
                }
                className="w-full sm:w-auto px-6 py-2.5 text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors cursor-pointer"
              >
                確認した！
              </button>
            </div>
          </div>
        </div>
      )}

      {historyOpen && (
        <HistoryModal
          save={save}
          onClose={() => {
            sound.click();
            flushPlayTime();
            setHistoryOpen(false);
          }}
        />
      )}

      {settingsOpen && (
        <SettingsModal
          save={save}
          muted={muted}
          bgmMuted={bgmMuted}
          onClose={() => {
            sound.click();
            setSettingsOpen(false);
          }}
          onToggleMute={handleToggleMute}
          onToggleBgmMute={handleToggleBgmMute}
          onChangeEventMode={handleChangeEventMode}
          onImportSave={handleImportSave}
          onResetAllData={handleResetSave}
        />
      )}

      {notice && (
        <div className="fixed bottom-5 right-5 z-40 px-4 py-2.5 bg-[#1b202c] border-2 border-amber-400 text-xs text-amber-200 shadow-lg">
          {notice}
        </div>
      )}

      <footer className="border-t border-[#1d212d] py-4 px-6 text-xs text-slate-500">
        <div className="max-w-[1320px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <span>ドット迷宮紀行 · 5つの持ち物と加護・仲間で挑む自動ダンジョンRPG</span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleToggleBgmMute}
              className="hover:text-slate-300 cursor-pointer"
            >
              BGM: {muted || bgmMuted ? 'OFF' : `ON（♪ ${BGM_TRACK_LABELS[currentBgmTrack]}）`}
            </button>
            <button
              type="button"
              onClick={handleToggleMute}
              className="hover:text-slate-300 cursor-pointer"
            >
              サウンド: {muted ? 'OFF' : 'ON'}
            </button>
            <button
              type="button"
              onClick={() => {
                sound.click();
                setSettingsOpen(true);
              }}
              className="hover:text-amber-300 cursor-pointer"
            >
              設定・セーブ管理
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
