export type GameScreen = 'TOWN' | 'EXPEDITION' | 'SUMMARY';

export type TownTab =
  | 'PREP'
  | 'SHOP'
  | 'SHRINE'
  | 'SKILLS'
  | 'TAVERN'
  | 'ACHIEVEMENTS'
  | 'COMPENDIUM'
  | 'FORGE';

export type ItemCategory = 'WEAPON' | 'ARMOR' | 'CONSUMABLE' | 'RELIC';

export type EventChoiceMode = 'AUTO' | 'MANUAL';

export type AutoEquipPlaystyle = 'OFFENSE' | 'DEFENSE' | 'CONSUMABLES';

export type GameSpeed = 1 | 2 | 4 | 8 | 16 | 32 | 64;

export type ConvenienceUpgradeId =
  | 'conv_speed_4x'
  | 'conv_speed_8x'
  | 'conv_speed_16x'
  | 'conv_speed_32x'
  | 'conv_speed_64x'
  | 'conv_auto_event'
  | 'conv_auto_equip'
  | 'conv_auto_repeat'
  | 'conv_bulk_ops';

export interface ConvenienceUpgradeDef {
  id: ConvenienceUpgradeId;
  name: string;
  costSp: number;
  requires?: ConvenienceUpgradeId;
  description: string;
}

export type MaterialId =
  | 'iron_ore'
  | 'magic_stone'
  | 'ancient_scroll'
  | 'abyss_shard'
  | 'void_gear'
  | 'chaos_prism';

export interface MaterialBag {
  iron_ore: number;
  magic_stone: number;
  ancient_scroll: number;
  abyss_shard: number;
  void_gear: number;
  chaos_prism: number;
}

export interface ItemStats {
  atk?: number;
  def?: number;
  maxHp?: number;
  spd?: number; // Attack speed % bonus
  crit?: number; // Crit % bonus
  lifesteal?: number; // % of damage healed
  thorns?: number; // % damage reflected
  goldBonus?: number; // % extra gold
  dropBonus?: number; // % extra material/loot chance
  regenPerRoom?: number; // HP healed on entering a room
}

export interface AutoEffect {
  trigger: 'LOW_HP' | 'ELITE_OR_PACK' | 'BOSS' | 'ON_DEATH';
  kind: 'HEAL' | 'BOMB' | 'BUFF_ATK' | 'BUFF_DEF' | 'REVIVE' | 'HEAL_AND_BUFF';
  power: number;
  uses: number;
  reactToAllies?: boolean; // RARE+ healing items trigger when any ally or hero HP drops
  thresholdPct?: number; // Default 50
  description: string;
}

export interface ItemDef {
  id: string;
  name: string;
  category: ItemCategory;
  rarity: 'COMMON' | 'RARE' | 'EPIC';
  price: number;
  sellPrice: number;
  spriteId: string;
  description: string;
  lore?: string; // Loop 2+ Compendium detailed lore
  tags?: string[]; // Synergy tags (e.g., 'FLAME', 'HOLY', 'DARK', 'STORM', 'ULTIMATE')
  stats?: ItemStats;
  autoEffect?: AutoEffect;
  shopUnlockClears?: number; // Number of clears needed for shop appearance
  isUltimate?: boolean; // Exclusive reward for Boss Rush / Secret Dungeon
  isForgeExclusive?: boolean; // Exclusive endgame craft unlocked at Endless 100F
}

export interface ForgeRecipe {
  id: string;
  resultItemId: string;
  goldCost: number;
  materials: Partial<MaterialBag>;
  requiredItems?: { itemId: string; count: number }[];
  requiredStageCleared?: number;
  requiredEndlessFloor?: number;
}

export interface BlessingDef {
  id: string;
  name: string;
  title: string;
  spriteId: string;
  color: string;
  unlockCostGold: number;
  unlockCostStones: number;
  maxLevel: number;
  upgradeBaseGold: number;
  upgradeBaseStones: number;
  descriptionPerLevel: (level: number) => string;
  getBonuses: (level: number) => {
    atkPct?: number;
    defPct?: number;
    hpPct?: number;
    spdPct?: number;
    critPct?: number;
    lifestealPct?: number;
    burnChance?: number;
    chainLightningChance?: number;
    roomHeal?: number;
    goldPct?: number;
    allyPowerPct?: number;
  };
}

export type AllyRole = 'HEALER' | 'TANK' | 'RANGER' | 'MAGE' | 'THIEF';

export interface AllyDef {
  id: string;
  name: string;
  roleName: string;
  role: AllyRole;
  spriteId: string;
  hireCost: number;
  upgradeBaseCost: number;
  baseHp: number;
  baseAtk: number;
  baseDef: number;
  attackIntervalMs: number;
  range: 'MELEE' | 'RANGED';
  skillDescription: string;
  passiveBonusText: string;
  awakeningBonusText: (rank: number) => string;
}

export interface EnemyDef {
  id: string;
  name: string;
  spriteId: string;
  hp: number;
  atk: number;
  def: number;
  attackIntervalMs: number;
  goldDrop: number;
  materialChance: number;
  isBoss?: boolean;
  isElite?: boolean;
  scale?: number;
  lore?: string; // Loop 2+ Compendium detailed lore
}

export type StageGimmickId =
  | 'MOSS_SPORE'
  | 'HEAT_WAVE'
  | 'CURSED_MIASMA'
  | 'FROZEN_CHILL'
  | 'STAR_RESONANCE'
  | 'ABYSS_PRESSURE'
  | 'BLUE_FLAME'
  | 'CHRONO_DISTORTION'
  | 'OMEGA_FIELD'
  | 'BOSS_RUSH_SURGE'
  | 'ENDLESS_ABYSS';

export interface StageGimmick {
  id: StageGimmickId;
  name: string;
  shortEffect: string;
  description: string;
}

export interface StageDef {
  id: number;
  name: string;
  subtitle: string;
  biome: 'MOSS' | 'LAVA' | 'CRYPT' | 'ICE' | 'STAR' | 'ABYSS' | 'CHAOS';
  floors: number;
  recommendedPower: number;
  clearBonusGold: number;
  enemyPool: string[];
  eliteId: string;
  bossId: string;
  description: string;
  gimmick: StageGimmick;
  minLoop?: number; // 1 = available from Loop 1, 2 = secret stage unlocked in Loop 2+
  isSecret?: boolean;
  isBossRush?: boolean; // Unlocked upon completing all achievements
  isEndless?: boolean; // Unlocked upon clearing Loop 5
}

export type SkillTreeBranch =
  | 'WARRIOR'
  | 'GUARDIAN'
  | 'EXPLORER'
  | 'ALLY'
  | 'CONVENIENCE'
  | 'TRANSCENDENT';

export interface SkillNodeEffects {
  atkPct?: number;
  defPct?: number;
  hpPct?: number;
  spdPct?: number;
  critPct?: number;
  critDmgPct?: number;
  lifestealPct?: number;
  allyPowerPct?: number;
  allySpdPct?: number;
  allyHpPct?: number;
  allyDefPct?: number;
  allyCritPct?: number;
  allyDmgReductionPct?: number;
  allyLifestealPct?: number;
  heroStatSharePct?: number;
  allyOverdrive?: boolean;
  dmgReductionPct?: number;
  roomHeal?: number;
  goldPct?: number;
  dropPct?: number;
  consumablePowerPct?: number;
  extraMeterCap?: number;
  extraTypeMeterCap?: number;
  extraCrests?: number;
  tripleStrike?: boolean;
  deathSave?: boolean;
}

export interface SkillNodeDef {
  id: string;
  branch: SkillTreeBranch;
  tier: 1 | 2 | 3 | 4;
  name: string;
  costSp: number;
  requiresAny?: string[];
  exclusiveWith?: string;
  description: string;
  effects: SkillNodeEffects;
}

export interface AchievementBonus {
  heroAndAllyStatsPct?: number; // ATK/DEF/HP for both hero and allies
  atkPct?: number;
  defPct?: number;
  hpPct?: number;
  spdPct?: number;
  critPct?: number;
  critDmgPct?: number;
  lifestealPct?: number;
  dmgReductionPct?: number;
  allyPowerPct?: number;
  allySpdPct?: number;
  allyHpPct?: number;
  goldPct?: number;
  dropPct?: number;
}

export interface AchievementDef {
  id: string;
  title: string;
  category: 'COMBAT' | 'CHALLENGE' | 'BOND' | 'PROGRESSION';
  description: string;
  rewardText: string;
  spriteId: string;
  bonus: AchievementBonus;
}

export type EventOutcomeKind =
  | 'SAFE_CHEST'
  | 'RISKY_CHEST'
  | 'HEAL_SPRING'
  | 'DIVE_SPRING'
  | 'ALTAR_SACRIFICE'
  | 'ALTAR_PRAY'
  | 'PEDDLER_HEAL'
  | 'PEDDLER_MATS'
  | 'FORK_ELITE'
  | 'FORK_REST'
  | 'MIMIC_CHEST'
  | 'ALCHEMIST_BREW'
  | 'ALCHEMIST_SELL'
  | 'GAMBLE_HIGH'
  | 'GAMBLE_SAFE'
  | 'SKIP';

export interface DungeonEventOption {
  id: string;
  label: string;
  hint: string;
  outcome: EventOutcomeKind;
  goldCost?: number;
}

export interface DungeonEventDef {
  id: string;
  title: string;
  spriteId: string;
  description: string;
  options: DungeonEventOption[];
  minLoop?: number;
}

export type InstantEventKind =
  | 'GOLD_POUCH'
  | 'GENTLE_BREEZE'
  | 'HIDDEN_RACK'
  | 'FALLING_ROCKS'
  | 'BLESSED_STATUE'
  | 'STRAY_SLIME'
  | 'GEM_VEIN';

export interface InstantEventDef {
  id: string;
  title: string;
  spriteId: string;
  kind: InstantEventKind;
  minLoop?: number;
}

export type TypeMeterCaps = Record<ItemCategory, number>;

export interface LoadoutPreset {
  id: string;
  name: string;
  saved: boolean;
  pouch: (string | null)[];
  activeAllies: string[];
  partyOrder: string[];
  activeBlessings: string[];
  autoEquipStyle: AutoEquipPlaystyle;
}

export interface SynergyBonus {
  atkPct?: number;
  defPct?: number;
  hpPct?: number;
  spdPct?: number;
  critPct?: number;
  critDmgPct?: number;
  lifestealPct?: number;
  dmgReductionPct?: number;
  burnChance?: number;
  roomHeal?: number;
  healReceivedPct?: number;
  unisonChargePct?: number;
  allyPowerPct?: number;
  allySpdPct?: number;
  allyHpPct?: number;
  goldPct?: number;
}

export interface SynergyDef {
  id: string;
  kind: 'BOND' | 'SET';
  name: string;
  conditionText: string;
  effectText: string;
  bonus: SynergyBonus;
}

export interface PartyContribution {
  id: string;
  name: string;
  spriteId: string;
  isHero: boolean;
  damageDealt: number;
  damageTaken: number;
  healingDone: number;
  kills: number;
}

export interface SaveState {
  gold: number;
  materials: MaterialBag;
  inventory: Record<string, number>; // itemId -> count owned
  pouch: (string | null)[]; // length 5: selected itemIds for next expedition
  totalMeterCap: number; // overall loadout cost cap
  typeMeterCaps: TypeMeterCaps; // per-category loadout cost cap
  loopCount: number; // current New Game+ / loop tier (1, 2, 3...)
  highestClearedLoop: number; // highest loop number whose main stages have been cleared
  bestEndlessFloor: number; // highest floor reached in Endless Corridor
  clearCrests: number; // emblems earned from clearing stages, spent to expand meters / exchange
  shopBoughtThisCycle: Record<string, number>; // itemId -> count bought since last return
  eventChoiceMode: EventChoiceMode;
  autoEquipStyle: AutoEquipPlaystyle;
  unlockedBlessings: Record<string, number>; // blessingId -> level (0 if locked)
  activeBlessings: string[]; // up to maxBlessingSlots
  maxBlessingSlots: number;
  hiredAllies: Record<string, number>; // allyId -> level (0 if not hired)
  allyAwakenings: Record<string, number>; // allyId -> awakening rank (0..3)
  allyGearLevels: Record<string, number>; // allyId -> exclusive gear rank (0..5)
  activeAllies: string[]; // up to 2 allyIds
  partyOrder: string[]; // ordered front -> back containing 'hero' and activeAllies
  highestClearedStage: number; // highest regular stage cleared in current loop
  selectedStageId: number;
  totalRuns: number;
  totalClears: number;
  cycleClears: number; // clears in current loop (resets on loop advance -> resets shop)
  heroUpgradeLevel: number; // permanent town training level
  skillPoints: number; // unspent SP for skill tree
  unlockedSkills: string[]; // chosen skill tree node IDs
  spMasteryLevel: number; // repeatable SP mastery rank
  stageClearsThisLoop: number[]; // stage IDs cleared in current loop (for +1 SP reward)
  discoveredEnemies: string[]; // enemy IDs encountered
  discoveredEvents: string[]; // choice & instant event IDs discovered
  discoveredItems: string[]; // item IDs ever obtained
  seenGuides: string[]; // tab IDs whose 1st-loop light guide has been dismissed
  unlockedAchievements: string[]; // permanent achievement IDs unlocked across loops
  claimedAllAchievementsInLoop: number; // loopCount where ultimate master reward was granted
  bossRushClears: number; // number of Enhanced Boss Rush clears
  bestSingleHit: number; // highest single-hit damage dealt
  unlockedConveniences: ConvenienceUpgradeId[]; // QoL unlocks tracked alongside unlockedSkills
  preferredSpeed: GameSpeed;
  autoRepeatEnabled: boolean;
  autoRestockOnReturn: boolean;
  practiceLoopCount: number | null; // Loop 2+ provisional dive at previously fought loop multiplier
  presets: LoadoutPreset[]; // Loop 3+ loadout presets (4 slots)
  itemRefineLevels: Record<string, number>; // Forge +0..+5 item refinement levels in current loop
  seenAnnouncements: string[]; // Feature / milestone unlock announcement IDs already acknowledged
  lifetimeStats: LifetimeStats; // Cumulative play history & economy/combat statistics
}

export interface RunHistoryEntry {
  id: number;
  timestamp: number;
  stageId: number;
  stageName: string;
  loopCount: number;
  victory: boolean;
  isEndless?: boolean;
  isBossRush?: boolean;
  isPracticeRun?: boolean;
  reachedFloor: number;
  totalFloors: number;
  goldEarned: number;
  enemiesDefeated: number;
  maxHitDamage: number;
  durationSec: number;
}

export interface LifetimeStats {
  playTimeSeconds: number;
  totalGoldEarned: number;
  totalGoldSpent: number;
  totalUpgrades: number;
  totalItemsUsed: number;
  totalConsumableActivations: number;
  totalItemsBought: number;
  totalItemsCrafted: number;
  totalItemsRefined: number;
  totalItemsSalvaged: number;
  totalHeroLevelsGained: number;
  totalAllyLevelsGained: number;
  totalEnemiesDefeated: number;
  totalBossesDefeated: number;
  totalDamageDealt: number;
  totalHealingDone: number;
  totalCrestsEarned: number;
  totalMaterialsEarned: number;
  totalReincarnations: number;
  recentRuns: RunHistoryEntry[];
}

export type HighlightKind =
  | 'BOSS_KILL'
  | 'RARE_LOOT'
  | 'CLOSE_CALL'
  | 'TRAP_EVADE'
  | 'BIG_CRIT';

export interface ExpeditionHighlight {
  id: number;
  floor: number;
  timeText: string;
  kind: HighlightKind;
  title: string;
  detail: string;
  spriteId?: string;
}

export interface ExpeditionResult {
  victory: boolean;
  stageId: number;
  stageName: string;
  loopCount: number;
  reachedFloor: number;
  totalFloors: number;
  enemiesDefeated: number;
  goldEarned: number;
  crestsEarned: number;
  materialsEarned: MaterialBag;
  lootedItems: string[]; // itemIds discovered in chests/bosses
  consumedItems: string[]; // all items used during run (consumed upon return)
  encounteredEnemyIds: string[]; // enemy IDs met in this run
  encounteredEventIds: string[]; // event IDs met in this run
  highlights: ExpeditionHighlight[];
  durationSec: number;
  causeOfReturn: string;
  // Challenge tracking metrics
  maxHitDamage: number;
  usedConsumablesCount: number;
  allPartySurvived: boolean;
  hadFullParty: boolean;
  pouchItemCount: number;
  heroHpPct: number;
  isBossRush?: boolean;
  isEndless?: boolean;
  isPracticeRun?: boolean;
  effectiveLoopCount?: number;
  autoPurchasedItems?: string[];
  autoPurchasedGold?: number;
  partyContributions?: PartyContribution[];
  totalDamageDealt?: number;
  totalHealingDone?: number;
  bossesDefeated?: number;
  consumableActivations?: number;
}

export interface CombatLogEntry {
  id: number;
  timeText: string;
  text: string;
  tone: 'info' | 'combat' | 'heal' | 'loot' | 'alert' | 'blessing';
}

export interface CarriedSlotStatus {
  slotIndex: number;
  itemId: string;
  name: string;
  spriteId: string;
  isConsumable: boolean;
  remainingUses: number;
  maxUses: number;
  usedInRun: boolean;
  lastTriggeredAt: number; // timestamp ms for visual flash
}
