import React, { useMemo, useState } from 'react';
import { Award, Compass, HelpCircle, Lock, Repeat, RotateCcw, Sparkles, Trash2, Zap } from 'lucide-react';
import dungeonDepthsImg from '../assets/images/pixel_dungeon_depths_1795345080012.jpg';
import shrineAltarImg from '../assets/images/pixel_sanctuary_altar_1795345079265.jpg';
import {
  ACHIEVEMENTS,
  ALLIES,
  areAllAchievementsUnlocked,
  AUTO_EQUIP_STYLE_META,
  BLESSINGS,
  canReincarnate,
  computePartyPower,
  createDefaultPresets,
  CREST_EXCHANGE_OPTIONS,
  DUNGEON_EVENTS,
  ENDLESS_BENCHMARK_LOOP,
  ENEMIES,
  FEATURE_UNLOCKS,
  FORGE_RECIPES,
  getAchievementBonuses,
  getActiveSynergies,
  getAllyGearCost,
  getAllyTrainBulkCost,
  getAllyTrainStepCost,
  getCompendiumBonuses,
  getCompendiumStats,
  getEffectiveDiveLoop,
  getEffectiveTotalMeterCap,
  getEffectiveTypeMeterCap,
  getEnemyStageHint,
  getFeatureUnlocks,
  getHeroTrainBulkCost,
  getHeroTrainStepCost,
  getItemEffectiveAutoPower,
  getItemEffectiveStats,
  getItemMeterCost,
  getItemRefineCost,
  getItemSalvageReward,
  getLoopEnemyStatMult,
  getLoopRewardMult,
  getMaxStageForLoop,
  getMaxTotalMeterCeiling,
  getMaxTypeMeterCeiling,
  getNextHeroMilestoneSteps,
  getNextUnlockHint,
  getPouchMeterUsage,
  getShopMaxStock,
  getSkillTreeBonuses,
  getStageDropProfile,
  getTotalMeterExpandCost,
  getTypeMeterExpandCost,
  hasConvenience,
  INSTANT_EVENT_DESCRIPTIONS,
  INSTANT_EVENTS,
  isEndlessUnlocked,
  isItemUnlockedInShop,
  isStageClearedInCurrentLoop,
  isStageUnlockedForPlay,
  isTabUnlocked,
  ITEMS,
  MATERIAL_INFO,
  MAX_ITEM_REFINE,
  MAX_POUCH_SLOTS,
  SKILL_TREE,
  STAGES,
  SYNERGIES,
  ULTIMATE_ITEM_IDS,
} from '../game/data';
import {
  AutoEquipPlaystyle,
  EventChoiceMode,
  ItemCategory,
  SaveState,
  SkillTreeBranch,
  TownTab,
} from '../game/types';
import { PixelSprite } from './PixelSprite';

interface TownViewProps {
  save: SaveState;
  activeTab: TownTab;
  onSelectTab: (tab: TownTab) => void;
  onEquipToPouch: (itemId: string) => void;
  onRemoveFromPouch: (slotIndex: number) => void;
  onClearPouch: () => void;
  onAutoFillPouch: () => void;
  onSavePreset: (slotIndex: number, customName?: string) => void;
  onLoadPreset: (slotIndex: number) => void;
  onRenamePreset: (slotIndex: number, name: string) => void;
  onChangeAutoEquipStyle: (style: AutoEquipPlaystyle) => void;
  onSellSurplusCommons: () => void;
  onQuickRestockConsumables: () => void;
  onExpandTotalMeter: () => void;
  onExpandTypeMeter: (category: ItemCategory) => void;
  onAdvanceLoop: () => void;
  onBuyItem: (itemId: string) => void;
  onSellItem: (itemId: string) => void;
  onCraftRecipe: (recipeId: string) => void;
  onRefineItem: (itemId: string) => void;
  onSalvageItem: (itemId: string) => void;
  onBulkSalvageSurplus: () => void;
  onExchangeCrest: (optionId: string) => void;
  onUnlockOrUpgradeBlessing: (blessingId: string) => void;
  onToggleBlessing: (blessingId: string) => void;
  onExpandBlessingSlot: () => void;
  onHireOrUpgradeAlly: (allyId: string) => void;
  onBulkTrainAlly: (allyId: string) => void;
  onAwakenAlly: (allyId: string) => void;
  onUpgradeAllyGear: (allyId: string) => void;
  onToggleAlly: (allyId: string) => void;
  onMovePartyMember: (memberId: string, direction: 'FORWARD' | 'BACKWARD') => void;
  onTrainHero: () => void;
  onBulkTrainHero: () => void;
  onUnlockSkill: (skillId: string) => void;
  onUpgradeSpMastery: () => void;
  onResetSkills: () => void;
  onSelectStage: (stageId: number) => void;
  onSelectPracticeLoop: (loop: number | null) => void;
  onChangeEventMode: (mode: EventChoiceMode) => void;
  onToggleAutoRepeat: () => void;
  onToggleAutoRestock: () => void;
  onStartExpedition: () => void;
  onOpenSettings: () => void;
  onDismissGuide: (tab: TownTab) => void;
  onReopenGuide: (tab: TownTab) => void;
}

const CATEGORY_LABELS: Record<'ALL' | ItemCategory, string> = {
  ALL: 'すべて',
  WEAPON: '武器',
  ARMOR: '防具',
  CONSUMABLE: '消費アイテム',
  RELIC: '魔道具',
};

const CATEGORY_SHORT: Record<ItemCategory, string> = {
  WEAPON: '武器',
  ARMOR: '防具',
  CONSUMABLE: '消費',
  RELIC: '魔道具',
};

const CATEGORY_BAR_COLOR: Record<ItemCategory, string> = {
  WEAPON: 'bg-rose-500',
  ARMOR: 'bg-sky-500',
  CONSUMABLE: 'bg-emerald-500',
  RELIC: 'bg-violet-500',
};

const RARITY_COLOR: Record<string, string> = {
  COMMON: 'text-slate-300',
  RARE: 'text-sky-300',
  EPIC: 'text-amber-300',
};

export const TownView: React.FC<TownViewProps> = ({
  save,
  activeTab,
  onSelectTab,
  onEquipToPouch,
  onRemoveFromPouch,
  onClearPouch,
  onAutoFillPouch,
  onSavePreset,
  onLoadPreset,
  onRenamePreset,
  onChangeAutoEquipStyle,
  onSellSurplusCommons,
  onQuickRestockConsumables,
  onExpandTotalMeter,
  onExpandTypeMeter,
  onAdvanceLoop,
  onBuyItem,
  onSellItem,
  onCraftRecipe,
  onRefineItem,
  onSalvageItem,
  onBulkSalvageSurplus,
  onExchangeCrest,
  onUnlockOrUpgradeBlessing,
  onToggleBlessing,
  onExpandBlessingSlot,
  onHireOrUpgradeAlly,
  onBulkTrainAlly,
  onAwakenAlly,
  onUpgradeAllyGear,
  onToggleAlly,
  onMovePartyMember,
  onTrainHero,
  onBulkTrainHero,
  onUnlockSkill,
  onUpgradeSpMastery,
  onResetSkills,
  onSelectStage,
  onSelectPracticeLoop,
  onChangeEventMode,
  onToggleAutoRepeat,
  onToggleAutoRestock,
  onStartExpedition,
  onOpenSettings,
  onDismissGuide,
  onReopenGuide,
}) => {
  const [itemFilter, setItemFilter] = useState<'ALL' | ItemCategory>('ALL');
  const [compendiumFilter, setCompendiumFilter] = useState<'ALL' | 'ENEMIES' | 'EVENTS' | 'ITEMS'>('ALL');
  const [compendiumOnlyMissing, setCompendiumOnlyMissing] = useState(false);
  const [achCategoryFilter, setAchCategoryFilter] = useState<'ALL' | 'CHALLENGE' | 'COMBAT' | 'BOND' | 'PROGRESSION'>('ALL');
  const [forgeSubTab, setForgeSubTab] = useState<'RECIPES' | 'REFINE' | 'SALVAGE' | 'EXCHANGE'>('RECIPES');
  const [confirmNextLoop, setConfirmNextLoop] = useState(false);
  const [shrineImgErr, setShrineImgErr] = useState(false);
  const [gateImgErr, setGateImgErr] = useState(false);

  const unlocks = useMemo(() => getFeatureUnlocks(save), [save]);
  const tabUnlocked = isTabUnlocked(activeTab, save);
  const unlockDef = FEATURE_UNLOCKS[activeTab];
  const nextUnlockHint = useMemo(() => getNextUnlockHint(save), [save]);
  const reincarnateReady = useMemo(() => canReincarnate(save), [save]);
  const endlessUnlocked = useMemo(() => isEndlessUnlocked(save), [save]);
  const loreUnlocked = save.loopCount >= 2 || (save.highestClearedLoop ?? 0) >= 1;
  const presets = useMemo(() => save.presets ?? createDefaultPresets(), [save.presets]);
  const activeSynergies = useMemo(() => getActiveSynergies(save), [save]);
  const showLoop1Guide =
    tabUnlocked &&
    save.loopCount === 1 &&
    !(save.seenGuides ?? []).includes(activeTab);

  const partyPower = useMemo(() => computePartyPower(save), [save]);
  const compStats = useMemo(() => getCompendiumStats(save), [save]);
  const compBonus = useMemo(() => getCompendiumBonuses(save), [save]);
  const achBonus = useMemo(() => getAchievementBonuses(save), [save]);
  const allAchUnlocked = useMemo(() => areAllAchievementsUnlocked(save), [save]);
  const skillBonus = useMemo(
    () => getSkillTreeBonuses(save.unlockedSkills, save.spMasteryLevel),
    [save.unlockedSkills, save.spMasteryLevel]
  );
  const selectedStage = STAGES.find((s) => s.id === save.selectedStageId) ?? STAGES[0];
  const heroTrainCost = getHeroTrainStepCost(save.heroUpgradeLevel);
  const heroMilestoneSteps = getNextHeroMilestoneSteps(save.heroUpgradeLevel);
  const heroBulkCost = getHeroTrainBulkCost(save.heroUpgradeLevel, heroMilestoneSteps);
  const heroTargetLv = save.heroUpgradeLevel + heroMilestoneSteps;
  const maxStageForLoop = getMaxStageForLoop(save.loopCount);
  const effectiveDive = getEffectiveDiveLoop(save);
  const loopStatMult = getLoopEnemyStatMult(effectiveDive.loop);
  const endlessStatMult = getLoopEnemyStatMult(ENDLESS_BENCHMARK_LOOP);
  const loopRewardMult = getLoopRewardMult(save.loopCount);

  const hasAutoEquipConv = hasConvenience(save, 'conv_auto_equip');
  const hasAutoEventConv = hasConvenience(save, 'conv_auto_event');
  const hasAutoRepeatConv = hasConvenience(save, 'conv_auto_repeat');
  const hasBulkOpsConv = hasConvenience(save, 'conv_bulk_ops');

  // Count how many of each itemId are currently placed in pouch
  const pouchCounts = useMemo(() => {
    const map: Record<string, number> = {};
    save.pouch.forEach((id) => {
      if (id) map[id] = (map[id] ?? 0) + 1;
    });
    return map;
  }, [save.pouch]);

  const surplusCommonStats = useMemo(() => {
    let totalCount = 0;
    let totalGold = 0;
    Object.entries(save.inventory).forEach(([id, qty]) => {
      const it = ITEMS[id];
      if (!it || it.rarity !== 'COMMON' || it.isUltimate) return;
      const inPouch = pouchCounts[id] ?? 0;
      const available = qty - inPouch;
      const sellable = Math.max(0, available - 2);
      if (sellable > 0) {
        totalCount += sellable;
        totalGold += sellable * it.sellPrice;
      }
    });
    return { totalCount, totalGold };
  }, [save.inventory, pouchCounts]);

  const surplusSalvageStats = useMemo(() => {
    let totalCount = 0;
    let gold = 0;
    let iron = 0;
    let stone = 0;
    let scroll = 0;
    Object.entries(save.inventory).forEach(([id, qty]) => {
      const it = ITEMS[id];
      if (!it || it.isUltimate) return;
      const inPouch = pouchCounts[id] ?? 0;
      const salvageable = Math.max(0, qty - inPouch - 2);
      if (salvageable <= 0) return;
      const reward = getItemSalvageReward(id);
      totalCount += salvageable;
      gold += reward.gold * salvageable;
      iron += reward.materials.iron_ore * salvageable;
      stone += reward.materials.magic_stone * salvageable;
      scroll += reward.materials.ancient_scroll * salvageable;
    });
    return { totalCount, gold, iron, stone, scroll };
  }, [save.inventory, pouchCounts]);

  const quickRestockStats = useMemo(() => {
    let remainingGold = save.gold;
    let totalItems = 0;
    let totalCost = 0;
    const candidates = Object.values(ITEMS)
      .filter((it) => isItemUnlockedInShop(it, save.cycleClears))
      .sort((a, b) => a.price - b.price);
    for (const item of candidates) {
      const maxStock = getShopMaxStock(item, save.cycleClears);
      const bought = save.shopBoughtThisCycle[item.id] ?? 0;
      const stockLeft = Math.max(0, maxStock - bought);
      for (let i = 0; i < stockLeft; i++) {
        if (remainingGold >= item.price) {
          remainingGold -= item.price;
          totalItems += 1;
          totalCost += item.price;
        } else {
          break;
        }
      }
    }
    return { totalItems, totalCost };
  }, [save.gold, save.cycleClears, save.shopBoughtThisCycle]);

  const filledCount = save.pouch.filter(Boolean).length;
  const meterUsage = useMemo(() => getPouchMeterUsage(save.pouch), [save.pouch]);
  const effectiveTotalCap = getEffectiveTotalMeterCap(save);
  const maxTypeCeiling = getMaxTypeMeterCeiling(save.loopCount);
  const maxTotalCeiling = getMaxTotalMeterCeiling(save.loopCount);
  const totalExpandCost = getTotalMeterExpandCost(save.totalMeterCap);
  const canExpandTotal =
    save.totalMeterCap < maxTotalCeiling &&
    save.gold >= totalExpandCost.gold &&
    save.clearCrests >= totalExpandCost.crests &&
    save.materials.magic_stone >= totalExpandCost.magicStone;

  const ownedItemEntries = useMemo(() => {
    return Object.entries(save.inventory)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => ({ item: ITEMS[id], qty }))
      .filter((entry) => !!entry.item)
      .filter((entry) => itemFilter === 'ALL' || entry.item.category === itemFilter);
  }, [save.inventory, itemFilter]);

  const unlockedShopCount = useMemo(
    () => Object.values(ITEMS).filter((it) => isItemUnlockedInShop(it, save.cycleClears)).length,
    [save.cycleClears]
  );
  const totalShopCatalogCount = Object.values(ITEMS).filter((it) => !it.isUltimate).length;

  const shopItems = useMemo(() => {
    return Object.values(ITEMS)
      .filter((it) => isItemUnlockedInShop(it, save.cycleClears))
      .filter((it) => itemFilter === 'ALL' || it.category === itemFilter);
  }, [save.cycleClears, itemFilter]);

  return (
    <div className="max-w-[1320px] mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* LEFT MAIN WORKSPACE (8 cols) */}
      <div className="lg:col-span-8 space-y-5">
        {/* Resource Strip */}
        <section className="pixel-panel px-5 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-5 sm:gap-6">
            <div>
              <div className="text-xs text-slate-400">所持ゴールド</div>
              <div className="font-num text-lg font-bold text-amber-300">
                {save.gold.toLocaleString()} G
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">踏破の証</div>
              <div className="font-num text-lg font-bold text-emerald-300">
                {save.clearCrests}
              </div>
            </div>
            <div className="h-7 w-px bg-[#2b3040] hidden sm:block" />
            <div className="flex flex-wrap items-center gap-4 sm:gap-5">
              {(['iron_ore', 'magic_stone', 'ancient_scroll'] as const).map((matKey) => (
                <div key={matKey} className="flex items-center gap-2">
                  <PixelSprite id={MATERIAL_INFO[matKey].spriteId} size={22} />
                  <div>
                    <div className="text-[11px] text-slate-400 leading-tight">
                      {MATERIAL_INFO[matKey].name}
                    </div>
                    <div className="font-num text-sm font-bold text-slate-100">
                      {save.materials[matKey]}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs text-slate-300 font-num">
              第{save.loopCount}周 · 出撃 {save.totalRuns}回 · 踏破 {save.totalClears}回
            </div>
            <button
              type="button"
              onClick={onOpenSettings}
              className="px-3 py-1.5 text-xs font-medium bg-[#252a38] hover:bg-[#31384a] text-slate-200 border border-[#3a4156] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              設定・セーブ管理
            </button>
          </div>
        </section>

        {/* Loop 1 Next Unlock Goal Banner */}
        {save.loopCount === 1 && nextUnlockHint && (
          <section className="bg-[#151a25] border border-amber-500/40 px-4 py-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs text-amber-200">
              <Compass className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{nextUnlockHint}</span>
            </div>
            {tabUnlocked && !showLoop1Guide && (
              <button
                type="button"
                onClick={() => onReopenGuide(activeTab)}
                className="inline-flex items-center gap-1 text-[11px] text-sky-300 hover:text-sky-200 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>使い方</span>
              </button>
            )}
          </section>
        )}

        {/* Prominent Reincarnation Banner when current loop's unlocked stages are all cleared */}
        {reincarnateReady && (
          <section className="bg-[#18162a] border-2 border-amber-400/80 px-4 py-3.5 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-bold text-amber-300">
                <RotateCcw className="w-4 h-4 shrink-0" />
                <span>
                  {save.loopCount === 1
                    ? `魔王討伐達成！第${save.loopCount + 1}周目への「転生」が可能になりました`
                    : `第${save.loopCount}周目の解放済みステージ全踏破！第${save.loopCount + 1}周目へ転生できます`}
                </span>
              </div>
              {!confirmNextLoop ? (
                <button
                  type="button"
                  onClick={() => setConfirmNextLoop(true)}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  転生する（第{save.loopCount + 1}周目へ）
                </button>
              ) : (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setConfirmNextLoop(false)}
                    className="px-3 py-1.5 bg-[#252a38] hover:bg-[#31384a] text-slate-200 text-xs font-medium cursor-pointer whitespace-nowrap"
                  >
                    キャンセル
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmNextLoop(false);
                      onAdvanceLoop();
                    }}
                    className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer whitespace-nowrap"
                  >
                    リセットして転生
                  </button>
                </div>
              )}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              未開放の【裏】ステージが残っていても転生可能です。図鑑・達成ボーナス・踏破の証(+2)を引き継ぎ、初期SP <span className="font-num text-amber-300 font-bold">{(save.loopCount + 1) * 2}SP</span> で開始（敵能力 <span className="font-num text-rose-300">{getLoopEnemyStatMult(save.loopCount + 1)}倍</span>）。
              {save.loopCount + 1 <= 4
                ? ` 新たな裏ステージ「ステージ${maxStageForLoop + 1}」も開放されます！`
                : save.loopCount === 5
                  ? ' 第5周目制覇報酬「【無限】終わらぬ深淵回廊」も開放されます！'
                  : ' 全ての裏ステージへさらに強敵化して挑めます！'}
            </p>
          </section>
        )}

        {/* Loop 1 Light Guide Card (when unlocked and not yet dismissed) */}
        {showLoop1Guide && (
          <section className="bg-[#141d2b] border-2 border-sky-500/60 px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 text-xs font-bold text-sky-300">
                <HelpCircle className="w-4 h-4 shrink-0" />
                <span>1周目ガイド · {unlockDef.guideTitle}</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {unlockDef.guideBody}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onDismissGuide(activeTab)}
              className="px-3.5 py-1.5 text-xs font-bold bg-sky-500 hover:bg-sky-400 text-slate-950 transition-colors whitespace-nowrap shrink-0 self-start sm:self-center cursor-pointer"
            >
              わかった（閉じる）
            </button>
          </section>
        )}

        {/* Locked Facility Preview Card */}
        {!tabUnlocked && (
          <section className="pixel-panel p-6 sm:p-10 text-center space-y-4">
            <div className="w-14 h-14 mx-auto bg-[#12151d] border-2 border-[#31384b] flex items-center justify-center">
              <Lock className="w-7 h-7 text-amber-300" />
            </div>
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-amber-300">
                錠前がかかっています
              </div>
              <h2 className="font-pixel text-2xl text-slate-100">
                {unlockDef.label}
              </h2>
              <p className="text-sm text-sky-300 font-medium">
                {unlockDef.requiredStageName} を踏破すると錠前が解除されます
              </p>
            </div>
            <p className="max-w-md mx-auto text-xs text-slate-300 leading-relaxed bg-[#12151d] border border-[#2b3040] p-3.5">
              {unlockDef.lockDescription}
            </p>
            <button
              type="button"
              onClick={() => onSelectTab('PREP')}
              className="px-5 py-2.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors cursor-pointer"
            >
              持ち込み準備へ戻る
            </button>
          </section>
        )}

        {/* TAB 1: PREP / WAREHOUSE */}
        {tabUnlocked && activeTab === 'PREP' && (
          <section className="pixel-panel p-5 space-y-4">
            <div className="space-y-3 border-b border-[#2b3040] pb-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-pixel text-xl text-slate-100">
                    倉庫と持ち込み準備
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    レアリティごとにメーター負荷が決まります（COMMON: 1 · RARE: 2 · EPIC: 3）。全体メーターとタイプ別上限の中で最大5つまで持ち込めます。
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onSelectTab('SKILLS')}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold border bg-[#1a1f2c] hover:bg-[#242a3b] border-amber-500/50 text-amber-300 transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>便利スキル（スキルツリー）</span>
                    {save.skillPoints > 0 && (
                      <span className="font-num px-1.5 py-0.5 bg-amber-400 text-slate-950 text-[10px]">
                        残{save.skillPoints}SP
                      </span>
                    )}
                  </button>
                  {hasAutoEquipConv && (
                    <button
                      type="button"
                      onClick={onClearPouch}
                      disabled={filledCount === 0}
                      className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium bg-[#252a38] hover:bg-[#31384a] text-slate-200 border border-[#3a4156] disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>全解除</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (!hasAutoEquipConv) {
                        onSelectTab('SKILLS');
                      }
                      onAutoFillPouch();
                    }}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                      hasAutoEquipConv
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                        : 'bg-[#222736] hover:bg-[#2a3144] text-slate-300 border border-[#384056]'
                    }`}
                  >
                    {!hasAutoEquipConv && <Lock className="w-3.5 h-3.5 text-amber-300" />}
                    <span>
                      {hasAutoEquipConv
                        ? `オート装備（${AUTO_EQUIP_STYLE_META[save.autoEquipStyle ?? 'OFFENSE'].label}）`
                        : 'オート装備（スキルで解放）'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Playstyle Switch for Auto-Equip */}
              <div className="bg-[#12151d] border border-[#2b3040] p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                    <span>オート装備のプレイスタイル設定</span>
                    {!hasAutoEquipConv && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-amber-300 font-normal">
                        <Lock className="w-3 h-3" />
                        「スマート編成」解放で有効
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {AUTO_EQUIP_STYLE_META[save.autoEquipStyle ?? 'OFFENSE'].description}
                  </div>
                </div>
                <div
                  className="grid grid-cols-3 gap-1 bg-[#0b0d12] border border-[#252a38] p-1 shrink-0"
                  role="group"
                  aria-label="オート装備のプレイスタイル"
                >
                  {(['OFFENSE', 'DEFENSE', 'CONSUMABLES'] as const).map((style) => {
                    const active = (save.autoEquipStyle ?? 'OFFENSE') === style;
                    const activeClass =
                      style === 'OFFENSE'
                        ? 'bg-rose-500 text-slate-950'
                        : style === 'DEFENSE'
                          ? 'bg-sky-500 text-slate-950'
                          : 'bg-emerald-500 text-slate-950';
                    return (
                      <button
                        key={style}
                        type="button"
                        onClick={() => onChangeAutoEquipStyle(style)}
                        className={`px-2.5 py-1.5 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          active ? activeClass : 'text-slate-400 hover:text-white'
                        } ${!hasAutoEquipConv ? 'opacity-65' : ''}`}
                      >
                        {AUTO_EQUIP_STYLE_META[style].label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Loadout Presets (Loop 3 Reward) */}
              <div className="bg-[#12151d] border border-[#2b3040] p-3 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-100">
                    <span>マイセット（編成プリセット 4枠）</span>
                    <span className="text-[10px] font-num px-1.5 py-0.5 bg-[#1b2030] border border-[#323a52] text-sky-300">
                      3周目報酬
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {save.loopCount >= 3
                      ? '装備・仲間・隊列・加護・方針をワンタッチ保存＆呼出'
                      : `第3周目到達で解放（現在 第${save.loopCount}周目）`}
                  </span>
                </div>

                {save.loopCount < 3 ? (
                  <div className="bg-[#0e1118] border border-dashed border-[#2c3345] px-3 py-2.5 flex items-center gap-2 text-xs text-slate-400">
                    <Lock className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    <span>
                      第3周目に到達すると、最大4パターンの装備・仲間・加護プリセットを保存＆ワンクリック切替できるようになります。
                    </span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {presets.map((preset, idx) => {
                      const itemCount = preset.pouch.filter(Boolean).length;
                      return (
                        <div
                          key={preset.id}
                          className="bg-[#171b26] border border-[#2e3446] p-2.5 space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <input
                              type="text"
                              value={preset.name}
                              onChange={(e) => onRenamePreset(idx, e.target.value)}
                              maxLength={24}
                              aria-label={`プリセット${idx + 1}の名前`}
                              className="min-w-0 flex-1 bg-[#0e1118] border border-[#2b3040] focus:border-amber-400 outline-none px-2 py-1 text-xs font-bold text-slate-100"
                            />
                            <span
                              className={`text-[10px] font-num shrink-0 ${
                                preset.saved ? 'text-emerald-300' : 'text-slate-500'
                              }`}
                            >
                              {preset.saved ? '保存済' : '未保存'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-num text-slate-400 truncate">
                              {preset.saved
                                ? `袋${itemCount} · 仲間${preset.activeAllies.length} · 加護${preset.activeBlessings.length}`
                                : '現在の編成を保存できます'}
                            </span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => onSavePreset(idx, preset.name)}
                                className="px-2.5 py-1 text-[11px] font-bold bg-[#252a38] hover:bg-[#31384a] text-amber-300 border border-[#3a4156] cursor-pointer whitespace-nowrap"
                              >
                                保存
                              </button>
                              <button
                                type="button"
                                disabled={!preset.saved}
                                onClick={() => onLoadPreset(idx)}
                                className="px-2.5 py-1 text-[11px] font-bold bg-sky-500 hover:bg-sky-400 text-slate-950 disabled:bg-[#222736] disabled:text-slate-500 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                              >
                                呼出
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Loadout Capacity Meters & Expansion */}
            <div className="pixel-slot p-4 space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-slate-100">
                    全体キャパシティメーター{' '}
                    <span className="font-num text-amber-300 ml-1">
                      {meterUsage.total} / {effectiveTotalCap}
                    </span>
                    <span className="font-num text-[11px] text-slate-400 ml-2">
                      (基礎天井 {maxTotalCeiling}{skillBonus.extraMeterCap > 0 ? ` · スキル+${skillBonus.extraMeterCap}` : ''})
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {unlocks.meterExpand
                      ? 'ステージ踏破で手に入る「踏破の証」とゴールドで各上限を開放できます。'
                      : '上限の拡張はステージ1を踏破すると開放されます。まずは現在の枠内で5つのアイテムを運びましょう。'}
                  </div>
                </div>
                {!unlocks.meterExpand ? (
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 font-num bg-[#12151d] border border-[#2b3040] px-2.5 py-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                    ステージ1踏破で上限開放
                  </span>
                ) : save.totalMeterCap < maxTotalCeiling ? (
                  <button
                    type="button"
                    onClick={onExpandTotalMeter}
                    disabled={!canExpandTotal}
                    className="px-3 py-1.5 text-xs font-bold bg-[#252a38] hover:bg-[#31384a] text-emerald-300 border border-[#3a4156] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                  >
                    全体上限 +1 ({totalExpandCost.gold}G · 証{totalExpandCost.crests}
                    {totalExpandCost.magicStone > 0 ? ` · 魔石${totalExpandCost.magicStone}` : ''})
                  </button>
                ) : (
                  <span className="text-[11px] text-amber-300 font-num">
                    今周回の全体上限MAX（次の周回で天井解放）
                  </span>
                )}
              </div>

              <div className="h-3 bg-[#0e1118] border border-[#2b3040] flex overflow-hidden">
                {Array.from({ length: effectiveTotalCap }).map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 border-r border-[#12151d] last:border-r-0 ${
                      i < meterUsage.total ? 'bg-amber-400' : 'bg-transparent'
                    }`}
                  />
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
                {(['WEAPON', 'ARMOR', 'CONSUMABLE', 'RELIC'] as const).map((cat) => {
                  const used = meterUsage.byCategory[cat];
                  const baseCap = save.typeMeterCaps[cat];
                  const cap = getEffectiveTypeMeterCap(save, cat);
                  const cost = getTypeMeterExpandCost(cat, baseCap);
                  const atMax = baseCap >= maxTypeCeiling;
                  const canExpand =
                    !atMax &&
                    save.gold >= cost.gold &&
                    save.clearCrests >= cost.crests &&
                    save.materials.magic_stone >= cost.magicStone;

                  return (
                    <div
                      key={cat}
                      className="bg-[#12151d] border border-[#2b3040] p-2.5 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-200">{CATEGORY_SHORT[cat]}枠</span>
                        <span className="font-num text-slate-200">
                          {used} / {cap}
                          <span className="text-[10px] text-slate-500 ml-1">
                            (天井{maxTypeCeiling}{skillBonus.extraTypeMeterCap > 0 ? `+${skillBonus.extraTypeMeterCap}` : ''})
                          </span>
                        </span>
                      </div>
                      <div className="h-2 bg-[#0b0d12] border border-[#252a38] flex overflow-hidden">
                        {Array.from({ length: cap }).map((_, idx) => (
                          <div
                            key={idx}
                            className={`flex-1 border-r border-[#12151d] last:border-r-0 ${
                              idx < used ? CATEGORY_BAR_COLOR[cat] : 'bg-transparent'
                            }`}
                          />
                        ))}
                      </div>
                      {!unlocks.meterExpand ? (
                        <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 py-1 font-num">
                          <Lock className="w-3 h-3" />
                          <span>ステージ1で開放</span>
                        </div>
                      ) : !atMax ? (
                        <button
                          type="button"
                          onClick={() => onExpandTypeMeter(cat)}
                          disabled={!canExpand}
                          className="w-full py-1 px-2 text-[11px] font-medium bg-[#1e2330] hover:bg-[#2a3144] text-sky-300 border border-[#323a50] disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                        >
                          開放+1 ({cost.gold}G·証{cost.crests}
                          {cost.magicStone > 0 ? `·石${cost.magicStone}` : ''})
                        </button>
                      ) : (
                        <div className="text-center text-[10px] text-amber-300 py-1 font-num">
                          今周回上限
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Category filter + Surplus COMMON bulk sell */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                {(['ALL', 'WEAPON', 'ARMOR', 'CONSUMABLE', 'RELIC'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setItemFilter(cat)}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      itemFilter === cat
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-[#12151d] text-slate-300 hover:text-white border border-[#2b3040]'
                    }`}
                  >
                    {CATEGORY_LABELS[cat]}
                  </button>
                ))}
              </div>
              {hasBulkOpsConv ? (
                <button
                  type="button"
                  onClick={onSellSurplusCommons}
                  disabled={surplusCommonStats.totalCount === 0}
                  title="各COMMONアイテムを倉庫に2個＋装備分だけ残して余剰分をまとめて売却します"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#252a38] hover:bg-[#31384a] text-amber-300 border border-[#3a4156] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>
                    {surplusCommonStats.totalCount > 0
                      ? `余剰COMMON一括売却 (${surplusCommonStats.totalCount}個 · +${surplusCommonStats.totalGold}G)`
                      : '余剰COMMONなし (各2個保持)'}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onSelectTab('SKILLS')}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] bg-[#12151d] text-slate-400 hover:text-amber-300 border border-[#2b3040] cursor-pointer whitespace-nowrap"
                >
                  <Lock className="w-3 h-3" />
                  <span>余剰一括売却 (スキルで解放)</span>
                </button>
              )}
            </div>

            {ownedItemEntries.length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-400 border border-dashed border-[#2b3040]">
                該当するアイテムを所持していません。「道具屋」で購入するか、ダンジョンで手に入れよう。
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ownedItemEntries.map(({ item, qty }) => {
                  const usedInPouch = pouchCounts[item.id] ?? 0;
                  const available = qty - usedInPouch;
                  const refineLv = (save.itemRefineLevels ?? {})[item.id] ?? 0;
                  const pouchFull = filledCount >= MAX_POUCH_SLOTS;
                  const meterCost = getItemMeterCost(item.id);
                  const typeOverCap =
                    meterUsage.byCategory[item.category] + meterCost >
                    getEffectiveTypeMeterCap(save, item.category);
                  const totalOverCap = meterUsage.total + meterCost > effectiveTotalCap;
                  const blocked = available <= 0 || pouchFull || typeOverCap || totalOverCap;

                  let buttonLabel = '持ち込む';
                  if (available <= 0) buttonLabel = 'すべて装備中';
                  else if (pouchFull) buttonLabel = '袋が満杯 (5/5)';
                  else if (typeOverCap) buttonLabel = `${CATEGORY_SHORT[item.category]}上限不足`;
                  else if (totalOverCap) buttonLabel = '全体メーター不足';

                  return (
                    <div
                      key={item.id}
                      className="pixel-slot p-3.5 flex flex-col justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 bg-[#1b1f2b] border border-[#2e3446] flex items-center justify-center shrink-0">
                          <PixelSprite id={item.spriteId} size={32} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`font-bold text-sm truncate ${RARITY_COLOR[item.rarity]}`}>
                              {item.name}
                              {refineLv > 0 && (
                                <span className="ml-1 font-num text-xs text-emerald-300">
                                  +{refineLv}
                                </span>
                              )}
                            </span>
                            <span className="font-num text-xs text-slate-300 shrink-0">
                              所持 {qty}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5 font-num">
                            {CATEGORY_SHORT[item.category]} · {item.rarity} · 負荷 {meterCost} · 装備 {usedInPouch}
                          </div>
                          <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                            {item.description}
                          </p>
                          <div className="text-[11px] text-amber-300/90 font-num mt-1">
                            {formatItemStats(item.id, save.itemRefineLevels)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#232836]">
                        <button
                          type="button"
                          onClick={() => onSellItem(item.id)}
                          disabled={available <= 0}
                          className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                        >
                          売却 (+{item.sellPrice}G)
                        </button>
                        <button
                          type="button"
                          onClick={() => onEquipToPouch(item.id)}
                          disabled={blocked}
                          className="px-3.5 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 disabled:bg-[#262b38] disabled:text-slate-500 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
                        >
                          {buttonLabel}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* TAB 2: SHOP */}
        {tabUnlocked && activeTab === 'SHOP' && (
          <section className="pixel-panel p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2b3040] pb-3.5">
              <div>
                <h2 className="font-pixel text-xl text-slate-100">道具屋</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  ステージをクリアするたびに買える商品が増え、各アイテムの購入上限（在庫）も増加します。帰還すると在庫が再入荷します。
                </p>
              </div>
              <div className="text-right text-xs font-num text-amber-300 shrink-0">
                <div>品揃え {unlockedShopCount} / {totalShopCatalogCount} 種</div>
                <div className="text-[11px] text-slate-400">
                  今周回クリア {save.cycleClears}回 · 在庫ボーナス +{save.cycleClears}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                {(['ALL', 'WEAPON', 'ARMOR', 'CONSUMABLE', 'RELIC'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setItemFilter(cat)}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      itemFilter === cat
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-[#12151d] text-slate-300 hover:text-white border border-[#2b3040]'
                    }`}
                  >
                    {CATEGORY_LABELS[cat]}
                  </button>
                ))}
              </div>
              {hasBulkOpsConv ? (
                <button
                  type="button"
                  onClick={onQuickRestockConsumables}
                  disabled={quickRestockStats.totalItems === 0}
                  title="道具屋で解放済みの全アイテムを在庫上限まで安い順にまとめて購入します"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#1c2824] hover:bg-[#243630] text-emerald-300 border border-emerald-500/45 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>
                    {quickRestockStats.totalItems > 0
                      ? `全アイテムまとめて購入 (+${quickRestockStats.totalItems}個 · ${quickRestockStats.totalCost}G)`
                      : '購入可能な在庫なし'}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onSelectTab('SKILLS')}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] bg-[#12151d] text-slate-400 hover:text-amber-300 border border-[#2b3040] cursor-pointer whitespace-nowrap"
                >
                  <Lock className="w-3 h-3" />
                  <span>全アイテムまとめ購入 (スキルで解放)</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {shopItems.map((item) => {
                const owned = save.inventory[item.id] ?? 0;
                const maxStock = getShopMaxStock(item, save.cycleClears);
                const bought = save.shopBoughtThisCycle[item.id] ?? 0;
                const remainingStock = Math.max(0, maxStock - bought);
                const canAfford = save.gold >= item.price && remainingStock > 0;

                return (
                  <div
                    key={item.id}
                    className="pixel-slot p-3.5 flex flex-col justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 bg-[#1b1f2b] border border-[#2e3446] flex items-center justify-center shrink-0">
                        <PixelSprite id={item.spriteId} size={32} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`font-bold text-sm truncate ${RARITY_COLOR[item.rarity]}`}>
                            {item.name}
                          </span>
                          <span className="font-num text-xs text-slate-400 shrink-0">
                            所持 {owned}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 font-num">
                          {CATEGORY_SHORT[item.category]} · {item.rarity} · 負荷 {getItemMeterCost(item.id)} ·{' '}
                          <span className={remainingStock > 0 ? 'text-sky-300' : 'text-rose-400'}>
                            在庫 {remainingStock}/{maxStock}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                          {item.description}
                        </p>
                        <div className="text-[11px] text-amber-300/90 font-num mt-1">
                          {formatItemStats(item.id)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#232836]">
                      <span className="font-num text-sm font-bold text-amber-300">
                        {item.price} G
                      </span>
                      <button
                        type="button"
                        onClick={() => onBuyItem(item.id)}
                        disabled={!canAfford}
                        className="px-4 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 disabled:bg-[#262b38] disabled:text-slate-500 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
                      >
                        {remainingStock <= 0 ? '売切（帰還で補充）' : '購入する'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* TAB 3: SHRINE (BLESSINGS) */}
        {tabUnlocked && activeTab === 'SHRINE' && (
          <section className="pixel-panel p-5 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center border-b border-[#2b3040] pb-4">
              <div className="md:col-span-5 overflow-hidden border border-[#2e3446] bg-[#12151d] aspect-[4/3]">
                {!shrineImgErr ? (
                  <img
                    src={shrineAltarImg}
                    alt="加護の祭壇"
                    referrerPolicy="no-referrer"
                    onError={() => setShrineImgErr(true)}
                    className="w-full h-full object-cover pixelated"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-[#161a24] text-amber-300">
                    <PixelSprite id="bless_gold" size={48} />
                    <span className="font-pixel text-sm">加護の祭壇</span>
                  </div>
                )}
              </div>
              <div className="md:col-span-7 space-y-2.5">
                <h2 className="font-pixel text-xl text-slate-100">加護の祭壇</h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  ダンジョンで手に入れた「魔石」とゴールドを捧げて神聖な加護を解放・強化できます。
                  同時に <span className="font-num text-amber-300 font-bold">{save.maxBlessingSlots}</span> 個の加護を発動して迷宮へ挑めます。
                </p>
                {save.maxBlessingSlots < 3 && (
                  <button
                    type="button"
                    onClick={onExpandBlessingSlot}
                    disabled={save.gold < 240 || save.materials.magic_stone < 3}
                    className="px-3.5 py-2 text-xs font-bold bg-[#252a38] hover:bg-[#31384a] text-sky-300 border border-[#3a4156] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    加護枠を3つに拡張 (240G · 魔石3)
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {BLESSINGS.map((b) => {
                const lv = save.unlockedBlessings[b.id] ?? 0;
                const isActive = save.activeBlessings.includes(b.id);
                const isMax = lv >= b.maxLevel;
                const nextGold = lv === 0 ? b.unlockCostGold : b.upgradeBaseGold * lv;
                const nextStones = lv === 0 ? b.unlockCostStones : b.upgradeBaseStones + (lv - 1);
                const canAfford = save.gold >= nextGold && save.materials.magic_stone >= nextStones;

                return (
                  <div
                    key={b.id}
                    className={`pixel-slot p-3.5 flex flex-col justify-between gap-3 ${
                      isActive ? 'border-amber-500/80 bg-[#1b1d28]' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 bg-[#1b1f2b] border border-[#2e3446] flex items-center justify-center shrink-0">
                        <PixelSprite id={b.spriteId} size={32} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-sm text-slate-100">{b.name}</span>
                          <span className="font-num text-xs text-amber-300">
                            {lv === 0 ? '未解放' : `Lv.${lv}/${b.maxLevel}`}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {b.title} {isActive ? '· 発動中' : ''}
                        </div>
                        <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                          {b.descriptionPerLevel(Math.max(1, lv))}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#232836]">
                      {!isMax ? (
                        <button
                          type="button"
                          onClick={() => onUnlockOrUpgradeBlessing(b.id)}
                          disabled={!canAfford}
                          className="px-3 py-1.5 text-xs font-medium bg-[#252a38] hover:bg-[#31384a] text-sky-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                        >
                          {lv === 0 ? '解放' : '強化'} ({nextGold}G · 魔石{nextStones})
                        </button>
                      ) : (
                        <span className="text-xs text-emerald-400 font-medium">最大レベル</span>
                      )}

                      {lv > 0 && (
                        <button
                          type="button"
                          onClick={() => onToggleBlessing(b.id)}
                          className={`px-3.5 py-1.5 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                            isActive
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                              : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                          }`}
                        >
                          {isActive ? '外す' : '加護を宿す'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* TAB 4: TAVERN (ALLIES & FORMATION) */}
        {tabUnlocked && activeTab === 'TAVERN' && (
          <section className="pixel-panel p-5 space-y-5">
            <div className="border-b border-[#2b3040] pb-3.5 space-y-2.5">
              <div>
                <h2 className="font-pixel text-xl text-slate-100">冒険者の酒場（仲間強化・武具鍛錬・隊列）</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  仲間を最大 <span className="font-num text-amber-300 font-bold">2</span> 人まで同行させ、レベル訓練・特技覚醒・<span className="text-violet-300 font-bold">専属武具鍛錬</span>で大幅に強化できます。前衛ほど攻撃を受けやすくなります。
                </p>
              </div>
              <div className="bg-[#12151d] border border-[#2b3040] px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <span className="text-slate-300">
                  <span className="text-amber-300 font-bold">共闘システム:</span>{' '}
                  仲間と戦うと「連携奥義ゲージ」が溜まり、満タンで全員の合体強撃＋全体12%回復が自動発動！
                </span>
                <span className="font-num text-violet-300 font-bold">
                  スキル＆実績 仲間補正: 能力+{skillBonus.allyPowerPct + achBonus.allyPowerPct}% · 速度+{skillBonus.allySpdPct + achBonus.allySpdPct}% · HP+{skillBonus.allyHpPct + achBonus.allyHpPct}%
                </span>
              </div>
            </div>

            {/* Interactive Formation Editor */}
            <div className="pixel-slot p-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200">パーティ隊列（左が後衛 · 右が前衛）</span>
                <span className="text-[11px] text-slate-400">矢印ボタンで前後を自由に入れ替え可能</span>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2.5">
                {[...save.partyOrder].reverse().map((memberId) => {
                  const orderIdx = save.partyOrder.indexOf(memberId);
                  const isHero = memberId === 'hero';
                  const ally = !isHero ? ALLIES.find((a) => a.id === memberId) : null;
                  if (!isHero && !ally) return null;
                  const label =
                    orderIdx === 0
                      ? '前衛'
                      : save.partyOrder.length === 2 || orderIdx === 2
                        ? '後衛'
                        : '中衛';

                  return (
                    <div
                      key={memberId}
                      className="flex-1 min-w-[145px] bg-[#181b24] border border-[#2e3446] p-2.5 flex flex-col items-center gap-2"
                    >
                      <div className="text-[11px] font-bold text-amber-300">{label}</div>
                      <PixelSprite id={isHero ? 'hero' : ally!.spriteId} size={32} />
                      <div className="text-xs font-bold text-slate-100 truncate max-w-full">
                        {isHero ? '勇者' : ally!.name}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={orderIdx >= save.partyOrder.length - 1}
                          onClick={() => onMovePartyMember(memberId, 'BACKWARD')}
                          className="px-2 py-1 text-[11px] bg-[#252a38] hover:bg-[#31384a] text-slate-200 disabled:opacity-30 cursor-pointer"
                        >
                          ← 後衛へ
                        </button>
                        <button
                          type="button"
                          disabled={orderIdx <= 0}
                          onClick={() => onMovePartyMember(memberId, 'FORWARD')}
                          className="px-2 py-1 text-[11px] bg-[#252a38] hover:bg-[#31384a] text-amber-300 disabled:opacity-30 cursor-pointer"
                        >
                          前衛へ →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ALLIES.map((ally) => {
                const lv = save.hiredAllies[ally.id] ?? 0;
                const rank = save.allyAwakenings[ally.id] ?? 0;
                const gearLv = (save.allyGearLevels ?? {})[ally.id] ?? 0;
                const isActive = save.activeAllies.includes(ally.id);
                const cost = getAllyTrainStepCost(ally, lv);
                const canAfford = save.gold >= cost;

                const awGold = 75 + rank * 75;
                const awIron = 1 + rank;
                const awStone = 1 + rank;
                const awScroll = rank >= 2 ? 1 : 0;
                const canAwaken =
                  lv > 0 &&
                  rank < 3 &&
                  save.gold >= awGold &&
                  save.materials.iron_ore >= awIron &&
                  save.materials.magic_stone >= awStone &&
                  save.materials.ancient_scroll >= awScroll;

                const gearCost = getAllyGearCost(gearLv);
                const canUpgradeGear =
                  lv > 0 &&
                  gearLv < 5 &&
                  save.gold >= gearCost.gold &&
                  save.materials.iron_ore >= gearCost.iron &&
                  save.materials.magic_stone >= gearCost.stone &&
                  save.materials.ancient_scroll >= gearCost.scroll;

                const atkMult =
                  lv > 0
                    ? 1 + (lv - 1) * 0.2 + rank * 0.12 + gearLv * 0.16
                    : 1;
                const hpMult =
                  lv > 0
                    ? 1 + (lv - 1) * 0.2 + rank * 0.12 + gearLv * 0.14
                    : 1;
                const defMult =
                  lv > 0
                    ? 1 + Math.max(0, lv - 1) * 0.16 + rank * 0.12 + gearLv * 0.1
                    : 1;

                return (
                  <div
                    key={ally.id}
                    className={`pixel-slot p-3.5 flex flex-col justify-between gap-3 ${
                      isActive ? 'border-emerald-500/75 bg-[#162022]' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-[#1b1f2b] border border-[#2e3446] flex items-center justify-center shrink-0">
                        <PixelSprite id={ally.spriteId} size={36} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-sm text-slate-100">{ally.name}</span>
                          <span className="font-num text-xs text-amber-300">
                            {lv === 0 ? '未契約' : `Lv.${lv} · ★${rank} · 武具+${gearLv}`}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {ally.roleName} · {ally.passiveBonusText}
                        </div>
                        <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                          {ally.skillDescription}
                        </p>
                        <div className="text-[11px] text-sky-300 font-num mt-1.5">
                          HP {Math.round(ally.baseHp * hpMult)} · 攻撃 {Math.round(ally.baseAtk * atkMult)} · 防御 {Math.round(ally.baseDef * defMult)}
                        </div>
                        {lv > 0 && (
                          <div className="text-[11px] text-emerald-300 mt-1">
                            {ally.awakeningBonusText(rank)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#232836] space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onHireOrUpgradeAlly(ally.id)}
                            disabled={!canAfford}
                            className="px-3 py-1.5 text-xs font-medium bg-[#252a38] hover:bg-[#31384a] text-amber-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                          >
                            {lv === 0 ? `雇う (${cost}G)` : `訓練で強化 (${cost}G)`}
                          </button>
                          {lv > 0 && hasBulkOpsConv && (() => {
                            const bulk5Cost = getAllyTrainBulkCost(ally, lv, 5);
                            return (
                              <button
                                type="button"
                                onClick={() => onBulkTrainAlly(ally.id)}
                                disabled={save.gold < bulk5Cost}
                                className="px-2.5 py-1.5 text-[11px] font-bold bg-[#1e2636] hover:bg-[#2a3449] text-sky-300 border border-sky-500/40 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                              >
                                +5訓練 ({bulk5Cost}G)
                              </button>
                            );
                          })()}
                        </div>

                        {lv > 0 && (
                          <button
                            type="button"
                            onClick={() => onToggleAlly(ally.id)}
                            className={`px-3.5 py-1.5 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                              isActive
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                            }`}
                          >
                            {isActive ? '同行中' : 'パーティへ'}
                          </button>
                        )}
                      </div>

                      {lv > 0 && (
                        <div className="space-y-1.5">
                          {rank < 3 ? (
                            <button
                              type="button"
                              onClick={() => onAwakenAlly(ally.id)}
                              disabled={!canAwaken}
                              className="w-full px-3 py-1.5 text-[11px] font-medium bg-[#1b2232] hover:bg-[#252f44] text-sky-300 border border-[#32405e] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            >
                              特技覚醒 ★{rank}→★{rank + 1} ({awGold}G · 鉄{awIron} · 魔石{awStone}
                              {awScroll > 0 ? ` · 古文書${awScroll}` : ''})
                            </button>
                          ) : (
                            <div className="text-[11px] text-emerald-400 font-medium">
                              特技覚醒 MAX (★3)
                            </div>
                          )}

                          {gearLv < 5 ? (
                            <button
                              type="button"
                              onClick={() => onUpgradeAllyGear(ally.id)}
                              disabled={!canUpgradeGear}
                              className="w-full px-3 py-1.5 text-[11px] font-medium bg-[#1f1930] hover:bg-[#2a2240] text-violet-200 border border-violet-500/45 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            >
                              専属武具鍛錬 +{gearLv}→+{gearLv + 1} ({gearCost.gold}G · 鉄{gearCost.iron} · 魔石{gearCost.stone}
                              {gearCost.scroll > 0 ? ` · 古文書${gearCost.scroll}` : ''})
                            </button>
                          ) : (
                            <div className="text-[11px] text-violet-300 font-medium font-num">
                              専属武具 MAX (+5 · 攻+80% · HP+70% · 防+50% · 速度+20%)
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* TAB 5: SKILL TREE */}
        {tabUnlocked && activeTab === 'SKILLS' && (() => {
          const convSkillIds = new Set(
            SKILL_TREE.filter((n) => n.branch === 'CONVENIENCE').map((n) => n.id)
          );
          const combatUnlockedCount = (save.unlockedSkills ?? []).filter(
            (id) => !convSkillIds.has(id)
          ).length;

          return (
            <section className="pixel-panel p-5 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2b3040] pb-3.5">
                <div>
                  <h2 className="font-pixel text-xl text-slate-100">
                    スキルツリー選択（便利機能＆戦闘強化）
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    勇者の「基礎修行（5Lvごと）」・各ステージの今周回初踏破・転生でSPを獲得できます。「快適・便利の道」は最初から、戦闘4系統はステージ4踏破で習得でき、スキル振り直し・転生でリセットされます。
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-[11px] text-slate-400">所持スキルポイント</div>
                    <div className="font-num text-xl font-bold text-amber-300">
                      {save.skillPoints} SP
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onResetSkills}
                    disabled={
                      (save.unlockedSkills?.length ?? 0) === 0 &&
                      (save.unlockedConveniences?.length ?? 0) === 0 &&
                      (save.spMasteryLevel ?? 0) === 0
                    }
                    className="px-3 py-2 text-xs font-medium bg-[#252a38] hover:bg-[#31384a] text-slate-200 border border-[#3a4156] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                  >
                    スキル振り直し
                  </button>
                </div>
              </div>

              {/* Combat Skill Trees Lock Notice before Stage 4 */}
              {!unlocks.skills && (
                <div className="bg-[#151824] border-2 border-[#31384b] p-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 text-xs text-slate-200">
                    <Lock className="w-4 h-4 text-amber-300 shrink-0" />
                    <span>
                      <span className="text-amber-300 font-bold">「快適・便利の道」</span>は最初から習得できます。
                      <span className="text-sky-300 font-bold">戦闘スキル4系統＆SP極限鍛錬</span>は
                      <span className="text-sky-300 font-bold">ステージ4「氷結の鐘楼」踏破</span>で解放されます。
                    </span>
                  </div>
                </div>
              )}

              {/* Active Skill Bonuses Summary */}
              <div className={`pixel-slot p-3.5 flex flex-wrap items-center justify-between gap-2 text-xs ${!unlocks.skills ? 'opacity-65' : ''}`}>
                <span className="font-bold text-slate-200">現在の戦闘スキル発動効果:</span>
                <span className="font-num text-amber-300">
                  {combatUnlockedCount === 0 && (save.spMasteryLevel ?? 0) === 0
                    ? unlocks.skills
                      ? 'まだ戦闘スキルを習得していません'
                      : 'ステージ4踏破後に習得可能'
                    : [
                        (save.spMasteryLevel ?? 0) > 0
                          ? `極限鍛錬Lv.${save.spMasteryLevel}`
                          : '',
                        skillBonus.atkPct > 0 ? `攻撃+${skillBonus.atkPct}%` : '',
                        skillBonus.defPct > 0 ? `防御+${skillBonus.defPct}%` : '',
                        skillBonus.hpPct > 0 ? `HP+${skillBonus.hpPct}%` : '',
                        skillBonus.spdPct > 0 ? `速度+${skillBonus.spdPct}%` : '',
                        skillBonus.critPct > 0 ? `会心+${skillBonus.critPct}%` : '',
                        skillBonus.critDmgPct > 0 ? `会心ダメ+${skillBonus.critDmgPct}%` : '',
                        skillBonus.lifestealPct > 0 ? `吸血+${skillBonus.lifestealPct}%` : '',
                        skillBonus.allyPowerPct > 0 ? `仲間能力+${skillBonus.allyPowerPct}%` : '',
                        skillBonus.allyHpPct > 0 ? `味方HP+${skillBonus.allyHpPct}%` : '',
                        skillBonus.allyDefPct > 0 ? `味方防御+${skillBonus.allyDefPct}%` : '',
                        skillBonus.allySpdPct > 0 ? `仲間速度+${skillBonus.allySpdPct}%` : '',
                        skillBonus.allyCritPct > 0 ? `味方会心+${skillBonus.allyCritPct}%` : '',
                        skillBonus.allyDmgReductionPct > 0
                          ? `味方被ダメ-${skillBonus.allyDmgReductionPct}%`
                          : '',
                        skillBonus.allyLifestealPct > 0
                          ? `味方吸血+${skillBonus.allyLifestealPct}%`
                          : '',
                        skillBonus.heroStatSharePct > 0
                          ? `威光同調${skillBonus.heroStatSharePct}%`
                          : '',
                        skillBonus.allyOverdrive ? '奥義:魂の共鳴覚醒' : '',
                        skillBonus.dmgReductionPct > 0 ? `被ダメ-${skillBonus.dmgReductionPct}%` : '',
                        skillBonus.roomHeal > 0 ? `部屋回復+${skillBonus.roomHeal}` : '',
                        skillBonus.goldPct > 0 ? `獲得G+${skillBonus.goldPct}%` : '',
                        skillBonus.dropPct > 0 ? `ドロップ+${skillBonus.dropPct}%` : '',
                        skillBonus.consumablePowerPct > 0
                          ? `消耗品+${skillBonus.consumablePowerPct}%`
                          : '',
                        skillBonus.extraMeterCap > 0 ? `全体枠+${skillBonus.extraMeterCap}` : '',
                        skillBonus.extraTypeMeterCap > 0
                          ? `全タイプ枠+${skillBonus.extraTypeMeterCap}`
                          : '',
                        skillBonus.extraCrests > 0 ? `証+${skillBonus.extraCrests}` : '',
                        skillBonus.tripleStrike ? '奥義:2回毎2.2倍斬撃' : '',
                        skillBonus.deathSave ? '奥義:致死復活70%' : '',
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                </span>
              </div>

              {/* Repeatable SP Mastery Sink */}
              <div className={`pixel-slot p-4 border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${!unlocks.skills ? 'opacity-60' : ''}`}>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-pixel text-base text-amber-300">
                      SP極限鍛錬
                    </span>
                    <span className="font-num text-xs font-bold text-emerald-300">
                      現在 Lv.{save.spMasteryLevel ?? 0}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    1 SPで何度でも底上げ可能。1レベルごとに{' '}
                    <span className="text-amber-200 font-num font-bold">
                      勇者 攻・防・HP +12% · 仲間能力 +8% · 獲得ゴールド +8%
                    </span>{' '}
                    が加算されます（振り直しで全SP返却）。
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onUpgradeSpMastery}
                  disabled={!unlocks.skills || save.skillPoints < 1}
                  className="px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 disabled:bg-[#222736] disabled:text-slate-500 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {unlocks.skills ? '鍛錬する (1SP)' : 'ステージ4踏破で解放'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
                {([
                  {
                    branch: 'CONVENIENCE' as SkillTreeBranch,
                    title: '快適・便利の道',
                    subtitle: '倍速・自動化・一括補充（最初から習得可）',
                    accent: 'text-amber-300',
                  },
                  {
                    branch: 'WARRIOR' as SkillTreeBranch,
                    title: '剣聖の道',
                    subtitle: '火力・会心・連撃特化',
                    accent: 'text-rose-300',
                  },
                  {
                    branch: 'GUARDIAN' as SkillTreeBranch,
                    title: '守護と絆の道',
                    subtitle: '耐久・回復・被ダメ軽減',
                    accent: 'text-sky-300',
                  },
                  {
                    branch: 'EXPLORER' as SkillTreeBranch,
                    title: '探求と秘宝の道',
                    subtitle: '財宝・消耗品・枠拡張',
                    accent: 'text-emerald-300',
                  },
                  {
                    branch: 'ALLY' as SkillTreeBranch,
                    title: '絆の指揮道',
                    subtitle: '味方専用・共闘極限強化',
                    accent: 'text-violet-300',
                  },
                ]).map((col) => {
                  const isConvBranch = col.branch === 'CONVENIENCE';
                  const branchUnlocked = isConvBranch || unlocks.skills;
                  const nodes = SKILL_TREE.filter((n) => n.branch === col.branch);
                  const tier1 = nodes.filter((n) => n.tier === 1);
                  const tier2 = nodes.filter((n) => n.tier === 2);
                  const tier3 = nodes.filter((n) => n.tier === 3);
                  const tier4 = nodes.filter((n) => n.tier === 4);

                  const renderNode = (node: (typeof nodes)[number]) => {
                    const unlocked =
                      (save.unlockedSkills ?? []).includes(node.id) ||
                      (isConvBranch && (save.unlockedConveniences ?? []).includes(node.id as never));
                    const exclTaken =
                      !!node.exclusiveWith &&
                      (save.unlockedSkills ?? []).includes(node.exclusiveWith);
                    const reqMet =
                      !node.requiresAny ||
                      node.requiresAny.some((reqId) =>
                        (save.unlockedSkills ?? []).includes(reqId) ||
                        (save.unlockedConveniences ?? []).includes(reqId as never)
                      );
                    const canAfford = save.skillPoints >= node.costSp;
                    const canLearn = branchUnlocked && !unlocked && !exclTaken && reqMet && canAfford;

                    return (
                      <div
                        key={node.id}
                        className={`p-3 border space-y-2 ${
                          unlocked
                            ? 'bg-[#17231e] border-emerald-500/75'
                            : exclTaken
                              ? 'bg-[#11131a] border-[#222634] opacity-45'
                              : 'bg-[#12151d] border-[#2b3040]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-xs font-bold text-slate-100 leading-snug">
                            {node.name}
                          </div>
                          <span className={`font-num text-[11px] shrink-0 ${unlocked ? 'text-emerald-300 font-bold' : 'text-amber-300'}`}>
                            {unlocked ? '習得済' : `${node.costSp}SP`}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          {node.description}
                        </p>
                        {!unlocked && (
                          <button
                            type="button"
                            onClick={() => onUnlockSkill(node.id)}
                            disabled={!canLearn}
                            className="w-full py-1.5 px-2 text-[11px] font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 disabled:bg-[#222736] disabled:text-slate-500 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
                          >
                            {!branchUnlocked
                              ? 'ステージ4踏破で解放'
                              : exclTaken
                                ? '他分岐を選択済'
                                : !reqMet
                                  ? '前提スキル未習得'
                                  : !canAfford
                                    ? `SP不足 (要${node.costSp}SP)`
                                    : `習得する (${node.costSp}SP)`}
                          </button>
                        )}
                      </div>
                    );
                  };

                  return (
                    <div
                      key={col.branch}
                      className={`pixel-slot p-3.5 space-y-3 ${
                        isConvBranch
                          ? 'border-amber-500/50'
                          : !branchUnlocked
                            ? 'opacity-65'
                            : ''
                      }`}
                    >
                      <div className="border-b border-[#232836] pb-2">
                        <div className={`font-pixel text-base ${col.accent}`}>{col.title}</div>
                        <div className="text-[11px] text-slate-400">{col.subtitle}</div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-[10px] font-num text-slate-400">TIER 1 · 基礎</div>
                        {tier1.map(renderNode)}

                        <div className="text-[10px] font-num text-amber-300 pt-1">
                          {isConvBranch ? 'TIER 2 · 発展（両方習得可）' : 'TIER 2 · 排他選択（どちらか1つ）'}
                        </div>
                        <div className="space-y-2">{tier2.map(renderNode)}</div>

                        <div className="text-[10px] font-num text-slate-400 pt-1">
                          {isConvBranch ? 'TIER 3 · 快適化の極み' : 'TIER 3 · 熟達'}
                        </div>
                        {tier3.map(renderNode)}

                        <div className="text-[10px] font-num text-rose-300 pt-1">
                          {isConvBranch ? 'TIER 4 · 自動周回' : 'TIER 4 · 奥義'}
                        </div>
                        {tier4.map(renderNode)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })()}

        {/* TAB 5.5: ACHIEVEMENTS (CHALLENGES & PERMANENT REWARDS) */}
        {tabUnlocked && activeTab === 'ACHIEVEMENTS' && (
          <section className="pixel-panel p-5 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2b3040] pb-3.5">
              <div>
                <h2 className="font-pixel text-xl text-slate-100">チャレンジ実績（永続強化）</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  実績を1つ解除するたびに基礎ランクが上がり、勇者と仲間が強くなります（周回しても引き継がれます）。
                </p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[11px] text-slate-400">達成状況</div>
                <div className="font-num text-2xl font-bold text-amber-300">
                  {achBonus.unlockedCount} / {achBonus.totalCount}
                </div>
              </div>
            </div>

            {/* Active Achievement Power Banner */}
            <div className="pixel-slot p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-bold text-slate-100">
                  累積実績ランク +{achBonus.unlockedCount}（1実績ごとに 勇者・味方攻防HP+3% · 獲得G+4%）
                </span>
                <span className="font-num text-amber-300 font-bold">
                  {Math.round((achBonus.unlockedCount / Math.max(1, achBonus.totalCount)) * 100)}% 達成
                </span>
              </div>
              <div className="h-3 bg-[#0e1118] border border-[#2b3040] overflow-hidden">
                <div
                  className="h-full bg-amber-400 transition-all duration-200"
                  style={{
                    width: `${Math.round((achBonus.unlockedCount / Math.max(1, achBonus.totalCount)) * 100)}%`,
                  }}
                />
              </div>
              <div className="text-[11px] font-num text-emerald-300 leading-relaxed">
                現在発動中の実績合計ボーナス:{' '}
                {[
                  achBonus.atkPct > 0 ? `勇者攻撃+${achBonus.atkPct}%` : '',
                  achBonus.defPct > 0 ? `防御+${achBonus.defPct}%` : '',
                  achBonus.hpPct > 0 ? `HP+${achBonus.hpPct}%` : '',
                  achBonus.allyPowerPct > 0 ? `味方能力+${achBonus.allyPowerPct}%` : '',
                  achBonus.allyHpPct > 0 ? `味方HP+${achBonus.allyHpPct}%` : '',
                  achBonus.spdPct > 0 ? `速度+${achBonus.spdPct}%` : '',
                  achBonus.allySpdPct > 0 ? `味方速度+${achBonus.allySpdPct}%` : '',
                  achBonus.critPct > 0 ? `会心+${achBonus.critPct}%` : '',
                  achBonus.critDmgPct > 0 ? `会心ダメ+${achBonus.critDmgPct}%` : '',
                  achBonus.lifestealPct > 0 ? `吸血+${achBonus.lifestealPct}%` : '',
                  achBonus.dmgReductionPct > 0 ? `被ダメ-${achBonus.dmgReductionPct}%` : '',
                  achBonus.goldPct > 0 ? `獲得G+${achBonus.goldPct}%` : '',
                  achBonus.dropPct > 0 ? `ドロップ+${achBonus.dropPct}%` : '',
                ]
                  .filter(Boolean)
                  .join(' · ') || '実績を解除するとボーナスが加算されます'}
              </div>
            </div>

            {/* 12/12 Master Completion Rewards Showcase */}
            <div
              className={`border-2 p-4 space-y-3 ${
                allAchUnlocked
                  ? 'bg-[#1a1529] border-amber-400'
                  : 'bg-[#12151d] border-[#31384b]'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Award className={`w-4 h-4 shrink-0 ${allAchUnlocked ? 'text-amber-300' : 'text-slate-400'}`} />
                  <span className="font-pixel text-base text-amber-300">
                    全実績制覇特典（12/12 達成報酬）
                  </span>
                </div>
                <span className="font-num text-xs font-bold text-purple-300">
                  {allAchUnlocked
                    ? `開放済 · 強化ボスラッシュ踏破 ${save.bossRushClears ?? 0}回`
                    : `残り ${achBonus.totalCount - achBonus.unlockedCount} 個で開放`}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                全12実績を達成すると究極の9連戦ステージ「<span className="text-rose-300 font-bold">【極】終焉の強化ボスラッシュ</span>」が解禁されます。
                最強装備4種（武器・防具・魔道具・霊薬）は<span className="text-amber-300 font-bold">強化ボスラッシュ踏破で確定1つずつ</span>、さらに<span className="text-purple-300 font-bold">【裏】ダンジョン（ステージ7〜9）踏破時に5%の確率でいずれか1つ</span>ドロップします！
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {ULTIMATE_ITEM_IDS.map((id) => {
                  const it = ITEMS[id];
                  if (!it) return null;
                  const owned = save.inventory[id] ?? 0;
                  return (
                    <div
                      key={id}
                      className="bg-[#0e1119] border border-[#2d3345] p-2.5 flex items-start gap-2.5"
                    >
                      <div className="w-10 h-10 bg-[#171b26] border border-[#30384e] flex items-center justify-center shrink-0">
                        <PixelSprite id={it.spriteId} size={28} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-amber-300 truncate">{it.name}</span>
                          <span className="font-num text-[10px] text-slate-400 shrink-0">
                            {CATEGORY_SHORT[it.category]} · 所持{owned}
                          </span>
                        </div>
                        <div className="text-[10px] text-sky-300 font-num mt-0.5">
                          {formatItemStats(id)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap items-center gap-1.5">
              {([
                { id: 'ALL', label: 'すべて' },
                { id: 'CHALLENGE', label: '縛り・挑戦' },
                { id: 'COMBAT', label: '戦闘' },
                { id: 'BOND', label: '仲間・絆' },
                { id: 'PROGRESSION', label: '進行・収集' },
              ] as const).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setAchCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    achCategoryFilter === cat.id
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-[#12151d] text-slate-300 hover:text-white border border-[#2b3040]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Achievements List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ACHIEVEMENTS.filter(
                (a) => achCategoryFilter === 'ALL' || a.category === achCategoryFilter
              ).map((ach) => {
                const unlocked = (save.unlockedAchievements ?? []).includes(ach.id);
                const catLabel =
                  ach.category === 'CHALLENGE'
                    ? '縛り挑戦'
                    : ach.category === 'COMBAT'
                      ? '戦闘'
                      : ach.category === 'BOND'
                        ? '絆'
                        : '進行';

                return (
                  <div
                    key={ach.id}
                    className={`pixel-slot p-3.5 flex items-start gap-3 ${
                      unlocked ? 'border-amber-500/80 bg-[#1a1d28]' : 'opacity-80'
                    }`}
                  >
                    <div className="w-11 h-11 bg-[#12151d] border border-[#2e3446] flex items-center justify-center shrink-0">
                      <PixelSprite id={ach.spriteId} size={30} />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-sm font-bold truncate ${
                            unlocked ? 'text-amber-300' : 'text-slate-200'
                          }`}
                        >
                          {ach.title}
                        </span>
                        <span
                          className={`font-num text-[11px] font-bold shrink-0 ${
                            unlocked ? 'text-emerald-300' : 'text-slate-500'
                          }`}
                        >
                          {unlocked ? '達成済' : catLabel}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{ach.description}</p>
                      <div className="text-[11px] font-num text-sky-300">
                        永続効果: {ach.rewardText} (+基礎ランク3%)
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* TAB 6: COMPENDIUM (ADVENTURE LOG / ENCYCLOPEDIA) */}
        {tabUnlocked && activeTab === 'COMPENDIUM' && (
          <section className="pixel-panel p-5 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2b3040] pb-3.5">
              <div>
                <h2 className="font-pixel text-xl text-slate-100">冒険記録（図鑑）</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  これまでに出会った魔物・発見したイベント・入手したアイテムを記録します。記録は周回しても引き継がれ、達成率に応じて勇者に永続ボーナスが付与されます。
                </p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[11px] text-slate-400">総合コンプリート率</div>
                <div className="font-num text-2xl font-bold text-amber-300">
                  {compStats.overallPct}%{' '}
                  <span className="text-xs text-slate-300 font-normal">
                    ({compStats.foundAll} / {compStats.totalAll})
                  </span>
                </div>
              </div>
            </div>

            {/* Loop 2 Lore Unlock Status */}
            <div
              className={`border px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs ${
                loreUnlocked
                  ? 'bg-[#14221d] border-emerald-500/60 text-emerald-200'
                  : 'bg-[#141722] border-[#2e3547] text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {!loreUnlocked && <Lock className="w-3.5 h-3.5 text-amber-300 shrink-0" />}
                <span>
                  {loreUnlocked
                    ? '2周目報酬 解放済：発見済みの魔物・武器・アイテムの詳細解説（図鑑フレーバー）を読めるようになりました。'
                    : '2周目報酬：第2周目に到達すると、発見済みの魔物・武器・アイテムの詳細解説が読めるようになります。'}
                </span>
              </div>
              <span className="font-num text-[11px] font-bold text-amber-300 shrink-0">
                {loreUnlocked ? '詳細解説 解放済' : `現在 第${save.loopCount}周`}
              </span>
            </div>

            {/* Completion Summary & Progress Bars */}
            <div className="pixel-slot p-4 space-y-3.5">
              <div className="h-3 bg-[#0e1118] border border-[#2b3040] overflow-hidden">
                <div
                  className="h-full bg-amber-400 transition-all duration-200"
                  style={{ width: `${compStats.overallPct}%` }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#12151d] border border-[#2b3040] p-3 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-bold">遭遇した魔物</span>
                    <span className="font-num text-rose-300 font-bold">
                      {compStats.enemyCount}/{compStats.totalEnemies} ({compStats.enemyPct}%)
                    </span>
                  </div>
                  <div className="h-1.5 bg-[#0b0d12] overflow-hidden">
                    <div
                      className="h-full bg-rose-500"
                      style={{ width: `${compStats.enemyPct}%` }}
                    />
                  </div>
                </div>

                <div className="bg-[#12151d] border border-[#2b3040] p-3 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-bold">発見イベント</span>
                    <span className="font-num text-sky-300 font-bold">
                      {compStats.eventCount}/{compStats.totalEvents} ({compStats.eventPct}%)
                    </span>
                  </div>
                  <div className="h-1.5 bg-[#0b0d12] overflow-hidden">
                    <div
                      className="h-full bg-sky-500"
                      style={{ width: `${compStats.eventPct}%` }}
                    />
                  </div>
                </div>

                <div className="bg-[#12151d] border border-[#2b3040] p-3 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-bold">入手アイテム</span>
                    <span className="font-num text-emerald-300 font-bold">
                      {compStats.itemCount}/{compStats.totalItems} ({compStats.itemPct}%)
                    </span>
                  </div>
                  <div className="h-1.5 bg-[#0b0d12] overflow-hidden">
                    <div
                      className="h-full bg-emerald-500"
                      style={{ width: `${compStats.itemPct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Milestone Bonuses */}
              <div className="pt-2 border-t border-[#232836] space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-bold text-slate-200">図鑑達成ボーナス（周回引き継ぎ）</span>
                  <span className="font-num text-[11px] text-amber-300">
                    現在効果: 攻撃+{compBonus.atkPct}% · 防御+{compBonus.defPct}% · HP+{compBonus.hpPct}% · 獲得G+{compBonus.goldPct}% · ドロップ+{compBonus.dropPct}%
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  {[
                    { pct: 25, label: '25%達成', reward: '攻撃力 +10%' },
                    { pct: 50, label: '50%達成', reward: '獲得ゴールド +15%' },
                    { pct: 75, label: '75%達成', reward: '最大HP +15% · ドロップ +15%' },
                    { pct: 100, label: '100%達成', reward: '全攻防HP さらに+15%' },
                  ].map((ms) => {
                    const unlocked = compStats.overallPct >= ms.pct;
                    return (
                      <div
                        key={ms.pct}
                        className={`p-2 border ${
                          unlocked
                            ? 'bg-[#17231e] border-emerald-500/60 text-emerald-200'
                            : 'bg-[#12151d] border-[#252a38] text-slate-500'
                        }`}
                      >
                        <div className="flex items-center justify-between font-num font-bold">
                          <span>{ms.label}</span>
                          <span>{unlocked ? '発動中' : '未達成'}</span>
                        </div>
                        <div className="mt-0.5 text-[10px]">{ms.reward}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                {([
                  { id: 'ALL', label: 'すべて' },
                  { id: 'ENEMIES', label: `魔物 (${compStats.enemyCount}/${compStats.totalEnemies})` },
                  { id: 'EVENTS', label: `イベント (${compStats.eventCount}/${compStats.totalEvents})` },
                  { id: 'ITEMS', label: `アイテム (${compStats.itemCount}/${compStats.totalItems})` },
                ] as const).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setCompendiumFilter(tab.id)}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      compendiumFilter === tab.id
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-[#12151d] text-slate-300 hover:text-white border border-[#2b3040]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setCompendiumOnlyMissing((v) => !v)}
                className={`px-3 py-1.5 text-xs border transition-colors whitespace-nowrap cursor-pointer ${
                  compendiumOnlyMissing
                    ? 'bg-sky-500 text-slate-950 border-sky-400 font-bold'
                    : 'bg-[#12151d] text-slate-300 border-[#2b3040] hover:text-white'
                }`}
              >
                {compendiumOnlyMissing ? '未発見のみ表示中' : '未発見のみ表示'}
              </button>
            </div>

            {/* Enemies List */}
            {(compendiumFilter === 'ALL' || compendiumFilter === 'ENEMIES') && (
              <div className="space-y-2.5">
                <h3 className="font-pixel text-base text-slate-200 border-b border-[#232836] pb-1.5">
                  遭遇した魔物 ({compStats.enemyCount} / {compStats.totalEnemies})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {Object.values(ENEMIES)
                    .filter((en) => !compendiumOnlyMissing || !(save.discoveredEnemies ?? []).includes(en.id))
                    .map((en) => {
                      const found = (save.discoveredEnemies ?? []).includes(en.id);
                      const roleLabel = en.isBoss ? 'BOSS' : en.isElite ? '強敵' : '通常';
                      return (
                        <div
                          key={en.id}
                          className={`pixel-slot p-3 flex items-start gap-3 ${
                            found ? '' : 'opacity-65'
                          }`}
                        >
                          <div className="w-11 h-11 bg-[#12151d] border border-[#2e3446] flex items-center justify-center shrink-0">
                            {found ? (
                              <PixelSprite id={en.spriteId} size={32} />
                            ) : (
                              <span className="font-pixel text-lg text-slate-600">?</span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className={`text-sm font-bold truncate ${found ? (en.isBoss ? 'text-amber-300' : 'text-slate-100') : 'text-slate-500'}`}>
                                {found ? en.name : '???'}
                              </span>
                              <span className="font-num text-[11px] text-slate-400 shrink-0">
                                {roleLabel}
                              </span>
                            </div>
                            {found ? (
                              <>
                                <div className="text-[11px] text-sky-300 font-num mt-1">
                                  基礎HP {en.hp} · 攻撃 {en.atk} · 防御 {en.def} · 報酬 {en.goldDrop}G
                                </div>
                                <div className="text-[11px] text-slate-400 mt-0.5">
                                  出現: {getEnemyStageHint(en.id)}
                                </div>
                                {loreUnlocked ? (
                                  en.lore && (
                                    <p className="text-[11px] text-amber-100/90 bg-[#12151d] border border-[#2b3040] px-2.5 py-1.5 mt-1.5 leading-relaxed">
                                      {en.lore}
                                    </p>
                                  )
                                ) : (
                                  <div className="inline-flex items-center gap-1 text-[10px] text-slate-500 mt-1.5">
                                    <Lock className="w-3 h-3" />
                                    <span>2周目到達で詳細解説を解放</span>
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="text-[11px] text-slate-500 mt-1">
                                未遭遇 · ヒント: {getEnemyStageHint(en.id)}に出現
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Events List */}
            {(compendiumFilter === 'ALL' || compendiumFilter === 'EVENTS') && (
              <div className="space-y-2.5">
                <h3 className="font-pixel text-base text-slate-200 border-b border-[#232836] pb-1.5">
                  発見したイベント ({compStats.eventCount} / {compStats.totalEvents})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    ...DUNGEON_EVENTS.map((ev) => ({
                      id: ev.id,
                      title: ev.title,
                      spriteId: ev.spriteId,
                      kindLabel: '選択イベント',
                      desc: ev.description,
                      hint: 'ダンジョン道中のイベント部屋で発生',
                    })),
                    ...INSTANT_EVENTS.map((ev) => ({
                      id: ev.id,
                      title: ev.title,
                      spriteId: ev.spriteId,
                      kindLabel: '突発イベント',
                      desc: INSTANT_EVENT_DESCRIPTIONS[ev.id] ?? '探索中に突発的に発生するイベント。',
                      hint: 'ダンジョン道中のイベント部屋で発生',
                    })),
                  ]
                    .filter((ev) => !compendiumOnlyMissing || !(save.discoveredEvents ?? []).includes(ev.id))
                    .map((ev) => {
                      const found = (save.discoveredEvents ?? []).includes(ev.id);
                      return (
                        <div
                          key={ev.id}
                          className={`pixel-slot p-3 flex items-start gap-3 ${
                            found ? '' : 'opacity-65'
                          }`}
                        >
                          <div className="w-11 h-11 bg-[#12151d] border border-[#2e3446] flex items-center justify-center shrink-0">
                            {found ? (
                              <PixelSprite id={ev.spriteId} size={30} />
                            ) : (
                              <span className="font-pixel text-lg text-slate-600">?</span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className={`text-sm font-bold truncate ${found ? 'text-slate-100' : 'text-slate-500'}`}>
                                {found ? ev.title : '???'}
                              </span>
                              <span className="text-[11px] text-sky-300 shrink-0">
                                {ev.kindLabel}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                              {found ? ev.desc : `未発見 · ${ev.hint}`}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Items List */}
            {(compendiumFilter === 'ALL' || compendiumFilter === 'ITEMS') && (
              <div className="space-y-2.5">
                <h3 className="font-pixel text-base text-slate-200 border-b border-[#232836] pb-1.5">
                  手に入れたアイテム ({compStats.itemCount} / {compStats.totalItems})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {Object.values(ITEMS)
                    .filter((it) => !compendiumOnlyMissing || !(save.discoveredItems ?? []).includes(it.id))
                    .map((it) => {
                      const found = (save.discoveredItems ?? []).includes(it.id);
                      const isCraftOnly = FORGE_RECIPES.some((r) => r.resultItemId === it.id);
                      const hintText = it.isUltimate
                        ? '全実績（12/12）解除で入手'
                        : it.rarity === 'EPIC'
                          ? `${(it.shopUnlockClears ?? 3) >= 4 ? 'ステージ6以降または高周回' : 'ステージ4以降または2周目〜'}のドロップ・鍛冶/店解禁で入手`
                          : isCraftOnly
                            ? '鍛冶屋での鍛造または中盤以降の宝箱・ボス戦で入手'
                            : it.shopUnlockClears
                              ? `踏破${it.shopUnlockClears}回以上で道具屋解禁 · または相応の迷宮で入手`
                              : '道具屋で購入またはダンジョンで入手';

                      return (
                        <div
                          key={it.id}
                          className={`pixel-slot p-3 flex items-start gap-3 ${
                            found ? '' : 'opacity-65'
                          }`}
                        >
                          <div className="w-11 h-11 bg-[#12151d] border border-[#2e3446] flex items-center justify-center shrink-0">
                            {found ? (
                              <PixelSprite id={it.spriteId} size={30} />
                            ) : (
                              <span className="font-pixel text-lg text-slate-600">?</span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className={`text-sm font-bold truncate ${found ? RARITY_COLOR[it.rarity] : 'text-slate-500'}`}>
                                {found ? it.name : '???'}
                              </span>
                              <span className="font-num text-[11px] text-slate-400 shrink-0">
                                {CATEGORY_SHORT[it.category]} · {it.rarity} · 負荷{getItemMeterCost(it.id)}
                              </span>
                            </div>
                            {found ? (
                              <>
                                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                                  {it.description}
                                </p>
                                <div className="text-[11px] text-amber-300/90 font-num mt-1">
                                  {formatItemStats(it.id, save.itemRefineLevels)}
                                </div>
                                {loreUnlocked ? (
                                  it.lore && (
                                    <p className="text-[11px] text-amber-100/90 bg-[#12151d] border border-[#2b3040] px-2.5 py-1.5 mt-1.5 leading-relaxed">
                                      {it.lore}
                                    </p>
                                  )
                                ) : (
                                  <div className="inline-flex items-center gap-1 text-[10px] text-slate-500 mt-1.5">
                                    <Lock className="w-3 h-3" />
                                    <span>2周目到達で詳細解説を解放</span>
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="text-[11px] text-slate-500 mt-1">
                                未入手 · {hintText}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </section>
        )}

        {/* TAB 7: FORGE (RECIPES / REFINE / SALVAGE / CREST EXCHANGE) */}
        {tabUnlocked && activeTab === 'FORGE' && (
          <section className="pixel-panel p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2b3040] pb-3.5">
              <div>
                <h2 className="font-pixel text-xl text-slate-100">ドワーフの鍛冶屋・交換所</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  素材からの装備鍛造に加え、装備の+精錬強化・余剰装備の分解・踏破の証の交換が行えます。
                </p>
              </div>
              <div className="font-num text-xs text-emerald-300 font-bold shrink-0">
                所持中の踏破の証: {save.clearCrests} 枚
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {([
                { id: 'RECIPES', label: '装備鍛造' },
                { id: 'REFINE', label: '装備精錬 (+強化)' },
                { id: 'SALVAGE', label: '余剰分解' },
                { id: 'EXCHANGE', label: '踏破の証 交換所' },
              ] as const).map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setForgeSubTab(sub.id)}
                  className={`px-3 py-1.5 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    forgeSubTab === sub.id
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-[#12151d] text-slate-300 hover:text-white border border-[#2b3040]'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>

            {forgeSubTab === 'RECIPES' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {FORGE_RECIPES.map((rec) => {
                  const item = ITEMS[rec.resultItemId];
                  if (!item) return null;
                  const locked =
                    rec.requiredStageCleared &&
                    save.highestClearedStage < rec.requiredStageCleared;
                  const hasGold = save.gold >= rec.goldCost;
                  const hasMats =
                    save.materials.iron_ore >= (rec.materials.iron_ore ?? 0) &&
                    save.materials.magic_stone >= (rec.materials.magic_stone ?? 0) &&
                    save.materials.ancient_scroll >= (rec.materials.ancient_scroll ?? 0);
                  const canCraft = !locked && hasGold && hasMats;

                  return (
                    <div
                      key={rec.id}
                      className="pixel-slot p-3.5 flex flex-col justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 bg-[#1b1f2b] border border-[#2e3446] flex items-center justify-center shrink-0">
                          <PixelSprite id={item.spriteId} size={32} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`font-bold text-sm ${RARITY_COLOR[item.rarity]}`}>
                              {item.name}
                            </span>
                            <span className="font-num text-xs text-slate-400">
                              所持 {save.inventory[item.id] ?? 0}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5 font-num">
                            {CATEGORY_SHORT[item.category]} · {item.rarity} · 負荷 {getItemMeterCost(item.id)}
                          </div>
                          <p className="text-xs text-slate-300 mt-1">{item.description}</p>
                          <div className="text-[11px] text-amber-300/90 font-num mt-1">
                            {formatItemStats(item.id, save.itemRefineLevels)}
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#232836] space-y-2">
                        <div className="flex flex-wrap items-center gap-3 text-xs font-num">
                          <span className={hasGold ? 'text-amber-300' : 'text-red-400'}>
                            {rec.goldCost}G
                          </span>
                          {rec.materials.iron_ore ? (
                            <span
                              className={
                                save.materials.iron_ore >= rec.materials.iron_ore
                                  ? 'text-slate-200'
                                  : 'text-red-400'
                              }
                            >
                              鉄鉱石 {save.materials.iron_ore}/{rec.materials.iron_ore}
                            </span>
                          ) : null}
                          {rec.materials.magic_stone ? (
                            <span
                              className={
                                save.materials.magic_stone >= rec.materials.magic_stone
                                  ? 'text-sky-300'
                                  : 'text-red-400'
                              }
                            >
                              魔石 {save.materials.magic_stone}/{rec.materials.magic_stone}
                            </span>
                          ) : null}
                          {rec.materials.ancient_scroll ? (
                            <span
                              className={
                                save.materials.ancient_scroll >= rec.materials.ancient_scroll
                                  ? 'text-amber-200'
                                  : 'text-red-400'
                              }
                            >
                              古文書 {save.materials.ancient_scroll}/{rec.materials.ancient_scroll}
                            </span>
                          ) : null}
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => onCraftRecipe(rec.id)}
                            disabled={!canCraft}
                            className="px-4 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 disabled:bg-[#262b38] disabled:text-slate-500 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
                          >
                            {locked ? `ステージ${rec.requiredStageCleared}踏破で解放` : '鍛造する'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {forgeSubTab === 'REFINE' && (() => {
              const ownedList = Object.entries(save.inventory)
                .filter(([, qty]) => qty > 0)
                .map(([id, qty]) => ({ item: ITEMS[id], qty }))
                .filter((e) => Boolean(e.item));

              return (
                <div className="space-y-3">
                  <div className="bg-[#12151d] border border-[#2b3040] px-3.5 py-2.5 text-xs text-slate-300 leading-relaxed">
                    所持中のアイテムを最大 <span className="font-num text-emerald-300 font-bold">+{MAX_ITEM_REFINE}</span> まで精錬し、1段階ごとに装備性能・発動威力を <span className="font-num text-amber-300 font-bold">+15%</span> 底上げします（復活アイテムは回復HP+7%/段。精錬段階は今周回中有効）。
                  </div>

                  {ownedList.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-[#2b3040]">
                      精錬できるアイテムを所持していません。
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {ownedList.map(({ item, qty }) => {
                        const lv = (save.itemRefineLevels ?? {})[item.id] ?? 0;
                        const isMax = lv >= MAX_ITEM_REFINE;
                        const cost = getItemRefineCost(item.id, lv);
                        const canRefine =
                          !isMax &&
                          save.gold >= cost.gold &&
                          save.materials.iron_ore >= cost.iron &&
                          save.materials.magic_stone >= cost.stone &&
                          save.materials.ancient_scroll >= cost.scroll;

                        return (
                          <div
                            key={item.id}
                            className="pixel-slot p-3.5 flex flex-col justify-between gap-3"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-11 h-11 bg-[#1b1f2b] border border-[#2e3446] flex items-center justify-center shrink-0">
                                <PixelSprite id={item.spriteId} size={32} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className={`font-bold text-sm truncate ${RARITY_COLOR[item.rarity]}`}>
                                    {item.name}
                                    {lv > 0 && (
                                      <span className="ml-1 font-num text-emerald-300">
                                        +{lv}
                                      </span>
                                    )}
                                  </span>
                                  <span className="font-num text-xs text-amber-300 shrink-0">
                                    +{lv}/{MAX_ITEM_REFINE} · 所持{qty}
                                  </span>
                                </div>
                                <div className="text-[11px] text-sky-300 font-num mt-1">
                                  {formatItemStats(item.id, save.itemRefineLevels)}
                                </div>
                              </div>
                            </div>

                            {isMax ? (
                              <div className="pt-2 border-t border-[#232836] text-xs font-bold text-emerald-400">
                                精錬 MAX (+5 · 効果+75%)
                              </div>
                            ) : (
                              <div className="pt-2 border-t border-[#232836] space-y-2">
                                <div className="flex flex-wrap items-center gap-3 text-xs font-num">
                                  <span className={save.gold >= cost.gold ? 'text-amber-300' : 'text-red-400'}>
                                    {cost.gold}G
                                  </span>
                                  <span className={save.materials.iron_ore >= cost.iron ? 'text-slate-200' : 'text-red-400'}>
                                    鉄 {save.materials.iron_ore}/{cost.iron}
                                  </span>
                                  {cost.stone > 0 && (
                                    <span className={save.materials.magic_stone >= cost.stone ? 'text-sky-300' : 'text-red-400'}>
                                      魔石 {save.materials.magic_stone}/{cost.stone}
                                    </span>
                                  )}
                                  {cost.scroll > 0 && (
                                    <span className={save.materials.ancient_scroll >= cost.scroll ? 'text-amber-200' : 'text-red-400'}>
                                      古文書 {save.materials.ancient_scroll}/{cost.scroll}
                                    </span>
                                  )}
                                </div>
                                <div className="flex justify-end">
                                  <button
                                    type="button"
                                    onClick={() => onRefineItem(item.id)}
                                    disabled={!canRefine}
                                    className="px-3.5 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white disabled:bg-[#262b38] disabled:text-slate-500 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                                  >
                                    +{lv}→+{lv + 1} 精錬する (+15%)
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}

            {forgeSubTab === 'SALVAGE' && (() => {
              const salvageList = Object.entries(save.inventory)
                .filter(([, qty]) => qty > 0)
                .map(([id, qty]) => ({ item: ITEMS[id], qty }))
                .filter((e) => Boolean(e.item));

              return (
                <div className="space-y-3">
                  <div className="bg-[#12151d] border border-[#2b3040] p-3.5 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs text-slate-300 leading-relaxed">
                      使わない余剰装備を分解し、ゴールドと鍛冶素材（鉄鉱石・魔石・古文書）へ還元します。
                    </div>
                    <button
                      type="button"
                      onClick={onBulkSalvageSurplus}
                      disabled={surplusSalvageStats.totalCount === 0}
                      className="px-3.5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 disabled:bg-[#262b38] disabled:text-slate-500 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                    >
                      {surplusSalvageStats.totalCount > 0
                        ? `余剰を一括分解 (${surplusSalvageStats.totalCount}個 → +${surplusSalvageStats.gold}G·鉄+${surplusSalvageStats.iron}·石+${surplusSalvageStats.stone}·書+${surplusSalvageStats.scroll})`
                        : '余剰品なし（装備分＋各2個保持）'}
                    </button>
                  </div>

                  {salvageList.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-[#2b3040]">
                      分解できるアイテムがありません。
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {salvageList.map(({ item, qty }) => {
                        const inPouch = pouchCounts[item.id] ?? 0;
                        const available = qty - inPouch;
                        const reward = getItemSalvageReward(item.id);

                        return (
                          <div
                            key={item.id}
                            className="pixel-slot p-3.5 flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 bg-[#1b1f2b] border border-[#2e3446] flex items-center justify-center shrink-0">
                                <PixelSprite id={item.spriteId} size={28} />
                              </div>
                              <div className="min-w-0">
                                <div className={`text-sm font-bold truncate ${RARITY_COLOR[item.rarity]}`}>
                                  {item.name}
                                </div>
                                <div className="text-[11px] text-slate-400 font-num">
                                  所持 {qty} · 装備 {inPouch} · 分解可 {Math.max(0, available)}
                                </div>
                                <div className="text-[11px] text-sky-300 font-num mt-0.5">
                                  還元: +{reward.gold}G
                                  {reward.materials.iron_ore > 0 ? ` · 鉄+${reward.materials.iron_ore}` : ''}
                                  {reward.materials.magic_stone > 0 ? ` · 魔石+${reward.materials.magic_stone}` : ''}
                                  {reward.materials.ancient_scroll > 0 ? ` · 古文書+${reward.materials.ancient_scroll}` : ''}
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              disabled={available <= 0}
                              onClick={() => onSalvageItem(item.id)}
                              className="px-3 py-1.5 text-xs font-bold bg-[#252a38] hover:bg-[#31384a] text-amber-300 border border-[#3a4156] disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap shrink-0"
                            >
                              1個分解
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}

            {forgeSubTab === 'EXCHANGE' && (
              <div className="space-y-3">
                <div className="bg-[#12151d] border border-[#2b3040] px-3.5 py-2.5 text-xs text-slate-300 leading-relaxed">
                  余った「踏破の証」を、希少な素材や周回数に応じたゴールド・SPへ交換できます。
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {CREST_EXCHANGE_OPTIONS.map((opt) => {
                    const canAfford = save.clearCrests >= opt.crestCost;
                    const rewardPreview =
                      opt.rewardKind === 'GOLD'
                        ? `+${(opt.amount * Math.max(1, save.loopCount)).toLocaleString()}G`
                        : opt.rewardKind === 'SP'
                          ? `+${opt.amount} SP`
                          : opt.rewardKind === 'IRON'
                            ? `鉄鉱石 +${opt.amount}`
                            : opt.rewardKind === 'STONE'
                              ? `魔石 +${opt.amount}`
                              : `古文書 +${opt.amount}`;

                    return (
                      <div
                        key={opt.id}
                        className="pixel-slot p-3.5 flex flex-col justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-sm text-slate-100">
                              {opt.title}
                            </span>
                            <span className="font-num text-xs font-bold text-amber-300">
                              {rewardPreview}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                            {opt.description}
                          </p>
                        </div>
                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#232836]">
                          <span className="font-num text-xs text-emerald-300">
                            必要: 踏破の証 {opt.crestCost}枚
                          </span>
                          <button
                            type="button"
                            onClick={() => onExchangeCrest(opt.id)}
                            disabled={!canAfford}
                            className="px-4 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 disabled:bg-[#262b38] disabled:text-slate-500 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                          >
                            交換する
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        )}
      </div>

      {/* RIGHT STICKY SIDEBAR: 5-SLOT POUCH + PARTY + STAGE SELECT (4 cols) */}
      <aside className="lg:col-span-4 space-y-5 lg:sticky lg:top-6">
        {/* 5-Item Expedition Pouch */}
        <section className="pixel-panel p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-pixel text-base text-slate-100">
              持ち込み袋 ({filledCount} / {MAX_POUCH_SLOTS})
            </h3>
            <button
              type="button"
              onClick={() => onSelectTab('PREP')}
              className="text-xs text-amber-300 hover:underline cursor-pointer"
            >
              倉庫・上限設定
            </button>
          </div>
          <div className="space-y-1.5 bg-[#12151d] border border-[#2b3040] p-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">全体負荷</span>
              <span className="font-num font-bold text-amber-300">
                {meterUsage.total} / {effectiveTotalCap}
              </span>
            </div>
            <div className="h-2 bg-[#0b0d12] flex overflow-hidden">
              {Array.from({ length: effectiveTotalCap }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 border-r border-[#12151d] last:border-r-0 ${
                    i < meterUsage.total ? 'bg-amber-400' : 'bg-transparent'
                  }`}
                />
              ))}
            </div>
            <div className="grid grid-cols-4 gap-1.5 pt-1 text-[10px] font-num">
              {(['WEAPON', 'ARMOR', 'CONSUMABLE', 'RELIC'] as const).map((cat) => (
                <div key={cat} className="text-slate-300">
                  {CATEGORY_SHORT[cat]}{' '}
                  <span className="text-slate-100 font-bold">
                    {meterUsage.byCategory[cat]}/{getEffectiveTypeMeterCap(save, cat)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {save.pouch.map((itemId, idx) => {
              const item = itemId ? ITEMS[itemId] : null;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => item && onRemoveFromPouch(idx)}
                  title={item ? `${item.name}（クリックで外す）` : `空き枠 ${idx + 1}`}
                  className={`aspect-square flex flex-col items-center justify-center p-1 border-2 transition-colors ${
                    item
                      ? 'bg-[#1e2330] border-amber-500/60 hover:border-red-400 cursor-pointer'
                      : 'bg-[#12151d] border-[#282d3d] border-dashed cursor-default'
                  }`}
                >
                  {item ? (
                    <PixelSprite id={item.spriteId} size={28} />
                  ) : (
                    <span className="font-num text-[11px] text-slate-600">{idx + 1}</span>
                  )}
                </button>
              );
            })}
          </div>

          {filledCount > 0 && (
            <div className="space-y-1 pt-1">
              {save.pouch.map((itemId, idx) => {
                if (!itemId) return null;
                const item = ITEMS[itemId];
                if (!item) return null;
                const refineLv = (save.itemRefineLevels ?? {})[item.id] ?? 0;
                return (
                  <div
                    key={`${itemId}-${idx}`}
                    className="flex items-center justify-between text-xs text-slate-300"
                  >
                    <span className="truncate">
                      {idx + 1}. {item.name}
                      {refineLv > 0 && (
                        <span className="text-emerald-300 font-num ml-1">+{refineLv}</span>
                      )}
                      <span className="font-num text-[10px] text-slate-500 ml-1.5">
                        ({CATEGORY_SHORT[item.category]}·負荷{getItemMeterCost(item.id)})
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => onRemoveFromPouch(idx)}
                      className="text-[11px] text-slate-500 hover:text-red-400 ml-2 shrink-0 cursor-pointer"
                    >
                      外す
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {save.loopCount >= 3 && presets.some((p) => p.saved) && (
            <div className="pt-2 border-t border-[#232836] flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-slate-400 mr-1">マイセット:</span>
              {presets.map((p, idx) =>
                p.saved ? (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onLoadPreset(idx)}
                    className="px-2 py-0.5 text-[10px] font-bold bg-[#171c28] hover:bg-sky-500/20 text-sky-300 border border-sky-500/40 cursor-pointer truncate max-w-[110px]"
                  >
                    {p.name}
                  </button>
                ) : null
              )}
            </div>
          )}
        </section>

        {/* Party & Blessings Summary */}
        <section className="pixel-panel p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 bg-[#12151d] border border-[#2e3446] flex items-center justify-center shrink-0">
                <PixelSprite id="hero" size={28} />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-slate-100">
                  勇者 Lv.{save.heroUpgradeLevel}
                </div>
                <div className="font-num text-xs text-amber-300">
                  総合戦力 {partyPower} · 残SP {save.skillPoints}
                </div>
                {unlocks.heroTrain && (
                  <div className="font-num text-[10px] text-slate-400">
                    次の基礎修行SP: Lv.{Math.floor(save.heroUpgradeLevel / 5) * 5 + 5}
                  </div>
                )}
              </div>
            </div>
            {unlocks.heroTrain ? (
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={onTrainHero}
                  disabled={save.gold < heroTrainCost}
                  className="px-3 py-1.5 text-xs font-medium bg-[#252a38] hover:bg-[#31384a] text-amber-300 border border-[#3a4156] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                >
                  {(save.heroUpgradeLevel + 1) % 5 === 0
                    ? `基礎修行 +1SP (${heroTrainCost}G)`
                    : `基礎修行 (${heroTrainCost}G)`}
                </button>
                {hasBulkOpsConv && (
                  <button
                    type="button"
                    onClick={onBulkTrainHero}
                    disabled={save.gold < heroBulkCost}
                    title={`Lv.${heroTargetLv} まで一括修行してSPボーナスを獲得`}
                    className="px-2.5 py-1 text-[11px] font-bold bg-[#1d2536] hover:bg-[#28334b] text-sky-300 border border-sky-500/40 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                  >
                    +{heroMilestoneSteps}Lv→Lv.{heroTargetLv} +1SP ({heroBulkCost}G)
                  </button>
                )}
              </div>
            ) : (
              <div className="inline-flex items-center gap-1 text-[11px] text-slate-500 px-2.5 py-1.5 bg-[#12151d] border border-[#2b3040] shrink-0">
                <Lock className="w-3 h-3" />
                <span>S1踏破で修行開放</span>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-[#232836] space-y-2 text-xs">
            {unlocks.tavern ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">
                    隊列（前衛 → 後衛） · 仲間 {save.activeAllies.length}/2
                  </span>
                  <button
                    type="button"
                    onClick={() => onSelectTab('TAVERN')}
                    className="text-amber-300 hover:underline cursor-pointer"
                  >
                    仲間・強化
                  </button>
                </div>

                <div className="space-y-1.5">
                  {save.partyOrder.map((memberId, idx) => {
                    const isHero = memberId === 'hero';
                    const ally = !isHero ? ALLIES.find((a) => a.id === memberId) : null;
                    if (!isHero && !ally) return null;
                    const posLabel =
                      idx === 0
                        ? '前衛'
                        : save.partyOrder.length === 2 || idx === 2
                          ? '後衛'
                          : '中衛';

                    return (
                      <div
                        key={memberId}
                        className="flex items-center justify-between gap-2 bg-[#12151d] border border-[#2b3040] px-2.5 py-1.5"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[11px] font-bold text-amber-300 shrink-0">
                            {posLabel}
                          </span>
                          <PixelSprite id={isHero ? 'hero' : ally!.spriteId} size={18} />
                          <span className="text-slate-200 truncate">
                            {isHero ? '勇者' : ally!.name}
                          </span>
                        </div>
                        {save.partyOrder.length > 1 && (
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              disabled={idx <= 0}
                              onClick={() => onMovePartyMember(memberId, 'FORWARD')}
                              className="px-1.5 py-0.5 text-[10px] bg-[#1e2330] hover:bg-[#2c3345] text-amber-300 disabled:opacity-25 cursor-pointer"
                              title="前衛へ移動"
                            >
                              前へ
                            </button>
                            <button
                              type="button"
                              disabled={idx >= save.partyOrder.length - 1}
                              onClick={() => onMovePartyMember(memberId, 'BACKWARD')}
                              className="px-1.5 py-0.5 text-[10px] bg-[#1e2330] hover:bg-[#2c3345] text-slate-300 disabled:opacity-25 cursor-pointer"
                              title="後衛へ移動"
                            >
                              後へ
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <button
                type="button"
                onClick={() => onSelectTab('TAVERN')}
                className="w-full flex items-center justify-between gap-2 bg-[#12151d] border border-[#2b3040] px-2.5 py-2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              >
                <span className="inline-flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  <span>仲間・隊列編成</span>
                </span>
                <span className="text-[11px]">ステージ1踏破で解除</span>
              </button>
            )}

            {unlocks.shrine ? (
              <>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-400">
                    発動中の加護 ({save.activeBlessings.length}/{save.maxBlessingSlots})
                  </span>
                  <button
                    type="button"
                    onClick={() => onSelectTab('SHRINE')}
                    className="text-amber-300 hover:underline cursor-pointer"
                  >
                    変更
                  </button>
                </div>
                {save.activeBlessings.length === 0 ? (
                  <div className="text-slate-500">なし</div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {save.activeBlessings.map((id) => {
                      const b = BLESSINGS.find((x) => x.id === id);
                      if (!b) return null;
                      return (
                        <div
                          key={id}
                          className="flex items-center gap-1.5 bg-[#12151d] border border-[#2b3040] px-2 py-1"
                        >
                          <PixelSprite id={b.spriteId} size={18} />
                          <span className="text-slate-200">{b.name}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <button
                type="button"
                onClick={() => onSelectTab('SHRINE')}
                className="w-full flex items-center justify-between gap-2 bg-[#12151d] border border-[#2b3040] px-2.5 py-2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              >
                <span className="inline-flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  <span>加護の祭壇</span>
                </span>
                <span className="text-[11px]">ステージ3踏破で解除</span>
              </button>
            )}
            {/* Synergies Summary */}
            <div className="pt-2 border-t border-[#232836] space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  発動中のシナジー（絆・共鳴）
                </span>
                <span className="font-num text-[11px] text-amber-300 font-bold">
                  {activeSynergies.length} / {SYNERGIES.length}
                </span>
              </div>
              {activeSynergies.length === 0 ? (
                <div className="text-[11px] text-slate-500 leading-relaxed">
                  特定の仲間同士の組合わせや、同系統装備・加護を2種以上揃えるとシナジーが発動します。
                </div>
              ) : (
                <div className="space-y-1">
                  {activeSynergies.map((syn) => (
                    <div
                      key={syn.id}
                      className="bg-[#121622] border border-amber-500/40 px-2.5 py-1.5"
                    >
                      <div className="flex items-center justify-between gap-2 text-[11px]">
                        <span className="font-bold text-amber-300 truncate">{syn.name}</span>
                        <span className="text-[10px] text-sky-300 shrink-0">
                          {syn.kind === 'BOND' ? '絆' : '共鳴'}
                        </span>
                      </div>
                      <div className="text-[10px] text-emerald-300 font-num mt-0.5">
                        {syn.effectText}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Stage Selector & Launch */}
        <section className="pixel-panel overflow-hidden">
          <div className="relative h-28 bg-[#12151d] border-b border-[#2b3040]">
            {!gateImgErr ? (
              <img
                src={dungeonDepthsImg}
                alt="ダンジョン入口"
                referrerPolicy="no-referrer"
                onError={() => setGateImgErr(true)}
                className="w-full h-full object-cover pixelated"
              />
            ) : (
              <div className="w-full h-full bg-[#161a24]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#181b24] via-[#181b24]/45 to-transparent" />
            <div className="absolute bottom-2.5 left-4 right-4 flex items-end justify-between">
              <div>
                <div className="text-[11px] text-amber-300">攻略ステージ選択</div>
                <div className="font-pixel text-lg text-white leading-tight">
                  {selectedStage.name}
                </div>
              </div>
              <div className="font-num text-xs text-slate-200">
                {selectedStage.isEndless ? '無限階層' : `全${selectedStage.floors}階`}
              </div>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {reincarnateReady && (
              <div className="bg-[#18162a] border border-amber-400/75 p-3 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                  <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    転生可能！第{save.loopCount + 1}周目へ進めます
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 leading-relaxed space-y-1">
                  <div>
                    <span className="text-rose-300 font-bold">リセット対象:</span> 所持金・素材・アイテム・道具屋品揃え・勇者Lv・仲間・加護・現在のメーター上限・習得スキルは初期状態に戻ります。
                  </div>
                  <div>
                    <span className="text-emerald-300 font-bold">引き継ぎ＆転生特典:</span> 冒険記録（図鑑）と達成ボーナス・踏破の証(+2進呈)を引き継ぎ、初期SPが <span className="font-num text-amber-300 font-bold">{(save.loopCount + 1) * 2}SP</span> で開始。敵能力 <span className="font-num text-rose-300">{getLoopEnemyStatMult(save.loopCount + 1)}倍</span>・報酬増加・メーター天井解放に加え、{save.loopCount + 1 <= 4 ? `新たな裏ステージ「ステージ${maxStageForLoop + 1}」が開放されます！` : save.loopCount === 5 ? '第5周目制覇報酬「【無限】終わらぬ深淵回廊」も開放されます！' : '全ての裏ステージへさらに強敵化して挑めます！'}
                  </div>
                </div>
                {!confirmNextLoop ? (
                  <button
                    type="button"
                    onClick={() => setConfirmNextLoop(true)}
                    className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    転生して第{save.loopCount + 1}周目へ進む
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmNextLoop(false)}
                      className="py-2 px-3 bg-[#252a38] hover:bg-[#31384a] text-slate-200 text-xs font-medium cursor-pointer"
                    >
                      キャンセル
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmNextLoop(false);
                        onAdvanceLoop();
                      }}
                      className="py-2 px-3 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
                    >
                      リセットして転生
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Provisional Past-Loop Multiplier Dive Selector (Loop 2+) */}
            {save.loopCount >= 2 && (
              <div className="bg-[#12151d] border border-[#2b3040] p-3 space-y-2">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-bold text-slate-200">潜入倍率（仮潜入対応）</span>
                  <span className="font-num text-[11px] text-amber-300">
                    {effectiveDive.isPractice
                      ? `仮: 第${effectiveDive.loop}周 (${loopStatMult}倍)`
                      : `通常: 第${save.loopCount}周 (${loopStatMult}倍)`}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {Array.from({ length: save.loopCount }, (_, idx) => idx + 1).map((loopOpt) => {
                    const isCurrentOpt = loopOpt === save.loopCount;
                    const active = effectiveDive.loop === loopOpt;
                    const mult = getLoopEnemyStatMult(loopOpt);
                    return (
                      <button
                        key={loopOpt}
                        type="button"
                        onClick={() => onSelectPracticeLoop(isCurrentOpt ? null : loopOpt)}
                        className={`px-2 py-1 text-[11px] font-num font-bold border transition-colors cursor-pointer ${
                          active
                            ? isCurrentOpt
                              ? 'bg-amber-500 border-amber-400 text-slate-950'
                              : 'bg-purple-600 border-purple-400 text-white'
                            : 'bg-[#171b26] border-[#2e3446] text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        {isCurrentOpt
                          ? `第${loopOpt}周 · 通常 (${mult}x)`
                          : `第${loopOpt}周 · 仮 (${mult}x)`}
                      </button>
                    );
                  })}
                </div>
                {effectiveDive.isPractice && !selectedStage.isEndless && (
                  <div className="bg-[#1b1429] border border-purple-500/60 px-2.5 py-2 text-[11px] text-purple-200 leading-relaxed">
                    仮潜入モード中（第{effectiveDive.loop}周倍率）：極めて低効率ですがゴールド(約10%)と魔石のみ入手可能。装備ドロップ・鉄鉱石・古文書・証・実績・クリア記録・店補充はなく、持ち込みアイテムも消費されません。
                  </div>
                )}
                {selectedStage.isEndless && (
                  <div className="bg-[#151228] border border-purple-400/55 px-2.5 py-2 text-[11px] text-purple-200 leading-relaxed">
                    ※【無限】終わらぬ深淵回廊は「第{ENDLESS_BENCHMARK_LOOP}周目基準（{endlessStatMult}倍）」の固定難易度チャレンジのため、周回倍率・仮潜入の対象外です。
                  </div>
                )}
              </div>
            )}

            <div className="space-y-1.5">
              {STAGES.map((st) => {
                const isBossRush = Boolean(st.isBossRush);
                const isEndless = Boolean(st.isEndless);
                const loopLocked = !isBossRush && !isEndless && (st.minLoop ?? 1) > save.loopCount;
                const bossRushLocked = isBossRush && !allAchUnlocked;
                const endlessLocked = isEndless && !endlessUnlocked;
                const cleared = isBossRush
                  ? (save.bossRushClears ?? 0) > 0
                  : isEndless
                    ? (save.bestEndlessFloor ?? 0) >= 10
                    : !loopLocked && isStageClearedInCurrentLoop(st.id, save);
                const unlocked = isStageUnlockedForPlay(st, save);
                const isSelected = st.id === save.selectedStageId;
                const loopPower = Math.round(
                  st.recommendedPower * (isEndless ? endlessStatMult : loopStatMult)
                );
                const loopBonus = effectiveDive.isPractice
                  ? 0
                  : Math.round(st.clearBonusGold * loopRewardMult);
                const crestReward = effectiveDive.isPractice
                  ? 0
                  : (isBossRush ? 8 : st.id) * save.loopCount + skillBonus.extraCrests;
                const firstClearSpAvailable =
                  (isEndless || !effectiveDive.isPractice) &&
                  unlocked &&
                  !(save.stageClearsThisLoop ?? []).includes(st.id);

                return (
                  <button
                    key={st.id}
                    type="button"
                    disabled={!unlocked}
                    onClick={() => onSelectStage(st.id)}
                    className={`w-full text-left px-3 py-2 border transition-colors flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-[#252a38] border-amber-500 text-white cursor-pointer'
                        : unlocked
                          ? isBossRush
                            ? 'bg-[#1c1324] border-rose-500/65 text-slate-100 hover:border-rose-400 cursor-pointer'
                            : isEndless
                              ? 'bg-[#141229] border-purple-400/75 text-slate-100 hover:border-purple-300 cursor-pointer'
                              : st.isSecret
                                ? 'bg-[#171224] border-purple-500/50 text-slate-200 hover:border-purple-400 cursor-pointer'
                                : 'bg-[#12151d] border-[#2b3040] text-slate-300 hover:border-slate-500 cursor-pointer'
                          : 'bg-[#101218] border-[#1f2330] text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">
                        {st.id}.{' '}
                        {loopLocked
                          ? '【裏】未開放の異界'
                          : bossRushLocked
                            ? '【極】終焉の強化ボスラッシュ（未解放）'
                            : endlessLocked
                              ? '【無限】終わらぬ深淵回廊（未解放）'
                              : st.name}{' '}
                        {isBossRush && unlocked
                          ? (save.bossRushClears ?? 0) > 0
                            ? `· 踏破 ${save.bossRushClears}回`
                            : ''
                          : isEndless && unlocked
                            ? (save.bestEndlessFloor ?? 0) > 0
                              ? `· 最高 ${save.bestEndlessFloor}F`
                              : ''
                            : cleared
                              ? '· 踏破済'
                              : ''}
                      </div>
                      <div className="text-[11px] text-slate-400 font-num truncate">
                        {loopLocked
                          ? `第${st.minLoop}周目（転生後）に開放 · 今周回の転生には不要`
                          : bossRushLocked
                            ? `全実績 (${achBonus.unlockedCount}/${achBonus.totalCount}) 解除で解放 · 転生には不要`
                            : endlessLocked
                              ? '5周目クリア（第6周目または5周目制覇）で解放 · 転生には不要'
                              : unlocked
                                ? isEndless
                                  ? `第${ENDLESS_BENCHMARK_LOOP}周目基準固定 (推奨戦力 ${loopPower}) · 5F毎ボス&証${firstClearSpAvailable ? ' · 初回10FでSP+1' : ''}`
                                  : `推奨戦力 ${loopPower} · ギミック:${st.gimmick.name}${firstClearSpAvailable ? ' · 初回SP+1' : ''}`
                                : '前ステージ踏破で解放'}
                      </div>
                    </div>
                    <div className="text-right font-num text-[11px] shrink-0">
                      {loopLocked ? (
                        <div className="text-purple-400">第{st.minLoop}周〜</div>
                      ) : bossRushLocked ? (
                        <div className="text-rose-400">
                          実績{achBonus.unlockedCount}/{achBonus.totalCount}
                        </div>
                      ) : endlessLocked ? (
                        <div className="text-purple-400">5周目制覇</div>
                      ) : isEndless ? (
                        <>
                          <div className="text-purple-300">{ENDLESS_BENCHMARK_LOOP}周目基準</div>
                          <div className="text-emerald-300">証+5F毎</div>
                        </>
                      ) : effectiveDive.isPractice ? (
                        <div className="text-purple-300">低効率(G·魔石)</div>
                      ) : (
                        <>
                          <div className="text-amber-300">+{loopBonus}G</div>
                          <div className="text-emerald-300">証+{crestReward}</div>
                        </>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="space-y-2">
              <div className="text-xs text-slate-300 leading-relaxed">
                {selectedStage.description}
              </div>
              <div className="bg-[#12151d] border border-[#2b3040] px-3 py-2 space-y-0.5">
                <div className="text-[11px] font-bold text-amber-300">
                  特殊ギミック · {selectedStage.gimmick.name}（{selectedStage.gimmick.shortEffect}）
                </div>
                <div className="text-[11px] text-slate-300 leading-relaxed">
                  {selectedStage.gimmick.description}
                </div>
              </div>
              {selectedStage.isEndless ? (
                <div className="bg-[#151228] border border-purple-400/55 px-3 py-2 space-y-1">
                  <div className="text-[11px] font-bold text-purple-300">
                    無限深淵チャレンジ（第{ENDLESS_BENCHMARK_LOOP}周目基準 · 固定倍率 {endlessStatMult}x · 最高記録: {save.bestEndlessFloor ?? 0}F）
                  </div>
                  <div className="text-[11px] text-slate-300 leading-relaxed">
                    現在の周回数や仮潜入に影響されない固定難易度のエンドコンテンツです。階層が深くなるほど敵が強化され、戦利品も上位RARE〜最上位EPICが出現。5階ごとのボス撃破で踏破の証を獲得でき、15F以降のボスでは8%で最強装備4種のいずれかがドロップします（敗北・撤退でも持ち帰り可能）。
                  </div>
                </div>
              ) : effectiveDive.isPractice ? (
                <div className="bg-[#1b1429] border border-purple-500/50 px-3 py-2 space-y-0.5">
                  <div className="text-[11px] font-bold text-purple-300">
                    仮潜入（第{effectiveDive.loop}周倍率 · 超低効率）
                  </div>
                  <div className="text-[11px] text-slate-300 leading-relaxed">
                    過去の強化倍率で挑戦できます。非常に低効率（ゴールド約10%・魔石のみ低確率）ですが獲得でき、装備ドロップ・クリア・実績・店補充・アイテム消費はありません。
                  </div>
                </div>
              ) : (
                (() => {
                  const dropProf = getStageDropProfile(
                    selectedStage.id,
                    save.loopCount,
                    !!selectedStage.isBossRush
                  );
                  return (
                    <div className="bg-[#12151d] border border-[#2b3040] px-3 py-2 space-y-0.5">
                      <div className="text-[11px] font-bold text-sky-300">
                        ドロップ帯（第{save.loopCount}周）· {dropProf.summaryLabel}
                      </div>
                      <div className="text-[11px] text-slate-400 leading-relaxed">
                        {dropProf.summaryDetail}
                      </div>
                      {selectedStage.isBossRush ? (
                        <div className="text-[11px] font-bold text-amber-300 pt-0.5">
                          確定踏破報酬: 最強装備4種（ジェネシス・イージス・覇王冠・アンブロシア）を1つずつ獲得
                        </div>
                      ) : selectedStage.isSecret ? (
                        <div className="text-[11px] font-bold text-purple-300 pt-0.5">
                          裏ダンジョン踏破枠: クリア時 5% で最強装備4種のいずれか1つがドロップ
                        </div>
                      ) : null}
                    </div>
                  );
                })()
              )}
            </div>

            {/* Pre-expedition Event Choice Mode Selector */}
            <div className="pt-2 border-t border-[#232836] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">道中イベントの選択方式</span>
                <span className="text-[11px] text-slate-400">
                  {save.eventChoiceMode === 'MANUAL' ? '選択肢が表示される' : '状況に応じ自動決定'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 bg-[#12151d] border border-[#2b3040] p-1">
                <button
                  type="button"
                  onClick={() => onChangeEventMode('MANUAL')}
                  className={`py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                    save.eventChoiceMode === 'MANUAL'
                      ? 'bg-sky-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  手動選択
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!hasAutoEventConv) {
                      onSelectTab('SKILLS');
                    }
                    onChangeEventMode('AUTO');
                  }}
                  className={`py-1.5 text-xs font-bold transition-colors cursor-pointer inline-flex items-center justify-center gap-1 ${
                    !hasAutoEventConv
                      ? 'text-slate-500 hover:text-amber-300'
                      : save.eventChoiceMode === 'AUTO'
                        ? 'bg-amber-500 text-slate-950'
                        : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {!hasAutoEventConv && <Lock className="w-3 h-3" />}
                  <span>自動選択</span>
                </button>
              </div>
            </div>

            {/* Auto-Repeat & Auto-Restock Controls */}
            {hasAutoRepeatConv ? (
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={onToggleAutoRepeat}
                  className={`py-2 px-2.5 text-[11px] font-bold border transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                    save.autoRepeatEnabled
                      ? 'bg-emerald-600 border-emerald-400 text-white'
                      : 'bg-[#12151d] border-[#2b3040] text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <Repeat className="w-3.5 h-3.5 shrink-0" />
                  <span>連続周回: {save.autoRepeatEnabled ? 'ON' : 'OFF'}</span>
                </button>
                <button
                  type="button"
                  onClick={onToggleAutoRestock}
                  className={`py-2 px-2.5 text-[11px] font-bold border transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                    save.autoRestockOnReturn
                      ? 'bg-sky-600 border-sky-400 text-white'
                      : 'bg-[#12151d] border-[#2b3040] text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 shrink-0" />
                  <span>帰還自動補充: {save.autoRestockOnReturn ? 'ON' : 'OFF'}</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onSelectTab('SKILLS')}
                className="w-full py-2 px-3 bg-[#12151d] border border-[#2b3040] text-[11px] text-slate-400 hover:text-amber-300 inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Lock className="w-3 h-3" />
                <span>連続周回・自動補充（スキルツリーで解放）</span>
              </button>
            )}

            <button
              type="button"
              onClick={onStartExpedition}
              className={`w-full py-3 px-4 font-pixel text-lg font-bold transition-colors cursor-pointer ${
                selectedStage.isEndless
                  ? 'bg-purple-600 hover:bg-purple-500 text-white'
                  : effectiveDive.isPractice
                    ? 'bg-purple-600 hover:bg-purple-500 text-white'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
              }`}
            >
              {selectedStage.isEndless
                ? `無限回廊へ挑戦（第${ENDLESS_BENCHMARK_LOOP}周目基準）`
                : effectiveDive.isPractice
                  ? `仮潜入で出発する（第${effectiveDive.loop}周倍率）`
                  : '自動攻略へ出発する'}
            </button>
          </div>
        </section>
      </aside>
    </div>
  );
};

function formatItemStats(
  itemId: string,
  refineLevels?: Record<string, number>
): string {
  const item = ITEMS[itemId];
  if (!item) return '';
  const stats = getItemEffectiveStats(itemId, refineLevels);
  const parts: string[] = [];
  if (stats?.atk) parts.push(`攻撃+${stats.atk}`);
  if (stats?.def) parts.push(`防御+${stats.def}`);
  if (stats?.maxHp) parts.push(`HP+${stats.maxHp}`);
  if (stats?.spd) parts.push(`速度+${stats.spd}%`);
  if (stats?.crit) parts.push(`会心+${stats.crit}%`);
  if (stats?.lifesteal) parts.push(`吸血+${stats.lifesteal}%`);
  if (stats?.thorns) parts.push(`反射+${stats.thorns}%`);
  if (stats?.goldBonus) parts.push(`獲得G+${stats.goldBonus}%`);
  if (stats?.regenPerRoom) parts.push(`部屋回復+${stats.regenPerRoom}`);
  if (item.autoEffect) {
    const lv = (refineLevels ?? {})[itemId] ?? 0;
    if (lv > 0) {
      const effPower = getItemEffectiveAutoPower(itemId, refineLevels);
      parts.push(`${item.autoEffect.description} (精錬+${lv}: 威力${effPower})`);
    } else {
      parts.push(item.autoEffect.description);
    }
  }
  return parts.join(' · ');
}
