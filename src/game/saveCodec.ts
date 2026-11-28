import {
  ALL_ACHIEVEMENT_IDS,
  clampSpeedToUnlocked,
  CONVENIENCE_UPGRADE_IDS,
  createDefaultPresets,
  CUSTOM_ALLY_ID,
  CUSTOM_ALLY_LOOP23_FAIL_TARGET,
  getMaxStageForLoop,
  INITIAL_CUSTOM_ALLY,
  INITIAL_LIFETIME_STATS,
  INITIAL_SAVE_STATE,
  INITIAL_TOTAL_METER_CAP,
  INITIAL_TYPE_METER_CAPS,
  ITEMS,
  MAX_ITEM_REFINE,
  MAX_POUCH_SLOTS,
  MAX_PRESET_SLOTS,
} from './data';
import {
  ConvenienceUpgradeId,
  CustomAllyBody,
  CustomAllyConfig,
  CustomAllyHeadgear,
  CustomAllyStyle,
  CustomAllyWeapon,
  ItemEngravingId,
  LifetimeStats,
  LoadoutPreset,
  RunHistoryEntry,
  SaveState,
} from './types';

export function mergeUnique(
  base: string[] | undefined,
  extra: (string | null | undefined)[]
): string[] {
  const set = new Set(base ?? []);
  extra.forEach((id) => {
    if (id) set.add(id);
  });
  return Array.from(set);
}

export function reconcilePartyOrder(
  order: string[] | undefined,
  activeAllies: string[]
): string[] {
  const allowed = new Set(['hero', ...activeAllies]);
  const next = (order ?? ['hero']).filter((id) => allowed.has(id));
  if (!next.includes('hero')) next.unshift('hero');
  activeAllies.forEach((id) => {
    if (!next.includes(id)) next.push(id);
  });
  return next;
}

export function sanitizeSaveState(parsed: Partial<SaveState>): SaveState {
  const loopCount =
    typeof parsed.loopCount === 'number' && Number.isFinite(parsed.loopCount) && parsed.loopCount >= 1
      ? Math.floor(parsed.loopCount)
      : 1;
  const highestClearedLoop =
    typeof parsed.highestClearedLoop === 'number' && Number.isFinite(parsed.highestClearedLoop)
      ? Math.max(loopCount - 1, Math.floor(parsed.highestClearedLoop))
      : loopCount - 1;
  const bestEndlessFloor =
    typeof parsed.bestEndlessFloor === 'number' && Number.isFinite(parsed.bestEndlessFloor)
      ? Math.max(0, Math.floor(parsed.bestEndlessFloor))
      : 0;
  const unlockedAchievements = Array.isArray(parsed.unlockedAchievements)
    ? parsed.unlockedAchievements.filter((x): x is string => typeof x === 'string')
    : [];
  const allAchUnlocked = ALL_ACHIEVEMENT_IDS.every((id) => unlockedAchievements.includes(id));
  const endlessUnlocked = highestClearedLoop >= 5 || loopCount >= 6;
  const maxStage = getMaxStageForLoop(loopCount, allAchUnlocked, endlessUnlocked);
  const loop23FailRetreatCount =
    typeof parsed.loop23FailRetreatCount === 'number' &&
    Number.isFinite(parsed.loop23FailRetreatCount) &&
    parsed.loop23FailRetreatCount >= 0
      ? Math.floor(parsed.loop23FailRetreatCount)
      : 0;
  const customAllyUnlocked =
    Boolean(parsed.customAllyUnlocked) ||
    loopCount >= 4 ||
    highestClearedLoop >= 3 ||
    loop23FailRetreatCount >= CUSTOM_ALLY_LOOP23_FAIL_TARGET;
  const activeAllies = Array.isArray(parsed.activeAllies)
    ? parsed.activeAllies.filter(
        (x): x is string => typeof x === 'string' && (customAllyUnlocked || x !== CUSTOM_ALLY_ID)
      )
    : [];
  const pouch =
    Array.isArray(parsed.pouch) && parsed.pouch.length === MAX_POUCH_SLOTS
      ? parsed.pouch.map((x) => (typeof x === 'string' ? x : null))
      : [...INITIAL_SAVE_STATE.pouch];
  const inv =
    parsed.inventory && typeof parsed.inventory === 'object'
      ? parsed.inventory
      : { ...INITIAL_SAVE_STATE.inventory };
  const ownedIds = Object.entries(inv)
    .filter(([, q]) => typeof q === 'number' && q > 0)
    .map(([id]) => id);

  const selectedStageId =
    typeof parsed.selectedStageId === 'number' && parsed.selectedStageId >= 1
      ? Math.min(maxStage, Math.floor(parsed.selectedStageId))
      : 1;

  const validConvSet = new Set<string>(CONVENIENCE_UPGRADE_IDS);
  const rawSkills = Array.isArray(parsed.unlockedSkills)
    ? parsed.unlockedSkills.filter((x): x is string => typeof x === 'string')
    : [];
  const rawConvs = Array.isArray(parsed.unlockedConveniences)
    ? parsed.unlockedConveniences.filter(
        (x): x is ConvenienceUpgradeId => typeof x === 'string' && validConvSet.has(x)
      )
    : [];
  const convFromSkills = rawSkills.filter((x): x is ConvenienceUpgradeId => validConvSet.has(x));
  const unlockedConveniences: ConvenienceUpgradeId[] = Array.from(
    new Set([...rawConvs, ...convFromSkills])
  );
  const unlockedSkills = mergeUnique(rawSkills, unlockedConveniences);
  const hasAutoEvent = unlockedConveniences.includes('conv_auto_event');
  const hasAutoRepeat = unlockedConveniences.includes('conv_auto_repeat');

  const practiceLoopCount =
    loopCount >= 2 &&
    typeof parsed.practiceLoopCount === 'number' &&
    Number.isFinite(parsed.practiceLoopCount) &&
    parsed.practiceLoopCount >= 1 &&
    Math.floor(parsed.practiceLoopCount) < loopCount
      ? Math.floor(parsed.practiceLoopCount)
      : null;

  const defaultPresets = createDefaultPresets();
  const rawPresets = Array.isArray(parsed.presets) ? parsed.presets : [];
  const presets: LoadoutPreset[] = Array.from({ length: MAX_PRESET_SLOTS }, (_, i) => {
    const p = rawPresets[i];
    const fallback = defaultPresets[i];
    if (!p || typeof p !== 'object') return fallback;
    const pAllies = Array.isArray(p.activeAllies)
      ? p.activeAllies.filter((x): x is string => typeof x === 'string')
      : [];
    return {
      id: typeof p.id === 'string' && p.id ? p.id : fallback.id,
      name: typeof p.name === 'string' && p.name.trim() ? p.name.slice(0, 20) : fallback.name,
      saved: Boolean(p.saved),
      pouch:
        Array.isArray(p.pouch) && p.pouch.length === MAX_POUCH_SLOTS
          ? p.pouch.map((x) => (typeof x === 'string' && ITEMS[x] ? x : null))
          : [...fallback.pouch],
      activeAllies: pAllies,
      partyOrder: reconcilePartyOrder(p.partyOrder, pAllies),
      activeBlessings: Array.isArray(p.activeBlessings)
        ? p.activeBlessings.filter((x): x is string => typeof x === 'string')
        : [],
      autoEquipStyle:
        p.autoEquipStyle === 'DEFENSE' || p.autoEquipStyle === 'CONSUMABLES'
          ? p.autoEquipStyle
          : 'OFFENSE',
    };
  });

  const itemRefineLevels: Record<string, number> = {};
  if (parsed.itemRefineLevels && typeof parsed.itemRefineLevels === 'object') {
    Object.entries(parsed.itemRefineLevels).forEach(([id, lv]) => {
      if (ITEMS[id] && typeof lv === 'number' && Number.isFinite(lv) && lv > 0) {
        itemRefineLevels[id] = Math.min(MAX_ITEM_REFINE, Math.floor(lv));
      }
    });
  }

  const validEngravings = new Set<ItemEngravingId>([
    'crimson',
    'aegis',
    'swift',
    'leech',
    'bond',
    'fortune',
  ]);
  const itemEngravings: Partial<Record<string, ItemEngravingId>> = {};
  if (parsed.itemEngravings && typeof parsed.itemEngravings === 'object') {
    Object.entries(parsed.itemEngravings).forEach(([id, eng]) => {
      if (ITEMS[id] && typeof eng === 'string' && validEngravings.has(eng as ItemEngravingId)) {
        itemEngravings[id] = eng as ItemEngravingId;
      }
    });
  }

  const defaultSeenAnnouncements: string[] = [];
  if (!Array.isArray(parsed.seenAnnouncements)) {
    const preCleared = loopCount >= 2 ? 99 : Math.max(0, Math.floor(parsed.highestClearedStage ?? 0));
    if (preCleared >= 1) defaultSeenAnnouncements.push('unlock_s1');
    if (preCleared >= 2) defaultSeenAnnouncements.push('unlock_s2');
    if (preCleared >= 3) defaultSeenAnnouncements.push('unlock_s3');
    if (preCleared >= 4) defaultSeenAnnouncements.push('unlock_s4');
    if (loopCount >= 2) defaultSeenAnnouncements.push('unlock_reincarnate');
    if (loopCount >= 5) defaultSeenAnnouncements.push('unlock_loop5_engrave');
  }
  const seenAnnouncements = Array.isArray(parsed.seenAnnouncements)
    ? parsed.seenAnnouncements.filter((x): x is string => typeof x === 'string')
    : defaultSeenAnnouncements;

  return {
    ...INITIAL_SAVE_STATE,
    ...parsed,
    gold:
      typeof parsed.gold === 'number' && Number.isFinite(parsed.gold) && parsed.gold >= 0
        ? Math.floor(parsed.gold)
        : INITIAL_SAVE_STATE.gold,
    materials: {
      iron_ore:
        typeof parsed.materials?.iron_ore === 'number' && Number.isFinite(parsed.materials.iron_ore)
          ? Math.max(0, Math.floor(parsed.materials.iron_ore))
          : INITIAL_SAVE_STATE.materials.iron_ore,
      magic_stone:
        typeof parsed.materials?.magic_stone === 'number' && Number.isFinite(parsed.materials.magic_stone)
          ? Math.max(0, Math.floor(parsed.materials.magic_stone))
          : INITIAL_SAVE_STATE.materials.magic_stone,
      ancient_scroll:
        typeof parsed.materials?.ancient_scroll === 'number' && Number.isFinite(parsed.materials.ancient_scroll)
          ? Math.max(0, Math.floor(parsed.materials.ancient_scroll))
          : INITIAL_SAVE_STATE.materials.ancient_scroll,
      abyss_shard:
        typeof parsed.materials?.abyss_shard === 'number' && Number.isFinite(parsed.materials.abyss_shard)
          ? Math.max(0, Math.floor(parsed.materials.abyss_shard))
          : 0,
      void_gear:
        typeof parsed.materials?.void_gear === 'number' && Number.isFinite(parsed.materials.void_gear)
          ? Math.max(0, Math.floor(parsed.materials.void_gear))
          : 0,
      chaos_prism:
        typeof parsed.materials?.chaos_prism === 'number' && Number.isFinite(parsed.materials.chaos_prism)
          ? Math.max(0, Math.floor(parsed.materials.chaos_prism))
          : 0,
    },
    inventory: inv,
    totalMeterCap:
      typeof parsed.totalMeterCap === 'number' && Number.isFinite(parsed.totalMeterCap)
        ? Math.max(INITIAL_TOTAL_METER_CAP, Math.floor(parsed.totalMeterCap))
        : INITIAL_TOTAL_METER_CAP,
    typeMeterCaps: {
      ...INITIAL_TYPE_METER_CAPS,
      ...(parsed.typeMeterCaps ?? {}),
    },
    loopCount,
    highestClearedLoop,
    bestEndlessFloor,
    clearCrests:
      typeof parsed.clearCrests === 'number' && Number.isFinite(parsed.clearCrests)
        ? Math.max(0, Math.floor(parsed.clearCrests))
        : 0,
    shopBoughtThisCycle: parsed.shopBoughtThisCycle ?? {},
    allyAwakenings: parsed.allyAwakenings ?? {},
    allyGearLevels: parsed.allyGearLevels ?? {},
    activeAllies,
    partyOrder: reconcilePartyOrder(parsed.partyOrder, activeAllies),
    eventChoiceMode: hasAutoEvent && parsed.eventChoiceMode === 'AUTO' ? 'AUTO' : 'MANUAL',
    autoEquipStyle:
      parsed.autoEquipStyle === 'DEFENSE' || parsed.autoEquipStyle === 'CONSUMABLES'
        ? parsed.autoEquipStyle
        : 'OFFENSE',
    pouch,
    selectedStageId,
    highestClearedStage:
      typeof parsed.highestClearedStage === 'number'
        ? Math.max(0, Math.floor(parsed.highestClearedStage))
        : 0,
    heroUpgradeLevel:
      typeof parsed.heroUpgradeLevel === 'number' && parsed.heroUpgradeLevel >= 1
        ? Math.floor(parsed.heroUpgradeLevel)
        : 1,
    totalRuns: typeof parsed.totalRuns === 'number' ? Math.max(0, Math.floor(parsed.totalRuns)) : 0,
    totalClears:
      typeof parsed.totalClears === 'number' ? Math.max(0, Math.floor(parsed.totalClears)) : 0,
    cycleClears:
      typeof parsed.cycleClears === 'number'
        ? Math.max(0, Math.floor(parsed.cycleClears))
        : typeof parsed.highestClearedStage === 'number'
          ? Math.max(0, Math.floor(parsed.highestClearedStage))
          : 0,
    skillPoints:
      typeof parsed.skillPoints === 'number' && parsed.skillPoints >= 0
        ? Math.floor(parsed.skillPoints)
        : 1,
    unlockedSkills,
    spMasteryLevel:
      typeof parsed.spMasteryLevel === 'number' && parsed.spMasteryLevel >= 0
        ? Math.floor(parsed.spMasteryLevel)
        : 0,
    stageClearsThisLoop: Array.isArray(parsed.stageClearsThisLoop)
      ? parsed.stageClearsThisLoop.filter((x): x is number => typeof x === 'number')
      : [],
    discoveredEnemies: Array.isArray(parsed.discoveredEnemies)
      ? parsed.discoveredEnemies.filter((x): x is string => typeof x === 'string')
      : [],
    discoveredEvents: Array.isArray(parsed.discoveredEvents)
      ? parsed.discoveredEvents.filter((x): x is string => typeof x === 'string')
      : [],
    discoveredItems: mergeUnique(
      Array.isArray(parsed.discoveredItems)
        ? parsed.discoveredItems.filter((x): x is string => typeof x === 'string')
        : INITIAL_SAVE_STATE.discoveredItems,
      [...ownedIds, ...pouch]
    ),
    seenGuides: Array.isArray(parsed.seenGuides)
      ? parsed.seenGuides.filter((x): x is string => typeof x === 'string')
      : [],
    unlockedAchievements,
    claimedAllAchievementsInLoop:
      typeof parsed.claimedAllAchievementsInLoop === 'number' &&
      parsed.claimedAllAchievementsInLoop >= 0
        ? Math.floor(parsed.claimedAllAchievementsInLoop)
        : 0,
    bossRushClears:
      typeof parsed.bossRushClears === 'number' && parsed.bossRushClears >= 0
        ? Math.floor(parsed.bossRushClears)
        : 0,
    bestSingleHit:
      typeof parsed.bestSingleHit === 'number' && parsed.bestSingleHit >= 0
        ? Math.floor(parsed.bestSingleHit)
        : 0,
    unlockedConveniences,
    preferredSpeed: clampSpeedToUnlocked(parsed.preferredSpeed, {
      ...INITIAL_SAVE_STATE,
      unlockedConveniences,
    } as SaveState),
    autoRepeatEnabled: hasAutoRepeat ? Boolean(parsed.autoRepeatEnabled) : false,
    autoRestockOnReturn: hasAutoRepeat ? Boolean(parsed.autoRestockOnReturn) : false,
    practiceLoopCount,
    presets,
    itemRefineLevels,
    itemEngravings,
    seenAnnouncements,
    lifetimeStats: (() => {
      const raw = (parsed.lifetimeStats ?? {}) as Partial<LifetimeStats>;
      const num = (v: unknown) =>
        typeof v === 'number' && Number.isFinite(v) && v >= 0 ? Math.floor(v) : 0;
      const recentRuns: RunHistoryEntry[] = Array.isArray(raw.recentRuns)
        ? raw.recentRuns
            .filter((r): r is RunHistoryEntry => Boolean(r && typeof r === 'object'))
            .slice(0, 20)
            .map((r, idx) => ({
              id: typeof r.id === 'number' && Number.isFinite(r.id) ? r.id : idx + 1,
              timestamp:
                typeof r.timestamp === 'number' && Number.isFinite(r.timestamp) ? r.timestamp : 0,
              stageId: num(r.stageId) || 1,
              stageName: typeof r.stageName === 'string' ? r.stageName.slice(0, 40) : '迷宮',
              loopCount: Math.max(1, num(r.loopCount)),
              victory: Boolean(r.victory),
              isEndless: Boolean(r.isEndless),
              isBossRush: Boolean(r.isBossRush),
              isPracticeRun: Boolean(r.isPracticeRun),
              reachedFloor: Math.max(1, num(r.reachedFloor)),
              totalFloors: Math.max(1, num(r.totalFloors)),
              goldEarned: num(r.goldEarned),
              enemiesDefeated: num(r.enemiesDefeated),
              maxHitDamage: num(r.maxHitDamage),
              durationSec: Math.max(1, num(r.durationSec)),
            }))
        : [];
      return {
        ...INITIAL_LIFETIME_STATS,
        playTimeSeconds: num(raw.playTimeSeconds),
        totalGoldEarned: num(raw.totalGoldEarned),
        totalGoldSpent: num(raw.totalGoldSpent),
        totalUpgrades: num(raw.totalUpgrades),
        totalItemsUsed: num(raw.totalItemsUsed),
        totalConsumableActivations: num(raw.totalConsumableActivations),
        totalItemsBought: num(raw.totalItemsBought),
        totalItemsCrafted: num(raw.totalItemsCrafted),
        totalItemsRefined: num(raw.totalItemsRefined),
        totalItemsSalvaged: num(raw.totalItemsSalvaged),
        totalHeroLevelsGained: num(raw.totalHeroLevelsGained),
        totalAllyLevelsGained: num(raw.totalAllyLevelsGained),
        totalEnemiesDefeated: num(raw.totalEnemiesDefeated),
        totalBossesDefeated: num(raw.totalBossesDefeated),
        totalDamageDealt: num(raw.totalDamageDealt),
        totalHealingDone: num(raw.totalHealingDone),
        totalCrestsEarned: num(raw.totalCrestsEarned),
        totalMaterialsEarned: num(raw.totalMaterialsEarned),
        totalReincarnations: num(raw.totalReincarnations),
        recentRuns,
      };
    })(),
    customAlly: (() => {
      const raw = (parsed.customAlly ?? {}) as Partial<CustomAllyConfig>;
      const validStyles: CustomAllyStyle[] = ['BALANCED', 'TANK', 'HEALER', 'RANGER', 'MAGE', 'THIEF'];
      const validBodies: CustomAllyBody[] = ['NEKO', 'HUMANOID', 'SLIME', 'GOLEM'];
      const validHeadgears: CustomAllyHeadgear[] = ['NONE', 'CAT_EARS', 'RIBBON', 'WIZARD_HAT', 'CROWN', 'HORNS'];
      const validWeapons: CustomAllyWeapon[] = ['NONE', 'SWORD', 'STAFF', 'BOW', 'SHIELD'];
      const hexOk = (v: unknown, fallback: string) =>
        typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v) ? v : fallback;
      const customPixels =
        Array.isArray(raw.customPixels) &&
        raw.customPixels.length === 256 &&
        raw.customPixels.every((c) => c === '' || (typeof c === 'string' && /^#[0-9a-fA-F]{6}$/.test(c)))
          ? raw.customPixels
          : null;
      return {
        created: Boolean(raw.created),
        name:
          typeof raw.name === 'string' && raw.name.trim()
            ? raw.name.trim().slice(0, 14)
            : INITIAL_CUSTOM_ALLY.name,
        title:
          typeof raw.title === 'string'
            ? raw.title.trim().slice(0, 12)
            : INITIAL_CUSTOM_ALLY.title,
        style: validStyles.includes(raw.style as CustomAllyStyle)
          ? (raw.style as CustomAllyStyle)
          : INITIAL_CUSTOM_ALLY.style,
        body: validBodies.includes(raw.body as CustomAllyBody)
          ? (raw.body as CustomAllyBody)
          : INITIAL_CUSTOM_ALLY.body,
        primaryColor: hexOk(raw.primaryColor, INITIAL_CUSTOM_ALLY.primaryColor),
        secondaryColor: hexOk(raw.secondaryColor, INITIAL_CUSTOM_ALLY.secondaryColor),
        accentColor: hexOk(raw.accentColor, INITIAL_CUSTOM_ALLY.accentColor),
        headgear: validHeadgears.includes(raw.headgear as CustomAllyHeadgear)
          ? (raw.headgear as CustomAllyHeadgear)
          : INITIAL_CUSTOM_ALLY.headgear,
        weapon: validWeapons.includes(raw.weapon as CustomAllyWeapon)
          ? (raw.weapon as CustomAllyWeapon)
          : INITIAL_CUSTOM_ALLY.weapon,
        customPixels,
      };
    })(),
    customAllyUnlocked,
    loop23FailRetreatCount,
    seenStoryOpening:
      typeof parsed.seenStoryOpening === 'boolean'
        ? parsed.seenStoryOpening
        : Boolean(
            (typeof parsed.totalRuns === 'number' && parsed.totalRuns > 0) ||
              (typeof parsed.highestClearedStage === 'number' && parsed.highestClearedStage > 0) ||
              (typeof parsed.loopCount === 'number' && parsed.loopCount > 1)
          ),
    seenStoryEnding: Boolean(parsed.seenStoryEnding),
  };
}

function fnv1aHex(str: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

const SAVE_PREFIX = 'DOTLABv2!';

export function encodeSaveToText(save: SaveState): string {
  const payload = JSON.stringify({ v: 2, data: save });
  const checksum = fnv1aHex(payload);
  const bytes = new TextEncoder().encode(payload);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return `${SAVE_PREFIX}${checksum}!${btoa(binary)}`;
}

export function decodeSaveFromText(
  rawInput: string
): { ok: true; save: SaveState } | { ok: false; error: string } {
  const trimmed = rawInput.trim().replace(/\s+/g, '');
  if (!trimmed) {
    return { ok: false, error: 'セーブ文字列が入力されていません。' };
  }

  try {
    let jsonPayload = '';
    if (trimmed.startsWith('{')) {
      // Allow raw JSON backup as fallback
      const rawJson = rawInput.trim();
      const obj = JSON.parse(rawJson) as { data?: Partial<SaveState> } & Partial<SaveState>;
      const candidate = obj.data && typeof obj.data === 'object' ? obj.data : obj;
      if (typeof candidate.gold !== 'number' || !Array.isArray(candidate.pouch)) {
        return { ok: false, error: 'セーブデータの構造が正しくありません。' };
      }
      return { ok: true, save: sanitizeSaveState(candidate) };
    }

    if (!trimmed.startsWith(SAVE_PREFIX)) {
      return {
        ok: false,
        error: '無効なセーブ文字列です（DOTLABv2! で始まる文字列を入力してください）。',
      };
    }

    const rest = trimmed.slice(SAVE_PREFIX.length);
    const sepIdx = rest.indexOf('!');
    if (sepIdx === -1) {
      return { ok: false, error: 'セーブ文字列の形式が破損しています。' };
    }

    const expectedChecksum = rest.slice(0, sepIdx);
    const b64 = rest.slice(sepIdx + 1);
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    jsonPayload = new TextDecoder().decode(bytes);

    if (fnv1aHex(jsonPayload) !== expectedChecksum) {
      return {
        ok: false,
        error: 'チェックサムが一致しません。文字列が欠けているか書き換わっています。',
      };
    }

    const parsed = JSON.parse(jsonPayload) as { v?: number; data?: Partial<SaveState> };
    if (!parsed || typeof parsed.data !== 'object' || parsed.data === null) {
      return { ok: false, error: 'セーブデータの中身を読み取れませんでした。' };
    }
    if (
      typeof parsed.data.gold !== 'number' ||
      !Array.isArray(parsed.data.pouch)
    ) {
      return { ok: false, error: 'セーブデータの必須項目が不足しています。' };
    }

    return { ok: true, save: sanitizeSaveState(parsed.data) };
  } catch {
    return {
      ok: false,
      error: 'セーブ文字列の復元に失敗しました。前後の文字欠けがないか確認してください。',
    };
  }
}
