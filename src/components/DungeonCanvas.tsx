import React, { useEffect, useRef } from 'react';
import {
  ALLIES,
  BLESSINGS,
  BOSS_RUSH_BOSS_ORDER,
  DUNGEON_EVENTS,
  ENDLESS_BENCHMARK_LOOP,
  ENDLESS_RARE_PART_IDS,
  ENEMIES,
  getAchievementBonuses,
  getActiveSynergies,
  getCompendiumBonuses,
  getEffectiveDiveLoop,
  getItemEffectiveAutoPower,
  getItemEffectiveStats,
  getLoopEnemyStatMult,
  getLoopRewardMult,
  getSkillTreeBonuses,
  getSynergySummary,
  INSTANT_EVENTS,
  ITEMS,
  MATERIAL_INFO,
  rollDropItem,
  STAGES,
  ULTIMATE_ITEM_IDS,
} from '../game/data';
import { getSpriteAuraCanvas, getSpriteCanvas } from '../game/pixelSprites';
import { sound } from '../game/sound';
import {
  CarriedSlotStatus,
  CombatLogEntry,
  DungeonEventDef,
  DungeonEventOption,
  EventChoiceMode,
  ExpeditionHighlight,
  ExpeditionResult,
  GameSpeed,
  HighlightKind,
  InstantEventDef,
  MaterialBag,
  MaterialId,
  PartyContribution,
  SaveState,
} from '../game/types';

export interface ExpeditionHudSnapshot {
  floor: number;
  totalFloors: number;
  roomLabel: string;
  goldEarned: number;
  materialsEarned: MaterialBag;
  lootedItems: string[];
  enemiesDefeated: number;
  unisonGauge: number;
  hasUnison: boolean;
  gimmickName: string;
  gimmickShort: string;
  gimmickStackCount: number;
  party: {
    id: string;
    name: string;
    spriteId: string;
    hp: number;
    maxHp: number;
    isHero: boolean;
    positionLabel: string;
  }[];
  carriedSlots: CarriedSlotStatus[];
  bossInfo: { name: string; hp: number; maxHp: number } | null;
  isBossIntro: boolean;
  isBossRush: boolean;
  isEndless?: boolean;
  isPracticeRun: boolean;
  effectiveLoopCount: number;
}

export interface EventChoiceSelection {
  nonce: number;
  option: DungeonEventOption;
}

interface DungeonCanvasProps {
  save: SaveState;
  speed: GameSpeed;
  paused: boolean;
  eventChoiceMode: EventChoiceMode;
  retreatSignal: number;
  eventSelection: EventChoiceSelection | null;
  onHudUpdate: (hud: ExpeditionHudSnapshot) => void;
  onLog: (entry: CombatLogEntry) => void;
  onEventPrompt: (event: DungeonEventDef | null) => void;
  onComplete: (result: ExpeditionResult) => void;
}

interface SimUnit {
  id: string;
  name: string;
  spriteId: string;
  isHero: boolean;
  role: 'HERO' | 'HEALER' | 'TANK' | 'RANGER' | 'MAGE' | 'THIEF';
  awakeningRank: number;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  crit: number;
  lifesteal: number;
  thorns: number;
  dmgReductionPct: number;
  atkIntervalMs?: number;
  attackIntervalMs: number;
  attackTimer: number;
  castCount: number;
  x: number;
  y: number;
  baseX: number;
  lungeX: number;
  hitFlash: number;
  alive: boolean;
}

interface SimEnemy {
  uid: number;
  enemyDefId: string;
  name: string;
  spriteId: string;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  attackIntervalMs: number;
  attackTimer: number;
  castCount: number;
  goldDrop: number;
  materialChance: number;
  isBoss: boolean;
  isElite: boolean;
  isBossRushEnhanced: boolean;
  scale: number;
  x: number;
  y: number;
  lungeX: number;
  hitFlash: number;
  alive: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface Projectile {
  x: number;
  y: number;
  tx: number;
  ty: number;
  progress: number;
  speed: number;
  color: string;
  size: number;
  kind: 'ARROW' | 'FIREBALL' | 'HOLY' | 'DARK';
}

interface FloatingText {
  x: number;
  y: number;
  vy: number;
  text: string;
  color: string;
  life: number;
}

interface BubbleEffect {
  x: number;
  y: number;
  spriteId: string;
  life: number;
}

type EncounterKind = 'COMBAT' | 'EVENT_CHOICE' | 'EVENT_INSTANT' | 'BOSS';

interface RoomEncounter {
  kind: EncounterKind;
  enemies: SimEnemy[];
  eventDef?: DungeonEventDef;
  instantDef?: InstantEventDef;
  eventState?: 'WAITING_CHOICE' | 'AUTO_DELAY' | 'RESOLVED';
  autoDelayTimer?: number;
  label: string;
}

const CANVAS_W = 480;
const CANVAS_H = 260;

const BIOME_COLORS = {
  MOSS: {
    sky: '#11181c',
    wall: '#1e282d',
    brick: '#29373d',
    floor: '#1a2324',
    floorTile: '#233030',
    accent: '#4d7c0f',
    torch: '#f59e0b',
  },
  LAVA: {
    sky: '#181012',
    wall: '#2a1a1d',
    brick: '#3b2427',
    floor: '#201315',
    floorTile: '#2d1a1c',
    accent: '#dc2626',
    torch: '#fb923c',
  },
  CRYPT: {
    sky: '#12131f',
    wall: '#1e2033',
    brick: '#2a2d47',
    floor: '#161726',
    floorTile: '#202338',
    accent: '#6366f1',
    torch: '#38bdf8',
  },
  ICE: {
    sky: '#0c1622',
    wall: '#152538',
    brick: '#1f3652',
    floor: '#101d2c',
    floorTile: '#182b40',
    accent: '#38bdf8',
    torch: '#bae6fd',
  },
  STAR: {
    sky: '#0c1020',
    wall: '#161d38',
    brick: '#222c52',
    floor: '#11162b',
    floorTile: '#1a2240',
    accent: '#818cf8',
    torch: '#fde047',
  },
  ABYSS: {
    sky: '#120d1a',
    wall: '#211630',
    brick: '#302045',
    floor: '#160f21',
    floorTile: '#231836',
    accent: '#a855f7',
    torch: '#f43f5e',
  },
  CHAOS: {
    sky: '#180c18',
    wall: '#2b142a',
    brick: '#3d1c3b',
    floor: '#1f0e1e',
    floorTile: '#2e162d',
    accent: '#e879f9',
    torch: '#f97316',
  },
  BOSS_RUSH: {
    sky: '#14080e',
    wall: '#240c16',
    brick: '#3b1522',
    floor: '#190a10',
    floorTile: '#2b1019',
    accent: '#f43f5e',
    torch: '#fbbf24',
  },
};

export const DungeonCanvas: React.FC<DungeonCanvasProps> = ({
  save,
  speed,
  paused,
  eventChoiceMode,
  retreatSignal,
  eventSelection,
  onHudUpdate,
  onLog,
  onEventPrompt,
  onComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const speedRef = useRef(speed);
  const pausedRef = useRef(paused);
  const eventModeRef = useRef(eventChoiceMode);
  const retreatRef = useRef(retreatSignal);
  const eventSelectionRef = useRef<EventChoiceSelection | null>(eventSelection);
  const lastHandledNonceRef = useRef<number>(0);

  const saveRef = useRef(save);
  saveRef.current = save;

  const onHudUpdateRef = useRef(onHudUpdate);
  const onLogRef = useRef(onLog);
  const onEventPromptRef = useRef(onEventPrompt);
  const onCompleteRef = useRef(onComplete);

  speedRef.current = speed;
  pausedRef.current = paused;
  eventModeRef.current = eventChoiceMode;
  eventSelectionRef.current = eventSelection;
  onHudUpdateRef.current = onHudUpdate;
  onLogRef.current = onLog;
  onEventPromptRef.current = onEventPrompt;
  onCompleteRef.current = onComplete;

  useEffect(() => {
    retreatRef.current = retreatSignal;
  }, [retreatSignal]);

  useEffect(() => {
    const runSave = saveRef.current;
    lastHandledNonceRef.current = 0;
    const stage = STAGES.find((s) => s.id === runSave.selectedStageId) ?? STAGES[0];
    const biome = stage.isBossRush ? BIOME_COLORS.BOSS_RUSH : BIOME_COLORS[stage.biome];
    const { loop: effectiveLoopCount, isPractice: isPracticeRun } = getEffectiveDiveLoop(
      runSave,
      stage.id
    );
    const loopMult = getLoopEnemyStatMult(effectiveLoopCount);
    const effectiveDropLoop = stage.isEndless ? ENDLESS_BENCHMARK_LOOP : runSave.loopCount;
    const loopRewardMult = stage.isEndless
      ? getLoopRewardMult(ENDLESS_BENCHMARK_LOOP)
      : isPracticeRun
        ? 1
        : getLoopRewardMult(runSave.loopCount);
    const PRACTICE_GOLD_RATE = 0.1;
    const calcPracticeGold = (normalGold: number) =>
      Math.max(1, Math.floor(normalGold * PRACTICE_GOLD_RATE));
    const skillBonus = getSkillTreeBonuses(runSave.unlockedSkills, runSave.spMasteryLevel);
    const achBonus = getAchievementBonuses(runSave);
    const activeSynergies = getActiveSynergies(runSave);
    const synBonus = getSynergySummary(runSave);
    const gimmickId = stage.gimmick.id;

    // Aggregate bonuses from 5-slot pouch + blessings + hero level + compendium + skills + achievements + synergies + gimmick
    let heroAtk = 14 + (runSave.heroUpgradeLevel - 1) * 4;
    let heroDef = 3 + (runSave.heroUpgradeLevel - 1) * 2;
    let heroMaxHp = 115 + (runSave.heroUpgradeLevel - 1) * 22;
    let heroSpdPct = skillBonus.spdPct + achBonus.spdPct + synBonus.spdPct;
    let heroCrit = 8 + skillBonus.critPct + achBonus.critPct + synBonus.critPct;
    let heroLifesteal = skillBonus.lifestealPct + achBonus.lifestealPct + synBonus.lifestealPct;
    let heroThorns = 0;
    let goldBonusPct = skillBonus.goldPct + achBonus.goldPct + synBonus.goldPct;
    let dropBonusPct = skillBonus.dropPct + achBonus.dropPct;
    let roomHealFlat = skillBonus.roomHeal + synBonus.roomHeal;
    let burnChance = synBonus.burnChance;
    let chainLightningChance = 0;
    let allyPowerPct = skillBonus.allyPowerPct + achBonus.allyPowerPct + synBonus.allyPowerPct;
    let allyHpBonusPct = skillBonus.allyHpPct + achBonus.allyHpPct + synBonus.allyHpPct;
    let allySpdBonusPct = skillBonus.allySpdPct + achBonus.allySpdPct + synBonus.allySpdPct;

    if (gimmickId === 'HEAT_WAVE') dropBonusPct += 25;
    if (gimmickId === 'CURSED_MIASMA') {
      heroLifesteal += 8;
      dropBonusPct += 30;
    }
    if (gimmickId === 'FROZEN_CHILL') heroCrit += 10;
    if (gimmickId === 'STAR_RESONANCE') {
      heroCrit += 15;
      allyPowerPct += 20;
    }
    if (gimmickId === 'ABYSS_PRESSURE') goldBonusPct += 30;
    if (gimmickId === 'BLUE_FLAME') heroSpdPct += 20;

    const carriedSlots: CarriedSlotStatus[] = [];
    runSave.pouch.forEach((itemId, idx) => {
      if (!itemId) return;
      const item = ITEMS[itemId];
      if (!item) return;
      const effStats = getItemEffectiveStats(itemId, runSave.itemRefineLevels);
      if (effStats) {
        heroAtk += effStats.atk ?? 0;
        heroDef += effStats.def ?? 0;
        heroMaxHp += effStats.maxHp ?? 0;
        heroSpdPct += effStats.spd ?? 0;
        heroCrit += effStats.crit ?? 0;
        heroLifesteal += effStats.lifesteal ?? 0;
        heroThorns += effStats.thorns ?? 0;
        goldBonusPct += effStats.goldBonus ?? 0;
        dropBonusPct += effStats.dropBonus ?? 0;
        roomHealFlat += effStats.regenPerRoom ?? 0;
      }
      carriedSlots.push({
        slotIndex: idx,
        itemId,
        name: item.name,
        spriteId: item.spriteId,
        isConsumable: item.category === 'CONSUMABLE',
        remainingUses: item.autoEffect?.uses ?? 0,
        maxUses: item.autoEffect?.uses ?? 0,
        usedInRun: false,
        lastTriggeredAt: 0,
      });
    });

    let atkPctMult = skillBonus.atkPct + achBonus.atkPct + synBonus.atkPct;
    let defPctMult = skillBonus.defPct + achBonus.defPct + synBonus.defPct;
    let hpPctMult = skillBonus.hpPct + achBonus.hpPct + synBonus.hpPct;
    runSave.activeBlessings.forEach((bId) => {
      const lv = runSave.unlockedBlessings[bId] ?? 0;
      const bDef = BLESSINGS.find((b) => b.id === bId);
      if (!bDef || lv <= 0) return;
      const b = bDef.getBonuses(lv);
      atkPctMult += b.atkPct ?? 0;
      defPctMult += b.defPct ?? 0;
      hpPctMult += b.hpPct ?? 0;
      heroSpdPct += b.spdPct ?? 0;
      heroCrit += b.critPct ?? 0;
      heroLifesteal += b.lifestealPct ?? 0;
      burnChance += b.burnChance ?? 0;
      chainLightningChance += b.chainLightningChance ?? 0;
      roomHealFlat += b.roomHeal ?? 0;
      goldBonusPct += b.goldPct ?? 0;
      allyPowerPct += b.allyPowerPct ?? 0;
      allyHpBonusPct += b.allyPowerPct ?? 0;
    });

    const compBonus = getCompendiumBonuses(runSave);
    atkPctMult += compBonus.atkPct;
    defPctMult += compBonus.defPct;
    hpPctMult += compBonus.hpPct;
    goldBonusPct += compBonus.goldPct;
    dropBonusPct += compBonus.dropPct;

    heroAtk = Math.round(heroAtk * (1 + atkPctMult / 100));
    heroDef = Math.max(0, Math.round(heroDef * (1 + defPctMult / 100)));
    heroMaxHp = Math.round(heroMaxHp * (1 + hpPctMult / 100));

    const hasThief = runSave.activeAllies.includes('thief_kaito');
    const hasCleric = runSave.activeAllies.includes('cleric_lilia');
    if (hasThief) {
      const thiefRank = runSave.allyAwakenings['thief_kaito'] ?? 0;
      goldBonusPct += 20 + thiefRank * 12;
    }

    const totalDmgReduction = Math.min(
      65,
      skillBonus.dmgReductionPct + achBonus.dmgReductionPct + synBonus.dmgReductionPct
    );

    const heroUnit: SimUnit = {
      id: 'hero',
      name: '勇者',
      spriteId: 'hero',
      isHero: true,
      role: 'HERO',
      awakeningRank: 0,
      hp: heroMaxHp,
      maxHp: heroMaxHp,
      atk: heroAtk,
      def: heroDef,
      crit: heroCrit,
      lifesteal: heroLifesteal,
      thorns: heroThorns,
      dmgReductionPct: totalDmgReduction,
      attackIntervalMs: Math.max(400, Math.round(1150 / (1 + heroSpdPct / 100))),
      attackTimer: 350,
      castCount: 0,
      x: 118,
      y: 174,
      baseX: 118,
      lungeX: 0,
      hitFlash: 0,
      alive: true,
    };

    const unitMap: Record<string, SimUnit> = { hero: heroUnit };
    const heroShareRate = skillBonus.heroStatSharePct / 100;

    runSave.activeAllies.forEach((allyId) => {
      const def = ALLIES.find((a) => a.id === allyId);
      const lv = runSave.hiredAllies[allyId] ?? 0;
      if (!def || lv <= 0) return;
      const rank = runSave.allyAwakenings[allyId] ?? 0;
      const gearLv = (runSave.allyGearLevels ?? {})[allyId] ?? 0;
      const atkMult =
        (1 + (lv - 1) * 0.2 + rank * 0.12 + gearLv * 0.16) *
        (1 + allyPowerPct / 100);
      const hpMult =
        (1 + (lv - 1) * 0.2 + rank * 0.12 + gearLv * 0.14) *
        (1 + allyHpBonusPct / 100);
      const spdBonus =
        (def.role === 'RANGER' || def.role === 'THIEF' ? rank * 6 : 0) +
        gearLv * 4 +
        allySpdBonusPct +
        (gimmickId === 'BLUE_FLAME' ? 20 : 0);
      const critBonus =
        (def.role === 'RANGER' ? 20 + rank * 8 : def.role === 'THIEF' ? 16 + rank * 5 : 8) +
        skillBonus.allyCritPct +
        achBonus.critPct +
        (gimmickId === 'FROZEN_CHILL' ? 10 : 0) +
        (gimmickId === 'STAR_RESONANCE' ? 15 : 0);
      const baseReduction = def.role === 'TANK' ? rank * 8 : 0;
      const allyMaxHp = Math.round(def.baseHp * hpMult + heroMaxHp * heroShareRate);
      const allyAtk = Math.round(def.baseAtk * atkMult + heroAtk * heroShareRate);
      const allyDef = Math.round(
        def.baseDef *
          (1 + (lv - 1) * 0.16 + rank * 0.12 + gearLv * 0.1) *
          (1 + (skillBonus.allyDefPct + achBonus.heroAndAllyStatsPct) / 100) +
          heroDef * heroShareRate
      );

      unitMap[allyId] = {
        id: def.id,
        name: def.name,
        spriteId: def.spriteId,
        isHero: false,
        role: def.role,
        awakeningRank: rank,
        hp: allyMaxHp,
        maxHp: allyMaxHp,
        atk: allyAtk,
        def: allyDef,
        crit: critBonus,
        lifesteal:
          skillBonus.allyLifestealPct +
          achBonus.lifestealPct +
          (gimmickId === 'CURSED_MIASMA' ? 8 : 0),
        thorns: def.role === 'TANK' ? rank * 12 : 0,
        dmgReductionPct: Math.min(
          60,
          baseReduction + totalDmgReduction + skillBonus.allyDmgReductionPct
        ),
        attackIntervalMs: Math.max(400, Math.round(def.attackIntervalMs / (1 + spdBonus / 100))),
        attackTimer: 400 + Math.random() * 300,
        castCount: 0,
        x: 0,
        y: 174,
        baseX: 0,
        lungeX: 0,
        hitFlash: 0,
        alive: true,
      };
    });

    // Build ordered party from front (index 0) -> back (index 1, 2)
    const validOrder = runSave.partyOrder.filter((id) => !!unitMap[id]);
    Object.keys(unitMap).forEach((id) => {
      if (!validOrder.includes(id)) validOrder.push(id);
    });

    const frontToBackX = [148, 102, 58];
    const party: SimUnit[] = validOrder.map((id, idx) => {
      const u = unitMap[id];
      const bx = frontToBackX[idx] ?? 58;
      u.baseX = bx;
      u.x = bx;
      u.y = 175 + (idx === 1 ? -3 : idx === 2 ? 4 : 0);
      return u;
    });

    const contribMap: Record<string, PartyContribution> = {};
    party.forEach((u) => {
      contribMap[u.id] = {
        id: u.id,
        name: u.name,
        spriteId: u.spriteId,
        isHero: u.isHero,
        damageDealt: 0,
        damageTaken: 0,
        healingDone: 0,
        kills: 0,
      };
    });

    // Simulation state
    let currentFloor = 1;
    let roomIndex = 0;
    let phase: 'MARCHING' | 'BOSS_INTRO' | 'ENCOUNTER' | 'ROOM_CLEAR' | 'FINISHED' = 'MARCHING';
    let marchTimer = 0;
    let bossIntroElapsed = 0;
    let bossIntroDuration = 2200;
    let clearWaitTimer = 0;
    let cameraX = 0;
    let elapsedSimMs = 0;

    const getBossIntroDuration = (spd: GameSpeed) => {
      if (spd <= 1) return 2400;
      if (spd === 2) return 1750;
      if (spd === 4) return 1150;
      if (spd === 8) return 700;
      if (spd <= 16) return 420;
      if (spd === 32) return 250;
      return 140;
    };
    let logCounter = 1;
    let enemyUidCounter = 1;
    let bossAtkBuffPct = 0;
    let bossDefBuffFlat = 0;
    let runAtkBuffPct = gimmickId === 'HEAT_WAVE' ? 18 : 0;
    let runDefBuffFlat = 0;
    let gimmickStackCount = 0;
    let usedSkillDeathSave = false;
    let unisonGauge = 0;
    let maxHitDamage = 0;
    let endlessCrestsEarned = 0;

    let goldEarned = 0;
    const materialsEarned: MaterialBag = {
      iron_ore: 0,
      magic_stone: 0,
      ancient_scroll: 0,
      abyss_shard: 0,
      void_gear: 0,
      chaos_prism: 0,
    };
    const lootedItems: string[] = [];
    const encounteredEnemyIds = new Set<string>();
    const encounteredEventIds = new Set<string>();
    let enemiesDefeated = 0;
    let bossesDefeated = 0;
    const highlights: ExpeditionHighlight[] = [];
    let highlightIdCounter = 1;
    let closeCallRecordedThisFloor = false;
    let peakHit: {
      dmg: number;
      floor: number;
      timeText: string;
      attackerName: string;
      spriteId: string;
      targetName: string;
      isTriple: boolean;
    } | null = null;

    const particles: Particle[] = [];
    const projectiles: Projectile[] = [];
    const floatingTexts: FloatingText[] = [];
    const bubbles: BubbleEffect[] = [];

    const formatSimTime = () => {
      const sec = Math.floor(elapsedSimMs / 1000);
      const mm = String(Math.floor(sec / 60)).padStart(2, '0');
      const ss = String(sec % 60).padStart(2, '0');
      return `${mm}:${ss}`;
    };

    const pushHighlight = (
      kind: HighlightKind,
      title: string,
      detail: string,
      spriteId?: string
    ) => {
      highlights.push({
        id: highlightIdCounter++,
        floor: currentFloor,
        timeText: formatSimTime(),
        kind,
        title,
        detail,
        spriteId,
      });
    };

    const pushLog = (text: string, tone: CombatLogEntry['tone'] = 'info') => {
      onLogRef.current({
        id: logCounter++,
        timeText: formatSimTime(),
        text,
        tone,
      });
    };

    const markEquipmentUsed = () => {
      carriedSlots.forEach((slot) => {
        if (!slot.isConsumable) {
          slot.usedInRun = true;
        }
      });
    };

    const spawnEnemy = (
      enemyId: string,
      x: number,
      y: number,
      floorScale: number,
      bossRushEnhanced = false
    ): SimEnemy => {
      const def = ENEMIES[enemyId] ?? ENEMIES.slime;
      let mult = stage.isEndless
        ? (1 + (floorScale - 1) * 0.24 + Math.max(0, floorScale - 10) * 0.09) * loopMult
        : (1 + (floorScale - 1) * 0.21) * loopMult;
      if (gimmickId === 'CHRONO_DISTORTION') {
        mult *= 1 + (floorScale - 1) * 0.05;
      }
      const bossRushHpMult = bossRushEnhanced ? 1.75 : 1;
      const bossRushAtkMult = bossRushEnhanced ? 1.42 : 1;
      const bossRushDefMult = bossRushEnhanced ? 1.35 : 1;
      const enemyAtkSpdScale =
        Math.max(0.72, 1 - (Math.max(1, effectiveLoopCount) - 1) * 0.06) *
        (gimmickId === 'FROZEN_CHILL' ? 1.15 : 1) *
        (gimmickId === 'BLUE_FLAME' ? 0.8 : 1);
      const hpMult = gimmickId === 'ABYSS_PRESSURE' ? 1.15 : 1;
      const atkMult =
        (gimmickId === 'HEAT_WAVE' ? 1.18 : 1) * (gimmickId === 'OMEGA_FIELD' ? 1.2 : 1);
      const defMult = gimmickId === 'FROZEN_CHILL' ? 1.25 : 1;

      return {
        uid: enemyUidCounter++,
        enemyDefId: def.id,
        name: bossRushEnhanced ? `【極】${def.name}` : def.name,
        spriteId: def.spriteId,
        hp: Math.round(def.hp * mult * hpMult * bossRushHpMult),
        maxHp: Math.round(def.hp * mult * hpMult * bossRushHpMult),
        atk: Math.round(def.atk * mult * atkMult * bossRushAtkMult),
        def: Math.round(
          def.def *
            (1 + (floorScale - 1) * 0.1) *
            (1 + (loopMult - 1) * 0.7) *
            defMult *
            bossRushDefMult
        ),
        attackIntervalMs: Math.max(580, Math.round(def.attackIntervalMs * enemyAtkSpdScale)),
        attackTimer: 550 + Math.random() * 450,
        castCount: 0,
        goldDrop: Math.round(
          def.goldDrop *
            (1 + (floorScale - 1) * 0.12) *
            loopRewardMult *
            (bossRushEnhanced ? 1.65 : 1)
        ),
        materialChance: def.materialChance,
        isBoss: !!def.isBoss,
        isElite: !!def.isElite,
        isBossRushEnhanced: bossRushEnhanced,
        scale: bossRushEnhanced ? Math.min(2.25, (def.scale ?? 1) * 1.18) : (def.scale ?? 1),
        x,
        y,
        lungeX: 0,
        hitFlash: 0,
        alive: true,
      };
    };

    const eligibleEvents = DUNGEON_EVENTS.filter(
      (ev) => (ev.minLoop ?? 1) <= effectiveLoopCount
    );
    const eligibleInstantEvents = INSTANT_EVENTS.filter(
      (ev) => (ev.minLoop ?? 1) <= effectiveLoopCount
    );

    const createEncounter = (floor: number, rIdx: number): RoomEncounter => {
      if (stage.isBossRush) {
        const bossId = BOSS_RUSH_BOSS_ORDER[(floor - 1) % BOSS_RUSH_BOSS_ORDER.length];
        return {
          kind: 'BOSS',
          enemies: [spawnEnemy(bossId, 336, 168, floor, true)],
          label: `極BOSS戦 (${floor}/${stage.floors}) · 【極】${ENEMIES[bossId]?.name ?? 'ボス'}`,
        };
      }

      if (stage.isEndless && floor % 5 === 0 && rIdx === 1) {
        const bossIdx = Math.floor(floor / 5) - 1;
        const bossId = BOSS_RUSH_BOSS_ORDER[bossIdx % BOSS_RUSH_BOSS_ORDER.length];
        const enhanced = floor >= 15;
        return {
          kind: 'BOSS',
          enemies: [spawnEnemy(bossId, 342, 168, floor, enhanced)],
          label: `無限BOSS (${floor}F) · ${enhanced ? '【極】' : ''}${ENEMIES[bossId]?.name ?? 'ボス'}`,
        };
      }

      const isFinalBoss = !stage.isEndless && floor === stage.floors && rIdx === 1;
      if (isFinalBoss) {
        return {
          kind: 'BOSS',
          enemies: [spawnEnemy(stage.bossId, 355, 168, floor)],
          label: `BOSS戦 · ${ENEMIES[stage.bossId]?.name ?? 'ボス'}`,
        };
      }

      if (rIdx === 1 && (stage.isEndless || floor < stage.floors)) {
        const roll = Math.random();
        if (roll < 0.48 && eligibleEvents.length > 0) {
          const ev = eligibleEvents[Math.floor(Math.random() * eligibleEvents.length)];
          return {
            kind: 'EVENT_CHOICE',
            enemies: [],
            eventDef: ev,
            eventState: eventModeRef.current === 'MANUAL' ? 'WAITING_CHOICE' : 'AUTO_DELAY',
            autoDelayTimer: 550,
            label: `選択イベント · ${ev.title}`,
          };
        } else if (roll < 0.82 && eligibleInstantEvents.length > 0) {
          const inst =
            eligibleInstantEvents[Math.floor(Math.random() * eligibleInstantEvents.length)];
          return {
            kind: 'EVENT_INSTANT',
            enemies: [],
            instantDef: inst,
            eventState: 'AUTO_DELAY',
            autoDelayTimer: 450,
            label: `突発イベント · ${inst.title}`,
          };
        }
        return {
          kind: 'COMBAT',
          enemies: [spawnEnemy(stage.eliteId, 345, 174, floor)],
          label: '強敵出現',
        };
      }

      const count = floor >= 3 && Math.random() < 0.65 ? 3 : 2;
      const enemies: SimEnemy[] = [];
      for (let i = 0; i < count; i++) {
        const eid = stage.enemyPool[Math.floor(Math.random() * stage.enemyPool.length)];
        enemies.push(spawnEnemy(eid, 315 + i * 44, 174 + (i % 2 === 0 ? 0 : -6), floor));
      }
      return {
        kind: 'COMBAT',
        enemies,
        label: '魔物との遭遇',
      };
    };

    let encounter: RoomEncounter = createEncounter(1, 0);

    const spawnParticles = (x: number, y: number, color: string, count = 8, speedScale = 1) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = (0.4 + Math.random() * 1.6) * speedScale;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd - 0.6,
          life: 260 + Math.random() * 240,
          maxLife: 500,
          color,
          size: Math.random() < 0.5 ? 2 : 3,
        });
      }
    };

    const addFloatText = (x: number, y: number, text: string, color: string) => {
      floatingTexts.push({ x, y, vy: -0.04, text, color, life: 850 });
    };

    const healUnit = (u: SimUnit, amount: number, healerId?: string) => {
      if (!u.alive) return 0;
      const clericMult = hasCleric ? 1.15 : 1;
      const gimmickHealMult = gimmickId === 'CURSED_MIASMA' ? 0.75 : 1;
      const synHealMult = 1 + synBonus.healReceivedPct / 100;
      const finalAmt = Math.max(1, Math.round(amount * clericMult * gimmickHealMult * synHealMult));
      const before = u.hp;
      u.hp = Math.min(u.maxHp, u.hp + finalAmt);
      const gained = u.hp - before;
      if (gained > 0) {
        const sourceId = healerId ?? 'hero';
        if (contribMap[sourceId]) {
          contribMap[sourceId].healingDone += gained;
        }
        addFloatText(u.x + 8, u.y - 6, `+${gained}`, '#34d399');
        spawnParticles(u.x + 12, u.y + 10, '#34d399', 5, 0.7);
      }
      return gained;
    };

    const awardMaterial = (chance: number, forcedMat?: MaterialId) => {
      if (isPracticeRun) {
        if (forcedMat && forcedMat !== 'magic_stone') return;
        const practiceChance = forcedMat === 'magic_stone' ? 0.25 : chance * 0.12;
        if (Math.random() > practiceChance) return;
        materialsEarned.magic_stone += 1;
        pushLog('【仮潜入】素材「魔石」を入手！', 'loot');
        return;
      }
      const adjChance = Math.min(
        1,
        chance * (1 + dropBonusPct / 100) * (1 + (Math.max(1, effectiveDropLoop) - 1) * 0.15)
      );
      if (!forcedMat && Math.random() > adjChance) return;
      let matId: MaterialId = forcedMat ?? 'iron_ore';
      if (!forcedMat) {
        const roll = Math.random();
        if (stage.id >= 3 && roll > 0.72) {
          matId = 'ancient_scroll';
        } else if (roll > 0.45) {
          matId = 'magic_stone';
        }
      }
      materialsEarned[matId] += 1;
      pushLog(`素材「${MATERIAL_INFO[matId].name}」を入手！`, 'loot');
    };

    const applyDamageToEnemy = (
      attackerId: string,
      target: SimEnemy,
      rawAmount: number
    ): number => {
      const dealt = Math.max(0, Math.min(target.hp, rawAmount));
      if (contribMap[attackerId] && dealt > 0) {
        contribMap[attackerId].damageDealt += dealt;
      }
      target.hp = Math.max(0, target.hp - rawAmount);
      return dealt;
    };

    const tryRollEndlessRarePart = (e: SimEnemy) => {
      if (!stage.isEndless || isPracticeRun) return;
      const baseRate = e.isBoss
        ? currentFloor >= 100
          ? 0.007
          : currentFloor >= 50
            ? 0.004
            : 0.002
        : currentFloor >= 100
          ? 0.0003
          : currentFloor >= 50
            ? 0.0002
            : 0.0001;
      const dropScale = Math.min(1.5, 1 + dropBonusPct / 400);
      if (Math.random() >= baseRate * dropScale) return;

      const partId =
        ENDLESS_RARE_PART_IDS[Math.floor(Math.random() * ENDLESS_RARE_PART_IDS.length)];
      const info = MATERIAL_INFO[partId];
      materialsEarned[partId] += 1;
      sound.victory();
      spawnParticles(e.x + 16, e.y + 12, info.color, 18, 1.5);
      addFloatText(e.x + 6, e.y - 20, `★${info.name}!`, info.color);
      pushLog(
        `【超絶レアドロップ】無限回廊 ${currentFloor}Fで鍛冶パーツ「${info.name}」を獲得！！`,
        'loot'
      );
      pushHighlight(
        'RARE_LOOT',
        `幻の鍛冶パーツ「${info.name}」獲得！`,
        `無限回廊 ${currentFloor}F（${e.name}撃破）で超絶低確率パーツを引き当てた！`,
        info.spriteId
      );
    };

    const handleEnemyDefeated = (e: SimEnemy, killerId?: string) => {
      if (!e.alive) return;
      e.alive = false;
      enemiesDefeated += 1;
      if (killerId && contribMap[killerId]) {
        contribMap[killerId].kills += 1;
      }
      const rawGold = Math.round(e.goldDrop * (1 + goldBonusPct / 100));
      const g = isPracticeRun ? calcPracticeGold(rawGold) : rawGold;
      goldEarned += g;
      sound.coin();
      spawnParticles(e.x + 16, e.y + 14, '#facc15', 10, 1.1);
      if (g > 0) {
        addFloatText(e.x + 10, e.y - 12, `+${g}G`, '#facc15');
      }
      awardMaterial(e.materialChance);
      tryRollEndlessRarePart(e);

      if (e.enemyDefId === 'mimic' && !isPracticeRun) {
        const picked = rollDropItem({
          stageId: stage.id,
          loopCount: effectiveDropLoop,
          source: 'CHEST',
          floor: currentFloor,
          isBossRush: stage.isBossRush,
        });
        if (picked) {
          lootedItems.push(picked.id);
          pushLog(`ミミック討伐戦利品「${picked.name}」を獲得！`, 'loot');
        }
      }

      if (e.isBoss) {
        bossesDefeated += 1;
        pushHighlight(
          'BOSS_KILL',
          `ボス「${e.name}」撃破！`,
          `${currentFloor}Fの激闘を制し討伐（勇者残HP ${Math.max(0, heroUnit.hp)}/${heroUnit.maxHp}）`,
          e.spriteId
        );
        if (!isPracticeRun) {
          if (stage.isEndless) {
            const crestGain = Math.max(3, Math.floor(currentFloor / 5) + ENDLESS_BENCHMARK_LOOP);
            endlessCrestsEarned += crestGain;
            pushLog(`【無限ボス撃破】踏破の証 +${crestGain} を獲得！`, 'loot');
            if (currentFloor >= 15 && Math.random() < 0.008) {
              const ultId =
                ULTIMATE_ITEM_IDS[Math.floor(Math.random() * ULTIMATE_ITEM_IDS.length)];
              const ultItem = ITEMS[ultId];
              if (ultItem) {
                lootedItems.push(ultId);
                pushLog(
                  `【無限深淵超レア枠(0.8%)】最強装備「${ultItem.name}」を獲得！！`,
                  'loot'
                );
                pushHighlight(
                  'RARE_LOOT',
                  `最強装備「${ultItem.name}」獲得！`,
                  `無限回廊 ${currentFloor}F ボス討伐時に0.8%の超低確率を引き当てた！`,
                  ultItem.spriteId
                );
              }
            }
          }
          const picked = rollDropItem({
            stageId: stage.id,
            loopCount: effectiveDropLoop,
            source: 'BOSS',
            floor: currentFloor,
            isBossRush: stage.isBossRush,
          });
          if (picked) {
            lootedItems.push(picked.id);
            pushLog(`ボス戦利品「${picked.name}」を獲得！`, 'loot');
            if (picked.rarity === 'RARE' || picked.rarity === 'EPIC') {
              pushHighlight(
                'RARE_LOOT',
                `希少品「${picked.name}」獲得`,
                `${e.name}から${picked.rarity}アイテムを入手！`,
                picked.spriteId
              );
            }
          }
        }
      }
    };

    const tryAutoItems = (trigger: 'LOW_HP' | 'ELITE_OR_PACK' | 'BOSS' | 'ON_DEATH') => {
      for (const slot of carriedSlots) {
        if (!slot.isConsumable || slot.remainingUses <= 0) continue;
        const item = ITEMS[slot.itemId];
        if (!item?.autoEffect || item.autoEffect.trigger !== trigger) continue;
        const effPower = getItemEffectiveAutoPower(slot.itemId, runSave.itemRefineLevels);

        if (trigger === 'LOW_HP') {
          const threshold = (item.autoEffect.thresholdPct ?? 50) / 100;
          const canReactToAllies =
            !!item.autoEffect.reactToAllies || item.rarity === 'RARE' || item.rarity === 'EPIC';

          // Check whether Hero or (if RARE+) any living Ally fell below threshold
          const endangeredUnit = canReactToAllies
            ? party.find((u) => u.alive && u.hp / u.maxHp < threshold)
            : heroUnit.alive && heroUnit.hp / heroUnit.maxHp < threshold
              ? heroUnit
              : undefined;

          if (!endangeredUnit) continue;

          slot.remainingUses -= 1;
          slot.usedInRun = true;
          slot.lastTriggeredAt = Date.now();
          sound.heal();
          bubbles.push({
            x: endangeredUnit.x + 6,
            y: endangeredUnit.y - 22,
            spriteId: item.spriteId,
            life: 950,
          });
          const preRatio = endangeredUnit.hp / endangeredUnit.maxHp;
          let totalHealed = 0;
          const consumableMult = 1 + skillBonus.consumablePowerPct / 100;
          party.forEach((u) => {
            totalHealed += healUnit(u, Math.round(effPower * consumableMult), 'hero');
          });
          if (item.autoEffect.kind === 'HEAL_AND_BUFF') {
            runAtkBuffPct += 20;
            addFloatText(heroUnit.x + 8, heroUnit.y - 18, '攻撃+20%', '#facc15');
          }
          if (preRatio <= 0.3 && !closeCallRecordedThisFloor) {
            closeCallRecordedThisFloor = true;
            pushHighlight(
              'CLOSE_CALL',
              '土壇場の緊急回復',
              `${endangeredUnit.name}の危機（HP ${Math.round(preRatio * 100)}%）に「${item.name}」が即座に発動（総回復+${totalHealed}）`,
              item.spriteId
            );
          }
          const reason = endangeredUnit.isHero
            ? '勇者のピンチに'
            : `${endangeredUnit.name}のHP減少に反応し`;
          pushLog(`${reason}「${item.name}」が発動！全員回復 (+${totalHealed})`, 'heal');
          return true;
        }

        if (trigger === 'ELITE_OR_PACK') {
          slot.remainingUses -= 1;
          slot.usedInRun = true;
          slot.lastTriggeredAt = Date.now();
          sound.bomb();
          bubbles.push({ x: heroUnit.x + 6, y: heroUnit.y - 22, spriteId: item.spriteId, life: 900 });
          const dmg = Math.round(
            effPower * (1 + skillBonus.consumablePowerPct / 100)
          );
          encounter.enemies.forEach((e) => {
            if (!e.alive) return;
            applyDamageToEnemy('hero', e, dmg);
            e.hitFlash = 220;
            spawnParticles(e.x + 16, e.y + 14, '#f97316', 12, 1.4);
            addFloatText(e.x + 12, e.y - 6, `${dmg}`, '#fb923c');
            if (e.hp <= 0) handleEnemyDefeated(e, 'hero');
          });
          pushLog(`「${item.name}」が炸裂！敵全体に ${dmg} ダメージ！`, 'combat');
          return true;
        }

        if (trigger === 'BOSS') {
          slot.remainingUses -= 1;
          slot.usedInRun = true;
          slot.lastTriggeredAt = Date.now();
          sound.heal();
          bubbles.push({ x: heroUnit.x + 6, y: heroUnit.y - 22, spriteId: item.spriteId, life: 1000 });
          if (item.autoEffect.kind === 'BUFF_DEF') {
            bossDefBuffFlat += effPower;
            spawnParticles(heroUnit.x + 12, heroUnit.y + 12, '#38bdf8', 14, 1.2);
            pushLog(`ボス戦開始！「${item.name}」で全員の防御が +${effPower} 上昇！`, 'blessing');
          } else {
            bossAtkBuffPct += effPower;
            spawnParticles(heroUnit.x + 12, heroUnit.y + 12, '#facc15', 14, 1.2);
            pushLog(`ボス戦開始！「${item.name}」で攻撃力が +${effPower}% 上昇！`, 'blessing');
          }
          // Keep checking in case player brought both attack and defense scrolls
          continue;
        }

        if (trigger === 'ON_DEATH') {
          slot.remainingUses -= 1;
          slot.usedInRun = true;
          slot.lastTriggeredAt = Date.now();
          sound.heal();
          heroUnit.alive = true;
          heroUnit.hp = Math.round(heroUnit.maxHp * (effPower / 100));
          bubbles.push({ x: heroUnit.x + 6, y: heroUnit.y - 24, spriteId: item.spriteId, life: 1100 });
          spawnParticles(heroUnit.x + 14, heroUnit.y + 12, '#facc15', 18, 1.5);
          addFloatText(heroUnit.x + 8, heroUnit.y - 10, 'REVIVE!', '#facc15');
          pushLog(`「${item.name}」が輝き、勇者が蘇生した！`, 'blessing');
          pushHighlight(
            'CLOSE_CALL',
            '死の淵からの復活',
            `${currentFloor}Fで力尽きかけた勇者が「${item.name}」の力で蘇生した！`,
            item.spriteId
          );
          return true;
        }
      }
      return false;
    };

    const resolveInstantEvent = (inst: InstantEventDef) => {
      encounter.eventState = 'RESOLVED';
      encounteredEventIds.add(inst.id);
      switch (inst.kind) {
        case 'GOLD_POUCH': {
          const raw = Math.round((24 + stage.id * 16) * (1 + goldBonusPct / 100) * loopRewardMult);
          const g = isPracticeRun ? calcPracticeGold(raw) : raw;
          goldEarned += g;
          sound.coin();
          if (g > 0) addFloatText(340, 155, `+${g}G`, '#facc15');
          spawnParticles(345, 175, '#facc15', 10, 1.1);
          pushLog(
            isPracticeRun
              ? `【自動イベント】落ちていた金貨袋から ${g}G 拾った（仮潜入·低効率）。`
              : `【自動イベント】落ちていた金貨袋から ${g}G 拾った！`,
            'loot'
          );
          phase = 'ROOM_CLEAR';
          clearWaitTimer = 0;
          break;
        }
        case 'GENTLE_BREEZE': {
          sound.heal();
          party.forEach((u) => healUnit(u, Math.round(u.maxHp * 0.25), 'hero'));
          pushLog(`【自動イベント】癒やしの風が吹き抜け、全員のHPが25%回復した！`, 'heal');
          phase = 'ROOM_CLEAR';
          clearWaitTimer = 0;
          break;
        }
        case 'HIDDEN_RACK': {
          sound.coin();
          awardMaterial(1.0);
          if (!isPracticeRun && Math.random() < 0.35) {
            const picked = rollDropItem({
              stageId: stage.id,
              loopCount: effectiveDropLoop,
              source: 'RACK',
              floor: currentFloor,
              isBossRush: stage.isBossRush,
            });
            if (picked) {
              lootedItems.push(picked.id);
              pushLog(`【自動イベント】物資棚から「${picked.name}」を見つけた！`, 'loot');
            }
          } else {
            pushLog(
              isPracticeRun
                ? '【自動イベント】物資棚を調べた（仮潜入のため装備なし）。'
                : `【自動イベント】物資棚から素材を回収した！`,
              'loot'
            );
          }
          phase = 'ROOM_CLEAR';
          clearWaitTimer = 0;
          break;
        }
        case 'FALLING_ROCKS': {
          if (hasThief) {
            const raw = 22 + stage.id * 10;
            const g = isPracticeRun ? calcPracticeGold(raw) : raw;
            goldEarned += g;
            sound.coin();
            addFloatText(330, 160, g > 0 ? `回避 +${g}G` : '回避!', '#34d399');
            pushLog(
              `【自動イベント】落石罠を盗賊カイトが見抜き回避！隙間から ${g}G 見つけた。`,
              'loot'
            );
            pushHighlight(
              'TRAP_EVADE',
              '危機一髪の罠回避',
              `${currentFloor}Fの落石罠を盗賊カイトが見抜き、無傷で回避！`,
              'ally_thief'
            );
          } else {
            const dmg = Math.max(4, Math.round(heroUnit.maxHp * 0.08));
            sound.hit(false);
            party.forEach((u) => {
              if (!u.alive) return;
              u.hp = Math.max(1, u.hp - dmg);
              u.hitFlash = 180;
              addFloatText(u.x + 8, u.y - 6, `-${dmg}`, '#ef4444');
            });
            pushLog(`【自動イベント】天井から落石！パーティ全員が ${dmg} ダメージを受けた。`, 'alert');
          }
          phase = 'ROOM_CLEAR';
          clearWaitTimer = 0;
          break;
        }
        case 'BLESSED_STATUE': {
          sound.heal();
          runDefBuffFlat += 3;
          runAtkBuffPct += 10;
          spawnParticles(heroUnit.x + 12, heroUnit.y + 10, '#38bdf8', 12, 1.1);
          addFloatText(heroUnit.x + 8, heroUnit.y - 10, '攻+10% 防+3', '#38bdf8');
          pushLog(`【自動イベント】戦女神像の加護を受け、攻撃+10%・防御+3を得た！`, 'blessing');
          phase = 'ROOM_CLEAR';
          clearWaitTimer = 0;
          break;
        }
        case 'STRAY_SLIME': {
          const raw = Math.round((32 + stage.id * 18) * (1 + goldBonusPct / 100) * loopRewardMult);
          const g = isPracticeRun ? calcPracticeGold(raw) : raw;
          goldEarned += g;
          enemiesDefeated += 1;
          sound.hit(true);
          sound.coin();
          spawnParticles(345, 175, '#facc15', 14, 1.3);
          if (g > 0) addFloatText(340, 152, `+${g}G`, '#facc15');
          pushLog(
            isPracticeRun
              ? `【自動イベント】はぐれ金スライムを一撃で倒し ${g}G 獲得（仮潜入·低効率）。`
              : `【自動イベント】はぐれ金スライムを一撃で倒し ${g}G 獲得！`,
            'loot'
          );
          phase = 'ROOM_CLEAR';
          clearWaitTimer = 0;
          break;
        }
        case 'GEM_VEIN': {
          const raw = Math.round((30 + stage.id * 15) * (1 + goldBonusPct / 100) * loopRewardMult);
          const g = isPracticeRun ? calcPracticeGold(raw) : raw;
          goldEarned += g;
          sound.coin();
          awardMaterial(1.0, 'magic_stone');
          if (!isPracticeRun && Math.random() < 0.45) {
            awardMaterial(1.0, 'magic_stone');
          }
          if (g > 0) addFloatText(340, 155, `+${g}G`, '#38bdf8');
          spawnParticles(345, 175, '#38bdf8', 12, 1.2);
          pushLog(
            isPracticeRun
              ? `【自動イベント】魔石鉱脈から ${g}G を掘り出した（仮潜入·低効率）。`
              : `【自動イベント】壁面の魔石鉱脈を発見し、魔石と ${g}G を採掘した！`,
            'loot'
          );
          phase = 'ROOM_CLEAR';
          clearWaitTimer = 0;
          break;
        }
      }
      emitHud();
    };

    const pickAutoEventOption = (ev: DungeonEventDef): DungeonEventOption => {
      const hpRatio = heroUnit.hp / heroUnit.maxHp;
      const availableGold = runSave.gold + goldEarned;

      if (ev.id === 'glowing_spring') {
        return hpRatio < 0.72 ? ev.options[0] : ev.options[1];
      }
      if (ev.id === 'wandering_peddler') {
        if (hpRatio < 0.6 && availableGold >= 25) return ev.options[0];
        if (availableGold >= 30) return ev.options[1];
        return ev.options[2];
      }
      if (ev.id === 'forked_corridor') {
        return hpRatio > 0.65 ? ev.options[0] : ev.options[1];
      }
      if (ev.id === 'ancient_altar') {
        return hpRatio > 0.55 ? ev.options[0] : ev.options[1];
      }
      if (ev.id === 'mysterious_chest') {
        return hasThief || hpRatio > 0.78 ? ev.options[1] : ev.options[0];
      }
      if (ev.id === 'mimic_chest') {
        return hasThief || hpRatio > 0.65 ? ev.options[0] : ev.options[1];
      }
      if (ev.id === 'wandering_alchemist') {
        if (hpRatio < 0.68 && availableGold >= 40) return ev.options[0];
        return ev.options[1];
      }
      if (ev.id === 'gamble_altar') {
        if (hpRatio > 0.72) return ev.options[0];
        return availableGold >= 20 ? ev.options[1] : ev.options[0];
      }
      return ev.options[0];
    };

    const resolveEventOption = (opt: DungeonEventOption, isAuto: boolean) => {
      const prefix = isAuto ? '【自動選択】' : '【選択】';
      pushLog(`${prefix}${opt.label}`, 'blessing');
      encounter.eventState = 'RESOLVED';
      onEventPromptRef.current(null);

      switch (opt.outcome) {
        case 'SAFE_CHEST': {
          const baseG = 28 + stage.id * 16 + (hasThief ? 20 : 0);
          const raw = Math.round(baseG * (1 + goldBonusPct / 100) * loopRewardMult);
          const g = isPracticeRun ? calcPracticeGold(raw) : raw;
          goldEarned += g;
          sound.coin();
          if (g > 0) addFloatText(340, 155, `+${g}G`, '#facc15');
          spawnParticles(345, 175, '#facc15', 12, 1.2);
          awardMaterial(0.95);
          pushLog(
            isPracticeRun
              ? `慎重に宝箱を開けて ${g}G を手に入れた（仮潜入·低効率）。`
              : `慎重に宝箱を開けて ${g}G と素材を手に入れた！`,
            'loot'
          );
          phase = 'ROOM_CLEAR';
          clearWaitTimer = 0;
          break;
        }
        case 'RISKY_CHEST': {
          const baseG = 45 + stage.id * 22;
          const raw = Math.round(baseG * (1 + goldBonusPct / 100) * loopRewardMult);
          const g = isPracticeRun ? calcPracticeGold(raw) : raw;
          goldEarned += g;
          sound.coin();
          if (g > 0) addFloatText(340, 155, `+${g}G`, '#facc15');
          spawnParticles(345, 175, '#facc15', 14, 1.3);

          if (Math.random() < 0.65 || hasThief) {
            if (!isPracticeRun) {
              const picked = rollDropItem({
                stageId: stage.id,
                loopCount: effectiveDropLoop,
                source: 'CHEST',
                floor: currentFloor,
                isBossRush: stage.isBossRush,
              });
              if (picked) {
                lootedItems.push(picked.id);
                pushLog(`大当たり！${g}G と「${picked.name}」を手に入れた！`, 'loot');
                if (picked.rarity === 'RARE' || picked.rarity === 'EPIC') {
                  pushHighlight(
                    'RARE_LOOT',
                    `宝箱から「${picked.name}」発見`,
                    `危険を冒して開けた宝箱から${picked.rarity}アイテムを引き当てた！`,
                    picked.spriteId
                  );
                }
              }
            } else {
              pushLog(`強引に宝箱を開けて ${g}G を回収した（仮潜入のため装備なし）。`, 'loot');
            }
          } else {
            const dmg = Math.max(6, Math.round(heroUnit.maxHp * 0.14));
            heroUnit.hp = Math.max(1, heroUnit.hp - dmg);
            heroUnit.hitFlash = 220;
            sound.hit(false);
            addFloatText(heroUnit.x + 8, heroUnit.y - 6, `-${dmg}`, '#ef4444');
            pushLog(`毒針の罠で ${dmg} ダメージを受けた！`, 'alert');
          }
          phase = 'ROOM_CLEAR';
          clearWaitTimer = 0;
          break;
        }
        case 'HEAL_SPRING': {
          sound.heal();
          party.forEach((u) => healUnit(u, Math.round(u.maxHp * 0.45)));
          pushLog('清らかな泉の水を飲み、パーティの体力が大きく回復した！', 'heal');
          phase = 'ROOM_CLEAR';
          clearWaitTimer = 0;
          break;
        }
        case 'DIVE_SPRING': {
          const raw = Math.round((40 + stage.id * 18) * (1 + goldBonusPct / 100) * loopRewardMult);
          const g = isPracticeRun ? calcPracticeGold(raw) : raw;
          goldEarned += g;
          sound.coin();
          if (g > 0) addFloatText(340, 155, `+${g}G`, '#facc15');
          awardMaterial(1.0, 'magic_stone');
          if (Math.random() < 0.3) {
            const dmg = Math.max(5, Math.round(heroUnit.maxHp * 0.1));
            heroUnit.hp = Math.max(1, heroUnit.hp - dmg);
            addFloatText(heroUnit.x + 8, heroUnit.y - 6, `-${dmg}`, '#38bdf8');
            pushLog(
              isPracticeRun
                ? `水底から ${g}G を拾ったが、冷気で ${dmg} ダメージ！（仮潜入·低効率）`
                : `水底から ${g}G と魔石を拾ったが、冷気で ${dmg} ダメージ！`,
              'alert'
            );
          } else {
            pushLog(
              isPracticeRun
                ? `泉の底から ${g}G を拾い上げた（仮潜入·低効率）。`
                : `泉の底から ${g}G と魔石を拾い上げた！`,
              'loot'
            );
          }
          phase = 'ROOM_CLEAR';
          clearWaitTimer = 0;
          break;
        }
        case 'ALTAR_SACRIFICE': {
          const cost = Math.max(5, Math.round(heroUnit.maxHp * 0.15));
          heroUnit.hp = Math.max(1, heroUnit.hp - cost);
          heroUnit.hitFlash = 180;
          runAtkBuffPct += 20;
          sound.heal();
          awardMaterial(1.0, 'magic_stone');
          spawnParticles(heroUnit.x + 12, heroUnit.y + 12, '#ef4444', 12, 1.2);
          addFloatText(heroUnit.x + 8, heroUnit.y - 10, '攻撃+20%', '#f97316');
          pushLog(
            `体力を捧げて石碑の力を得た！（攻撃力+20%${isPracticeRun ? '' : ' · 魔石+1'}）`,
            'blessing'
          );
          phase = 'ROOM_CLEAR';
          clearWaitTimer = 0;
          break;
        }
        case 'ALTAR_PRAY': {
          sound.heal();
          party.forEach((u) => healUnit(u, Math.round(u.maxHp * 0.15)));
          awardMaterial(1.0, 'ancient_scroll');
          pushLog(
            isPracticeRun
              ? '祈りを捧げ、パーティが少し回復した。'
              : '祈りを捧げ、古文書を1つ授かった。',
            'loot'
          );
          phase = 'ROOM_CLEAR';
          clearWaitTimer = 0;
          break;
        }
        case 'PEDDLER_HEAL': {
          const cost = opt.goldCost ?? 25;
          if (!isPracticeRun && runSave.gold + goldEarned >= cost) {
            goldEarned -= cost;
            sound.heal();
            party.forEach((u) => healUnit(u, 70));
            pushLog(`${cost}G を行商人に支払い、特製薬で全員のHPが回復した！`, 'heal');
          } else if (isPracticeRun) {
            pushLog('仮潜入中は行商人との取引を行えません。', 'info');
          } else {
            pushLog('ゴールドが足りず取引できなかった。', 'info');
          }
          phase = 'ROOM_CLEAR';
          clearWaitTimer = 0;
          break;
        }
        case 'PEDDLER_MATS': {
          const cost = opt.goldCost ?? 30;
          if (!isPracticeRun && runSave.gold + goldEarned >= cost) {
            goldEarned -= cost;
            sound.buy();
            awardMaterial(1.0);
            awardMaterial(1.0);
            pushLog(`${cost}G で素材袋を購入した！`, 'loot');
          } else if (isPracticeRun) {
            pushLog('仮潜入中は行商人との取引を行えません。', 'info');
          } else {
            pushLog('ゴールドが足りず取引できなかった。', 'info');
          }
          phase = 'ROOM_CLEAR';
          clearWaitTimer = 0;
          break;
        }
        case 'FORK_ELITE': {
          const elite = spawnEnemy(stage.eliteId, 345, 174, currentFloor);
          elite.goldDrop = Math.round(elite.goldDrop * 1.5);
          encounteredEnemyIds.add(elite.enemyDefId);
          encounter = {
            kind: 'COMBAT',
            enemies: [elite],
            label: `強敵ルート · ${elite.name}`,
          };
          markEquipmentUsed();
          pushLog(`右の道で強敵「${elite.name}」と戦闘になった！`, 'combat');
          tryAutoItems('ELITE_OR_PACK');
          break;
        }
        case 'FORK_REST': {
          sound.heal();
          party.forEach((u) => healUnit(u, Math.round(u.maxHp * 0.25), 'hero'));
          pushLog('静かな抜け道で息を整えた（HP25%回復）。', 'heal');
          phase = 'ROOM_CLEAR';
          clearWaitTimer = 0;
          break;
        }
        case 'MIMIC_CHEST': {
          if (Math.random() < (hasThief ? 0.55 : 0.42)) {
            const raw = Math.round((85 + stage.id * 34) * (1 + goldBonusPct / 100) * loopRewardMult);
            const g = isPracticeRun ? calcPracticeGold(raw) : raw;
            goldEarned += g;
            sound.coin();
            if (g > 0) addFloatText(340, 155, `+${g}G`, '#facc15');
            awardMaterial(1.0, 'magic_stone');
            if (!isPracticeRun) {
              const picked = rollDropItem({
                stageId: stage.id,
                loopCount: effectiveDropLoop,
                source: 'CHEST',
                floor: currentFloor,
                isBossRush: stage.isBossRush,
              });
              if (picked) {
                lootedItems.push(picked.id);
                pushLog(`黄金宝箱だった！${g}G と「${picked.name}」を獲得！`, 'loot');
              } else {
                pushLog(`黄金宝箱から ${g}G と魔石を獲得！`, 'loot');
              }
            } else {
              pushLog(`黄金宝箱から ${g}G を回収（仮潜入·低効率）。`, 'loot');
            }
            phase = 'ROOM_CLEAR';
            clearWaitTimer = 0;
          } else {
            const mimicEnemy = spawnEnemy('mimic', 345, 174, currentFloor);
            encounteredEnemyIds.add('mimic');
            encounter = {
              kind: 'COMBAT',
              enemies: [mimicEnemy],
              label: `擬態魔物 · ${mimicEnemy.name}`,
            };
            markEquipmentUsed();
            pushLog(`宝箱が牙を剥いた！「${mimicEnemy.name}」が出現！`, 'alert');
            tryAutoItems('ELITE_OR_PACK');
          }
          break;
        }
        case 'ALCHEMIST_BREW': {
          const cost = opt.goldCost ?? 40;
          if (!isPracticeRun && runSave.gold + goldEarned >= cost) {
            goldEarned -= cost;
            runAtkBuffPct += 25;
            sound.heal();
            party.forEach((u) => healUnit(u, Math.round(u.maxHp * 0.5), 'hero'));
            addFloatText(heroUnit.x + 8, heroUnit.y - 16, '攻撃+25%', '#a855f7');
            pushLog(`${cost}Gで秘薬を調合してもらい、攻撃+25%＆全員HP50%回復！`, 'blessing');
          } else if (isPracticeRun) {
            pushLog('仮潜入中は錬金術師との取引を行えません。', 'info');
          } else {
            pushLog('ゴールドが足りず調合を諦めた。', 'info');
          }
          phase = 'ROOM_CLEAR';
          clearWaitTimer = 0;
          break;
        }
        case 'ALCHEMIST_SELL': {
          const raw = Math.round((52 + stage.id * 24) * (1 + goldBonusPct / 100) * loopRewardMult);
          const g = isPracticeRun ? calcPracticeGold(raw) : raw;
          goldEarned += g;
          sound.coin();
          if (g > 0) addFloatText(340, 155, `+${g}G`, '#facc15');
          awardMaterial(0.9, 'magic_stone');
          if (!isPracticeRun && Math.random() < 0.45) {
            awardMaterial(1.0, 'ancient_scroll');
          }
          pushLog(
            isPracticeRun
              ? `放浪錬金術師に鑑定買い取りしてもらった（+${g}G · 仮潜入·低効率）。`
              : `放浪錬金術師の鑑定で ${g}G と希少素材を手に入れた！`,
            'loot'
          );
          phase = 'ROOM_CLEAR';
          clearWaitTimer = 0;
          break;
        }
        case 'GAMBLE_HIGH': {
          const hpCost = Math.max(5, Math.round(heroUnit.maxHp * 0.25));
          heroUnit.hp = Math.max(1, heroUnit.hp - hpCost);
          heroUnit.hitFlash = 180;
          if (Math.random() < 0.68) {
            const raw = Math.round((88 + stage.id * 35) * (1 + goldBonusPct / 100) * loopRewardMult);
            const g = isPracticeRun ? calcPracticeGold(raw) : raw;
            goldEarned += g;
            runAtkBuffPct += 25;
            sound.victory();
            if (g > 0) addFloatText(heroUnit.x + 8, heroUnit.y - 16, `大吉!+${g}G`, '#facc15');
            awardMaterial(1.0, 'magic_stone');
            awardMaterial(1.0, 'ancient_scroll');
            pushLog(
              isPracticeRun
                ? `運命の天秤は大吉！攻撃+25%＆+${g}G（仮潜入·低効率）`
                : `運命の天秤は大吉！+${g}G・魔石・古文書・攻撃+25%を獲得！`,
              'loot'
            );
          } else {
            const extraDmg = Math.max(4, Math.round(heroUnit.maxHp * 0.12));
            heroUnit.hp = Math.max(1, heroUnit.hp - extraDmg);
            sound.hit(false);
            addFloatText(heroUnit.x + 8, heroUnit.y - 10, `凶-${hpCost + extraDmg}`, '#ef4444');
            pushLog(`天秤は凶と出た…合計 ${hpCost + extraDmg} ダメージを受けた。`, 'alert');
          }
          phase = 'ROOM_CLEAR';
          clearWaitTimer = 0;
          break;
        }
        case 'GAMBLE_SAFE': {
          const cost = opt.goldCost ?? 20;
          if (!isPracticeRun && runSave.gold + goldEarned >= cost) {
            goldEarned -= cost;
            sound.heal();
            party.forEach((u) => healUnit(u, Math.round(u.maxHp * 0.35), 'hero'));
            pushLog(`${cost}G を祭壇に供え、全員のHPが35%回復した！`, 'heal');
          } else if (isPracticeRun) {
            pushLog('仮潜入中はゴールド供物を行えません。', 'info');
          } else {
            pushLog('ゴールドが足りず祈りのみ捧げた。', 'info');
          }
          phase = 'ROOM_CLEAR';
          clearWaitTimer = 0;
          break;
        }
        case 'SKIP':
        default: {
          pushLog('何もせず先へ進んだ。', 'info');
          phase = 'ROOM_CLEAR';
          clearWaitTimer = 0;
          break;
        }
      }
      emitHud();
    };

    const finishRun = (victory: boolean, cause: string) => {
      if (phase === 'FINISHED') return;
      phase = 'FINISHED';
      onEventPromptRef.current(null);
      const crestsEarned = isPracticeRun
        ? 0
        : stage.isEndless
          ? endlessCrestsEarned
          : victory
            ? (stage.isBossRush ? 14 : stage.id) * Math.max(1, runSave.loopCount) +
              skillBonus.extraCrests
            : 0;
      if (victory) {
        if (isPracticeRun) {
          const practiceBonus = Math.max(5, Math.floor(stage.clearBonusGold * PRACTICE_GOLD_RATE));
          goldEarned += practiceBonus;
          const clearStone = Math.random() < 0.25 ? 1 : 0;
          if (clearStone > 0) {
            materialsEarned.magic_stone += clearStone;
          }
          sound.victory();
          pushLog(
            `【仮潜入】${stage.name}（第${effectiveLoopCount}周倍率）を模擬踏破！ +${practiceBonus}G${clearStone > 0 ? ' · 魔石+1' : ''}（他報酬・記録なし）`,
            'loot'
          );
        } else {
          const bonus = Math.round(stage.clearBonusGold * (1 + goldBonusPct / 100) * loopRewardMult);
          goldEarned += bonus;
          sound.victory();
          pushLog(
            `${stage.name}を踏破！踏破ボーナス +${bonus}G · 踏破の証 +${crestsEarned}`,
            'loot'
          );

          if (stage.isBossRush) {
            if (Math.random() < 0.02) {
              const ultId =
                ULTIMATE_ITEM_IDS[Math.floor(Math.random() * ULTIMATE_ITEM_IDS.length)];
              const ultItem = ITEMS[ultId];
              if (ultItem) {
                lootedItems.push(ultId);
                pushLog(
                  `【ボスラッシュ制覇超レア枠(2%)】最強装備「${ultItem.name}」を獲得！！`,
                  'loot'
                );
                pushHighlight(
                  'RARE_LOOT',
                  `最強装備「${ultItem.name}」獲得！`,
                  '強化ボスラッシュ制覇時に2%の超低確率を引き当てた！',
                  ultItem.spriteId
                );
              }
            }
          } else if (stage.isSecret && Math.random() < 0.005) {
            const ultId =
              ULTIMATE_ITEM_IDS[Math.floor(Math.random() * ULTIMATE_ITEM_IDS.length)];
            const ultItem = ITEMS[ultId];
            if (ultItem) {
              lootedItems.push(ultId);
              pushLog(
                `【裏ダンジョン踏破超レア枠(0.5%)】最強装備「${ultItem.name}」を獲得！！`,
                'loot'
              );
              pushHighlight(
                'RARE_LOOT',
                `最強装備「${ultItem.name}」獲得！`,
                `${stage.name}踏破時に0.5%の超低確率を引き当てた！`,
                ultItem.spriteId
              );
            }
          }
        }
      } else {
        if (stage.isEndless && !isPracticeRun) {
          sound.victory();
          pushLog(
            `無限回廊 ${currentFloor}F に到達！獲得した財宝・踏破の証(+${crestsEarned})を持ち帰ります。`,
            'loot'
          );
        } else {
          sound.defeat();
          pushLog(cause, 'alert');
        }
      }

      const consumedItems = isPracticeRun
        ? []
        : carriedSlots.filter((s) => s.usedInRun).map((s) => s.itemId);
      const usedConsumablesCount = carriedSlots.filter(
        (s) => s.isConsumable && s.usedInRun
      ).length;

      const finalHighlights = [...highlights];
      if (peakHit && (peakHit.dmg >= 35 || finalHighlights.length < 2)) {
        finalHighlights.push({
          id: highlightIdCounter++,
          floor: peakHit.floor,
          timeText: peakHit.timeText,
          kind: 'BIG_CRIT',
          title: `最大ダメージ ${peakHit.dmg} DMG`,
          detail: `${peakHit.floor}Fで${peakHit.attackerName}が${peakHit.targetName}に放った${peakHit.isTriple ? '奥義斬撃' : '会心の一撃'}`,
          spriteId: peakHit.spriteId,
        });
      }
      finalHighlights.sort((a, b) => a.id - b.id);

      const partyContributions = party.map((u) => ({ ...contribMap[u.id] }));
      const totalDamageDealt = partyContributions.reduce((s, c) => s + c.damageDealt, 0);
      const totalHealingDone = partyContributions.reduce((s, c) => s + c.healingDone, 0);
      const consumableActivations = carriedSlots.reduce(
        (sum, s) => sum + (s.isConsumable ? Math.max(0, s.maxUses - s.remainingUses) : 0),
        0
      );

      emitHud();
      finishTimer = setTimeout(() => {
        onCompleteRef.current({
          victory,
          stageId: stage.id,
          stageName: stage.name,
          loopCount: runSave.loopCount,
          reachedFloor: currentFloor,
          totalFloors: stage.floors,
          enemiesDefeated,
          goldEarned,
          crestsEarned,
          materialsEarned: isPracticeRun
            ? {
                iron_ore: 0,
                magic_stone: materialsEarned.magic_stone,
                ancient_scroll: 0,
                abyss_shard: 0,
                void_gear: 0,
                chaos_prism: 0,
              }
            : { ...materialsEarned },
          lootedItems: isPracticeRun ? [] : [...lootedItems],
          consumedItems,
          encounteredEnemyIds: isPracticeRun ? [] : Array.from(encounteredEnemyIds),
          encounteredEventIds: isPracticeRun ? [] : Array.from(encounteredEventIds),
          highlights: finalHighlights.slice(0, 10),
          durationSec: Math.max(1, Math.round(elapsedSimMs / 1000)),
          causeOfReturn: isPracticeRun
            ? victory
              ? `【仮潜入】第${effectiveLoopCount}周倍率で ${stage.name} を模擬踏破（低効率G・魔石のみ獲得）`
              : `【仮潜入】第${effectiveLoopCount}周倍率（${currentFloor}F）から撤退（低効率G・魔石のみ持帰／消費なし）`
            : stage.isEndless
              ? `無限回廊 ${currentFloor}F に到達して帰還（獲得した財宝・踏破の証+${crestsEarned}をすべて持ち帰り）`
              : cause,
          maxHitDamage,
          usedConsumablesCount,
          allPartySurvived: party.every((u) => u.alive),
          hadFullParty: party.length >= 3,
          pouchItemCount: carriedSlots.length,
          heroHpPct: Math.round((Math.max(0, heroUnit.hp) / heroUnit.maxHp) * 100),
          isBossRush: !!stage.isBossRush,
          isEndless: !!stage.isEndless,
          isPracticeRun,
          effectiveLoopCount,
          partyContributions,
          totalDamageDealt,
          totalHealingDone,
          bossesDefeated,
          consumableActivations,
        });
      }, 650);
    };

    const posLabels = ['前衛', '中衛', '後衛'];
    const emitHud = () => {
      const boss = encounter.enemies.find((e) => e.isBoss && e.alive);
      onHudUpdateRef.current({
        floor: currentFloor,
        totalFloors: stage.floors,
        roomLabel: encounter.label,
        goldEarned,
        materialsEarned: isPracticeRun
          ? {
              iron_ore: 0,
              magic_stone: materialsEarned.magic_stone,
              ancient_scroll: 0,
              abyss_shard: 0,
              void_gear: 0,
              chaos_prism: 0,
            }
          : { ...materialsEarned },
        lootedItems: isPracticeRun ? [] : [...lootedItems],
        enemiesDefeated,
        unisonGauge,
        hasUnison: party.length >= 2,
        gimmickName: stage.gimmick.name,
        gimmickShort: stage.gimmick.shortEffect,
        gimmickStackCount,
        party: party.map((u, i) => ({
          id: u.id,
          name: u.name,
          spriteId: u.spriteId,
          hp: Math.max(0, u.hp),
          maxHp: u.maxHp,
          isHero: u.isHero,
          positionLabel: party.length === 2 && i === 1 ? '後衛' : posLabels[i] ?? '後衛',
        })),
        carriedSlots: carriedSlots.map((s) => ({ ...s })),
        bossInfo: boss ? { name: boss.name, hp: boss.hp, maxHp: boss.maxHp } : null,
        isBossIntro: phase === 'BOSS_INTRO',
        isBossRush: !!stage.isBossRush,
        isEndless: !!stage.isEndless,
        isPracticeRun,
        effectiveLoopCount,
      });
    };

    if (isPracticeRun) {
      pushLog(
        `【仮潜入】第${effectiveLoopCount}周の強化倍率（${loopMult}倍）で ${stage.name} (全${stage.floors}階) に挑戦！（低効率でG・魔石のみ獲得／消費・進行記録なし）`,
        'blessing'
      );
    } else if (stage.isEndless) {
      pushLog(
        `【固定チャレンジ · 第${ENDLESS_BENCHMARK_LOOP}周目基準 (${loopMult}倍)】${stage.name} (無限階層) の攻略を開始！`,
        'blessing'
      );
    } else {
      pushLog(
        `【第${runSave.loopCount}周】${stage.name} (全${stage.floors}階) の攻略を開始！`,
        'info'
      );
    }
    pushLog(`【特殊ギミック】${stage.gimmick.name}：${stage.gimmick.description}`, 'blessing');
    if (activeSynergies.length > 0) {
      pushLog(
        `【シナジー発動】${activeSynergies.map((s) => s.name).join(' / ')}`,
        'blessing'
      );
    }
    emitHud();

    let lastTime = performance.now();
    let hudTimer = 0;
    let rafId = 0;
    let finishTimer: ReturnType<typeof setTimeout> | null = null;
    let animClock = 0;

    const tick = (now: number) => {
      const rawDt = Math.min(50, now - lastTime);
      lastTime = now;

      if (retreatRef.current > 0 && phase !== 'FINISHED') {
        finishRun(false, '拠点へ帰還しました（使用アイテムは消費、獲得品は持ち帰り）');
      }

      if (
        phase === 'ENCOUNTER' &&
        encounter.kind === 'EVENT_CHOICE' &&
        encounter.eventState === 'WAITING_CHOICE' &&
        eventSelectionRef.current &&
        eventSelectionRef.current.nonce !== lastHandledNonceRef.current
      ) {
        lastHandledNonceRef.current = eventSelectionRef.current.nonce;
        resolveEventOption(eventSelectionRef.current.option, false);
      }

      const isWaitingManualChoice =
        phase === 'ENCOUNTER' &&
        encounter.kind === 'EVENT_CHOICE' &&
        encounter.eventState === 'WAITING_CHOICE';

      const stepSim = (dt: number) => {
        elapsedSimMs += dt;
        animClock += dt;

        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx * (dt / 16);
          p.y += p.vy * (dt / 16);
          p.vy += 0.04 * (dt / 16);
          p.life -= dt;
          if (p.life <= 0) particles.splice(i, 1);
        }

        for (let i = floatingTexts.length - 1; i >= 0; i--) {
          const ft = floatingTexts[i];
          ft.y += ft.vy * dt;
          ft.life -= dt;
          if (ft.life <= 0) floatingTexts.splice(i, 1);
        }

        for (let i = bubbles.length - 1; i >= 0; i--) {
          bubbles[i].life -= dt;
          if (bubbles[i].life <= 0) bubbles.splice(i, 1);
        }

        party.forEach((u) => {
          if (u.hitFlash > 0) u.hitFlash = Math.max(0, u.hitFlash - dt);
          u.lungeX *= Math.pow(0.86, dt / 16);
        });
        encounter.enemies.forEach((e) => {
          if (e.hitFlash > 0) e.hitFlash = Math.max(0, e.hitFlash - dt);
          e.lungeX *= Math.pow(0.86, dt / 16);
        });

        for (let i = projectiles.length - 1; i >= 0; i--) {
          const pr = projectiles[i];
          pr.progress += pr.speed * dt;
          if (pr.progress >= 1) {
            spawnParticles(pr.tx, pr.ty, pr.color, pr.kind === 'FIREBALL' ? 12 : 5, 1.1);
            projectiles.splice(i, 1);
          }
        }

        if (phase === 'MARCHING') {
          marchTimer += dt;
          cameraX += 0.11 * dt;
          if (Math.random() < 0.14 * (dt / 16)) {
            spawnParticles(heroUnit.x + 6, heroUnit.y + 30, '#64748b', 1, 0.35);
          }
          if (marchTimer >= 1150) {
            marchTimer = 0;
            if (encounter.kind === 'BOSS') {
              phase = 'BOSS_INTRO';
              bossIntroElapsed = 0;
              bossIntroDuration = getBossIntroDuration(speedRef.current);
              sound.bossWarning(!!stage.isBossRush);
              emitHud();
              return;
            }
            phase = 'ENCOUNTER';

            if (encounter.kind === 'COMBAT') {
              markEquipmentUsed();
              encounter.enemies.forEach((en) => encounteredEnemyIds.add(en.enemyDefId));
              pushLog(`${currentFloor}F: ${encounter.enemies.map((e) => e.name).join('・')}が出現！`, 'combat');
              if (encounter.enemies.length >= 2 || encounter.enemies.some((e) => e.isElite)) {
                tryAutoItems('ELITE_OR_PACK');
              }
            } else if (encounter.kind === 'EVENT_CHOICE' && encounter.eventDef) {
              encounteredEventIds.add(encounter.eventDef.id);
              pushLog(`${currentFloor}Fイベント: ${encounter.eventDef.title}`, 'blessing');
              if (eventModeRef.current === 'MANUAL') {
                encounter.eventState = 'WAITING_CHOICE';
                onEventPromptRef.current(encounter.eventDef);
              } else {
                encounter.eventState = 'AUTO_DELAY';
                encounter.autoDelayTimer = 550;
              }
            } else if (encounter.kind === 'EVENT_INSTANT' && encounter.instantDef) {
              encounteredEventIds.add(encounter.instantDef.id);
              encounter.eventState = 'AUTO_DELAY';
              encounter.autoDelayTimer = 420;
            }
            emitHud();
          }
        } else if (phase === 'ENCOUNTER') {
          if (encounter.kind === 'EVENT_CHOICE' && encounter.eventDef) {
            if (encounter.eventState === 'AUTO_DELAY') {
              if (eventModeRef.current === 'MANUAL') {
                encounter.eventState = 'WAITING_CHOICE';
                onEventPromptRef.current(encounter.eventDef);
                emitHud();
                return;
              }
              encounter.autoDelayTimer = (encounter.autoDelayTimer ?? 0) - dt;
              if ((encounter.autoDelayTimer ?? 0) <= 0) {
                const autoOpt = pickAutoEventOption(encounter.eventDef);
                resolveEventOption(autoOpt, true);
              }
            }
          } else if (encounter.kind === 'EVENT_INSTANT' && encounter.instantDef) {
            if (encounter.eventState === 'AUTO_DELAY') {
              encounter.autoDelayTimer = (encounter.autoDelayTimer ?? 0) - dt;
              if ((encounter.autoDelayTimer ?? 0) <= 0) {
                resolveInstantEvent(encounter.instantDef);
              }
            }
          } else {
            // Combat simulation
            const livingEnemies = encounter.enemies.filter((e) => e.alive);
            const livingParty = party.filter((u) => u.alive);

            if (livingEnemies.length === 0) {
              phase = 'ROOM_CLEAR';
              clearWaitTimer = 0;
              emitHud();
            } else if (!heroUnit.alive) {
              const revived = tryAutoItems('ON_DEATH');
              if (!revived && skillBonus.deathSave && !usedSkillDeathSave) {
                usedSkillDeathSave = true;
                heroUnit.alive = true;
                heroUnit.hp = Math.max(1, Math.round(heroUnit.maxHp * 0.7));
                party.forEach((member) => {
                  if (!member.isHero && member.alive) {
                    healUnit(member, member.maxHp * 0.35);
                  }
                });
                sound.heal();
                spawnParticles(heroUnit.x + 14, heroUnit.y + 12, '#38bdf8', 22, 1.5);
                addFloatText(heroUnit.x + 8, heroUnit.y - 12, '聖域復活!', '#38bdf8');
                pushLog('【奥義】聖域の守護者が発動！勇者がHP70%で復活し仲間も回復した！', 'blessing');
                pushHighlight(
                  'CLOSE_CALL',
                  '奥義による奇跡の生還',
                  `${currentFloor}Fで致死ダメージを耐え抜き、【聖域の守護者】でHP70%に復活した！`,
                  'hero'
                );
              } else if (!revived) {
                finishRun(false, `${currentFloor}Fで力尽きた…戦利品を持って拠点へ帰還`);
              }
            } else {
              livingParty.forEach((u) => {
                u.attackTimer -= dt;
                if (u.attackTimer > 0) return;
                const chronoSpdMult =
                  gimmickId === 'CHRONO_DISTORTION' ? 1 + gimmickStackCount * 0.05 : 1;
                u.attackTimer = Math.max(360, Math.round(u.attackIntervalMs / chronoSpdMult));
                u.castCount += 1;

                // Party Unison Gauge charge & burst (requires >= 1 active ally)
                if (party.length >= 2) {
                  const unisonGain = Math.max(
                    1,
                    Math.round(7 * (1 + synBonus.unisonChargePct / 100))
                  );
                  unisonGauge = Math.min(100, unisonGauge + unisonGain);
                  if (unisonGauge >= 100 && livingEnemies.length > 0) {
                    unisonGauge = 0;
                    const combinedAtk = livingParty.reduce((s, m) => s + m.atk, 0);
                    const burstDmg = Math.max(
                      12,
                      Math.round(combinedAtk * (1.15 + runAtkBuffPct / 100))
                    );
                    if (burstDmg > maxHitDamage) maxHitDamage = burstDmg;
                    sound.bomb();
                    livingEnemies.forEach((en) => {
                      if (!en.alive) return;
                      const dealt = Math.min(en.hp, burstDmg);
                      const share = Math.max(1, Math.round(dealt / livingParty.length));
                      livingParty.forEach((m) => {
                        if (contribMap[m.id]) contribMap[m.id].damageDealt += share;
                      });
                      en.hp = Math.max(0, en.hp - burstDmg);
                      en.hitFlash = 220;
                      addFloatText(en.x + 10, en.y - 14, `連携!${burstDmg}`, '#38bdf8');
                      spawnParticles(en.x + 14, en.y + 12, '#38bdf8', 12, 1.3);
                      if (en.hp <= 0) handleEnemyDefeated(en, livingParty[0].id);
                    });
                    livingParty.forEach((m) => healUnit(m, Math.round(m.maxHp * 0.12), 'hero'));
                    pushLog(
                      `【絆の連携奥義】ユニゾンバースト発動！敵全体に ${burstDmg} ダメージ＆全員HP12%回復！`,
                      'blessing'
                    );
                  }
                }

                const isAllyOverdrive =
                  !u.isHero && skillBonus.allyOverdrive && u.castCount % 3 === 0;

                if (u.role === 'HEALER') {
                  const injured = [...livingParty].sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
                  if (injured && (injured.hp < injured.maxHp * 0.88 || isAllyOverdrive)) {
                    const healPower =
                      u.atk *
                      (1.25 + u.awakeningRank * 0.25) *
                      (isAllyOverdrive ? 1.45 : 1);
                    const healed = healUnit(injured, healPower, u.id);
                    if (isAllyOverdrive || (u.awakeningRank > 0 && Math.random() < 0.35)) {
                      livingParty.forEach((ally) => {
                        if (ally.id !== injured.id) {
                          healUnit(ally, healPower * (isAllyOverdrive ? 0.65 : 0.4), u.id);
                        }
                      });
                    }
                    sound.heal();
                    projectiles.push({
                      x: u.x + 18,
                      y: u.y + 10,
                      tx: injured.x + 14,
                      ty: injured.y + 12,
                      progress: 0,
                      speed: 0.005,
                      color: isAllyOverdrive ? '#38bdf8' : '#34d399',
                      size: 4,
                      kind: 'HOLY',
                    });
                    if (healed > 0 && !isAllyOverdrive) return;
                  }
                }

                const target = livingEnemies.find((e) => e.alive);
                if (!target) return;

                if (u.role === 'MAGE' && (u.castCount % 3 === 0 || isAllyOverdrive)) {
                  u.lungeX = 8;
                  sound.bomb();
                  const aoeMult =
                    (1.25 + u.awakeningRank * 0.2) * (isAllyOverdrive ? 1.35 : 1);
                  livingEnemies.forEach((en) => {
                    if (!en.alive) return;
                    const dmg = Math.max(
                      4,
                      Math.round(u.atk * (1 + runAtkBuffPct / 100) * aoeMult - en.def * 0.4)
                    );
                    if (dmg > maxHitDamage) maxHitDamage = dmg;
                    applyDamageToEnemy(u.id, en, dmg);
                    en.hitFlash = 180;
                    addFloatText(
                      en.x + 12,
                      en.y - 6,
                      isAllyOverdrive ? `共鳴!${dmg}` : `${dmg}`,
                      '#fb923c'
                    );
                    projectiles.push({
                      x: u.x + 20,
                      y: u.y + 10,
                      tx: en.x + 14,
                      ty: en.y + 14,
                      progress: 0,
                      speed: 0.0055,
                      color: '#f97316',
                      size: 6,
                      kind: 'FIREBALL',
                    });
                    if (u.lifesteal > 0) {
                      healUnit(u, Math.max(1, Math.round((dmg * u.lifesteal) / 100)), u.id);
                    }
                    if (en.hp <= 0) handleEnemyDefeated(en, u.id);
                  });
                  return;
                }

                const isCrit = Math.random() * 100 < u.crit;
                const isTripleStrike =
                  u.isHero && skillBonus.tripleStrike && u.castCount % 2 === 0;
                const buffMult = 1 + ((u.isHero ? bossAtkBuffPct : 0) + runAtkBuffPct) / 100;
                const critMult = isCrit
                  ? 1.65 +
                    (u.isHero
                      ? (skillBonus.critDmgPct + achBonus.critDmgPct + synBonus.critDmgPct) / 100
                      : (achBonus.critDmgPct + synBonus.critDmgPct) / 100) +
                    (gimmickId === 'BLUE_FLAME' ? 0.35 : 0)
                  : 1;
                const rawAtk =
                  u.atk *
                  buffMult *
                  critMult *
                  (isTripleStrike ? 2.2 : 1) *
                  (isAllyOverdrive ? 1.6 : 1);
                const dmg = Math.max(2, Math.round(rawAtk - target.def * 0.55));
                if (dmg > maxHitDamage) maxHitDamage = dmg;
                if ((isCrit || isTripleStrike || isAllyOverdrive) && (!peakHit || dmg > peakHit.dmg)) {
                  peakHit = {
                    dmg,
                    floor: currentFloor,
                    timeText: formatSimTime(),
                    attackerName: u.name,
                    spriteId: u.spriteId,
                    targetName: target.name,
                    isTriple: isTripleStrike || isAllyOverdrive,
                  };
                }
                applyDamageToEnemy(u.id, target, dmg);
                target.hitFlash = 150;
                u.lungeX = u.role === 'RANGER' || u.role === 'MAGE' ? 6 : 16;

                sound.hit(isCrit || isTripleStrike || isAllyOverdrive);
                addFloatText(
                  target.x + 12,
                  target.y - 6,
                  isTripleStrike
                    ? `奥義!${dmg}`
                    : isAllyOverdrive
                      ? `共鳴!${dmg}`
                      : isCrit
                        ? `${dmg}!`
                        : `${dmg}`,
                  isTripleStrike || isAllyOverdrive ? '#38bdf8' : isCrit ? '#facc15' : '#f8fafc'
                );

                if (u.role === 'RANGER' || u.role === 'MAGE' || u.role === 'HEALER') {
                  projectiles.push({
                    x: u.x + 20,
                    y: u.y + 12,
                    tx: target.x + 14,
                    ty: target.y + 14,
                    progress: 0,
                    speed: 0.007,
                    color: u.role === 'MAGE' ? '#a855f7' : u.role === 'HEALER' ? '#fde047' : '#38bdf8',
                    size: 4,
                    kind: 'ARROW',
                  });
                } else {
                  spawnParticles(target.x + 10, target.y + 14, isCrit ? '#facc15' : '#e2e8f0', 6, 1.0);
                }

                if (u.lifesteal > 0) {
                  const absorb = Math.max(1, Math.round((dmg * u.lifesteal) / 100));
                  healUnit(u, absorb, u.id);
                }
                if (u.isHero && burnChance > 0 && Math.random() * 100 < burnChance && target.hp > 0) {
                  const burnDmg = Math.max(3, Math.round(u.atk * 0.45));
                  applyDamageToEnemy(u.id, target, burnDmg);
                  addFloatText(target.x + 16, target.y - 16, `炎+${burnDmg}`, '#f97316');
                  spawnParticles(target.x + 14, target.y + 12, '#f97316', 7, 1.1);
                }
                if (u.isHero && chainLightningChance > 0 && Math.random() * 100 < chainLightningChance) {
                  const shockDmg = Math.max(4, Math.round(u.atk * 0.55));
                  livingEnemies.forEach((en) => {
                    if (!en.alive) return;
                    applyDamageToEnemy(u.id, en, shockDmg);
                    addFloatText(en.x + 8, en.y - 18, `雷${shockDmg}`, '#fde047');
                    spawnParticles(en.x + 14, en.y + 10, '#facc15', 5, 1.1);
                    if (en.hp <= 0) handleEnemyDefeated(en, u.id);
                  });
                }

                if (target.hp <= 0) {
                  handleEnemyDefeated(target, u.id);
                }
              });

              encounter.enemies
                .filter((e) => e.alive)
                .forEach((e) => {
                  e.attackTimer -= dt;
                  if (e.attackTimer > 0) return;
                  e.attackTimer = e.attackIntervalMs;
                  e.castCount += 1;

                  // Frontline formation aggro: frontmost living member takes ~78% of hits
                  if (livingParty.length === 0) return;
                  let target = livingParty[0];
                  if (livingParty.length > 1) {
                    const roll = Math.random();
                    if (roll > 0.78) {
                      target = livingParty[Math.min(1, livingParty.length - 1)];
                    }
                    if (livingParty.length > 2 && roll > 0.94) {
                      target = livingParty[2];
                    }
                  }

                  e.lungeX = -14;
                  const defFactor = gimmickId === 'OMEGA_FIELD' ? 0.52 : 0.65;
                  const effDef = target.def + runDefBuffFlat + bossDefBuffFlat;
                  const bossHeavyMult =
                    e.isBoss && gimmickId === 'ABYSS_PRESSURE' && e.castCount % 2 === 0
                      ? 1.35
                      : 1;
                  const rawDmg = Math.max(
                    1,
                    Math.round(e.atk * bossHeavyMult - effDef * defFactor)
                  );
                  const dmg = Math.max(1, Math.round(rawDmg * (1 - target.dmgReductionPct / 100)));
                  const taken = Math.min(target.hp, dmg);
                  if (contribMap[target.id]) {
                    contribMap[target.id].damageTaken += taken;
                  }
                  target.hp = Math.max(0, target.hp - dmg);
                  target.hitFlash = 160;
                  addFloatText(target.x + 10, target.y - 6, `-${dmg}`, '#f87171');
                  spawnParticles(target.x + 14, target.y + 14, '#ef4444', 5, 0.9);

                  if (target.thorns > 0 && e.alive) {
                    const refl = Math.max(1, Math.round((dmg * target.thorns) / 100));
                    applyDamageToEnemy(target.id, e, refl);
                    addFloatText(e.x + 10, e.y - 14, `反${refl}`, '#cbd5e1');
                    if (e.hp <= 0) handleEnemyDefeated(e, target.id);
                  }

                  if (target.hp <= 0) {
                    target.alive = false;
                    if (!target.isHero) {
                      pushLog(`${target.name} が倒れた！`, 'alert');
                    }
                  } else if (
                    target.isHero &&
                    target.hp / target.maxHp <= 0.2 &&
                    !closeCallRecordedThisFloor
                  ) {
                    closeCallRecordedThisFloor = true;
                    pushHighlight(
                      'CLOSE_CALL',
                      '薄氷の踏みとどまり',
                      `${currentFloor}Fで${e.name}の強打を耐え、勇者HPが残り ${target.hp}（${Math.round((target.hp / target.maxHp) * 100)}%）に！`,
                      'hero'
                    );
                  }

                  // Trigger LOW_HP auto-healing (supports RARE+ ally HP reaction!)
                  tryAutoItems('LOW_HP');
                });
            }
          }
        } else if (phase === 'ROOM_CLEAR') {
          clearWaitTimer += dt;
          if (clearWaitTimer >= 650) {
            if (!stage.isEndless && currentFloor === stage.floors && (stage.isBossRush || roomIndex === 1)) {
              finishRun(true, `${stage.name} を完全踏破！`);
            } else {
              if (!stage.isBossRush && roomIndex === 0) {
                roomIndex = 1;
              } else {
                const clearedFloor = currentFloor;
                roomIndex = 0;
                currentFloor += 1;
                closeCallRecordedThisFloor = false;
                bossAtkBuffPct = 0;
                bossDefBuffFlat = 0;

                // Ally Overdrive skill revives fallen allies between floors
                if (skillBonus.allyOverdrive || stage.isBossRush) {
                  const revivePct = skillBonus.allyOverdrive ? 0.4 : 0.25;
                  party.forEach((member) => {
                    if (!member.isHero && !member.alive) {
                      member.alive = true;
                      member.hp = Math.max(1, Math.round(member.maxHp * revivePct));
                      addFloatText(member.x + 8, member.y - 10, '戦線復帰!', '#38bdf8');
                      pushLog(`${member.name} が戦線へ復帰した！`, 'heal');
                    }
                  });
                }

                if (roomHealFlat > 0) {
                  party.forEach((u) => healUnit(u, roomHealFlat, 'hero'));
                  pushLog(`加護と聖遺物の力でHPが少し回復 (+${roomHealFlat})`, 'heal');
                }

                if (stage.isEndless && clearedFloor % 5 === 0) {
                  party.forEach((u) => healUnit(u, Math.round(u.maxHp * 0.2), 'hero'));
                  pushLog(`【無限深淵】${clearedFloor}Fボス階層突破！全員HP20%回復！`, 'heal');
                }

                // Stage Gimmick floor-transition triggers
                if (gimmickId === 'MOSS_SPORE') {
                  party.forEach((u) => healUnit(u, Math.round(u.maxHp * 0.08), 'hero'));
                  pushLog('【ギミック：癒やしの苔胞子】全員のHPが8%自然回復！', 'heal');
                } else if (gimmickId === 'CHRONO_DISTORTION' || gimmickId === 'OMEGA_FIELD') {
                  gimmickStackCount += 1;
                  runAtkBuffPct += 6;
                  pushLog(
                    `【ギミック蓄積】階層突破によりパーティ攻撃+6%${gimmickId === 'CHRONO_DISTORTION' ? '·速度+5%' : ''}（累計${gimmickStackCount}層）`,
                    'blessing'
                  );
                } else if (gimmickId === 'BOSS_RUSH_SURGE') {
                  gimmickStackCount += 1;
                  runAtkBuffPct += 5;
                  runDefBuffFlat += 2;
                  party.forEach((u) => healUnit(u, Math.round(u.maxHp * 0.25), 'hero'));
                  pushLog(
                    `【極限闘気】ボス撃破ボーナス！全員HP25%回復＆攻撃+5%・防御+2（累計${gimmickStackCount}層）`,
                    'blessing'
                  );
                }
              }
              encounter = createEncounter(currentFloor, roomIndex);
              phase = 'MARCHING';
              marchTimer = 0;
              emitHud();
            }
          }
        }
      };

      if (!pausedRef.current && !isWaitingManualChoice && phase !== 'FINISHED') {
        if (phase === 'BOSS_INTRO') {
          animClock += rawDt * Math.min(3.5, speedRef.current);
          bossIntroElapsed += rawDt;

          for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx * (rawDt / 16);
            p.y += p.vy * (rawDt / 16);
            p.vy += 0.02 * (rawDt / 16);
            p.life -= rawDt;
            if (p.life <= 0) particles.splice(i, 1);
          }

          if (Math.random() < (stage.isBossRush ? 0.45 : 0.25) * (rawDt / 16)) {
            const boss = encounter.enemies[0];
            if (boss) {
              const size = Math.round(32 * boss.scale);
              spawnParticles(
                boss.x + Math.random() * size,
                boss.y - Math.random() * size,
                stage.isBossRush && Math.random() < 0.45 ? '#fbbf24' : '#f43f5e',
                1,
                0.85
              );
            }
          }

          if (bossIntroElapsed >= bossIntroDuration) {
            phase = 'ENCOUNTER';
            markEquipmentUsed();
            encounter.enemies.forEach((en) => encounteredEnemyIds.add(en.enemyDefId));
            const bossName = encounter.enemies[0]?.name ?? ENEMIES[stage.bossId]?.name ?? 'ボス';
            pushLog(`${bossName} が立ちはだかった！`, 'alert');
            tryAutoItems('BOSS');
            emitHud();
          }
        } else {
          const totalDt = rawDt * speedRef.current;
          const steps = Math.max(1, Math.ceil(totalDt / 45));
          const subDt = totalDt / steps;
          hudTimer += rawDt;

          if (stage.isBossRush && phase === 'ENCOUNTER' && Math.random() < 0.35 * (rawDt / 16)) {
            encounter.enemies.forEach((boss) => {
              if (!boss.alive || !boss.isBossRushEnhanced) return;
              const size = Math.round(32 * boss.scale);
              particles.push({
                x: boss.x + Math.random() * size,
                y: boss.y - Math.random() * (size * 0.8),
                vx: (Math.random() - 0.5) * 0.5,
                vy: -0.6 - Math.random() * 0.8,
                life: 320 + Math.random() * 240,
                maxLife: 560,
                color: Math.random() < 0.4 ? '#fbbf24' : '#f43f5e',
                size: 2,
              });
            });
          }

          for (let s = 0; s < steps; s++) {
            if (pausedRef.current || (phase as string) === 'FINISHED' || (phase as string) === 'BOSS_INTRO') break;
            const waitingNow =
              phase === 'ENCOUNTER' &&
              encounter.kind === 'EVENT_CHOICE' &&
              encounter.eventState === 'WAITING_CHOICE';
            if (waitingNow) break;
            stepSim(subDt);
          }

          if (hudTimer >= 120) {
            hudTimer = 0;
            emitHud();
          }
        }
      }

      // === RENDER PIXEL ART SCENE ===
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = false;

        ctx.fillStyle = biome.sky;
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

        if (stage.isBossRush) {
          const rushPulse = 0.5 + 0.5 * Math.sin(animClock / 320);
          const skyGrad = ctx.createLinearGradient(0, 0, 0, 170);
          skyGrad.addColorStop(0, '#14060d');
          skyGrad.addColorStop(0.55, '#260b16');
          skyGrad.addColorStop(1, `rgba(127, 29, 29, ${(0.25 + 0.12 * rushPulse).toFixed(2)})`);
          ctx.fillStyle = skyGrad;
          ctx.fillRect(0, 0, CANVAS_W, 170);
        }

        ctx.fillStyle = biome.wall;
        ctx.fillRect(0, 36, CANVAS_W, 134);

        const scrollMod = Math.floor(cameraX) % 64;
        ctx.fillStyle = biome.brick;
        for (let bx = -scrollMod; bx < CANVAS_W + 64; bx += 64) {
          ctx.fillRect(bx, 48, 28, 12);
          ctx.fillRect(bx + 32, 64, 28, 12);
          ctx.fillRect(bx, 82, 28, 12);
          ctx.fillRect(bx + 32, 98, 28, 12);
          ctx.fillRect(bx, 114, 28, 12);
          ctx.fillRect(bx + 32, 132, 28, 12);
        }

        if (stage.isBossRush) {
          const runePulse = 0.5 + 0.5 * Math.sin(animClock / 280);
          const pillarMod = Math.floor(cameraX) % 160;
          for (let px = 64 - pillarMod; px < CANVAS_W + 160; px += 160) {
            ctx.fillStyle = '#180911';
            ctx.fillRect(px, 36, 18, 134);
            ctx.fillStyle = `rgba(244, 63, 94, ${(0.28 + 0.3 * runePulse).toFixed(2)})`;
            ctx.fillRect(px + 7, 46, 4, 114);
            ctx.fillStyle = `rgba(251, 191, 36, ${(0.35 + 0.35 * runePulse).toFixed(2)})`;
            ctx.fillRect(px + 6, 62, 6, 4);
            ctx.fillRect(px + 6, 98, 6, 4);
            ctx.fillRect(px + 6, 134, 6, 4);
          }
        }

        const torchMod = Math.floor(cameraX) % 128;
        for (let tx = 40 - torchMod; tx < CANVAS_W + 64; tx += 128) {
          if (stage.isBossRush) {
            ctx.fillStyle = 'rgba(244, 63, 94, 0.22)';
            ctx.fillRect(tx - 16, 66, 36, 38);
            ctx.fillStyle = '#475569';
            ctx.fillRect(tx, 90, 4, 14);
            const flick = Math.floor((animClock / 90 + tx) % 3);
            ctx.fillStyle = '#f43f5e';
            ctx.fillRect(tx - 2, 78 - flick, 8, 12 + flick);
            ctx.fillStyle = '#fbbf24';
            ctx.fillRect(tx, 81 - flick, 4, 8);
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(tx + 1, 84 - flick, 2, 4);
          } else {
            ctx.fillStyle = `${biome.torch}22`;
            ctx.fillRect(tx - 12, 74, 28, 28);
            ctx.fillStyle = '#475569';
            ctx.fillRect(tx, 90, 4, 14);
            const flick = Math.floor((animClock / 120 + tx) % 2);
            ctx.fillStyle = biome.torch;
            ctx.fillRect(tx - 1, 83 - flick, 6, 7);
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(tx + 1, 85 - flick, 2, 4);
          }
        }

        ctx.fillStyle = biome.floor;
        ctx.fillRect(0, 170, CANVAS_W, CANVAS_H - 170);

        ctx.fillStyle = biome.accent;
        ctx.fillRect(0, 168, CANVAS_W, 3);
        if (stage.isBossRush) {
          ctx.fillStyle = '#fbbf24';
          for (let gx = -((Math.floor(cameraX) % 24)); gx < CANVAS_W; gx += 24) {
            ctx.fillRect(gx, 168, 8, 2);
          }
        }

        const tileMod = Math.floor(cameraX) % 32;
        ctx.fillStyle = biome.floorTile;
        for (let fx = -tileMod; fx < CANVAS_W + 32; fx += 32) {
          ctx.fillRect(fx, 178, 28, 16);
          ctx.fillRect(fx + 14, 200, 28, 20);
          ctx.fillRect(fx, 226, 28, 24);
        }

        // Draw party back-to-front so front unit draws cleanly on top
        [...party].reverse().forEach((u, revIdx) => {
          if (!u.alive) return;
          const idx = party.length - 1 - revIdx;
          const bob =
            phase === 'MARCHING'
              ? Math.round(Math.sin(animClock / 95 + idx) * 2.2)
              : Math.round(Math.sin(animClock / 260 + idx) * 1);
          const drawX = Math.round(u.x + u.lungeX);
          const drawY = Math.round(u.y - 26 + bob);

          ctx.fillStyle = 'rgba(0,0,0,0.45)';
          ctx.fillRect(drawX + 4, u.y + 4, 24, 5);

          const sprite = getSpriteCanvas(u.spriteId);
          ctx.drawImage(sprite, drawX, drawY, 32, 32);

          if (u.hitFlash > 0) {
            ctx.fillStyle = 'rgba(255,255,255,0.55)';
            ctx.fillRect(drawX + 4, drawY + 2, 24, 26);
          }

          const barW = 26;
          const pct = Math.max(0, u.hp / u.maxHp);
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(drawX + 3, drawY - 7, barW, 4);
          ctx.fillStyle = u.isHero ? '#10b981' : '#38bdf8';
          ctx.fillRect(drawX + 4, drawY - 6, Math.round((barW - 2) * pct), 2);
        });

        const bossIntroProgress =
          phase === 'BOSS_INTRO'
            ? Math.min(1, bossIntroElapsed / Math.max(1, bossIntroDuration))
            : 1;
        const bossSlideOffset =
          phase === 'BOSS_INTRO'
            ? Math.round((1 - Math.min(1, bossIntroProgress / 0.42)) * 105)
            : 0;

        if (phase !== 'MARCHING') {
          if (encounter.kind === 'EVENT_CHOICE' && encounter.eventDef) {
            const spr = getSpriteCanvas(encounter.eventDef.spriteId);
            ctx.fillStyle = 'rgba(0,0,0,0.45)';
            ctx.fillRect(332, 178, 30, 6);
            ctx.drawImage(spr, 330, 146, 36, 36);
          } else if (encounter.kind === 'EVENT_INSTANT' && encounter.instantDef) {
            const spr = getSpriteCanvas(encounter.instantDef.spriteId);
            ctx.fillStyle = 'rgba(0,0,0,0.45)';
            ctx.fillRect(332, 178, 30, 6);
            ctx.drawImage(spr, 330, 146, 36, 36);
          } else {
            encounter.enemies.forEach((e, idx) => {
              if (!e.alive) return;
              const size = Math.round(32 * e.scale);
              const bob = Math.round(Math.sin(animClock / 220 + idx) * 1.5);
              const drawX = Math.round(e.x + e.lungeX + (e.isBoss ? bossSlideOffset : 0));
              const drawY = Math.round(e.y - size + 6 + bob);

              if (e.isBossRushEnhanced) {
                const auraPulse = 0.5 + 0.5 * Math.sin(animClock / 160);
                const centerX = drawX + size / 2;
                const centerY = drawY + size / 2;

                // Crimson-gold magic circle beneath enhanced boss
                ctx.save();
                ctx.strokeStyle = `rgba(244, 63, 94, ${(0.55 + 0.35 * auraPulse).toFixed(2)})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.ellipse(centerX, e.y + 7, size * 0.62, 7, 0, 0, Math.PI * 2);
                ctx.stroke();

                ctx.strokeStyle = `rgba(251, 191, 36, ${(0.45 + 0.4 * auraPulse).toFixed(2)})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.ellipse(centerX, e.y + 7, size * 0.44, 4.5, 0, 0, Math.PI * 2);
                ctx.stroke();

                // Cardinal rune sparks on floor ring
                ctx.fillStyle = '#fbbf24';
                ctx.fillRect(Math.round(centerX - size * 0.62) - 1, e.y + 6, 3, 3);
                ctx.fillRect(Math.round(centerX + size * 0.62) - 1, e.y + 6, 3, 3);
                ctx.restore();

                // Ambient radial crimson/purple glow behind enhanced boss
                const glowRadius = size * (0.78 + 0.08 * auraPulse);
                const radGlow = ctx.createRadialGradient(
                  centerX,
                  centerY,
                  size * 0.12,
                  centerX,
                  centerY,
                  glowRadius
                );
                radGlow.addColorStop(0, `rgba(244, 63, 94, ${(0.34 + 0.16 * auraPulse).toFixed(2)})`);
                radGlow.addColorStop(0.55, `rgba(168, 85, 247, ${(0.22 + 0.1 * auraPulse).toFixed(2)})`);
                radGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.fillStyle = radGlow;
                ctx.fillRect(
                  Math.round(centerX - glowRadius),
                  Math.round(centerY - glowRadius),
                  Math.round(glowRadius * 2),
                  Math.round(glowRadius * 2)
                );
              } else {
                ctx.fillStyle = 'rgba(0,0,0,0.45)';
                ctx.fillRect(drawX + 4, e.y + 4, size - 8, 5);
              }

              const spr = getSpriteCanvas(e.spriteId);
              ctx.save();
              ctx.translate(drawX + size, drawY);
              ctx.scale(-1, 1);

              if (e.isBossRushEnhanced) {
                const auraPulse = 0.5 + 0.5 * Math.sin(animClock / 160);
                const px = size / 16;
                const outerAura = getSpriteAuraCanvas(e.spriteId, '#dc2626');
                const innerAura = getSpriteAuraCanvas(
                  e.spriteId,
                  auraPulse > 0.5 ? '#fbbf24' : '#f43f5e'
                );

                // Outer crimson pulse aura
                ctx.save();
                ctx.globalAlpha = 0.45 + 0.35 * auraPulse;
                ctx.drawImage(
                  outerAura,
                  -px * 1.6,
                  -px * 1.6,
                  size + px * 3.2,
                  size + px * 3.2
                );
                // Crisp 1px pixel silhouette rim
                ctx.globalAlpha = 0.72 + 0.25 * auraPulse;
                ctx.drawImage(innerAura, -px, -px, size + px * 2, size + px * 2);
                // Spectral afterimage flicker
                const ghostShift = Math.round(Math.sin(animClock / 110) * 2);
                ctx.globalAlpha = 0.22;
                ctx.drawImage(spr, ghostShift, -1, size, size);
                ctx.restore();
              }

              ctx.drawImage(spr, 0, 0, size, size);
              ctx.restore();

              if (e.isBossRushEnhanced) {
                // Orbiting crimson & gold energy orbs around enhanced boss
                const centerX = drawX + size / 2;
                const centerY = drawY + size / 2;
                for (let oi = 0; oi < 4; oi++) {
                  const angle = animClock / 340 + (oi * Math.PI) / 2;
                  const ox = Math.round(centerX + Math.cos(angle) * (size * 0.58));
                  const oy = Math.round(centerY + Math.sin(angle) * (size * 0.38));
                  ctx.fillStyle = oi % 2 === 0 ? '#fbbf24' : '#f43f5e';
                  ctx.fillRect(ox - 2, oy - 2, 4, 4);
                  ctx.fillStyle = '#fef08a';
                  ctx.fillRect(ox - 1, oy - 1, 2, 2);
                }
              }

              if (e.hitFlash > 0) {
                ctx.fillStyle = 'rgba(255,255,255,0.6)';
                ctx.fillRect(drawX + 4, drawY + 2, size - 8, size - 6);
              }

              const barW = Math.max(26, size - 4);
              const pct = Math.max(0, e.hp / e.maxHp);
              if (e.isBossRushEnhanced) {
                ctx.fillStyle = '#fbbf24';
                ctx.fillRect(drawX + 1, drawY - 10, barW + 2, 7);
                ctx.fillStyle = '#090b10';
                ctx.fillRect(drawX + 2, drawY - 9, barW, 5);
                ctx.fillStyle = '#e11d48';
                ctx.fillRect(drawX + 3, drawY - 8, Math.round((barW - 2) * pct), 3);
                ctx.fillStyle = '#fbbf24';
                ctx.fillRect(drawX + 3, drawY - 8, Math.round((barW - 2) * pct), 1);

                // Crisp pixel "極" crown crest above HP bar
                ctx.font = 'bold 9px "DotGothic16", monospace';
                ctx.textAlign = 'center';
                ctx.fillStyle = '#090b10';
                ctx.fillText('【極】', drawX + size / 2 + 1, drawY - 13);
                ctx.fillStyle = '#fbbf24';
                ctx.fillText('【極】', drawX + size / 2, drawY - 14);
              } else {
                ctx.fillStyle = '#0f172a';
                ctx.fillRect(drawX + 2, drawY - 7, barW, 4);
                ctx.fillStyle = e.isBoss ? '#f59e0b' : '#ef4444';
                ctx.fillRect(drawX + 3, drawY - 6, Math.round((barW - 2) * pct), 2);
              }
            });
          }
        }

        projectiles.forEach((pr) => {
          const px = Math.round(pr.x + (pr.tx - pr.x) * pr.progress);
          const py = Math.round(pr.y + (pr.ty - pr.y) * pr.progress);
          ctx.fillStyle = pr.color;
          ctx.fillRect(px - pr.size / 2, py - pr.size / 2, pr.size, pr.size);
        });

        particles.forEach((p) => {
          ctx.fillStyle = p.color;
          ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
        });

        bubbles.forEach((b) => {
          ctx.fillStyle = '#181b24';
          ctx.fillRect(Math.round(b.x) - 2, Math.round(b.y) - 2, 22, 22);
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 1;
          ctx.strokeRect(Math.round(b.x) - 2, Math.round(b.y) - 2, 22, 22);
          ctx.drawImage(getSpriteCanvas(b.spriteId), Math.round(b.x), Math.round(b.y), 18, 18);
        });

        ctx.font = 'bold 11px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        floatingTexts.forEach((ft) => {
          ctx.fillStyle = '#090b10';
          ctx.fillText(ft.text, Math.round(ft.x) + 1, Math.round(ft.y) + 1);
          ctx.fillStyle = ft.color;
          ctx.fillText(ft.text, Math.round(ft.x), Math.round(ft.y));
        });

        // === BOSS WARNING INTRO OVERLAY (Slow red blinking + BOSS label) ===
        if (phase === 'BOSS_INTRO') {
          const blinkCycles = speedRef.current >= 8 ? 1 : 2;
          const redPulse = 0.5 - 0.5 * Math.cos(bossIntroProgress * Math.PI * 2 * blinkCycles);
          const bossEntity = encounter.enemies[0];
          const isEnhanced = Boolean(bossEntity?.isBossRushEnhanced || stage.isBossRush);

          // Full-screen slow red pulse wash
          ctx.fillStyle = `rgba(220, 38, 38, ${(0.06 + 0.25 * redPulse).toFixed(3)})`;
          ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

          // Top & bottom crimson vignette bands
          ctx.fillStyle = `rgba(127, 29, 29, ${(0.22 + 0.45 * redPulse).toFixed(3)})`;
          ctx.fillRect(0, 0, CANVAS_W, 24);
          ctx.fillRect(0, CANVAS_H - 24, CANVAS_W, 24);

          // Animated pixel hazard stripes along top & bottom edges
          const stripeShift = Math.floor((animClock / 35) % 24);
          ctx.fillStyle = `rgba(239, 68, 68, ${(0.45 + 0.45 * redPulse).toFixed(3)})`;
          for (let sx = -24 + stripeShift; sx < CANVAS_W + 24; sx += 24) {
            ctx.fillRect(sx, 3, 12, 4);
            ctx.fillRect(CANVAS_W - sx - 12, CANVAS_H - 7, 12, 4);
          }

          // Center-upper BOSS label banner
          const bannerY = 58;
          const bannerH = 74;
          ctx.fillStyle = 'rgba(10, 11, 16, 0.88)';
          ctx.fillRect(0, bannerY, CANVAS_W, bannerH);

          // Pulsing double alert border lines
          ctx.fillStyle = `rgba(239, 68, 68, ${(0.5 + 0.5 * redPulse).toFixed(3)})`;
          ctx.fillRect(0, bannerY, CANVAS_W, 3);
          ctx.fillRect(0, bannerY + bannerH - 3, CANVAS_W, 3);

          ctx.fillStyle = isEnhanced
            ? `rgba(251, 191, 36, ${(0.5 + 0.45 * redPulse).toFixed(3)})`
            : `rgba(252, 165, 165, ${(0.35 + 0.4 * redPulse).toFixed(3)})`;
          ctx.fillRect(0, bannerY + 5, CANVAS_W, 1);
          ctx.fillRect(0, bannerY + bannerH - 6, CANVAS_W, 1);

          // Side warning pixel diamonds
          ctx.fillStyle = `rgba(248, 113, 113, ${(0.45 + 0.55 * redPulse).toFixed(3)})`;
          [38, CANVAS_W - 38].forEach((cx) => {
            const cy = bannerY + bannerH / 2;
            ctx.fillRect(cx - 5, cy - 2, 10, 4);
            ctx.fillRect(cx - 2, cy - 5, 4, 10);
          });

          ctx.textAlign = 'center';
          ctx.font = 'bold 10px "JetBrains Mono", monospace';
          ctx.fillStyle = isEnhanced ? '#fbbf24' : '#fca5a5';
          ctx.fillText(
            stage.isEndless
              ? `${isEnhanced ? 'WARNING  //  極・深淵BOSS' : 'WARNING  //  深淵BOSS'} (${currentFloor}F)`
              : isEnhanced
                ? `WARNING  //  極・強化ボス (${currentFloor}/${stage.floors})`
                : 'WARNING  //  DANGER',
            CANVAS_W / 2,
            bannerY + 19
          );

          // Prominent BOSS label
          const mainLabel = isEnhanced ? '【極】BOSS' : 'BOSS';
          ctx.font = 'bold 26px "DotGothic16", "JetBrains Mono", monospace';
          ctx.fillStyle = '#090b10';
          ctx.fillText(mainLabel, CANVAS_W / 2 + 2, bannerY + 49);
          ctx.fillStyle =
            redPulse > 0.55 ? (isEnhanced ? '#fde047' : '#fecaca') : '#ef4444';
          ctx.fillText(mainLabel, CANVAS_W / 2, bannerY + 47);

          // Boss Name subtitle
          ctx.font = 'bold 12px "DotGothic16", "M PLUS 1p", sans-serif';
          ctx.fillStyle = '#090b10';
          ctx.fillText(bossEntity?.name ?? 'ボス出現', CANVAS_W / 2 + 1, bannerY + 65);
          ctx.fillStyle = isEnhanced ? '#fde68a' : '#f8fafc';
          ctx.fillText(bossEntity?.name ?? 'ボス出現', CANVAS_W / 2, bannerY + 64);
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      if (finishTimer) clearTimeout(finishTimer);
      onEventPromptRef.current(null);
    };
  }, []);

  return (
    <div className="relative w-full aspect-[480/260] bg-[#0c0e13] border-2 border-[#2b3040] overflow-hidden select-none">
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        className="w-full h-full pixelated block"
      />
      {paused && (
        <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
          <div className="px-5 py-2.5 bg-[#181b24] border-2 border-amber-500/70 text-amber-300 font-pixel text-lg">
            一時停止中
          </div>
        </div>
      )}
    </div>
  );
};
