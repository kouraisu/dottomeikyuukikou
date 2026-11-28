import {
  AchievementBonus,
  AchievementDef,
  AllyDef,
  AutoEquipPlaystyle,
  BlessingDef,
  ConvenienceUpgradeDef,
  ConvenienceUpgradeId,
  CustomAllyConfig,
  CustomAllyStyle,
  DungeonEventDef,
  EnemyDef,
  ForgeRecipe,
  GameSpeed,
  InstantEventDef,
  ItemCategory,
  ItemDef,
  ItemStats,
  LifetimeStats,
  LoadoutPreset,
  MaterialBag,
  SaveState,
  SkillNodeDef,
  SkillNodeEffects,
  StageDef,
  SynergyBonus,
  SynergyDef,
  TownTab,
  TypeMeterCaps,
} from './types';

export const MAX_POUCH_SLOTS = 5;

export const RARITY_COST: Record<'COMMON' | 'RARE' | 'EPIC', number> = {
  COMMON: 1,
  RARE: 2,
  EPIC: 3,
};

export const INITIAL_TYPE_METER_CAPS: TypeMeterCaps = {
  WEAPON: 2,
  ARMOR: 2,
  CONSUMABLE: 3,
  RELIC: 2,
};

export const INITIAL_TOTAL_METER_CAP = 6;

export const MATERIAL_INFO = {
  iron_ore: { name: '鉄鉱石', color: '#94a3b8', spriteId: 'mat_iron' },
  magic_stone: { name: '魔石', color: '#38bdf8', spriteId: 'mat_stone' },
  ancient_scroll: { name: '古文書', color: '#f59e0b', spriteId: 'mat_scroll' },
  abyss_shard: { name: '深淵の欠片', color: '#c084fc', spriteId: 'mat_abyss_shard' },
  void_gear: { name: '虚無の歯車', color: '#38bdf8', spriteId: 'mat_void_gear' },
  chaos_prism: { name: '混沌の星晶', color: '#f472b6', spriteId: 'mat_chaos_prism' },
} as const;

export const BASE_MATERIAL_IDS = ['iron_ore', 'magic_stone', 'ancient_scroll'] as const;
export const ENDLESS_RARE_PART_IDS = ['abyss_shard', 'void_gear', 'chaos_prism'] as const;

export const ITEMS: Record<string, ItemDef> = {
  // === WEAPONS ===
  wooden_sword: {
    id: 'wooden_sword',
    name: '旅人の剣',
    category: 'WEAPON',
    rarity: 'COMMON',
    price: 30,
    sellPrice: 15,
    spriteId: 'item_sword_wood',
    description: '扱いやすい基本の剣。攻撃力を少し高める（使用で消費）。',
    lore: '辺境の鍛冶屋が駆け出し冒険者向けに量産する片手剣。使い込むと刃こぼれしやすいが、手になじむ重心のおかげで素直な斬撃が打てる。',
    stats: { atk: 8 },
    shopUnlockClears: 0,
  },
  iron_blade: {
    id: 'iron_blade',
    name: '鉄の長剣',
    category: 'WEAPON',
    rarity: 'COMMON',
    price: 90,
    sellPrice: 45,
    spriteId: 'item_sword_iron',
    description: '鍛えられた鉄製の剣。安定した斬撃を繰り出す。',
    lore: '坑道産の良質な鉄鉱石を何度も折り返し鍛錬した長剣。急所を突く切っ先の鋭さが増しており、序盤の難所越えに欠かせない一本。',
    stats: { atk: 16, crit: 4 },
    shopUnlockClears: 1,
  },
  swift_dagger: {
    id: 'swift_dagger',
    name: '疾風の短剣',
    category: 'WEAPON',
    rarity: 'RARE',
    price: 165,
    sellPrice: 80,
    spriteId: 'item_dagger',
    description: '手数を増やす軽量短剣。攻撃速度と会心が上がる。',
    lore: '風の精霊の加護を刀身に刻んだ軽銀製の短剣。振った瞬間に空気抵抗が消え、敵が身構える前に二度三度と連撃を叩き込める。',
    tags: ['STORM'],
    stats: { atk: 18, spd: 22, crit: 14 },
    shopUnlockClears: 1,
  },
  silver_lance: {
    id: 'silver_lance',
    name: '白銀の騎士槍',
    category: 'WEAPON',
    rarity: 'RARE',
    price: 205,
    sellPrice: 100,
    spriteId: 'item_lance',
    description: '長いリーチと鋭さを持つ銀槍。攻撃力と会心・速度が高水準。',
    lore: 'かつて王都の近衛槍騎士団に支給された純銀メッキの騎兵槍。不死族や重装の敵に対しても装甲の隙間を正確に貫く。',
    tags: ['HOLY'],
    stats: { atk: 24, crit: 10, spd: 12 },
    shopUnlockClears: 1,
  },
  thunder_staff: {
    id: 'thunder_staff',
    name: '雷鳴の魔杖',
    category: 'WEAPON',
    rarity: 'RARE',
    price: 220,
    sellPrice: 110,
    spriteId: 'item_staff',
    description: '雷の魔力を帯びた杖。高い会心率と魔力補正をもたらす。',
    lore: '雷雲の魔石を先端に封じた魔導杖。持ち主の闘気に呼応して紫電を走らせ、鎧の内部から致命的な一撃を見舞う。',
    tags: ['STORM'],
    stats: { atk: 25, crit: 18, maxHp: 20 },
    shopUnlockClears: 2,
  },
  flame_katana: {
    id: 'flame_katana',
    name: '紅蓮の太刀',
    category: 'WEAPON',
    rarity: 'RARE',
    price: 240,
    sellPrice: 120,
    spriteId: 'item_sword_flame',
    description: '炎を纏った名刀。高い攻撃力と会心率を誇る。',
    lore: '灼熱の坑道最奥で鍛え上げられた業物の太刀。抜刀と同時に紅蓮の炎が刃を這い、斬りつけた傷口を焼き続ける。',
    tags: ['FLAME'],
    stats: { atk: 30, crit: 12, spd: 8 },
    shopUnlockClears: 2,
  },
  holy_excalibur: {
    id: 'holy_excalibur',
    name: '聖剣エクスカリバー',
    category: 'WEAPON',
    rarity: 'EPIC',
    price: 430,
    sellPrice: 215,
    spriteId: 'item_excalibur',
    description: '聖なる光を放つ伝説の剣。攻撃・HP・会心を大きく高める。',
    lore: '初代勇者が魔王を封じた際に振るわれたとされる白金の聖剣。握る者の生命力を呼び覚まし、闇に属する魔物を一刀両断にする。',
    tags: ['HOLY'],
    stats: { atk: 42, maxHp: 65, crit: 18 },
    shopUnlockClears: 3,
  },
  abyss_greatsword: {
    id: 'abyss_greatsword',
    name: '深淵の大剣',
    category: 'WEAPON',
    rarity: 'EPIC',
    price: 480,
    sellPrice: 240,
    spriteId: 'item_sword_abyss',
    description: '闇の魔力を秘めた大剣。一撃の威力と吸血効果が強力。',
    lore: '深淵の黒鉄から削り出された呪われし巨剣。斬り裂いた敵の精気を刀身が吸い上げ、使い手の傷を瞬時に塞ぐ危険な代物。',
    tags: ['DARK'],
    stats: { atk: 50, crit: 15, lifesteal: 8 },
    shopUnlockClears: 4,
  },

  // === ARMOR ===
  leather_armor: {
    id: 'leather_armor',
    name: '革の胸当て',
    category: 'ARMOR',
    rarity: 'COMMON',
    price: 35,
    sellPrice: 17,
    spriteId: 'item_armor_leather',
    description: '軽くて丈夫な革鎧。HPと防御を補強する。',
    lore: '魔獣の鞣し革を二重に縫い合わせた軽装鎧。動きをまったく妨げないため、探索に不慣れな旅人でも安心して身を任せられる。',
    stats: { def: 5, maxHp: 28 },
    shopUnlockClears: 0,
  },
  iron_shield: {
    id: 'iron_shield',
    name: '騎士の鉄盾',
    category: 'ARMOR',
    rarity: 'COMMON',
    price: 95,
    sellPrice: 48,
    spriteId: 'item_shield_iron',
    description: '硬い鉄盾。被ダメージを大きく抑える。',
    lore: '厚みのある鍛鉄に補強鋲を打った大盾。重さはあるが真正面からの強打を確実に受け止め、パーティ全体の生存率を高める。',
    stats: { def: 11, maxHp: 45 },
    shopUnlockClears: 1,
  },
  shadow_cloak: {
    id: 'shadow_cloak',
    name: '影縫いの外套',
    category: 'ARMOR',
    rarity: 'RARE',
    price: 185,
    sellPrice: 92,
    spriteId: 'item_cloak',
    description: '素早さと急所狙いを引き上げる闇色のマント。',
    lore: '夜影の糸で織られた暗殺者御用達の外套。輪郭を曖昧にして攻撃をかわしやすくするだけでなく、反撃の一撃を鋭くする。',
    tags: ['DARK'],
    stats: { def: 9, maxHp: 45, spd: 18, crit: 10 },
    shopUnlockClears: 1,
  },
  mithril_plate: {
    id: 'mithril_plate',
    name: 'ミスリルメイル',
    category: 'ARMOR',
    rarity: 'RARE',
    price: 215,
    sellPrice: 105,
    spriteId: 'item_mithril',
    description: '軽く強靭な銀の鎧。防御とHP、行動速度をバランス良く強化。',
    lore: '希少鉱石ミスリルを精錬した白銀の鎖帷子。鋼鉄以上の硬度を持ちながら羽のように軽く、攻守一体の立ち回りを可能にする。',
    tags: ['HOLY'],
    stats: { def: 15, maxHp: 75, spd: 8 },
    shopUnlockClears: 2,
  },
  thorn_mail: {
    id: 'thorn_mail',
    name: '棘の重鎧',
    category: 'ARMOR',
    rarity: 'RARE',
    price: 230,
    sellPrice: 115,
    spriteId: 'item_armor_thorn',
    description: '受けたダメージの一部を敵に跳ね返す重装鎧。',
    lore: '魔鉄の無数の棘を外向きに備えた重鎧。敵が殴りかかるたびに鋭い棘と反発呪術が牙を剥き、攻撃した側にも痛手を与える。',
    stats: { def: 17, maxHp: 85, thorns: 25 },
    shopUnlockClears: 2,
  },
  holy_aegis: {
    id: 'holy_aegis',
    name: '聖域の盾鎧',
    category: 'ARMOR',
    rarity: 'EPIC',
    price: 450,
    sellPrice: 225,
    spriteId: 'item_shield_holy',
    description: '部屋を進むたび傷を癒やす祝福された防具。',
    lore: '聖堂の大司教が幾重もの守護祈祷を込めた白銀の盾鎧。小規模な結界が常に展開されており、部屋を越えるごとに肉体の傷を再生する。',
    tags: ['HOLY'],
    stats: { def: 25, maxHp: 140, regenPerRoom: 20 },
    shopUnlockClears: 4,
  },

  // === CONSUMABLES (RARE+ healing reacts to Allies' HP too!) ===
  party_herb: {
    id: 'party_herb',
    name: '癒やしの薬草束',
    category: 'CONSUMABLE',
    rarity: 'COMMON',
    price: 18,
    sellPrice: 9,
    spriteId: 'item_herb',
    description: '勇者のHPが減った時に使う手軽な薬草（2回分）。',
    lore: '苔むす迷宮の入り口付近でも採れる香り高い薬草を束ねた携帯薬。即効性は控えめだが安価で、2度に分けて服用できる。',
    autoEffect: {
      trigger: 'LOW_HP',
      kind: 'HEAL',
      power: 38,
      uses: 2,
      reactToAllies: false,
      thresholdPct: 55,
      description: '勇者HP55%以下で自動回復 (+38HP)',
    },
    shopUnlockClears: 0,
  },
  red_potion: {
    id: 'red_potion',
    name: '回復薬',
    category: 'CONSUMABLE',
    rarity: 'COMMON',
    price: 28,
    sellPrice: 14,
    spriteId: 'item_potion_red',
    description: '勇者のHPが減った時に自動で味方全体を回復（2回分）。',
    lore: '冒険者ギルド標準規格の赤いポーション。魔石の微粉末を溶かしてあり、霧状にして吸い込むことで仲間にも微かな癒やしが行き渡る。',
    autoEffect: {
      trigger: 'LOW_HP',
      kind: 'HEAL',
      power: 58,
      uses: 2,
      reactToAllies: false,
      thresholdPct: 50,
      description: '勇者HP50%以下で全体回復 (+58HP)',
    },
    shopUnlockClears: 0,
  },
  fire_bomb: {
    id: 'fire_bomb',
    name: '火炎爆弾',
    category: 'CONSUMABLE',
    rarity: 'COMMON',
    price: 40,
    sellPrice: 20,
    spriteId: 'item_bomb',
    description: '強敵や群れに自動で投げつけ、敵全体に炎ダメージ（2回分）。',
    lore: '油と火薬を素焼きの壺に詰めた投擲兵器。敵の数が多い場面や強敵を察知すると自動で点火し、陣形ごと焼き払う。',
    tags: ['FLAME'],
    autoEffect: {
      trigger: 'ELITE_OR_PACK',
      kind: 'BOMB',
      power: 48,
      uses: 2,
      description: '複数敵・強敵戦で自動投擲 (全体48ダメ)',
    },
    shopUnlockClears: 0,
  },
  war_scroll: {
    id: 'war_scroll',
    name: '戦神の巻物',
    category: 'CONSUMABLE',
    rarity: 'RARE',
    price: 85,
    sellPrice: 40,
    spriteId: 'item_scroll',
    description: 'ボス戦で自動的に発動し、パーティの攻撃力を大幅強化。',
    lore: '古の戦将が記した軍陣魔術の巻物。強大なボスの魔力を感知すると封印が解け、勇者の剣に闘神の加護を宿らせる。',
    autoEffect: {
      trigger: 'BOSS',
      kind: 'BUFF_ATK',
      power: 35,
      uses: 1,
      description: 'ボス戦開始時に自動発動 (攻撃+35%)',
    },
    shopUnlockClears: 0,
  },
  hi_potion: {
    id: 'hi_potion',
    name: '上等な回復薬',
    category: 'CONSUMABLE',
    rarity: 'RARE',
    price: 82,
    sellPrice: 41,
    spriteId: 'item_potion_gold',
    description: 'RARE以上効果：勇者だけでなく仲間のHP減少にも反応して全員を回復（2回分）。',
    lore: '高純度の魔石エキスから抽出された黄金色の霊薬。共鳴魔術が組み込まれており、仲間がピンチに陥った瞬間にも即座に霧散して救う。',
    autoEffect: {
      trigger: 'LOW_HP',
      kind: 'HEAL',
      power: 125,
      uses: 2,
      reactToAllies: true,
      thresholdPct: 55,
      description: '勇者・仲間のHP55%以下で全体回復 (+125HP)',
    },
    shopUnlockClears: 1,
  },
  holy_bell: {
    id: 'holy_bell',
    name: '聖光の鈴',
    category: 'CONSUMABLE',
    rarity: 'RARE',
    price: 96,
    sellPrice: 48,
    spriteId: 'item_bell',
    description: 'RARE以上効果：仲間を含む誰かのHPが減った瞬間に響き、3回まで全体を癒やす。',
    lore: '聖歌隊の祈りを封じた小さな銀の鈴。誰かの危機に反応して清澄な音色を奏で、3度までパーティ全員の傷を癒やし続ける。',
    tags: ['HOLY'],
    autoEffect: {
      trigger: 'LOW_HP',
      kind: 'HEAL',
      power: 95,
      uses: 3,
      reactToAllies: true,
      thresholdPct: 52,
      description: '勇者・仲間のHP52%以下で全体回復 (+95HP · 3回)',
    },
    shopUnlockClears: 2,
  },
  ice_crystal: {
    id: 'ice_crystal',
    name: '氷結の結晶',
    category: 'CONSUMABLE',
    rarity: 'RARE',
    price: 95,
    sellPrice: 47,
    spriteId: 'item_ice_crystal',
    description: '強敵や群れに自動炸裂し、敵全体へ78ダメージの大氷撃（2回分）。',
    lore: '万年雪の頂から切り出された魔力氷晶。衝撃で砕け散ると絶対零度の吹雪を生み出し、敵の群れを一網打尽にする。',
    autoEffect: {
      trigger: 'ELITE_OR_PACK',
      kind: 'BOMB',
      power: 78,
      uses: 2,
      description: '複数敵・強敵戦で自動炸裂 (全体78ダメ)',
    },
    shopUnlockClears: 2,
  },
  guardian_scroll: {
    id: 'guardian_scroll',
    name: '守護の結界札',
    category: 'CONSUMABLE',
    rarity: 'RARE',
    price: 90,
    sellPrice: 45,
    spriteId: 'item_barrier_scroll',
    description: 'ボス戦で自動発動し、パーティ全員の防御力を+14高める結界を張る。',
    lore: '城塞都市の結界師が書き上げた守護符。主敵の咆哮に合わせて自動展開し、パーティ全体の皮膚を鋼のように硬質化させる。',
    autoEffect: {
      trigger: 'BOSS',
      kind: 'BUFF_DEF',
      power: 14,
      uses: 1,
      description: 'ボス戦開始時に自動発動 (全体防御+14)',
    },
    shopUnlockClears: 1,
  },
  elixir_bottle: {
    id: 'elixir_bottle',
    name: '奇跡のエリクサー',
    category: 'CONSUMABLE',
    rarity: 'EPIC',
    price: 210,
    sellPrice: 105,
    spriteId: 'item_elixir',
    description: 'EPIC霊薬：勇者・仲間のHPが48%以下で自動発動し、全員を大きく回復＆攻撃+20%！',
    lore: '古代錬金術師が追い求めた究極の万薬。生命の飛躍的な回復と同時に戦意をも燃え上がらせ、逆転の狼煙を上げる。',
    autoEffect: {
      trigger: 'LOW_HP',
      kind: 'HEAL_AND_BUFF',
      power: 240,
      uses: 2,
      reactToAllies: true,
      thresholdPct: 48,
      description: '勇者・仲間HP48%以下で+240回復＆攻撃+20%',
    },
    shopUnlockClears: 3,
  },
  phoenix_feather: {
    id: 'phoenix_feather',
    name: '不死鳥の羽',
    category: 'CONSUMABLE',
    rarity: 'EPIC',
    price: 190,
    sellPrice: 95,
    spriteId: 'item_feather',
    description: '勇者が倒れた瞬間に一度だけ自動で蘇生させる秘宝。',
    lore: '灰の中から蘇る霊鳥フェニックスの尾羽。持ち主の鼓動が途絶えた瞬間に黄金の炎となって燃え上がり、肉体を再構築して蘇らせる。',
    tags: ['FLAME'],
    autoEffect: {
      trigger: 'ON_DEATH',
      kind: 'REVIVE',
      power: 65,
      uses: 1,
      description: '戦闘不能時に自動でHP65%蘇生',
    },
    shopUnlockClears: 3,
  },

  // === RELICS ===
  gold_charm: {
    id: 'gold_charm',
    name: '黄金の護符',
    category: 'RELIC',
    rarity: 'COMMON',
    price: 95,
    sellPrice: 48,
    spriteId: 'item_charm_gold',
    description: 'ダンジョン内で得るゴールドが35%増加する幸運の護符。',
    lore: '商人の守り神を象った純金製の護符。魔物が隠していた金貨の気配を引き寄せ、普段より多くの財宝を発見できるようにする。',
    stats: { goldBonus: 35, dropBonus: 15 },
    shopUnlockClears: 0,
  },
  lucky_clover: {
    id: 'lucky_clover',
    name: '四つ葉の魔札',
    category: 'RELIC',
    rarity: 'COMMON',
    price: 85,
    sellPrice: 42,
    spriteId: 'item_clover',
    description: '素材ドロップ率と会心率、獲得ゴールドをまんべんなく上げる。',
    lore: '幸運の四つ葉を押し花にして封じたタロット風の魔札。わずかな確率の偏りを引き寄せ、素材の入手から急所突きまで幅広く助ける。',
    stats: { goldBonus: 25, dropBonus: 35, crit: 6 },
    shopUnlockClears: 0,
  },
  vampire_fang: {
    id: 'vampire_fang',
    name: '吸血の牙',
    category: 'RELIC',
    rarity: 'RARE',
    price: 155,
    sellPrice: 75,
    spriteId: 'item_fang',
    description: '攻撃時に与えたダメージの12%をHPとして吸収する魔道具。',
    lore: '古の吸血鬼伯爵から抜き取られた鋭い犬歯の加工品。懐に忍ばせるだけで攻撃に生命吸収の呪いが乗る。',
    tags: ['DARK'],
    stats: { atk: 6, lifesteal: 12 },
    shopUnlockClears: 1,
  },
  wind_boots: {
    id: 'wind_boots',
    name: '風精のブーツ',
    category: 'RELIC',
    rarity: 'RARE',
    price: 165,
    sellPrice: 80,
    spriteId: 'item_boots',
    description: '行動間隔を縮め、会心攻撃の発生率も引き上げる。',
    lore: 'シルフの羽根を編み込んだ軽量ブーツ。踏み込みの一歩が風のように鋭くなり、攻撃回数とクリティカル率が目に見えて上がる。',
    tags: ['STORM'],
    stats: { spd: 20, crit: 10 },
    shopUnlockClears: 1,
  },
  berserk_ring: {
    id: 'berserk_ring',
    name: '狂戦士の指輪',
    category: 'RELIC',
    rarity: 'RARE',
    price: 195,
    sellPrice: 95,
    spriteId: 'item_berserk_ring',
    description: '守りを削る代わりに攻撃力と会心率を劇的に引き上げる指輪。',
    lore: '闘争本能を極限まで煽る紅黒の指輪。防衛意識が薄れる代償として、全ての斬撃が敵を粉砕する必殺の重みを得る。',
    tags: ['DARK'],
    stats: { atk: 20, crit: 14, def: -3 },
    shopUnlockClears: 2,
  },
  healing_chalice: {
    id: 'healing_chalice',
    name: '癒やしの聖杯',
    category: 'RELIC',
    rarity: 'RARE',
    price: 200,
    sellPrice: 100,
    spriteId: 'item_chalice',
    description: '部屋の踏破ごとに味方全体のHPを少しずつ回復する。',
    lore: '尽きることなく清浄な霊水が湧き出る銀の聖杯。戦いの合間にひと口含むだけで、疲労と傷がみるみる癒えていく。',
    tags: ['HOLY'],
    stats: { maxHp: 35, regenPerRoom: 24 },
    shopUnlockClears: 2,
  },
  sage_orb: {
    id: 'sage_orb',
    name: '賢者の宝珠',
    category: 'RELIC',
    rarity: 'EPIC',
    price: 380,
    sellPrice: 190,
    spriteId: 'item_sage_orb',
    description: '生命・魔力・再生・財宝の恩恵を併せ持つ大魔導師の宝珠。',
    lore: 'かつて星屑の古戦場で詠唱を極めた大賢者が遺した結晶球。あらゆる戦局を最適化する知恵の輝きが宿っている。',
    stats: { maxHp: 75, atk: 18, regenPerRoom: 26, goldBonus: 20 },
    shopUnlockClears: 3,
  },
  dragon_heart: {
    id: 'dragon_heart',
    name: '竜の心臓石',
    category: 'RELIC',
    rarity: 'EPIC',
    price: 420,
    sellPrice: 210,
    spriteId: 'item_dragon_heart',
    description: '莫大な生命力と攻撃力を宿す古代竜の結晶。',
    lore: '千年を生きた古竜の胸奥で結晶化した魔核。鼓動のように脈打つ熱量が、持ち主へ竜族さながらのタフネスと剛力を授ける。',
    tags: ['FLAME'],
    stats: { maxHp: 115, atk: 24, def: 10 },
    shopUnlockClears: 4,
  },

  // === ULTIMATE ENDGAME ITEMS (Ultra-rare: Boss Rush 2% / Secret Dungeon 0.5% / Endless 15F+ Boss 0.8%) ===
  god_blade_genesis: {
    id: 'god_blade_genesis',
    name: '創世の神剣ジェネシス',
    category: 'WEAPON',
    rarity: 'EPIC',
    price: 1200,
    sellPrice: 400,
    spriteId: 'item_god_blade',
    description: '強化ボスラッシュ踏破（2%）や裏ダンジョン踏破（0.5%）・無限回廊15F以降ボス（0.8%）で極低確率入手できる最強の神剣。圧倒的な火力と吸血・連撃性能を誇る。',
    lore: '世界創世の閃光が具現化したとされる究極の神剣。ただ一振りするだけで星辰を裂き、斬った相手の生命すら吸収して主を無敵に近づける。',
    tags: ['ULTIMATE', 'HOLY'],
    stats: { atk: 95, crit: 30, spd: 30, lifesteal: 15 },
    isUltimate: true,
  },
  celestial_aegis: {
    id: 'celestial_aegis',
    name: '天界の神鎧イージス',
    category: 'ARMOR',
    rarity: 'EPIC',
    price: 1200,
    sellPrice: 400,
    spriteId: 'item_god_aegis',
    description: '強化ボスラッシュ踏破（2%）や裏ダンジョン踏破（0.5%）・無限回廊15F以降ボス（0.8%）で極低確率入手できる最強の聖鎧。鉄壁の守りと毎部屋の自動再生、反射を併せ持つ。',
    lore: '天界の主神が自ら纏ったと伝えられる絶対守護の神鎧。あらゆる災厄を弾き返すと同時に傷を再生し、挑戦者を不沈の城塞に変える。',
    tags: ['ULTIMATE', 'HOLY'],
    stats: { def: 45, maxHp: 280, regenPerRoom: 45, thorns: 40 },
    isUltimate: true,
  },
  infinity_crown: {
    id: 'infinity_crown',
    name: '無限の覇王冠',
    category: 'RELIC',
    rarity: 'EPIC',
    price: 1200,
    sellPrice: 400,
    spriteId: 'item_infinity_crown',
    description: '強化ボスラッシュ踏破（2%）や裏ダンジョン踏破（0.5%）・無限回廊15F以降ボス（0.8%）で極低確率入手できる究極の秘宝。全能力と財宝獲得効率を極限まで引き上げる。',
    lore: '輪廻の理を超越した覇王の証。戴く者の全能力を限界以上に解き放ち、迷宮に眠るあらゆる富と知識を惹きつける奇跡の宝冠。',
    tags: ['ULTIMATE'],
    stats: { atk: 42, def: 24, maxHp: 180, spd: 20, crit: 18, goldBonus: 60, dropBonus: 50 },
    isUltimate: true,
  },
  panacea_ambrosia: {
    id: 'panacea_ambrosia',
    name: '神々の霊薬アンブロシア',
    category: 'CONSUMABLE',
    rarity: 'EPIC',
    price: 800,
    sellPrice: 300,
    spriteId: 'item_ambrosia',
    description: '強化ボスラッシュ踏破（2%）や裏ダンジョン踏破（0.5%）・無限回廊15F以降ボス（0.8%）で極低確率入手できる究極の霊薬。勇者・仲間の危機に3回まで全体超回復＆攻撃+35%。',
    lore: '神々の宴でのみ供される不老不死の霊酒。一滴口に含めば瀕死の部隊すら瞬時に全盛期以上の闘志を取り戻す。',
    tags: ['ULTIMATE'],
    autoEffect: {
      trigger: 'LOW_HP',
      kind: 'HEAL_AND_BUFF',
      power: 480,
      uses: 3,
      reactToAllies: true,
      thresholdPct: 58,
      description: '勇者・仲間HP58%以下で全体+480回復＆攻撃+35%（3回）',
    },
    isUltimate: true,
  },

  // === TRUE ENDGAME FORGE-EXCLUSIVE ITEMS (Unlocked at Endless 100F+) ===
  void_breaker_eternity: {
    id: 'void_breaker_eternity',
    name: '虚無断つ神槍エタニティ',
    category: 'WEAPON',
    rarity: 'EPIC',
    price: 3600,
    sellPrice: 1200,
    spriteId: 'item_void_lance',
    description: '無限回廊100F突破で鍛造解禁。神剣すら凌ぐ究極の一撃と超高速連撃・吸血を兼備する鍛冶屋限定の超越神槍。',
    lore: '無限回廊の百層を越えた鍛冶神が、虚無の結晶と古の竜鉄を打って仕上げた至高の神槍。空間そのものを穿ち、敵の生命力を根こそぎ奪い取る。',
    tags: ['ULTIMATE', 'STORM', 'DARK'],
    stats: { atk: 145, crit: 38, spd: 42, lifesteal: 18 },
    isUltimate: true,
    isForgeExclusive: true,
  },
  astral_barrier_omega: {
    id: 'astral_barrier_omega',
    name: '星界の神盾鎧オメガ',
    category: 'ARMOR',
    rarity: 'EPIC',
    price: 3600,
    sellPrice: 1200,
    spriteId: 'item_omega_armor',
    description: '無限回廊100F突破で鍛造解禁。星辰の絶対結界により凄まじい生命・防御・毎階自動再生・反射をもたらす究極防具。',
    lore: '終焉領域の星光を集約し鍛造された星界の鎧。纏う者の周囲に幾重もの星盾を展開し、受けた攻撃を倍以上の輝きで跳ね返す。',
    tags: ['ULTIMATE', 'HOLY'],
    stats: { def: 72, maxHp: 460, regenPerRoom: 85, thorns: 60 },
    isUltimate: true,
    isForgeExclusive: true,
  },
  abyssal_core_paradox: {
    id: 'abyssal_core_paradox',
    name: '深淵の魔核パラドクス',
    category: 'RELIC',
    rarity: 'EPIC',
    price: 4000,
    sellPrice: 1400,
    spriteId: 'item_abyss_core',
    description: '無限回廊100F突破で鍛造解禁。あらゆる戦闘能力と財宝獲得倍率を極限まで底上げする、鍛冶屋限定の終極魔道具。',
    lore: '無限深淵の底で脈動していた矛盾の魔核を秘法で封じた宝珠。破壊と再生、強欲と祝福の相反する力が一つの核で共鳴している。',
    tags: ['ULTIMATE', 'DARK', 'FLAME'],
    stats: { atk: 70, def: 38, maxHp: 300, spd: 28, crit: 24, lifesteal: 8, goldBonus: 90, dropBonus: 80 },
    isUltimate: true,
    isForgeExclusive: true,
  },
  philosopher_nectar: {
    id: 'philosopher_nectar',
    name: '賢者の不老神酒ネクタール',
    category: 'CONSUMABLE',
    rarity: 'EPIC',
    price: 2600,
    sellPrice: 900,
    spriteId: 'item_nectar',
    description: '無限回廊100F突破で鍛造解禁。勇者・仲間の危機に4回まで全体+920回復＆攻撃+45%をもたらす至高の神酒。',
    lore: '太古の賢者が不滅の霊薬をさらに昇華させた究極の一滴。ひとたび香気が広がれば、深淵の死線すら跳ね返す不屈の活力が湧き上がる。',
    tags: ['ULTIMATE', 'HOLY'],
    autoEffect: {
      trigger: 'LOW_HP',
      kind: 'HEAL_AND_BUFF',
      power: 920,
      uses: 4,
      reactToAllies: true,
      thresholdPct: 62,
      description: '勇者・仲間HP62%以下で全体+920回復＆攻撃+45%（4回）',
    },
    isUltimate: true,
    isForgeExclusive: true,
  },
};

export const ULTIMATE_ITEM_IDS = [
  'god_blade_genesis',
  'celestial_aegis',
  'infinity_crown',
  'panacea_ambrosia',
] as const;

export const FORGE_EXCLUSIVE_ITEM_IDS = [
  'void_breaker_eternity',
  'astral_barrier_omega',
  'abyssal_core_paradox',
  'philosopher_nectar',
] as const;

export function getShopMaxStock(item: ItemDef, totalClears: number): number {
  const base = item.category === 'CONSUMABLE' ? 2 : 1;
  return base + totalClears;
}

export function isItemUnlockedInShop(item: ItemDef, totalClears: number): boolean {
  if (item.isUltimate) return false;
  return (item.shopUnlockClears ?? 0) <= totalClears;
}

export type DropSource = 'RACK' | 'CHEST' | 'BOSS';

export interface StageDropProfile {
  effectiveDifficulty: number;
  maxItemTier: number;
  minCommonTier: number;
  minRareTier: number;
  minEpicTier: number;
  maxEpicTier: number;
  weights: Record<DropSource, { common: number; rare: number; epic: number }>;
  summaryLabel: string;
  summaryDetail: string;
}

export const ENDLESS_BENCHMARK_LOOP = 6;

export function getStageDropProfile(
  stageId: number,
  loopCount: number,
  isBossRush = false,
  floor?: number
): StageDropProfile {
  const loop = stageId === 11 ? ENDLESS_BENCHMARK_LOOP : Math.max(1, loopCount);
  const effectiveDifficulty =
    isBossRush || stageId === 11
      ? 5 + Math.floor((Math.max(1, floor ?? 5) - 1) / 2) + (loop - 1) * 2
      : stageId + (loop - 1) * 2;

  if (effectiveDifficulty <= 1) {
    return {
      effectiveDifficulty,
      maxItemTier: 1,
      minCommonTier: 0,
      minRareTier: 0,
      minEpicTier: 3,
      maxEpicTier: 0,
      weights: {
        RACK: { common: 100, rare: 0, epic: 0 },
        CHEST: { common: 85, rare: 15, epic: 0 },
        BOSS: { common: 65, rare: 35, epic: 0 },
      },
      summaryLabel: 'COMMON主体 · 宝箱/ボスで序盤RARE',
      summaryDetail:
        '1周目ステージ1のため基本COMMON中心。ボスや宝箱から序盤RAREのみ出現（EPICは未出現）。',
    };
  }

  if (effectiveDifficulty === 2) {
    return {
      effectiveDifficulty,
      maxItemTier: 1,
      minCommonTier: 0,
      minRareTier: 0,
      minEpicTier: 3,
      maxEpicTier: 0,
      weights: {
        RACK: { common: 90, rare: 10, epic: 0 },
        CHEST: { common: 68, rare: 32, epic: 0 },
        BOSS: { common: 25, rare: 75, epic: 0 },
      },
      summaryLabel: 'COMMON〜序盤RARE（EPIC未出現）',
      summaryDetail:
        '鉄製装備や序盤RARE（疾風の短剣・上等な回復薬・結界札など）が出現します。',
    };
  }

  if (effectiveDifficulty === 3) {
    return {
      effectiveDifficulty,
      maxItemTier: 2,
      minCommonTier: 0,
      minRareTier: 0,
      minEpicTier: 3,
      maxEpicTier: 0,
      weights: {
        RACK: { common: 75, rare: 25, epic: 0 },
        CHEST: { common: 45, rare: 55, epic: 0 },
        BOSS: { common: 0, rare: 100, epic: 0 },
      },
      summaryLabel: '中堅RARE解禁（ボスRARE確定）',
      summaryDetail:
        '紅蓮の太刀・ミスリルメイル・聖光の鈴など中堅RAREが解禁されます（EPICはまだ出現しません）。',
    };
  }

  if (effectiveDifficulty === 4) {
    return {
      effectiveDifficulty,
      maxItemTier: 3,
      minCommonTier: 0,
      minRareTier: 0,
      minEpicTier: 3,
      maxEpicTier: 3,
      weights: {
        RACK: { common: 60, rare: 40, epic: 0 },
        CHEST: { common: 30, rare: 62, epic: 8 },
        BOSS: { common: 0, rare: 80, epic: 20 },
      },
      summaryLabel: 'RARE中心 · まれに上位EPIC出現',
      summaryDetail:
        '宝箱(8%)・ボス(20%)から聖剣エクスカリバーや不死鳥の羽など上位EPICが出現し始めます。',
    };
  }

  if (effectiveDifficulty === 5) {
    return {
      effectiveDifficulty,
      maxItemTier: 3,
      minCommonTier: 0,
      minRareTier: 1,
      minEpicTier: 3,
      maxEpicTier: 3,
      weights: {
        RACK: { common: 45, rare: 55, epic: 0 },
        CHEST: { common: 18, rare: 67, epic: 15 },
        BOSS: { common: 0, rare: 65, epic: 35 },
      },
      summaryLabel: isBossRush && floor === undefined
        ? '階層連動（終盤EPIC高確率）＋踏破2%で最強装備抽選'
        : '上位RARE主力 · ボス35%でEPIC',
      summaryDetail: isBossRush && floor === undefined
        ? '1〜3階はRARE/EPIC、中盤以降は最上位EPICが高確率で出現。さらに踏破時2%の超低確率で最強装備4種のいずれか1つが出現（確定なし）！'
        : '中〜上位RAREが主力となり、ボス討伐では35%の確率でTier3 EPICがドロップします。',
    };
  }

  if (effectiveDifficulty === 6) {
    return {
      effectiveDifficulty,
      maxItemTier: 4,
      minCommonTier: 1,
      minRareTier: 1,
      minEpicTier: 3,
      maxEpicTier: 4,
      weights: {
        RACK: { common: 30, rare: 65, epic: 5 },
        CHEST: { common: 0, rare: 76, epic: 24 },
        BOSS: { common: 0, rare: 45, epic: 55 },
      },
      summaryLabel: '最上位EPIC解禁（ボス55%でEPIC）',
      summaryDetail:
        '深淵の大剣・聖域の盾鎧・竜の心臓石を含む全EPIC（実績限定除く）が解禁されます。',
    };
  }

  if (effectiveDifficulty <= 8) {
    return {
      effectiveDifficulty,
      maxItemTier: 4,
      minCommonTier: 1,
      minRareTier: 1,
      minEpicTier: 3,
      maxEpicTier: 4,
      weights: {
        RACK: { common: 15, rare: 73, epic: 12 },
        CHEST: { common: 0, rare: 62, epic: 38 },
        BOSS: { common: 0, rare: 30, epic: 70 },
      },
      summaryLabel: isBossRush && floor === undefined
        ? '階層連動（序盤RARE/EPIC → 終盤EPIC 85%）'
        : '上位RARE & 高確率EPIC (ボス70%)',
      summaryDetail:
        '高周回・裏ステージ帯として序盤COMMONをほぼ排し、上位RAREと全EPICが高確率で出現します。',
    };
  }

  return {
    effectiveDifficulty,
    maxItemTier: 4,
    minCommonTier: 1,
    minRareTier: 2,
    minEpicTier: 3,
    maxEpicTier: 4,
    weights: {
      RACK: { common: 0, rare: 75, epic: 25 },
      CHEST: { common: 0, rare: 50, epic: 50 },
      BOSS: { common: 0, rare: 15, epic: 85 },
    },
    summaryLabel: isBossRush && floor === undefined
      ? '階層連動（全階 上位RARE〜最上位EPIC）'
      : '最上位RARE & EPIC高確率 (ボス85%)',
    summaryDetail:
      '高周回・最深部帯として最上位RAREと全EPIC（Tier3〜4）のみが戦利品として出現します。',
  };
}

export function rollDropItem(params: {
  stageId: number;
  loopCount: number;
  source: DropSource;
  floor?: number;
  isBossRush?: boolean;
}): ItemDef | null {
  const profile = getStageDropProfile(
    params.stageId,
    params.loopCount,
    params.isBossRush,
    params.floor
  );
  const w = profile.weights[params.source];
  const eligible = Object.values(ITEMS).filter(
    (it) => !it.isUltimate && (it.shopUnlockClears ?? 0) <= profile.maxItemTier
  );
  if (eligible.length === 0) return null;

  const commonPool = eligible.filter(
    (it) => it.rarity === 'COMMON' && (it.shopUnlockClears ?? 0) >= profile.minCommonTier
  );
  const rarePool = eligible.filter(
    (it) => it.rarity === 'RARE' && (it.shopUnlockClears ?? 0) >= profile.minRareTier
  );
  const epicPool = eligible.filter(
    (it) =>
      it.rarity === 'EPIC' &&
      (it.shopUnlockClears ?? 0) >= profile.minEpicTier &&
      (it.shopUnlockClears ?? 0) <= profile.maxEpicTier
  );

  const buckets: { pool: ItemDef[]; weight: number }[] = [
    { pool: commonPool, weight: w.common },
    { pool: rarePool, weight: w.rare },
    { pool: epicPool, weight: w.epic },
  ].filter((b) => b.pool.length > 0 && b.weight > 0);

  if (buckets.length === 0) {
    // Fallback strictly within stage/loop maxItemTier
    return eligible[Math.floor(Math.random() * eligible.length)];
  }

  const totalWeight = buckets.reduce((sum, b) => sum + b.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const b of buckets) {
    roll -= b.weight;
    if (roll <= 0) {
      return b.pool[Math.floor(Math.random() * b.pool.length)];
    }
  }
  const last = buckets[buckets.length - 1];
  return last.pool[Math.floor(Math.random() * last.pool.length)];
}

export const FORGE_RECIPES: ForgeRecipe[] = [
  {
    id: 'craft_iron_blade',
    resultItemId: 'iron_blade',
    goldCost: 35,
    materials: { iron_ore: 3 },
  },
  {
    id: 'craft_silver_lance',
    resultItemId: 'silver_lance',
    goldCost: 85,
    materials: { iron_ore: 4, magic_stone: 2 },
  },
  {
    id: 'craft_flame_katana',
    resultItemId: 'flame_katana',
    goldCost: 95,
    materials: { iron_ore: 5, magic_stone: 3 },
  },
  {
    id: 'craft_mithril_plate',
    resultItemId: 'mithril_plate',
    goldCost: 90,
    materials: { iron_ore: 5, magic_stone: 2 },
  },
  {
    id: 'craft_thorn_mail',
    resultItemId: 'thorn_mail',
    goldCost: 100,
    materials: { iron_ore: 6, magic_stone: 2 },
  },
  {
    id: 'craft_war_scroll',
    resultItemId: 'war_scroll',
    goldCost: 30,
    materials: { ancient_scroll: 2 },
  },
  {
    id: 'craft_holy_bell',
    resultItemId: 'holy_bell',
    goldCost: 45,
    materials: { magic_stone: 2, ancient_scroll: 1 },
  },
  {
    id: 'craft_elixir',
    resultItemId: 'elixir_bottle',
    goldCost: 95,
    materials: { magic_stone: 3, ancient_scroll: 2 },
  },
  {
    id: 'craft_phoenix_feather',
    resultItemId: 'phoenix_feather',
    goldCost: 85,
    materials: { magic_stone: 4, ancient_scroll: 2 },
  },
  {
    id: 'craft_excalibur',
    resultItemId: 'holy_excalibur',
    goldCost: 200,
    materials: { iron_ore: 7, magic_stone: 5, ancient_scroll: 3 },
    requiredStageCleared: 2,
  },
  {
    id: 'craft_abyss_greatsword',
    resultItemId: 'abyss_greatsword',
    goldCost: 220,
    materials: { iron_ore: 8, magic_stone: 6, ancient_scroll: 3 },
    requiredStageCleared: 2,
  },
  {
    id: 'craft_holy_aegis',
    resultItemId: 'holy_aegis',
    goldCost: 200,
    materials: { iron_ore: 8, magic_stone: 5, ancient_scroll: 3 },
    requiredStageCleared: 2,
  },
  {
    id: 'craft_sage_orb',
    resultItemId: 'sage_orb',
    goldCost: 190,
    materials: { magic_stone: 6, ancient_scroll: 4 },
    requiredStageCleared: 2,
  },
  {
    id: 'craft_dragon_heart',
    resultItemId: 'dragon_heart',
    goldCost: 230,
    materials: { magic_stone: 8, ancient_scroll: 4 },
    requiredStageCleared: 2,
  },
  {
    id: 'forge_void_breaker',
    resultItemId: 'void_breaker_eternity',
    goldCost: 25000,
    materials: {
      iron_ore: 30,
      magic_stone: 25,
      ancient_scroll: 15,
      abyss_shard: 1,
      void_gear: 1,
      chaos_prism: 1,
    },
    requiredItems: [{ itemId: 'god_blade_genesis', count: 1 }],
    requiredEndlessFloor: 100,
  },
  {
    id: 'forge_astral_barrier',
    resultItemId: 'astral_barrier_omega',
    goldCost: 25000,
    materials: {
      iron_ore: 32,
      magic_stone: 25,
      ancient_scroll: 15,
      abyss_shard: 1,
      void_gear: 1,
      chaos_prism: 1,
    },
    requiredItems: [{ itemId: 'celestial_aegis', count: 1 }],
    requiredEndlessFloor: 100,
  },
  {
    id: 'forge_abyssal_core',
    resultItemId: 'abyssal_core_paradox',
    goldCost: 28000,
    materials: {
      iron_ore: 20,
      magic_stone: 35,
      ancient_scroll: 20,
      abyss_shard: 1,
      void_gear: 1,
      chaos_prism: 1,
    },
    requiredItems: [{ itemId: 'infinity_crown', count: 1 }],
    requiredEndlessFloor: 100,
  },
  {
    id: 'forge_philosopher_nectar',
    resultItemId: 'philosopher_nectar',
    goldCost: 18000,
    materials: {
      magic_stone: 25,
      ancient_scroll: 20,
      abyss_shard: 1,
      void_gear: 1,
      chaos_prism: 1,
    },
    requiredItems: [{ itemId: 'panacea_ambrosia', count: 1 }],
    requiredEndlessFloor: 100,
  },
];

export const BLESSINGS: BlessingDef[] = [
  {
    id: 'flame_blessing',
    name: '炎帝の加護',
    title: '攻撃特化',
    spriteId: 'bless_flame',
    color: '#ef4444',
    unlockCostGold: 70,
    unlockCostStones: 1,
    maxLevel: 3,
    upgradeBaseGold: 130,
    upgradeBaseStones: 2,
    descriptionPerLevel: (lv) => `攻撃力 +${12 * lv}% · 攻撃時${15 + lv * 8}%で炎上追撃`,
    getBonuses: (lv) => ({ atkPct: 12 * lv, burnChance: 15 + lv * 8 }),
  },
  {
    id: 'tree_blessing',
    name: '聖樹の加護',
    title: '生命・再生',
    spriteId: 'bless_tree',
    color: '#10b981',
    unlockCostGold: 65,
    unlockCostStones: 1,
    maxLevel: 3,
    upgradeBaseGold: 120,
    upgradeBaseStones: 2,
    descriptionPerLevel: (lv) => `最大HP +${15 * lv}% · 部屋移動ごとにHP +${12 * lv}回復`,
    getBonuses: (lv) => ({ hpPct: 15 * lv, roomHeal: 12 * lv }),
  },
  {
    id: 'shield_blessing',
    name: '鉄壁の加護',
    title: '堅牢守護',
    spriteId: 'bless_shield',
    color: '#60a5fa',
    unlockCostGold: 80,
    unlockCostStones: 1,
    maxLevel: 3,
    upgradeBaseGold: 140,
    upgradeBaseStones: 2,
    descriptionPerLevel: (lv) => `防御力 +${22 * lv}% · 勇者の最大HP +${8 * lv}%`,
    getBonuses: (lv) => ({ defPct: 22 * lv, hpPct: 8 * lv }),
  },
  {
    id: 'wind_blessing',
    name: '疾風の加護',
    title: '高速連撃',
    spriteId: 'bless_wind',
    color: '#34d399',
    unlockCostGold: 90,
    unlockCostStones: 2,
    maxLevel: 3,
    upgradeBaseGold: 150,
    upgradeBaseStones: 3,
    descriptionPerLevel: (lv) => `攻撃速度 +${14 * lv}% · 会心率 +${6 * lv}%`,
    getBonuses: (lv) => ({ spdPct: 14 * lv, critPct: 6 * lv }),
  },
  {
    id: 'vampire_blessing',
    name: '紅月の加護',
    title: '吸血継戦',
    spriteId: 'bless_blood',
    color: '#f43f5e',
    unlockCostGold: 110,
    unlockCostStones: 2,
    maxLevel: 3,
    upgradeBaseGold: 170,
    upgradeBaseStones: 3,
    descriptionPerLevel: (lv) => `与ダメージの ${6 * lv}% をHPとして吸収`,
    getBonuses: (lv) => ({ lifestealPct: 6 * lv }),
  },
  {
    id: 'thunder_blessing',
    name: '雷鳴の加護',
    title: '連鎖電撃',
    spriteId: 'bless_thunder',
    color: '#facc15',
    unlockCostGold: 120,
    unlockCostStones: 2,
    maxLevel: 3,
    upgradeBaseGold: 180,
    upgradeBaseStones: 3,
    descriptionPerLevel: (lv) => `会心率 +${8 * lv}% · ${15 + lv * 10}%の確率で敵全体に電撃`,
    getBonuses: (lv) => ({ critPct: 8 * lv, chainLightningChance: 15 + lv * 10 }),
  },
  {
    id: 'gold_blessing',
    name: '黄金の加護',
    title: '戦利品増加',
    spriteId: 'bless_gold',
    color: '#f59e0b',
    unlockCostGold: 85,
    unlockCostStones: 1,
    maxLevel: 3,
    upgradeBaseGold: 140,
    upgradeBaseStones: 2,
    descriptionPerLevel: (lv) => `獲得ゴールド +${25 * lv}% · 素材ドロップ率上昇`,
    getBonuses: (lv) => ({ goldPct: 25 * lv }),
  },
  {
    id: 'bond_blessing',
    name: '絆の加護',
    title: '仲間強化',
    spriteId: 'bless_bond',
    color: '#a78bfa',
    unlockCostGold: 100,
    unlockCostStones: 2,
    maxLevel: 3,
    upgradeBaseGold: 160,
    upgradeBaseStones: 2,
    descriptionPerLevel: (lv) => `同行中の味方の攻撃力・回復力・HP +${15 * lv}%`,
    getBonuses: (lv) => ({ allyPowerPct: 15 * lv }),
  },
];

export const ALLIES: AllyDef[] = [
  {
    id: 'cleric_lilia',
    name: '聖職者 リリア',
    roleName: '回復支援',
    role: 'HEALER',
    spriteId: 'ally_cleric',
    hireCost: 90,
    upgradeBaseCost: 115,
    baseHp: 80,
    baseAtk: 12,
    baseDef: 4,
    attackIntervalMs: 1750,
    range: 'RANGED',
    skillDescription: '傷ついた味方を聖なる光で自動回復し、合間に光弾で攻撃。',
    passiveBonusText: 'パーティの被回復量 +15%',
    awakeningBonusText: (rank) =>
      `特技覚醒 ★${rank}/3: 回復倍率 +${rank * 25}% · 全体小回復確率追加`,
  },
  {
    id: 'knight_gald',
    name: '重騎士 ガルド',
    roleName: '前衛盾役',
    role: 'TANK',
    spriteId: 'ally_knight',
    hireCost: 110,
    upgradeBaseCost: 125,
    baseHp: 145,
    baseAtk: 11,
    baseDef: 11,
    attackIntervalMs: 1550,
    range: 'MELEE',
    skillDescription: '高いHPと防御を誇る盾役。前衛に置くとパーティを守りやすい。',
    passiveBonusText: '防御・HPが高く前衛向き',
    awakeningBonusText: (rank) =>
      `特技覚醒 ★${rank}/3: 被ダメージ -${rank * 8}% · 反撃強化`,
  },
  {
    id: 'ranger_ren',
    name: '狩人 レン',
    roleName: '遠距離狙撃',
    role: 'RANGER',
    spriteId: 'ally_ranger',
    hireCost: 130,
    upgradeBaseCost: 135,
    baseHp: 82,
    baseAtk: 17,
    baseDef: 4,
    attackIntervalMs: 1200,
    range: 'RANGED',
    skillDescription: '素早い矢を連射し、高い会心率で敵を射抜く。後衛で真価を発揮。',
    passiveBonusText: '会心率が高く手数に優れる',
    awakeningBonusText: (rank) =>
      `特技覚醒 ★${rank}/3: 会心率 +${rank * 8}% · 攻撃速度 +${rank * 6}%`,
  },
  {
    id: 'mage_noah',
    name: '魔導士 ノア',
    roleName: '範囲魔法',
    role: 'MAGE',
    spriteId: 'ally_mage',
    hireCost: 160,
    upgradeBaseCost: 155,
    baseHp: 75,
    baseAtk: 20,
    baseDef: 4,
    attackIntervalMs: 1850,
    range: 'RANGED',
    skillDescription: '3回に1度、敵全体を焼き払う火球魔法を詠唱する。',
    passiveBonusText: '複数敵に強い範囲火力',
    awakeningBonusText: (rank) =>
      `特技覚醒 ★${rank}/3: 火球威力 +${rank * 20}% · 魔力攻撃強化`,
  },
  {
    id: 'thief_kaito',
    name: '盗賊 カイト',
    roleName: '探索・財宝',
    role: 'THIEF',
    spriteId: 'ally_thief',
    hireCost: 140,
    upgradeBaseCost: 140,
    baseHp: 86,
    baseAtk: 14,
    baseDef: 5,
    attackIntervalMs: 980,
    range: 'MELEE',
    skillDescription: '超高速の二連撃に加え、罠を解除して獲得ゴールドを増やす。',
    passiveBonusText: '罠無効化 · 獲得G +20%',
    awakeningBonusText: (rank) =>
      `特技覚醒 ★${rank}/3: 獲得Gさらに +${rank * 12}% · 攻撃速度 +${rank * 6}%`,
  },
];

export const CUSTOM_ALLY_ID = 'custom_ally';

export const CUSTOM_ALLY_STYLE_META: Record<
  CustomAllyStyle,
  {
    label: string;
    roleName: string;
    role: AllyDef['role'];
    baseHp: number;
    baseAtk: number;
    baseDef: number;
    attackIntervalMs: number;
    range: 'MELEE' | 'RANGED';
    skillDescription: string;
    passiveBonusText: string;
    awakeningBonusText: (rank: number) => string;
  }
> = {
  BALANCED: {
    label: 'まっさら（バランス型）',
    roleName: '自由万能',
    role: 'ALLROUNDER',
    baseHp: 85,
    baseAtk: 11,
    baseDef: 5,
    attackIntervalMs: 1450,
    range: 'MELEE',
    skillDescription: '堅実に戦いながら、3回に1度みんなに小さな応援回復を届ける気楽な相棒。',
    passiveBonusText: '攻防バランスの良い万能タイプ',
    awakeningBonusText: (rank) =>
      `特技覚醒 ★${rank}/3: 応援回復 +${rank * 12}% · 堅実な小連撃`,
  },
  TANK: {
    label: 'まもり（前衛盾型）',
    roleName: 'おまもり役',
    role: 'TANK',
    baseHp: 120,
    baseAtk: 9,
    baseDef: 9,
    attackIntervalMs: 1600,
    range: 'MELEE',
    skillDescription: '前に立ってパーティを守る盾役（重騎士ガルドより控えめな手軽タイプ）。',
    passiveBonusText: '防御とHPが高めで前衛向き',
    awakeningBonusText: (rank) =>
      `特技覚醒 ★${rank}/3: 被ダメージ -${rank * 6}% · 反撃小強化`,
  },
  HEALER: {
    label: 'いやし（回復支援型）',
    roleName: 'ちいさな癒やし手',
    role: 'HEALER',
    baseHp: 70,
    baseAtk: 10,
    baseDef: 4,
    attackIntervalMs: 1850,
    range: 'RANGED',
    skillDescription: '傷ついた味方をやさしく回復し、合間に攻撃もこなす癒やし系。',
    passiveBonusText: '単体回復で道中の安定感を底上げ',
    awakeningBonusText: (rank) =>
      `特技覚醒 ★${rank}/3: 回復倍率 +${rank * 20}% · 全体小回復確率追加`,
  },
  RANGER: {
    label: 'はやわざ（遠距離連射型）',
    roleName: '軽快スナイパー',
    role: 'RANGER',
    baseHp: 72,
    baseAtk: 13,
    baseDef: 4,
    attackIntervalMs: 1280,
    range: 'RANGED',
    skillDescription: '後ろからテンポよく矢や光弾を放ち、会心でチクチク援護する遠距離型。',
    passiveBonusText: '会心率が高く後衛から攻撃',
    awakeningBonusText: (rank) =>
      `特技覚醒 ★${rank}/3: 会心率 +${rank * 6}% · 攻撃速度 +${rank * 5}%`,
  },
  MAGE: {
    label: 'まほう（範囲魔法型）',
    roleName: '見習い魔導士',
    role: 'MAGE',
    baseHp: 66,
    baseAtk: 15,
    baseDef: 3,
    attackIntervalMs: 1920,
    range: 'RANGED',
    skillDescription: '3回に1度、小さな範囲魔法で敵全体をまとめて攻撃する魔法型。',
    passiveBonusText: '複数敵に有効な範囲魔法を所持',
    awakeningBonusText: (rank) =>
      `特技覚醒 ★${rank}/3: 魔法威力 +${rank * 16}% · 魔力小強化`,
  },
  THIEF: {
    label: 'おたから（財宝探索型）',
    roleName: '気まぐれトレジャー',
    role: 'THIEF',
    baseHp: 74,
    baseAtk: 11,
    baseDef: 4,
    attackIntervalMs: 1100,
    range: 'MELEE',
    skillDescription: '素早い手数で敵を叩きつつ、見つけた金貨をちょっと増やしてくれる探索型。',
    passiveBonusText: '獲得ゴールド +10%（罠解除はカイト専用）',
    awakeningBonusText: (rank) =>
      `特技覚醒 ★${rank}/3: 獲得Gさらに +${rank * 5}% · 攻撃速度 +${rank * 5}%`,
  },
};

export const INITIAL_CUSTOM_ALLY: CustomAllyConfig = {
  created: false,
  name: 'まっさらちゃん',
  title: 'オリキャラ',
  style: 'BALANCED',
  body: 'NEKO',
  primaryColor: '#f8fafc',
  secondaryColor: '#38bdf8',
  accentColor: '#f43f5e',
  headgear: 'NONE',
  weapon: 'SWORD',
  customPixels: null,
};

export function getCustomAllyDef(cfg?: CustomAllyConfig): AllyDef {
  const safe = cfg ?? INITIAL_CUSTOM_ALLY;
  const meta = CUSTOM_ALLY_STYLE_META[safe.style] ?? CUSTOM_ALLY_STYLE_META.BALANCED;
  const displayName = (safe.name || '').trim() || 'まっさらちゃん';
  const customTitle = (safe.title || '').trim();
  return {
    id: CUSTOM_ALLY_ID,
    name: displayName,
    roleName: customTitle ? `${customTitle} · ${meta.roleName}` : `オリキャラ · ${meta.roleName}`,
    role: meta.role,
    spriteId: 'ally_custom',
    hireCost: 80,
    upgradeBaseCost: 110,
    baseHp: meta.baseHp,
    baseAtk: meta.baseAtk,
    baseDef: meta.baseDef,
    attackIntervalMs: meta.attackIntervalMs,
    range: meta.range,
    skillDescription: meta.skillDescription,
    passiveBonusText: meta.passiveBonusText,
    awakeningBonusText: meta.awakeningBonusText,
    isCustom: true,
  };
}

export const CUSTOM_ALLY_LOOP23_FAIL_TARGET = 10;

export function isCustomAllyUnlocked(
  save: Pick<
    SaveState,
    'loopCount' | 'highestClearedLoop' | 'loop23FailRetreatCount' | 'customAllyUnlocked'
  >
): boolean {
  return (
    Boolean(save.customAllyUnlocked) ||
    save.loopCount >= 4 ||
    (save.highestClearedLoop ?? 0) >= 3 ||
    (save.loop23FailRetreatCount ?? 0) >= CUSTOM_ALLY_LOOP23_FAIL_TARGET
  );
}

export function getAllyDef(
  allyId: string,
  save?: Pick<SaveState, 'customAlly'>
): AllyDef | undefined {
  if (allyId === CUSTOM_ALLY_ID) {
    return getCustomAllyDef(save?.customAlly);
  }
  return ALLIES.find((a) => a.id === allyId);
}

export const ENEMIES: Record<string, EnemyDef> = {
  slime: {
    id: 'slime',
    name: 'ブルースライム',
    spriteId: 'enemy_slime',
    hp: 34,
    atk: 7,
    def: 1,
    attackIntervalMs: 1450,
    goldDrop: 14,
    materialChance: 0.25,
    lore: '地下の湿気を吸って生まれる最も身近な粘液魔物。体内にわずかな魔石の欠片を溶かし込んでいることがあり、新米冒険者の良き標的になる。',
  },
  bat: {
    id: 'bat',
    name: '洞窟コウモリ',
    spriteId: 'enemy_bat',
    hp: 26,
    atk: 9,
    def: 1,
    attackIntervalMs: 1150,
    goldDrop: 15,
    materialChance: 0.25,
    lore: '暗い天井に潜み、羽音を殺して急降下してくる吸血コウモリ。体力は低いが攻撃の回転が速く、複数で現れると油断ならない。',
  },
  goblin: {
    id: 'goblin',
    name: 'ゴブリン斥候',
    spriteId: 'enemy_goblin',
    hp: 46,
    atk: 11,
    def: 3,
    attackIntervalMs: 1350,
    goldDrop: 20,
    materialChance: 0.34,
    lore: '粗末な短剣と革鎧で武装した小鬼。金目のものに目がなく、よく金貨や素材を懐に隠し持っているため討伐の実入りが良い。',
  },
  skeleton: {
    id: 'skeleton',
    name: '朽ちた骸骨剣士',
    spriteId: 'enemy_skeleton',
    hp: 72,
    atk: 16,
    def: 5,
    attackIntervalMs: 1300,
    goldDrop: 28,
    materialChance: 0.4,
    lore: '迷宮の魔力によって再び剣を取った古の兵士。痛みを感じず黙々と刃を振るい続けるため、防具と回復手段を揃えて挑みたい相手。',
  },
  flame_imp: {
    id: 'flame_imp',
    name: 'フレイムインプ',
    spriteId: 'enemy_imp',
    hp: 84,
    atk: 21,
    def: 5,
    attackIntervalMs: 1200,
    goldDrop: 32,
    materialChance: 0.45,
    lore: '灼熱の坑道に棲む火炎の小悪魔。身軽さと高い攻撃力を併せ持ち、前衛をじわじわと焼き削ってくる。',
  },
  orc: {
    id: 'orc',
    name: '重装オーク',
    spriteId: 'enemy_orc',
    hp: 135,
    atk: 24,
    def: 9,
    attackIntervalMs: 1600,
    goldDrop: 42,
    materialChance: 0.5,
    isElite: true,
    lore: '厚い鉄鎧と大鉈を操る精鋭オーク。動きはやや鈍重ながら、一撃の重さとタフネスは通常モンスターを大きく上回る。',
  },
  gargoyle: {
    id: 'gargoyle',
    name: '石像ガーゴイル',
    spriteId: 'enemy_gargoyle',
    hp: 145,
    atk: 27,
    def: 12,
    attackIntervalMs: 1450,
    goldDrop: 48,
    materialChance: 0.55,
    lore: '聖堂の守護像に邪悪な魂が宿った石の魔物。石皮膚による高い防御力を持つため、会心攻撃や魔法火力で打ち砕くのが有効。',
  },
  dark_priest: {
    id: 'dark_priest',
    name: '闇の司祭',
    spriteId: 'enemy_dark_priest',
    hp: 130,
    atk: 32,
    def: 8,
    attackIntervalMs: 1350,
    goldDrop: 55,
    materialChance: 0.6,
    lore: '禁術を研究し迷宮の奥へ籠もった堕落魔導士。防御は薄いが呪詛による攻撃力が高く、古文書を懐に忍ばせていることも多い。',
  },
  shadow_knight: {
    id: 'shadow_knight',
    name: '深淵の黒騎士',
    spriteId: 'enemy_shadow_knight',
    hp: 210,
    atk: 36,
    def: 15,
    attackIntervalMs: 1400,
    goldDrop: 70,
    materialChance: 0.7,
    isElite: true,
    lore: '闇に魂を売った王国随一の剣士。攻・防・HPすべてに隙がなく、聖堂から深淵に至るまでの要所で挑戦者を阻む強敵。',
  },
  ice_wisp: {
    id: 'ice_wisp',
    name: '氷結の精霊',
    spriteId: 'enemy_ice_wisp',
    hp: 165,
    atk: 34,
    def: 11,
    attackIntervalMs: 1200,
    goldDrop: 62,
    materialChance: 0.58,
    lore: '極寒の魔力が結晶化して意志を持った氷精。素早い氷弾を連射してくるため、長期戦になる前に倒し切りたい。',
  },
  frost_knight: {
    id: 'frost_knight',
    name: '氷霜の騎士',
    spriteId: 'enemy_frost_knight',
    hp: 245,
    atk: 39,
    def: 16,
    attackIntervalMs: 1350,
    goldDrop: 78,
    materialChance: 0.65,
    isElite: true,
    lore: '凍てつく魔鎧を纏い氷獄の女王に仕える近衛騎士。高い防御力で持久戦を強いてくるため、火力バフや吸血が活きる。',
  },
  star_elemental: {
    id: 'star_elemental',
    name: '星幽の魔導兵',
    spriteId: 'enemy_star_elemental',
    hp: 260,
    atk: 45,
    def: 15,
    attackIntervalMs: 1250,
    goldDrop: 88,
    materialChance: 0.68,
    lore: '古代神殿を守るために造られた星の自動人形。星光を収束させた高威力・高回転の攻撃でパーティを削る。',
  },
  chaos_chimera: {
    id: 'chaos_chimera',
    name: '混沌のキメラ',
    spriteId: 'enemy_chaos_chimera',
    hp: 360,
    atk: 54,
    def: 19,
    attackIntervalMs: 1280,
    goldDrop: 120,
    materialChance: 0.78,
    isElite: true,
    lore: '複数の猛獣と魔竜の因子が融合した異形の合成獣。圧倒的な生命力と獰猛な連撃を誇り、生半可な前衛を瞬時に引き裂く。',
  },
  void_reaper: {
    id: 'void_reaper',
    name: '虚無の死神',
    spriteId: 'enemy_void_reaper',
    hp: 420,
    atk: 62,
    def: 22,
    attackIntervalMs: 1220,
    goldDrop: 145,
    materialChance: 0.85,
    isElite: true,
    lore: '時空の狭間から現れる死の代行者。大鎌の一閃は極めて重く、素材ドロップ率も非常に高い危険な強敵。',
  },
  mimic: {
    id: 'mimic',
    name: '貪欲なるミミック',
    spriteId: 'enemy_mimic',
    hp: 280,
    atk: 48,
    def: 16,
    attackIntervalMs: 1200,
    goldDrop: 185,
    materialChance: 1.0,
    isElite: true,
    lore: '豪華な宝箱に擬態して冒険者を待つ罠魔物。牙の攻撃は鋭いが、倒せば体内に溜め込んだ大量の金貨と希少アイテムを吐き出す。',
  },

  // === BOSSES ===
  boss_king_slime: {
    id: 'boss_king_slime',
    name: 'キングスライム',
    spriteId: 'boss_king_slime',
    hp: 195,
    atk: 16,
    def: 4,
    attackIntervalMs: 1500,
    goldDrop: 95,
    materialChance: 1.0,
    isBoss: true,
    scale: 1.5,
    lore: '無数のスライムが合体し、古代の王冠を取り込んで誕生した迷宮最初の主。巨体による押し潰しは侮れないが、まずはここを越えることが真の冒険の始まりとなる。',
  },
  boss_lava_golem: {
    id: 'boss_lava_golem',
    name: '溶岩ゴーレム',
    spriteId: 'boss_golem',
    hp: 430,
    atk: 31,
    def: 13,
    attackIntervalMs: 1700,
    goldDrop: 170,
    materialChance: 1.0,
    isBoss: true,
    scale: 1.55,
    lore: '灼熱のマグマと黒曜石が魔力で組み上がった巨像。攻撃間隔は遅めだが高い装甲と灼熱の鉄拳を持ち、回復や仲間の支援が攻略の鍵になる。',
  },
  boss_death_knight: {
    id: 'boss_death_knight',
    name: '呪剣デスナイト',
    spriteId: 'boss_death_knight',
    hp: 660,
    atk: 42,
    def: 16,
    attackIntervalMs: 1350,
    goldDrop: 260,
    materialChance: 1.0,
    isBoss: true,
    scale: 1.55,
    lore: '呪われし聖堂の玉座を守る亡霊騎士団長。素早い剣さばきと高い攻撃力で、加護や鍛冶を整えていない挑戦者を容赦なく斬り伏せる。',
  },
  boss_frost_queen: {
    id: 'boss_frost_queen',
    name: '氷獄の女王フロスト',
    spriteId: 'boss_frost_queen',
    hp: 880,
    atk: 52,
    def: 19,
    attackIntervalMs: 1300,
    goldDrop: 340,
    materialChance: 1.0,
    isBoss: true,
    scale: 1.6,
    lore: '氷結の鐘楼に君臨する冷徹なる氷の女王。氷壁のギミックと相まって堅固な守りを誇るため、会心とバフを重ねて突破する必要がある。',
  },
  boss_star_warden: {
    id: 'boss_star_warden',
    name: '星辰の守護者アストラ',
    spriteId: 'boss_star_warden',
    hp: 1150,
    atk: 62,
    def: 22,
    attackIntervalMs: 1260,
    goldDrop: 440,
    materialChance: 1.0,
    isBoss: true,
    scale: 1.65,
    lore: '星屑の古戦場を永劫守り続ける光の番人。勇者のスキルや仲間との連携奥義を駆使した総力戦で挑むに相応しい強敵。',
  },
  boss_abyss_dragon: {
    id: 'boss_abyss_dragon',
    name: '魔王アビスドラゴン',
    spriteId: 'boss_dragon',
    hp: 1520,
    atk: 72,
    def: 25,
    attackIntervalMs: 1320,
    goldDrop: 580,
    materialChance: 1.0,
    isBoss: true,
    scale: 1.75,
    lore: '表世界の迷宮を統べる漆黒の魔王竜。2回ごとの重撃ブレスは前衛を打ち砕く威力を持つが、討伐すれば新たな輪廻「転生」への扉が開く。',
  },
  boss_crimson_archfiend: {
    id: 'boss_crimson_archfiend',
    name: '蒼炎の魔将イグニス',
    spriteId: 'boss_crimson_archfiend',
    hp: 2050,
    atk: 86,
    def: 29,
    attackIntervalMs: 1220,
    goldDrop: 780,
    materialChance: 1.0,
    isBoss: true,
    scale: 1.75,
    lore: '2周目の異界に現れる蒼炎の魔将。超高速戦闘の領域で凄まじい手数を繰り出してくるため、吸血や守護結界での継戦が試される。',
  },
  boss_chrono_titan: {
    id: 'boss_chrono_titan',
    name: '時の巨神クロノス',
    spriteId: 'boss_chrono_titan',
    hp: 2700,
    atk: 102,
    def: 34,
    attackIntervalMs: 1220,
    goldDrop: 1020,
    materialChance: 1.0,
    isBoss: true,
    scale: 1.8,
    lore: '3周目の時空遺跡を司る古の巨神。堅牢な神体と強大な一撃を持ち、階層ごとに積み上げた強化を出し切ってようやく渡り合える。',
  },
  boss_eternal_overlord: {
    id: 'boss_eternal_overlord',
    name: '終焉神オメガドラゴン',
    spriteId: 'boss_eternal_overlord',
    hp: 3600,
    atk: 120,
    def: 40,
    attackIntervalMs: 1140,
    goldDrop: 1450,
    materialChance: 1.0,
    isBoss: true,
    scale: 1.85,
    lore: '星界の最奥に座す終焉の古神竜。防御貫通の領域と凄まじい攻撃速度を併せ持ち、全装備・仲間・加護・スキルを極めた勇者のみが討ち倒せる。',
  },
};

export const BOSS_RUSH_BOSS_ORDER: string[] = [
  'boss_king_slime',
  'boss_lava_golem',
  'boss_death_knight',
  'boss_frost_queen',
  'boss_star_warden',
  'boss_abyss_dragon',
  'boss_crimson_archfiend',
  'boss_chrono_titan',
  'boss_eternal_overlord',
];

export const STAGES: StageDef[] = [
  {
    id: 1,
    name: '苔むす迷宮',
    subtitle: '初級地下遺跡',
    biome: 'MOSS',
    floors: 5,
    recommendedPower: 38,
    clearBonusGold: 95,
    enemyPool: ['slime', 'bat', 'goblin'],
    eliteId: 'goblin',
    bossId: 'boss_king_slime',
    description: '駆け出し冒険者向けの地下迷宮。まずは5つのアイテムを整えて挑もう。',
    gimmick: {
      id: 'MOSS_SPORE',
      name: '癒やしの苔胞子',
      shortEffect: '毎階HP8%自然回復',
      description: '各階へ進んだ際、パーティ全員のHPが最大HPの8%自然回復する。',
    },
    minLoop: 1,
  },
  {
    id: 2,
    name: '紅蓮の坑道',
    subtitle: '中級灼熱鉱脈',
    biome: 'LAVA',
    floors: 6,
    recommendedPower: 105,
    clearBonusGold: 180,
    enemyPool: ['goblin', 'skeleton', 'flame_imp'],
    eliteId: 'orc',
    bossId: 'boss_lava_golem',
    description: '魔石と鉄鉱石が眠る灼熱の坑道。敵の攻撃が激しいため回復や味方が重要。',
    gimmick: {
      id: 'HEAT_WAVE',
      name: '灼熱の熱気',
      shortEffect: '敵味方攻+18% · 素材+25%',
      description: '灼熱により敵味方ともに攻撃力が+18%上昇し、素材ドロップ率が+25%増える。',
    },
    minLoop: 1,
  },
  {
    id: 3,
    name: '呪われし聖堂',
    subtitle: '上級亡霊回廊',
    biome: 'CRYPT',
    floors: 7,
    recommendedPower: 205,
    clearBonusGold: 300,
    enemyPool: ['skeleton', 'gargoyle', 'dark_priest'],
    eliteId: 'shadow_knight',
    bossId: 'boss_death_knight',
    description: '不死の騎士が守る古の聖堂。加護と鍛冶で装備を整えて突破しよう。',
    gimmick: {
      id: 'CURSED_MIASMA',
      name: '呪詛と吸血の霧',
      shortEffect: '回復-25% · 全員吸血+8% · 古文書増',
      description: '回復量が25%低下する代わりに勇者と味方に吸血+8%が付与され、素材ドロップ+30%。',
    },
    minLoop: 1,
  },
  {
    id: 4,
    name: '氷結の鐘楼',
    subtitle: '極寒氷晶塔',
    biome: 'ICE',
    floors: 7,
    recommendedPower: 315,
    clearBonusGold: 420,
    enemyPool: ['ice_wisp', 'gargoyle', 'frost_knight'],
    eliteId: 'frost_knight',
    bossId: 'boss_frost_queen',
    description: '凍てつく魔力が渦巻く氷の塔。氷獄の女王フロストが冷徹な刃で迎撃する。',
    gimmick: {
      id: 'FROZEN_CHILL',
      name: '極寒の氷壁',
      shortEffect: '敵防御+25% · 敵鈍足15% · 会心+10%',
      description: '冷気で敵の防御が+25%固くなるが攻撃間隔が15%遅くなり、味方会心率+10%。',
    },
    minLoop: 1,
  },
  {
    id: 5,
    name: '星屑の古戦場',
    subtitle: '星幽遺跡',
    biome: 'STAR',
    floors: 8,
    recommendedPower: 440,
    clearBonusGold: 560,
    enemyPool: ['dark_priest', 'frost_knight', 'star_elemental'],
    eliteId: 'shadow_knight',
    bossId: 'boss_star_warden',
    description: 'かつての神々が戦った星屑の戦場。強大な魔導兵と星の守護者が試練を与える。',
    gimmick: {
      id: 'STAR_RESONANCE',
      name: '星辰の共鳴',
      shortEffect: '会心率+15% · 味方威力+20%',
      description: '星の魔力が共鳴し、全員の会心率+15%・仲間の攻撃＆回復力が+20%強化される。',
    },
    minLoop: 1,
  },
  {
    id: 6,
    name: '深淵の玉座',
    subtitle: '最深部決戦',
    biome: 'ABYSS',
    floors: 8,
    recommendedPower: 590,
    clearBonusGold: 740,
    enemyPool: ['flame_imp', 'dark_priest', 'shadow_knight', 'star_elemental'],
    eliteId: 'chaos_chimera',
    bossId: 'boss_abyss_dragon',
    description: '魔王アビスドラゴンが待ち受ける表の最終迷宮。全ての力を結集して討ち倒せ。',
    gimmick: {
      id: 'ABYSS_PRESSURE',
      name: '深淵の威圧',
      shortEffect: '敵HP+15% · ボス2回毎強打 · G+30%',
      description: '敵HP+15%＆ボスが2回毎に1.35倍の重撃を放つ。討伐時の獲得ゴールド+30%。',
    },
    minLoop: 1,
  },
  {
    id: 7,
    name: '【裏】蒼炎の結晶窟',
    subtitle: '2周目解放 · 裏迷宮',
    biome: 'LAVA',
    floors: 9,
    recommendedPower: 780,
    clearBonusGold: 1050,
    enemyPool: ['frost_knight', 'star_elemental', 'chaos_chimera'],
    eliteId: 'chaos_chimera',
    bossId: 'boss_crimson_archfiend',
    description: '2周目で姿を表す蒼炎の異界。通常の迷宮を凌駕する魔物と魔将イグニスが待ち受ける。',
    gimmick: {
      id: 'BLUE_FLAME',
      name: '蒼炎の暴走',
      shortEffect: '敵味方速度+20% · 会心ダメ+35%',
      description: '敵味方ともに攻撃間隔が20%短縮され、味方の会心ダメージが+35%増幅される超高速戦。',
    },
    minLoop: 2,
    isSecret: true,
  },
  {
    id: 8,
    name: '【裏】時の狭間の遺跡',
    subtitle: '3周目解放 · 裏迷宮',
    biome: 'CHAOS',
    floors: 9,
    recommendedPower: 1020,
    clearBonusGold: 1450,
    enemyPool: ['star_elemental', 'chaos_chimera', 'void_reaper'],
    eliteId: 'void_reaper',
    bossId: 'boss_chrono_titan',
    description: '3周目で開かれる時空の迷宮。虚無の死神と時の巨神クロノスが挑戦者を試す。',
    gimmick: {
      id: 'CHRONO_DISTORTION',
      name: '時空加速の歪曲',
      shortEffect: '毎階 味方攻+6%/速度+5%蓄積',
      description: '階層を進むごとに味方の攻撃+6%・速度+5%が累積する一方、敵も階層ごとに鋭さを増す。',
    },
    minLoop: 3,
    isSecret: true,
  },
  {
    id: 9,
    name: '【裏】終焉の星界玉座',
    subtitle: '4周目解放 · 最奥裏迷宮',
    biome: 'ABYSS',
    floors: 10,
    recommendedPower: 1300,
    clearBonusGold: 2100,
    enemyPool: ['chaos_chimera', 'void_reaper', 'shadow_knight'],
    eliteId: 'void_reaper',
    bossId: 'boss_eternal_overlord',
    description: '4周目以降にのみ挑める究極の領域。終焉神オメガドラゴンとの最終決戦。',
    gimmick: {
      id: 'OMEGA_FIELD',
      name: '終焉領域の試練',
      shortEffect: '敵攻+20%/防貫通20% · 毎階攻+6%',
      description: '全敵の攻撃+20%かつ防御を20%貫通する過酷な領域。味方は毎階攻撃+6%で対抗する。',
    },
    minLoop: 4,
    isSecret: true,
  },
  {
    id: 10,
    name: '【極】終焉の強化ボスラッシュ',
    subtitle: '全実績解除 · 9連ボス決戦',
    biome: 'CHAOS',
    floors: 9,
    recommendedPower: 1550,
    clearBonusGold: 3600,
    enemyPool: ['void_reaper'],
    eliteId: 'void_reaper',
    bossId: 'boss_eternal_overlord',
    description: '全実績を解除した勇者のみが挑める究極の闘技迷宮。強化された歴代ボス9体が毎階連続で襲いかかる！',
    gimmick: {
      id: 'BOSS_RUSH_SURGE',
      name: '極限連戦の闘気',
      shortEffect: '毎階強化ボス · 撃破毎HP25%回復&攻+5%',
      description: '全9階が強化ボス連戦。1体倒すたびHP25%回復＆倒れた仲間も25%で戦線復帰し、攻撃+5%/防御+2が蓄積！',
    },
    minLoop: 1,
    isSecret: true,
    isBossRush: true,
  },
  {
    id: 11,
    name: '【無限】終わらぬ深淵回廊',
    subtitle: '5周目クリア報酬 · 第6周目基準の固定高難度チャレンジ',
    biome: 'CHAOS',
    floors: 999,
    recommendedPower: 2200,
    clearBonusGold: 0,
    enemyPool: ['frost_knight', 'star_elemental', 'chaos_chimera', 'void_reaper'],
    eliteId: 'void_reaper',
    bossId: 'boss_eternal_overlord',
    description:
      '5周目を制覇した者だけに開かれる最高難易度のチャレンジ迷宮。現在の周回倍率や仮潜入の影響を受けず、常に「第6周目基準」の固定難易度から始まり階層ごとに敵が強大化する！',
    gimmick: {
      id: 'ENDLESS_ABYSS',
      name: '無限深淵の法則',
      shortEffect: '第6周目基準固定 · 毎階敵強化 · 5F毎ボス&証 · 超絶レアパーツ',
      description:
        '周回倍率に関わらず常に「第6周目基準（21.67倍）」の固定強さで始まり、階層が進むほどさらに強大化するチャレンジ迷宮。5階ごとにボスが登場して撃破で「踏破の証」と希少ドロップを獲得（15F以降5F毎ボスで最強装備0.8%枠）。また全敵・ボスから超絶低確率で鍛冶屋限定装備に必要な3種のパーツ（深淵の欠片・虚無の歯車・混沌の星晶）がドロップします。',
    },
    minLoop: 1,
    isSecret: true,
    isEndless: true,
  },
];

export const SKILL_TREE: SkillNodeDef[] = [
  // === WARRIOR BRANCH ===
  {
    id: 'war_1',
    branch: 'WARRIOR',
    tier: 1,
    name: '剛剣の構え',
    costSp: 1,
    description: '基礎攻撃力 +30% · 会心率 +8%',
    effects: { atkPct: 30, critPct: 8 },
  },
  {
    id: 'war_2a',
    branch: 'WARRIOR',
    tier: 2,
    name: '必殺の一閃',
    costSp: 1,
    requiresAny: ['war_1'],
    exclusiveWith: 'war_2b',
    description: '会心率 +25% · 会心ダメージ +45% · 基礎攻撃力 +15%（疾風連撃と排他選択）',
    effects: { critPct: 25, critDmgPct: 45, atkPct: 15 },
  },
  {
    id: 'war_2b',
    branch: 'WARRIOR',
    tier: 2,
    name: '疾風連撃',
    costSp: 1,
    requiresAny: ['war_1'],
    exclusiveWith: 'war_2a',
    description: '攻撃速度 +40% · 基礎攻撃力 +15%（必殺の一閃と排他選択）',
    effects: { spdPct: 40, atkPct: 15 },
  },
  {
    id: 'war_3',
    branch: 'WARRIOR',
    tier: 3,
    name: '血戦の剣技',
    costSp: 2,
    requiresAny: ['war_2a', 'war_2b'],
    description: '攻撃力 +40% · 与ダメージの 12% 吸血',
    effects: { atkPct: 40, lifestealPct: 12 },
  },
  {
    id: 'war_4',
    branch: 'WARRIOR',
    tier: 4,
    name: '【奥義】剣聖覚醒',
    costSp: 2,
    requiresAny: ['war_3'],
    description: '攻撃力 +60% · 2回攻撃ごとに2.2倍の奥義斬撃',
    effects: { atkPct: 60, tripleStrike: true },
  },

  // === GUARDIAN BRANCH ===
  {
    id: 'grd_1',
    branch: 'GUARDIAN',
    tier: 1,
    name: '不屈の盾',
    costSp: 1,
    description: '最大HP +40% · 防御力 +30%',
    effects: { hpPct: 40, defPct: 30 },
  },
  {
    id: 'grd_2a',
    branch: 'GUARDIAN',
    tier: 2,
    name: '戦友の鼓舞',
    costSp: 1,
    requiresAny: ['grd_1'],
    exclusiveWith: 'grd_2b',
    description: '仲間の全能力 +25% · 仲間攻撃速度 +12%（再生の息吹と排他選択）',
    effects: { allyPowerPct: 25, allySpdPct: 12 },
  },
  {
    id: 'grd_2b',
    branch: 'GUARDIAN',
    tier: 2,
    name: '再生の息吹',
    costSp: 1,
    requiresAny: ['grd_1'],
    exclusiveWith: 'grd_2a',
    description: '部屋移動ごとに全員HP +30回復 · 最大HP +25%（戦友の鼓舞と排他選択）',
    effects: { roomHeal: 30, hpPct: 25 },
  },
  {
    id: 'grd_3',
    branch: 'GUARDIAN',
    tier: 3,
    name: '鉄壁の陣',
    costSp: 2,
    requiresAny: ['grd_2a', 'grd_2b'],
    description: 'パーティ被ダメージ -18% · 防御力 +20% · 仲間攻撃速度 +15%',
    effects: { dmgReductionPct: 18, defPct: 20, allySpdPct: 15 },
  },
  {
    id: 'grd_4',
    branch: 'GUARDIAN',
    tier: 4,
    name: '【奥義】聖域の守護者',
    costSp: 2,
    requiresAny: ['grd_3'],
    description: '最大HP +60% · 致死ダメージ時に1度だけHP70%で踏みとどまり仲間も回復',
    effects: { hpPct: 60, deathSave: true },
  },

  // === EXPLORER BRANCH ===
  {
    id: 'exp_1',
    branch: 'EXPLORER',
    tier: 1,
    name: '鑑定眼',
    costSp: 1,
    description: '獲得ゴールド +40% · 素材ドロップ率 +30%',
    effects: { goldPct: 40, dropPct: 30 },
  },
  {
    id: 'exp_2a',
    branch: 'EXPLORER',
    tier: 2,
    name: '魔導錬金',
    costSp: 1,
    requiresAny: ['exp_1'],
    exclusiveWith: 'exp_2b',
    description: '回復薬・爆弾など消耗品の効果 +65% · 攻撃力 +20%（軽量化の知恵と排他選択）',
    effects: { consumablePowerPct: 65, atkPct: 20 },
  },
  {
    id: 'exp_2b',
    branch: 'EXPLORER',
    tier: 2,
    name: '軽量化の知恵',
    costSp: 1,
    requiresAny: ['exp_1'],
    exclusiveWith: 'exp_2a',
    description: '全体メーター上限 +3 · 全タイプ別メーター上限 +1（魔導錬金と排他選択）',
    effects: { extraMeterCap: 3, extraTypeMeterCap: 1 },
  },
  {
    id: 'exp_3',
    branch: 'EXPLORER',
    tier: 3,
    name: '宝物庫の鍵',
    costSp: 2,
    requiresAny: ['exp_2a', 'exp_2b'],
    description: '獲得ゴールド +55% · 素材ドロップ率 +40% · 消耗品効果 +25%',
    effects: { goldPct: 55, dropPct: 40, consumablePowerPct: 25 },
  },
  {
    id: 'exp_4',
    branch: 'EXPLORER',
    tier: 4,
    name: '【奥義】無限の探求者',
    costSp: 2,
    requiresAny: ['exp_3'],
    description: '全攻防HP +35% · 踏破の証 +2 · 獲得ゴールド +40%',
    effects: { atkPct: 35, defPct: 35, hpPct: 35, extraCrests: 2, goldPct: 40 },
  },

  // === ALLY-EXCLUSIVE COMMAND BRANCH ===
  {
    id: 'ally_1',
    branch: 'ALLY',
    tier: 1,
    name: '戦友の誓約',
    costSp: 1,
    description: '【味方専用】味方全員の攻撃・回復力 +25% · 味方HP +25% · 味方防御 +20%',
    effects: { allyPowerPct: 25, allyHpPct: 25, allyDefPct: 20 },
  },
  {
    id: 'ally_2a',
    branch: 'ALLY',
    tier: 2,
    name: '疾風共闘陣',
    costSp: 1,
    requiresAny: ['ally_1'],
    exclusiveWith: 'ally_2b',
    description: '【味方専用】味方の攻撃速度 +25% · 味方会心率 +12%（鉄壁の庇護陣と排他選択）',
    effects: { allySpdPct: 25, allyCritPct: 12 },
  },
  {
    id: 'ally_2b',
    branch: 'ALLY',
    tier: 2,
    name: '鉄壁の庇護陣',
    costSp: 1,
    requiresAny: ['ally_1'],
    exclusiveWith: 'ally_2a',
    description: '【味方専用】味方HP +30% · 味方被ダメ -18% · 味方に吸血8%付与（疾風共闘陣と排他）',
    effects: { allyHpPct: 30, allyDmgReductionPct: 18, allyLifestealPct: 8 },
  },
  {
    id: 'ally_3',
    branch: 'ALLY',
    tier: 3,
    name: '勇者の威光同調',
    costSp: 2,
    requiresAny: ['ally_2a', 'ally_2b'],
    description: '【味方専用】勇者の攻防HPの18%を味方全員に伝播共有！さらに味方能力 +20%',
    effects: { heroStatSharePct: 18, allyPowerPct: 20 },
  },
  {
    id: 'ally_4',
    branch: 'ALLY',
    tier: 4,
    name: '【奥義】魂の共鳴覚醒',
    costSp: 2,
    requiresAny: ['ally_3'],
    description: '【味方専用】味方全能力 +35% · 味方HP +25% · 味方が3回行動毎に1.6倍連携技発動 · 毎階終了時に50%で味方蘇生',
    effects: { allyPowerPct: 35, allyHpPct: 25, allyOverdrive: true },
  },

  // === CONVENIENCE BRANCH (Unlocked from Stage 0, resets with skill tree on respec/reincarnation) ===
  {
    id: 'conv_speed_4x',
    branch: 'CONVENIENCE',
    tier: 1,
    name: '探索倍速 I（2x · 4x）',
    costSp: 1,
    description: 'ダンジョン攻略の再生速度「2x」「4x」を解放します（最初から習得可）。',
    effects: {},
  },
  {
    id: 'conv_auto_equip',
    branch: 'CONVENIENCE',
    tier: 1,
    name: 'スマート編成（オート装備）',
    costSp: 1,
    description: '方針別（攻撃／防御／消費多め）の「オート装備」と「持ち込み全解除」を解放します。',
    effects: {},
  },
  {
    id: 'conv_speed_8x',
    branch: 'CONVENIENCE',
    tier: 2,
    name: '探索倍速 II（8x）',
    costSp: 1,
    requiresAny: ['conv_speed_4x'],
    description: 'ダンジョン攻略の高速「8x」モードを解放します。',
    effects: {},
  },
  {
    id: 'conv_auto_event',
    branch: 'CONVENIENCE',
    tier: 2,
    name: 'イベント自動判断',
    costSp: 1,
    description: '道中の選択イベントを状況（残HP・盗賊同行・所持G）に応じて自動決定するモードを解放します。',
    effects: {},
  },
  {
    id: 'conv_speed_16x',
    branch: 'CONVENIENCE',
    tier: 3,
    name: '探索倍速 III（最大16x）',
    costSp: 1,
    requiresAny: ['conv_speed_8x'],
    description: '超高速「16x」モードを解放します。精密計算により1x時と同じ挙動で高速攻略できます。',
    effects: {},
  },
  {
    id: 'conv_bulk_ops',
    branch: 'CONVENIENCE',
    tier: 3,
    name: '一括育成＆ショップ補充',
    costSp: 1,
    description: '勇者・仲間の「一括修行/訓練」、倉庫の「余剰COMMON一括売却」、道具屋の「全アイテムまとめて購入」を解放します。',
    effects: {},
  },
  {
    id: 'conv_auto_repeat',
    branch: 'CONVENIENCE',
    tier: 4,
    name: '連続自動周回＆自動補充',
    costSp: 1,
    description: '帰還時に消費した持ち込み枠をショップから自動購入（お金と在庫が十分な場合）＆倉庫補充し、同じステージへ自動再出撃する「連続周回」を解放します。',
    effects: {},
  },

  // === TRANSCENDENT BRANCH (Unlocked after Endless Corridor 100F+) ===
  {
    id: 'conv_speed_32x',
    branch: 'TRANSCENDENT',
    tier: 1,
    name: '極限加速・32倍速',
    costSp: 10,
    description: '超高難度周回向けの探索「32x」モードを解放！さらに勇者の攻撃速度 +20%。',
    effects: { spdPct: 20 },
  },
  {
    id: 'trans_titan_body',
    branch: 'TRANSCENDENT',
    tier: 1,
    name: '神域の肉体',
    costSp: 12,
    description: '勇者の基礎攻撃力 +150% · 防御力 +150% · 最大HP +180% · 攻撃速度 +35%。',
    effects: { atkPct: 150, defPct: 150, hpPct: 180, spdPct: 35 },
  },
  {
    id: 'trans_war_god',
    branch: 'TRANSCENDENT',
    tier: 1,
    name: '万象砕く闘神',
    costSp: 15,
    description: '勇者の基礎攻撃力 +180% · 会心率 +30% · 会心ダメージ +100% · 吸血 +15%。',
    effects: { atkPct: 180, critPct: 30, critDmgPct: 100, lifestealPct: 15 },
  },
  {
    id: 'conv_speed_64x',
    branch: 'TRANSCENDENT',
    tier: 2,
    name: '神速領域・64倍速',
    costSp: 20,
    requiresAny: ['conv_speed_32x'],
    description: '究極の探索速度「64x」モードを解放！さらに勇者・味方の攻撃速度 +40%。',
    effects: { spdPct: 40, allySpdPct: 40 },
  },
  {
    id: 'trans_abyss_bond',
    branch: 'TRANSCENDENT',
    tier: 2,
    name: '星界の軍勢',
    costSp: 20,
    requiresAny: ['trans_titan_body', 'trans_war_god'],
    description: '味方全員の攻撃・回復・HP +220% · 味方防御 +150% · 味方速度 +45% · 勇者の攻防HP 30%を追加同調！',
    effects: { allyPowerPct: 220, allyHpPct: 220, allyDefPct: 150, allySpdPct: 45, heroStatSharePct: 30 },
  },
  {
    id: 'trans_fortune_void',
    branch: 'TRANSCENDENT',
    tier: 2,
    name: '無限の財宝律',
    costSp: 20,
    requiresAny: ['trans_titan_body', 'trans_war_god'],
    description: '獲得ゴールド +250% · 素材ドロップ +150% · 消耗品 +120% · 全体枠 +4 · 全タイプ枠 +2 · 踏破の証 +4！',
    effects: { goldPct: 250, dropPct: 150, consumablePowerPct: 120, extraMeterCap: 4, extraTypeMeterCap: 2, extraCrests: 4 },
  },
  {
    id: 'trans_omega_ascension',
    branch: 'TRANSCENDENT',
    tier: 4,
    name: '【真奥義】深淵超越',
    costSp: 30,
    requiresAny: ['trans_abyss_bond', 'trans_fortune_void'],
    description: '勇者・味方の全攻防HP +300% · 会心ダメ +120% · 全員被ダメ -20% · 毎階全員HP +250回復！',
    effects: {
      atkPct: 300,
      defPct: 300,
      hpPct: 300,
      allyPowerPct: 300,
      allyHpPct: 300,
      allyDefPct: 300,
      critDmgPct: 120,
      dmgReductionPct: 20,
      allyDmgReductionPct: 20,
      roomHeal: 250,
    },
  },
];

export const DUNGEON_EVENTS: DungeonEventDef[] = [
  {
    id: 'mysterious_chest',
    title: '古びた錠前付き宝箱',
    spriteId: 'prop_chest_closed',
    description: '通路の隅に重厚な宝箱が置かれている。少し罠の気配もするが、中にはお宝が眠っていそうだ。',
    options: [
      {
        id: 'safe',
        label: '慎重に鍵を外して開ける',
        hint: '確実にゴールドと素材を入手（盗賊同行で増量）',
        outcome: 'SAFE_CHEST',
      },
      {
        id: 'risky',
        label: '強引にこじ開けて奥まで漁る',
        hint: '高確率で装備アイテム＆希少品チャンス · ただし罠の危険あり',
        outcome: 'RISKY_CHEST',
      },
      {
        id: 'skip',
        label: '警戒してそのまま通り過ぎる',
        hint: '危険を避けて先へ進む',
        outcome: 'SKIP',
      },
    ],
  },
  {
    id: 'glowing_spring',
    title: '青く澄んだ地下の泉',
    spriteId: 'prop_fountain',
    description: '清らかな光が差し込む地下泉を見つけた。水面の下には何かがきらめいている。',
    options: [
      {
        id: 'drink',
        label: '泉の水を飲んで休息する',
        hint: 'パーティ全員のHPを60%回復（倒れた仲間も35%で蘇生）',
        outcome: 'HEAL_SPRING',
      },
      {
        id: 'dive',
        label: '水底の輝きを拾いに行く',
        hint: 'まとまったゴールドと魔石を獲得（低確率で冷気に凍える）',
        outcome: 'DIVE_SPRING',
      },
    ],
  },
  {
    id: 'ancient_altar',
    title: '古代戦士の石碑',
    spriteId: 'bless_flame',
    description: '赤黒いルーンが刻まれた古い祭壇がある。微かな魔力が勇者の武器に共鳴している。',
    options: [
      {
        id: 'sacrifice',
        label: '体力を捧げて力を借りる',
        hint: '勇者HPを15%消費 · 今回攻撃+30%・防御+5＆魔石+1',
        outcome: 'ALTAR_SACRIFICE',
      },
      {
        id: 'pray',
        label: '静かに祈りを捧げる',
        hint: '全員HP20%回復し、古文書を1〜2個入手',
        outcome: 'ALTAR_PRAY',
      },
    ],
  },
  {
    id: 'wandering_peddler',
    title: '迷宮の行商人',
    spriteId: 'item_charm_gold',
    description: 'ランタンを下げた行商人が休んでいる。「おや、冒険者さんかい？ 少し取引していかないかい？」',
    options: [
      {
        id: 'buy_heal',
        label: '特製薬を分けてもらう (25G)',
        hint: '25Gを支払い、パーティ全員のHPを90回復＆攻撃+10%',
        outcome: 'PEDDLER_HEAL',
        goldCost: 25,
      },
      {
        id: 'buy_mats',
        label: '掘り出し物の素材袋を買う (30G)',
        hint: '30Gを支払い、素材を3個入手',
        outcome: 'PEDDLER_MATS',
        goldCost: 30,
      },
      {
        id: 'leave',
        label: '挨拶だけして先を急ぐ',
        hint: 'ゴールドを使わずに進む',
        outcome: 'SKIP',
      },
    ],
  },
  {
    id: 'forked_corridor',
    title: '二手に分かれた迷宮回廊',
    spriteId: 'prop_trap',
    description: '左右の通路へ道が分かれている。右からは中ボス級の凄まじい咆哮が響き、左は静まり返っている。',
    options: [
      {
        id: 'right_elite',
        label: '右の強敵ルート（中ボス戦）へ突入する',
        hint: '中ボス級の強敵と戦闘！撃破で大量G・素材・高確率で装備ドロップ＆攻撃+12%',
        outcome: 'FORK_ELITE',
      },
      {
        id: 'left_rest',
        label: '左の安全な抜け道を選ぶ',
        hint: '戦闘を避け、小休止でHP30%回復',
        outcome: 'FORK_REST',
      },
    ],
  },
  {
    id: 'ancient_armory',
    title: '封印された古代武具庫',
    spriteId: 'item_excalibur',
    description: '重厚な鉄扉の奥に、かつての騎士団が遺した武器や鍛冶資材が整然と並んでいる！',
    options: [
      {
        id: 'armory_open',
        label: '封印を解いて武器を手にする',
        hint: '今回の攻撃+35%＆確定で装備ドロップ（希少枠UP）· 低確率で結界の反動',
        outcome: 'ARMORY_WEAPON',
      },
      {
        id: 'armory_salvage',
        label: '鍛冶資材を根こそぎ回収する',
        hint: '安全に鉄鉱石+2・魔石+2・古文書+1を獲得',
        outcome: 'ARMORY_SALVAGE',
      },
    ],
  },
  {
    id: 'mystic_fountain_wish',
    title: '星降る願いの聖泉',
    spriteId: 'bless_bond',
    description: '七色にきらめく神秘の泉。「旅人よ、一つだけ大きな願いを叶えてあげよう」と声が響く。',
    options: [
      {
        id: 'wish_power',
        label: '圧倒的な闘志と力を願う',
        hint: '今回攻撃+45%・防御+8 ＆ 連携奥義ゲージ100%満タン！',
        outcome: 'WISH_POWER',
      },
      {
        id: 'wish_fortune',
        label: '黄金と秘宝の雨を願う',
        hint: '特大ゴールド獲得 ＆ 確定で装備アイテムを発見！',
        outcome: 'WISH_FORTUNE',
      },
      {
        id: 'wish_miracle',
        label: '仲間全員の完全復活を願う',
        hint: '倒れた仲間を全員蘇生し、パーティ全員のHPを100%全回復！',
        outcome: 'WISH_MIRACLE',
      },
    ],
  },
  {
    id: 'secret_vault',
    title: '王家の隠し宝物庫',
    spriteId: 'item_god_aegis',
    description: '崩れた壁の向こうに、眩い金貨と宝具が山積みにされた隠し部屋を見つけた！',
    options: [
      {
        id: 'vault_plunder',
        label: '奥の黄金箱まで徹底的に漁る',
        hint: '特大G＋素材2種＋装備高確率！（30%で中ボス級ミミックが襲来）',
        outcome: 'VAULT_PLUNDER',
      },
      {
        id: 'vault_safe',
        label: '手前の金貨袋だけ頂戴する',
        hint: '安全にまとまったGと鉄鉱石+2を入手',
        outcome: 'VAULT_SAFE',
      },
    ],
  },
  {
    id: 'dragon_shrine',
    title: '古竜の試練祭壇',
    spriteId: 'item_dragon_heart',
    description: '竜の彫刻が鎮座する荘厳な祭壇。試練を受ければ強大な力が目覚め、戦えば大いなる報酬が得られるという。',
    options: [
      {
        id: 'dragon_trial',
        label: '古竜の試練（中ボス戦）に挑む！',
        hint: '中ボス級強敵と激突！勝利で希少装備チャンス・大量G・今回攻撃+25%',
        outcome: 'TRIAL_MIDBOSS',
      },
      {
        id: 'dragon_bless',
        label: '竜の鱗に触れて加護を授かる',
        hint: '全員HP40%回復・今回防御+10・古文書+1を獲得',
        outcome: 'DRAGON_BLESS',
      },
    ],
  },
  {
    id: 'crimson_pact',
    title: '紅蓮の契約石',
    spriteId: 'bless_blood',
    description: '脈動する巨大な紅蓮の水晶。「血を捧げれば爆発的な破壊力を、砕けば尽きぬ生命力を与えよう」',
    options: [
      {
        id: 'pact_berserk',
        label: 'HP30%を捧げて狂戦士の力を得る',
        hint: '勇者HP30%消費 · 今回攻撃+60%＆古文書+2！',
        outcome: 'PACT_BERSERK',
      },
      {
        id: 'pact_vitality',
        label: '血石を砕いて生命力を吸収する',
        hint: '今回全員の最大HP+20%＆全員HP全快！',
        outcome: 'PACT_VITALITY',
      },
    ],
  },
  {
    id: 'mimic_chest',
    title: '不気味に震える豪華な宝箱',
    spriteId: 'enemy_mimic',
    minLoop: 2,
    description: '黄金の装飾が施された宝箱だが、鍵穴の奥から微かな息遣いが聞こえる…。ミミックかもしれないが、本物なら破格の財宝があるはずだ。',
    options: [
      {
        id: 'open_mimic',
        label: '警戒しつつ強引に蓋をこじ開ける',
        hint: '確率で豪華財宝 · 外れると中ボス級「貪欲なるミミック」と戦闘（撃破で豪華報酬）',
        outcome: 'MIMIC_CHEST',
      },
      {
        id: 'leave_mimic',
        label: '気味が悪いので触れずに立ち去る',
        hint: '安全に先へ進む',
        outcome: 'SKIP',
      },
    ],
  },
  {
    id: 'wandering_alchemist',
    title: '迷宮の放浪錬金術師',
    spriteId: 'prop_alchemist',
    minLoop: 2,
    description: '紫のローブを纏った錬金術師が携帯釜を沸かしている。「おや、先を急ぐなら秘薬を調合しようか？ 不要物の買い取りもするよ」',
    options: [
      {
        id: 'brew',
        label: '特製秘薬の調合を頼む (40G)',
        hint: '40G支払い、今回探索中の攻撃+35%＆HP60%回復',
        outcome: 'ALCHEMIST_BREW',
        goldCost: 40,
      },
      {
        id: 'sell',
        label: '手持ちの余剰品を鑑定してもらう',
        hint: 'まとまったゴールドと魔石・古文書を入手',
        outcome: 'ALCHEMIST_SELL',
      },
      {
        id: 'skip_alch',
        label: '礼を言って通り過ぎる',
        hint: '何もせず進む',
        outcome: 'SKIP',
      },
    ],
  },
  {
    id: 'gamble_altar',
    title: '運命の賭け祭壇',
    spriteId: 'bless_gold',
    minLoop: 2,
    description: '光と闇の天秤が置かれた怪しい祭壇。「己の生命を秤に載せよ。大いなる幸運か、痛手かを受け取るだろう」',
    options: [
      {
        id: 'gamble_high',
        label: 'HP25%を賭けて運命の天秤を引く',
        hint: '高確率で大吉（特大G＋素材3種＋攻撃+40%＋装備抽選）、外れると追加ダメ',
        outcome: 'GAMBLE_HIGH',
      },
      {
        id: 'gamble_safe',
        label: '20Gを供えて無事を祈る',
        hint: '20G支払い、パーティ全員HP45%回復',
        outcome: 'GAMBLE_SAFE',
        goldCost: 20,
      },
    ],
  },
  {
    id: 'time_rift',
    title: '時空の歪み・祝福の裂け目',
    spriteId: 'item_infinity_crown',
    minLoop: 2,
    description: '空間がまばゆく歪み、時を巻き戻す光と先へ導く風の双方が溢れ出している！',
    options: [
      {
        id: 'rift_power',
        label: '時空の魔力を浴びて全力を解放する',
        hint: '今回攻撃+50%・全消費アイテム残数+1補充・連携ゲージ100%！',
        outcome: 'RIFT_POWER',
      },
      {
        id: 'rift_warp',
        label: '空間跳躍で次階層へ飛び、財宝も掠める',
        hint: '1階層スキップして前進（最深部手前なら大量G・魔石+2・HP回復）！',
        outcome: 'RIFT_WARP',
      },
    ],
  },
];

export const INSTANT_EVENTS: InstantEventDef[] = [
  {
    id: 'gold_pouch',
    title: 'こぼれ落ちた金貨袋',
    spriteId: 'item_charm_gold',
    kind: 'GOLD_POUCH',
  },
  {
    id: 'gentle_breeze',
    title: '癒やしの風の部屋',
    spriteId: 'prop_fountain',
    kind: 'GENTLE_BREEZE',
  },
  {
    id: 'hidden_rack',
    title: '忘れられた物資棚',
    spriteId: 'prop_chest_open',
    kind: 'HIDDEN_RACK',
  },
  {
    id: 'falling_rocks',
    title: '天井の落石罠',
    spriteId: 'prop_trap',
    kind: 'FALLING_ROCKS',
  },
  {
    id: 'blessed_statue',
    title: '古の戦女神像',
    spriteId: 'bless_shield',
    kind: 'BLESSED_STATUE',
  },
  {
    id: 'stray_slime',
    title: 'はぐれ金スライム',
    spriteId: 'enemy_gold_slime',
    kind: 'STRAY_SLIME',
  },
  {
    id: 'meteor_blessing',
    title: '流星の魔力覚醒',
    spriteId: 'item_sage_orb',
    kind: 'METEOR_BLESSING',
  },
  {
    id: 'treasure_goblin',
    title: '黄金を抱えた大ゴブリン',
    spriteId: 'enemy_goblin',
    kind: 'TREASURE_GOBLIN',
  },
  {
    id: 'lost_shrine_revive',
    title: '奇跡の蘇生祭壇',
    spriteId: 'item_elixir',
    kind: 'LOST_SHRINE_REVIVE',
  },
  {
    id: 'ancient_supply_cache',
    title: '伝説の補給物資箱',
    spriteId: 'item_nectar',
    kind: 'ANCIENT_SUPPLY_CACHE',
  },
  {
    id: 'gem_vein',
    title: 'きらめく魔石鉱脈',
    spriteId: 'prop_gem_vein',
    kind: 'GEM_VEIN',
    minLoop: 2,
  },
  {
    id: 'chaos_roulette',
    title: '大いなる混沌のルーレット',
    spriteId: 'item_clover',
    kind: 'CHAOS_ROULETTE',
    minLoop: 2,
  },
];

export const MAX_PRESET_SLOTS = 4;

export function createDefaultPresets(): LoadoutPreset[] {
  return Array.from({ length: MAX_PRESET_SLOTS }, (_, i) => ({
    id: `preset_${i + 1}`,
    name: `マイセット ${i + 1}`,
    saved: false,
    pouch: Array(MAX_POUCH_SLOTS).fill(null),
    activeAllies: [],
    partyOrder: ['hero'],
    activeBlessings: [],
    autoEquipStyle: 'OFFENSE',
  }));
}

export const INITIAL_SAVE_STATE: SaveState = {
  gold: 120,
  materials: {
    iron_ore: 2,
    magic_stone: 1,
    ancient_scroll: 0,
    abyss_shard: 0,
    void_gear: 0,
    chaos_prism: 0,
  },
  inventory: {
    wooden_sword: 1,
    leather_armor: 1,
    red_potion: 2,
    fire_bomb: 1,
  },
  pouch: ['wooden_sword', 'leather_armor', 'red_potion', 'fire_bomb', null],
  totalMeterCap: INITIAL_TOTAL_METER_CAP,
  typeMeterCaps: { ...INITIAL_TYPE_METER_CAPS },
  loopCount: 1,
  highestClearedLoop: 0,
  bestEndlessFloor: 0,
  clearCrests: 0,
  shopBoughtThisCycle: {},
  eventChoiceMode: 'MANUAL',
  autoEquipStyle: 'OFFENSE',
  unlockedBlessings: {},
  activeBlessings: [],
  maxBlessingSlots: 2,
  hiredAllies: {},
  allyAwakenings: {},
  allyGearLevels: {},
  activeAllies: [],
  partyOrder: ['hero'],
  highestClearedStage: 0,
  selectedStageId: 1,
  totalRuns: 0,
  totalClears: 0,
  cycleClears: 0,
  heroUpgradeLevel: 1,
  skillPoints: 1,
  unlockedSkills: [],
  spMasteryLevel: 0,
  stageClearsThisLoop: [],
  discoveredEnemies: [],
  discoveredEvents: [],
  discoveredItems: ['wooden_sword', 'leather_armor', 'red_potion', 'fire_bomb'],
  seenGuides: [],
  unlockedAchievements: [],
  claimedAllAchievementsInLoop: 0,
  bossRushClears: 0,
  bestSingleHit: 0,
  unlockedConveniences: [],
  preferredSpeed: 1,
  autoRepeatEnabled: false,
  autoRestockOnReturn: false,
  practiceLoopCount: null,
  presets: createDefaultPresets(),
  itemRefineLevels: {},
  seenAnnouncements: [],
  lifetimeStats: {
    playTimeSeconds: 0,
    totalGoldEarned: 0,
    totalGoldSpent: 0,
    totalUpgrades: 0,
    totalItemsUsed: 0,
    totalConsumableActivations: 0,
    totalItemsBought: 0,
    totalItemsCrafted: 0,
    totalItemsRefined: 0,
    totalItemsSalvaged: 0,
    totalHeroLevelsGained: 0,
    totalAllyLevelsGained: 0,
    totalEnemiesDefeated: 0,
    totalBossesDefeated: 0,
    totalDamageDealt: 0,
    totalHealingDone: 0,
    totalCrestsEarned: 0,
    totalMaterialsEarned: 0,
    totalReincarnations: 0,
    recentRuns: [],
  },
  customAlly: { ...INITIAL_CUSTOM_ALLY },
  customAllyUnlocked: false,
  loop23FailRetreatCount: 0,
  seenStoryOpening: false,
  seenStoryEnding: false,
};

export const INITIAL_LIFETIME_STATS: LifetimeStats = INITIAL_SAVE_STATE.lifetimeStats;

export const CONVENIENCE_UPGRADES: ConvenienceUpgradeDef[] = [
  {
    id: 'conv_speed_4x',
    name: '探索倍速 I（2x · 4x）',
    costSp: 1,
    description: 'ダンジョン攻略の再生速度「2x」「4x」を解放します。',
  },
  {
    id: 'conv_speed_8x',
    name: '探索倍速 II（8x）',
    costSp: 1,
    requires: 'conv_speed_4x',
    description: 'ダンジョン攻略の高速「8x」モードを解放します。',
  },
  {
    id: 'conv_speed_16x',
    name: '探索倍速 III（最大16x）',
    costSp: 1,
    requires: 'conv_speed_8x',
    description: '超高速「16x」モードを解放します。精密計算により1x時と同じ挙動で高速攻略できます。',
  },
  {
    id: 'conv_auto_event',
    name: 'イベント自動判断',
    costSp: 1,
    description: '道中の選択イベントを状況（残HP・盗賊同行・所持G）に応じて自動決定するモードを解放します。',
  },
  {
    id: 'conv_auto_equip',
    name: 'スマート編成（オート装備）',
    costSp: 1,
    description: '方針別（攻撃／防御／消費多め）の「オート装備」と「持ち込み全解除」を解放します。',
  },
  {
    id: 'conv_auto_repeat',
    name: '連続自動周回＆自動補充',
    costSp: 1,
    description: '帰還時に消費した持ち込み枠をショップから自動購入（お金と在庫が十分な場合）＆倉庫補充し、同じステージへ自動再出撃する「連続周回」を解放します。',
  },
  {
    id: 'conv_bulk_ops',
    name: '一括育成＆ショップ補充',
    costSp: 1,
    description: '勇者・仲間の「一括修行/訓練」、倉庫の「余剰COMMON一括売却」、道具屋の「全アイテムまとめて購入」を解放します。',
  },
];

export const CONVENIENCE_UPGRADE_IDS: ConvenienceUpgradeId[] = [
  ...CONVENIENCE_UPGRADES.map((c) => c.id),
  'conv_speed_32x',
  'conv_speed_64x',
];

export const ENDLESS_TRUE_ENDGAME_FLOOR = 100;
export const ENDLESS_TRUE_ENDGAME_REVEAL_FLOOR = 30;

export function isTrueEndgameUnlocked(save: SaveState): boolean {
  return (save.bestEndlessFloor ?? 0) >= ENDLESS_TRUE_ENDGAME_FLOOR;
}

export function isTrueEndgameVisible(save: SaveState): boolean {
  return (save.bestEndlessFloor ?? 0) >= ENDLESS_TRUE_ENDGAME_REVEAL_FLOOR;
}

export function hasConvenience(save: SaveState, id: ConvenienceUpgradeId): boolean {
  return (
    (save.unlockedSkills ?? []).includes(id) ||
    (save.unlockedConveniences ?? []).includes(id)
  );
}

export function getEffectiveDiveLoop(
  save: SaveState,
  stageId?: number
): { loop: number; isPractice: boolean } {
  const targetStageId = stageId ?? save.selectedStageId;
  if (targetStageId === 11) {
    return { loop: ENDLESS_BENCHMARK_LOOP, isPractice: false };
  }
  const current = Math.max(1, save.loopCount);
  if (
    current >= 2 &&
    save.practiceLoopCount !== null &&
    save.practiceLoopCount !== undefined &&
    save.practiceLoopCount >= 1 &&
    save.practiceLoopCount < current
  ) {
    return { loop: Math.floor(save.practiceLoopCount), isPractice: true };
  }
  return { loop: current, isPractice: false };
}

export function getMaxUnlockedSpeed(save: SaveState): GameSpeed {
  if (hasConvenience(save, 'conv_speed_64x')) return 64;
  if (hasConvenience(save, 'conv_speed_32x')) return 32;
  if (hasConvenience(save, 'conv_speed_16x')) return 16;
  if (hasConvenience(save, 'conv_speed_8x')) return 8;
  if (hasConvenience(save, 'conv_speed_4x')) return 4;
  return 1;
}

export function clampSpeedToUnlocked(speed: number | undefined, save: SaveState): GameSpeed {
  const maxSpd = getMaxUnlockedSpeed(save);
  const valid: GameSpeed[] = [1, 2, 4, 8, 16, 32, 64];
  const candidate = valid.includes(speed as GameSpeed) ? (speed as GameSpeed) : 1;
  return candidate <= maxSpd ? candidate : maxSpd;
}

export function getHeroTrainStepCost(level: number): number {
  return Math.round(55 * Math.pow(1.1315, Math.max(0, level - 1)));
}

export function getNextHeroMilestoneSteps(level: number): number {
  const rem = level % 5;
  return rem === 0 ? 5 : 5 - rem;
}

export function getHeroTrainBulkCost(currentLevel: number, steps: number): number {
  let total = 0;
  for (let i = 0; i < steps; i++) {
    total += getHeroTrainStepCost(currentLevel + i);
  }
  return total;
}

export function getAllyTrainStepCost(ally: AllyDef, currentLevel: number): number {
  return currentLevel === 0
    ? ally.hireCost
    : Math.round(ally.upgradeBaseCost * Math.pow(1.212, currentLevel - 1));
}

export function getAllyTrainBulkCost(ally: AllyDef, currentLevel: number, steps: number): number {
  let total = 0;
  for (let i = 0; i < steps; i++) {
    total += getAllyTrainStepCost(ally, currentLevel + i);
  }
  return total;
}

export interface AutoRestockResult {
  pouch: (string | null)[];
  nextInventory: Record<string, number>;
  nextShopBought: Record<string, number>;
  goldSpent: number;
  boughtItemIds: string[];
}

export function refillConsumedPouchSlots(
  originalPouch: (string | null)[],
  reconciledPouch: (string | null)[],
  saveAfterRun: SaveState
): AutoRestockResult {
  const nextPouch = [...reconciledPouch];
  const nextInventory: Record<string, number> = { ...saveAfterRun.inventory };
  const nextShopBought: Record<string, number> = { ...saveAfterRun.shopBoughtThisCycle };
  let remainingGold = saveAfterRun.gold;
  let goldSpent = 0;
  const boughtItemIds: string[] = [];

  const style = saveAfterRun.autoEquipStyle ?? 'OFFENSE';
  const effectiveTotalCap = getEffectiveTotalMeterCap(saveAfterRun);
  const usage = getPouchMeterUsage(nextPouch);
  let totalUsed = usage.total;
  const typeUsed: TypeMeterCaps = { ...usage.byCategory };

  const countInPouch = (id: string) => nextPouch.filter((x) => x === id).length;

  const fitsMeter = (id: string) => {
    const it = ITEMS[id];
    if (!it) return false;
    const cost = getItemMeterCost(id);
    return (
      totalUsed + cost <= effectiveTotalCap &&
      typeUsed[it.category] + cost <= getEffectiveTypeMeterCap(saveAfterRun, it.category)
    );
  };

  const canPlaceFromInventory = (id: string) => {
    const owned = nextInventory[id] ?? 0;
    if (countInPouch(id) >= owned) return false;
    return fitsMeter(id);
  };

  for (let i = 0; i < MAX_POUCH_SLOTS; i++) {
    const wasEquipped = originalPouch[i];
    if (!wasEquipped || nextPouch[i] !== null) continue;
    const prevItem = ITEMS[wasEquipped];
    const targetCategory = prevItem?.category;

    // 1. If the consumed item is purchasable in shop and player has enough gold & stock, auto-buy and equip it
    if (prevItem && fitsMeter(wasEquipped) && isItemUnlockedInShop(prevItem, saveAfterRun.cycleClears)) {
      const maxStock = getShopMaxStock(prevItem, saveAfterRun.cycleClears);
      const boughtCount = nextShopBought[wasEquipped] ?? 0;
      if (boughtCount < maxStock && remainingGold >= prevItem.price) {
        remainingGold -= prevItem.price;
        goldSpent += prevItem.price;
        nextInventory[wasEquipped] = (nextInventory[wasEquipped] ?? 0) + 1;
        nextShopBought[wasEquipped] = boughtCount + 1;
        boughtItemIds.push(wasEquipped);

        nextPouch[i] = wasEquipped;
        const cost = getItemMeterCost(wasEquipped);
        totalUsed += cost;
        typeUsed[prevItem.category] += cost;
        continue;
      }
    }

    // 2. Fallback to spare items in warehouse
    const candidates = Object.entries(nextInventory)
      .filter(([id, qty]) => qty > 0 && canPlaceFromInventory(id))
      .map(([id]) => ({
        id,
        item: ITEMS[id]!,
        sameCat: ITEMS[id]?.category === targetCategory ? 1 : 0,
        score: scoreItemForPlaystyle(ITEMS[id]!, style),
      }))
      .sort((a, b) => b.sameCat - a.sameCat || b.score - a.score);

    const best = candidates[0];
    if (best) {
      nextPouch[i] = best.id;
      const cost = getItemMeterCost(best.id);
      totalUsed += cost;
      typeUsed[best.item.category] += cost;
    }
  }
  return {
    pouch: nextPouch,
    nextInventory,
    nextShopBought,
    goldSpent,
    boughtItemIds,
  };
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'ach_stage1',
    title: '迷宮への第一歩',
    category: 'PROGRESSION',
    description: 'ステージ1「苔むす迷宮」を踏破する。',
    rewardText: '勇者・味方 攻撃+4% / HP+4%',
    spriteId: 'item_sword_wood',
    bonus: { atkPct: 4, hpPct: 4, allyPowerPct: 4, allyHpPct: 4 },
  },
  {
    id: 'ach_minimalist',
    title: '縛り挑戦：最小荷物',
    category: 'CHALLENGE',
    description: '持ち込み袋を 2個以下（空き3枠以上）にしていずれかのステージを踏破する。',
    rewardText: '獲得ゴールド+10% / 勇者・味方 防御+5%',
    spriteId: 'item_charm_gold',
    bonus: { goldPct: 10, defPct: 5 },
  },
  {
    id: 'ach_no_consumable',
    title: '薬いらずの決意',
    category: 'CHALLENGE',
    description: '消費アイテムを1度も発動させずにステージ2以降を踏破する。',
    rewardText: '勇者・味方 最大HP +8%',
    spriteId: 'item_herb',
    bonus: { hpPct: 8, allyHpPct: 8 },
  },
  {
    id: 'ach_perfect_trio',
    title: '三位一体の勝利',
    category: 'BOND',
    description: '勇者と仲間2人（計3人）を連れて全員生存したままステージ3以降を踏破する。',
    rewardText: '味方能力 +12% / 味方速度 +6%',
    spriteId: 'bless_bond',
    bonus: { allyPowerPct: 12, allySpdPct: 6 },
  },
  {
    id: 'ach_speed_clear',
    title: '電光石火の踏破',
    category: 'CHALLENGE',
    description: '探索経過時間 40秒以内 でいずれかのステージを踏破する。',
    rewardText: '勇者・味方 攻撃速度 +8%',
    spriteId: 'item_boots',
    bonus: { spdPct: 8, allySpdPct: 8 },
  },
  {
    id: 'ach_heavy_hitter',
    title: '一撃必殺の極み',
    category: 'COMBAT',
    description: '1回の攻撃で 180ダメージ以上 を叩き出す。',
    rewardText: '会心率 +5% / 会心ダメージ +15%',
    spriteId: 'item_sword_flame',
    bonus: { critPct: 5, critDmgPct: 15 },
  },
  {
    id: 'ach_high_hp_boss',
    title: '盤石の完勝',
    category: 'CHALLENGE',
    description: '勇者の残りHP 80%以上 を保ったままステージ4以降のボスを倒して踏破する。',
    rewardText: '勇者・味方 防御+10% / 被ダメージ-4%',
    spriteId: 'item_shield_holy',
    bonus: { defPct: 10, dmgReductionPct: 4 },
  },
  {
    id: 'ach_demon_slayer',
    title: '魔王討伐',
    category: 'PROGRESSION',
    description: 'ステージ6「深淵の玉座」の魔王アビスドラゴンを討伐する。',
    rewardText: '勇者・味方 全攻防HP +10%',
    spriteId: 'boss_dragon',
    bonus: { heroAndAllyStatsPct: 10 },
  },
  {
    id: 'ach_reincarnate',
    title: '輪廻の転生者',
    category: 'PROGRESSION',
    description: '転生を実行し、第2周目以降の世界へ進む。',
    rewardText: '獲得ゴールド+15% / 素材ドロップ+20%',
    spriteId: 'item_sage_orb',
    bonus: { goldPct: 15, dropPct: 20 },
  },
  {
    id: 'ach_ally_master',
    title: '揺るぎなき戦友',
    category: 'BOND',
    description: 'いずれかの仲間の専属武具を +3以上 に鍛え、特技覚醒 ★2以上 に到達する。',
    rewardText: '味方能力 +15% / 味方HP +12%',
    spriteId: 'ally_knight',
    bonus: { allyPowerPct: 15, allyHpPct: 12 },
  },
  {
    id: 'ach_epic_collector',
    title: '伝説の収集家',
    category: 'PROGRESSION',
    description: 'EPICレアリティの装備・秘宝・霊薬を累計 3種類以上 図鑑に登録する。',
    rewardText: '勇者・味方 攻撃+10% / 吸血+3%',
    spriteId: 'item_excalibur',
    bonus: { atkPct: 10, lifestealPct: 3, allyPowerPct: 10 },
  },
  {
    id: 'ach_secret_clear',
    title: '裏迷宮の覇者',
    category: 'CHALLENGE',
    description: '2周目以降に出現する【裏】ステージを1つ以上踏破する。',
    rewardText: '勇者・味方 全攻防HP +12%',
    spriteId: 'boss_crimson_archfiend',
    bonus: { heroAndAllyStatsPct: 12 },
  },
];

export const ALL_ACHIEVEMENT_IDS = ACHIEVEMENTS.map((a) => a.id);

export const SECRET_ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'sach_endless_100',
    title: '【裏】深淵百層の突破者',
    category: 'CHALLENGE',
    description: '無限回廊で 100F に到達（突破）する。',
    rewardText: '勇者・味方 全攻防HP +20% / 獲得G +25%',
    spriteId: 'item_infinity_crown',
    bonus: { heroAndAllyStatsPct: 20, goldPct: 25 },
  },
  {
    id: 'sach_endless_150',
    title: '【裏】深淵を征す覇者',
    category: 'CHALLENGE',
    description: '無限回廊で 150F に到達する。',
    rewardText: '勇者・味方 攻撃+25% / 会心ダメ+35% / 速度+15%',
    spriteId: 'boss_eternal_overlord',
    bonus: { atkPct: 25, allyPowerPct: 25, critDmgPct: 35, spdPct: 15, allySpdPct: 15 },
  },
  {
    id: 'sach_endless_200',
    title: '【裏】無限の超越者',
    category: 'CHALLENGE',
    description: '無限回廊で 200F に到達する。',
    rewardText: '勇者・味方 全攻防HP +35% / 被ダメ -8%',
    spriteId: 'item_void_lance',
    bonus: { heroAndAllyStatsPct: 35, dmgReductionPct: 8 },
  },
  {
    id: 'sach_god_slayer',
    title: '【裏】極限一撃の神域',
    category: 'COMBAT',
    description: '1回の攻撃で 10,000ダメージ以上 を叩き出す。',
    rewardText: '会心率 +12% / 会心ダメ +50% / 吸血 +5%',
    spriteId: 'item_god_blade',
    bonus: { critPct: 12, critDmgPct: 50, lifestealPct: 5 },
  },
  {
    id: 'sach_forge_mythic',
    title: '【裏】神域鍛冶の継承者',
    category: 'PROGRESSION',
    description: '無限100F突破後に解放される鍛冶屋限定装備を1つ以上鍛造する。',
    rewardText: '素材ドロップ +35% / 勇者・味方 防御+25% · HP+20%',
    spriteId: 'item_omega_armor',
    bonus: { dropPct: 35, defPct: 25, hpPct: 20, allyHpPct: 20 },
  },
  {
    id: 'sach_transcendent_master',
    title: '【裏】超越せし極み',
    category: 'PROGRESSION',
    description: '「深淵超越の道」の高コストスキル（32倍速・64倍速など）を1つ以上習得する。',
    rewardText: '勇者・味方 全攻防HP +25% / 味方速度 +20%',
    spriteId: 'item_abyss_core',
    bonus: { heroAndAllyStatsPct: 25, allySpdPct: 20 },
  },
];

export const ALL_SECRET_ACHIEVEMENT_IDS = SECRET_ACHIEVEMENTS.map((a) => a.id);

export function areAllAchievementsUnlocked(save: SaveState): boolean {
  const unlockedSet = new Set(save.unlockedAchievements ?? []);
  return ALL_ACHIEVEMENT_IDS.every((id) => unlockedSet.has(id));
}

export function getAchievementBonuses(save: SaveState): Required<AchievementBonus> & {
  unlockedCount: number;
  totalCount: number;
  secretUnlockedCount: number;
  secretTotalCount: number;
} {
  const unlockedSet = new Set(save.unlockedAchievements ?? []);
  const unlockedCount = ALL_ACHIEVEMENT_IDS.filter((id) => unlockedSet.has(id)).length;
  const secretUnlockedCount = ALL_SECRET_ACHIEVEMENT_IDS.filter((id) => unlockedSet.has(id)).length;
  const totalRankCount = unlockedCount + secretUnlockedCount;

  // Per-achievement cumulative power rank: each unlocked achievement boosts Hero & Allies +3% stats and +4% gold!
  const out: Required<AchievementBonus> & {
    unlockedCount: number;
    totalCount: number;
    secretUnlockedCount: number;
    secretTotalCount: number;
  } = {
    unlockedCount,
    totalCount: ACHIEVEMENTS.length,
    secretUnlockedCount,
    secretTotalCount: SECRET_ACHIEVEMENTS.length,
    heroAndAllyStatsPct: totalRankCount * 3,
    atkPct: 0,
    defPct: 0,
    hpPct: 0,
    spdPct: 0,
    critPct: 0,
    critDmgPct: 0,
    lifestealPct: 0,
    dmgReductionPct: 0,
    allyPowerPct: totalRankCount * 3,
    allySpdPct: 0,
    allyHpPct: totalRankCount * 3,
    goldPct: totalRankCount * 4,
    dropPct: 0,
  };

  [...ACHIEVEMENTS, ...SECRET_ACHIEVEMENTS].forEach((ach) => {
    if (!unlockedSet.has(ach.id)) return;
    const b = ach.bonus;
    out.heroAndAllyStatsPct += b.heroAndAllyStatsPct ?? 0;
    out.atkPct += b.atkPct ?? 0;
    out.defPct += b.defPct ?? 0;
    out.hpPct += b.hpPct ?? 0;
    out.spdPct += b.spdPct ?? 0;
    out.critPct += b.critPct ?? 0;
    out.critDmgPct += b.critDmgPct ?? 0;
    out.lifestealPct += b.lifestealPct ?? 0;
    out.dmgReductionPct += b.dmgReductionPct ?? 0;
    out.allyPowerPct += (b.allyPowerPct ?? 0) + (b.heroAndAllyStatsPct ?? 0);
    out.allySpdPct += b.allySpdPct ?? 0;
    out.allyHpPct += (b.allyHpPct ?? 0) + (b.heroAndAllyStatsPct ?? 0);
    out.goldPct += b.goldPct ?? 0;
    out.dropPct += b.dropPct ?? 0;
  });

  // Normalize hero stats to include heroAndAllyStatsPct
  out.atkPct += out.heroAndAllyStatsPct;
  out.defPct += out.heroAndAllyStatsPct;
  out.hpPct += out.heroAndAllyStatsPct;

  return out;
}

export function isEndlessUnlocked(save: SaveState): boolean {
  return (
    (save.highestClearedLoop ?? 0) >= 5 ||
    save.loopCount >= 6 ||
    (save.loopCount === 5 && canReincarnate(save))
  );
}

export function getUnlockedStagesForLoop(loopCount: number): StageDef[] {
  const n = Math.max(1, loopCount);
  return STAGES.filter((s) => !s.isBossRush && !s.isEndless && (s.minLoop ?? 1) <= n);
}

export function getMaxStageForLoop(
  loopCount: number,
  allAchievementsUnlocked = false,
  endlessUnlocked = false
): number {
  const available = STAGES.filter((s) => {
    if (s.isBossRush) return allAchievementsUnlocked;
    if (s.isEndless) return endlessUnlocked;
    return (s.minLoop ?? 1) <= Math.max(1, loopCount);
  });
  return available.reduce((max, s) => Math.max(max, s.id), 1);
}

export function isStageUnlockedForPlay(stage: StageDef, save: SaveState): boolean {
  if (stage.isBossRush) {
    return areAllAchievementsUnlocked(save);
  }
  if (stage.isEndless) {
    return isEndlessUnlocked(save);
  }
  if ((stage.minLoop ?? 1) > save.loopCount) {
    return false;
  }
  const cleared = isStageClearedInCurrentLoop(stage.id, save);
  return stage.id <= save.highestClearedStage + 1 || cleared;
}

export function isStageClearedInCurrentLoop(stageId: number, save: SaveState): boolean {
  if (stageId === 10) {
    return (save.bossRushClears ?? 0) > 0;
  }
  if (stageId === 11) {
    return (save.bestEndlessFloor ?? 0) >= 10;
  }
  return (
    save.highestClearedStage >= stageId ||
    (save.stageClearsThisLoop ?? []).includes(stageId)
  );
}

export function canReincarnate(save: SaveState): boolean {
  const unlocked = getUnlockedStagesForLoop(save.loopCount);
  if (unlocked.length === 0) return false;
  return unlocked.every((st) => isStageClearedInCurrentLoop(st.id, save));
}

export function getLoopEnemyStatMult(loopCount: number): number {
  const n = Math.max(1, loopCount);
  if (n === 1) return 1;
  return Number(Math.pow(1.85, n - 1).toFixed(2));
}

export function getLoopRewardMult(loopCount: number): number {
  const n = Math.max(1, loopCount);
  return 1 + (n - 1) * 0.55;
}

export function getSkillTreeBonuses(
  unlockedSkills: string[] | undefined,
  spMasteryLevel = 0
): Required<SkillNodeEffects> {
  const mastery = Math.max(0, Math.floor(spMasteryLevel));
  const out: Required<SkillNodeEffects> = {
    atkPct: mastery * 8,
    defPct: mastery * 8,
    hpPct: mastery * 8,
    spdPct: 0,
    critPct: 0,
    critDmgPct: 0,
    lifestealPct: 0,
    allyPowerPct: mastery * 6,
    allySpdPct: 0,
    allyHpPct: mastery * 6,
    allyDefPct: mastery * 4,
    allyCritPct: 0,
    allyDmgReductionPct: 0,
    allyLifestealPct: 0,
    heroStatSharePct: 0,
    allyOverdrive: false,
    dmgReductionPct: 0,
    roomHeal: 0,
    goldPct: mastery * 6,
    dropPct: 0,
    consumablePowerPct: 0,
    extraMeterCap: 0,
    extraTypeMeterCap: 0,
    extraCrests: 0,
    tripleStrike: false,
    deathSave: false,
  };
  const activeSet = new Set(unlockedSkills ?? []);
  SKILL_TREE.forEach((node) => {
    if (!activeSet.has(node.id)) return;
    const e = node.effects;
    out.atkPct += e.atkPct ?? 0;
    out.defPct += e.defPct ?? 0;
    out.hpPct += e.hpPct ?? 0;
    out.spdPct += e.spdPct ?? 0;
    out.critPct += e.critPct ?? 0;
    out.critDmgPct += e.critDmgPct ?? 0;
    out.lifestealPct += e.lifestealPct ?? 0;
    out.allyPowerPct += e.allyPowerPct ?? 0;
    out.allySpdPct += e.allySpdPct ?? 0;
    out.allyHpPct += e.allyHpPct ?? 0;
    out.allyDefPct += e.allyDefPct ?? 0;
    out.allyCritPct += e.allyCritPct ?? 0;
    out.allyDmgReductionPct += e.allyDmgReductionPct ?? 0;
    out.allyLifestealPct += e.allyLifestealPct ?? 0;
    out.heroStatSharePct += e.heroStatSharePct ?? 0;
    if (e.allyOverdrive) out.allyOverdrive = true;
    out.dmgReductionPct += e.dmgReductionPct ?? 0;
    out.roomHeal += e.roomHeal ?? 0;
    out.goldPct += e.goldPct ?? 0;
    out.dropPct += e.dropPct ?? 0;
    out.consumablePowerPct += e.consumablePowerPct ?? 0;
    out.extraMeterCap += e.extraMeterCap ?? 0;
    out.extraTypeMeterCap += e.extraTypeMeterCap ?? 0;
    out.extraCrests += e.extraCrests ?? 0;
    if (e.tripleStrike) out.tripleStrike = true;
    if (e.deathSave) out.deathSave = true;
  });
  return out;
}

export function getEffectiveTotalMeterCap(save: SaveState): number {
  const skillBonus = getSkillTreeBonuses(save.unlockedSkills, save.spMasteryLevel);
  return save.totalMeterCap + skillBonus.extraMeterCap;
}

export function getEffectiveTypeMeterCap(save: SaveState, category: ItemCategory): number {
  const skillBonus = getSkillTreeBonuses(save.unlockedSkills, save.spMasteryLevel);
  return save.typeMeterCaps[category] + skillBonus.extraTypeMeterCap;
}

export const AUTO_EQUIP_STYLE_META: Record<
  AutoEquipPlaystyle,
  { label: string; description: string }
> = {
  OFFENSE: {
    label: '攻撃重視',
    description: '武器・攻撃/会心/速度・攻撃バフや爆弾など火力系アイテムを優先編成',
  },
  DEFENSE: {
    label: '防御重視',
    description: '防具・防御/HP/自動回復・結界札/復活など耐久系アイテムを優先編成',
  },
  CONSUMABLES: {
    label: '消費アイテム多め',
    description: '回復薬・爆弾・巻物などの消費アイテムを上限枠まで最優先で詰め込み編成',
  },
};

export function scoreItemForPlaystyle(item: ItemDef, style: AutoEquipPlaystyle): number {
  const s = item.stats;
  const eff = item.autoEffect;
  const rarityScore = item.rarity === 'EPIC' ? 32 : item.rarity === 'RARE' ? 16 : 4;

  if (style === 'OFFENSE') {
    let score =
      (s?.atk ?? 0) * 4.0 +
      (s?.crit ?? 0) * 2.4 +
      (s?.spd ?? 0) * 2.2 +
      (s?.lifesteal ?? 0) * 2.5 +
      (s?.def ?? 0) * 0.4 +
      (s?.maxHp ?? 0) * 0.15 +
      rarityScore;

    if (item.category === 'WEAPON') score += 45;
    if (eff) {
      if (eff.kind === 'BUFF_ATK') score += eff.power * 2.4 + 25;
      else if (eff.kind === 'BOMB') score += eff.power * 1.4 + eff.uses * 10;
      else if (eff.kind === 'HEAL_AND_BUFF') score += eff.power * 0.55 + 35;
      else if (eff.kind === 'HEAL' || eff.kind === 'REVIVE') score += eff.power * 0.2;
      else if (eff.kind === 'BUFF_DEF') score += eff.power * 0.4;
    }
    return score;
  }

  if (style === 'DEFENSE') {
    let score =
      (s?.def ?? 0) * 4.6 +
      (s?.maxHp ?? 0) * 0.95 +
      (s?.regenPerRoom ?? 0) * 3.0 +
      (s?.thorns ?? 0) * 1.8 +
      (s?.lifesteal ?? 0) * 2.2 +
      (s?.atk ?? 0) * 0.8 +
      rarityScore;

    if ((s?.def ?? 0) < 0) score -= 35;
    if (item.category === 'ARMOR') score += 45;
    if (eff) {
      if (eff.kind === 'BUFF_DEF') score += eff.power * 5.0 + 30;
      else if (eff.kind === 'REVIVE') score += 125;
      else if (eff.kind === 'HEAL' || eff.kind === 'HEAL_AND_BUFF') {
        score += eff.power * 0.85 + eff.uses * 16 + (eff.reactToAllies ? 22 : 0);
      } else if (eff.kind === 'BOMB') score += eff.power * 0.35;
      else if (eff.kind === 'BUFF_ATK') score += eff.power * 0.5;
    }
    return score;
  }

  // CONSUMABLES style: maximize consumable impact first, then solid gear for leftover slots
  let score =
    (s?.atk ?? 0) * 2.0 +
    (s?.def ?? 0) * 2.0 +
    (s?.maxHp ?? 0) * 0.4 +
    (s?.crit ?? 0) * 1.1 +
    (s?.spd ?? 0) * 1.1 +
    rarityScore;

  if (item.category === 'CONSUMABLE') {
    score += 120;
  }
  if (eff) {
    score += eff.power * 0.85 + eff.uses * 22 + (eff.reactToAllies ? 18 : 0);
    if (eff.kind === 'REVIVE') score += 50;
  }
  return score;
}

export function buildAutoEquipPouch(
  save: SaveState,
  style: AutoEquipPlaystyle
): (string | null)[] {
  const effectiveTotalCap = getEffectiveTotalMeterCap(save);
  const pool: { id: string; category: ItemCategory; score: number }[] = [];

  Object.entries(save.inventory).forEach(([id, qty]) => {
    const item = ITEMS[id];
    if (!item || qty <= 0) return;
    const score = scoreItemForPlaystyle(item, style);
    for (let i = 0; i < qty; i++) {
      pool.push({ id, category: item.category, score });
    }
  });

  pool.sort((a, b) => b.score - a.score);

  const chosen: string[] = [];
  const typeUsed: Record<ItemCategory, number> = {
    WEAPON: 0,
    ARMOR: 0,
    CONSUMABLE: 0,
    RELIC: 0,
  };
  let totalUsed = 0;

  const canFit = (id: string) => {
    const it = ITEMS[id];
    if (!it) return false;
    const cost = getItemMeterCost(id);
    return (
      typeUsed[it.category] + cost <= getEffectiveTypeMeterCap(save, it.category) &&
      totalUsed + cost <= effectiveTotalCap
    );
  };

  const countPicked = (id: string) => chosen.filter((x) => x === id).length;

  const tryAdd = (id: string): boolean => {
    if (chosen.length >= MAX_POUCH_SLOTS) return false;
    if (countPicked(id) >= (save.inventory[id] ?? 0)) return false;
    if (!canFit(id)) return false;
    const it = ITEMS[id]!;
    const cost = getItemMeterCost(id);
    chosen.push(id);
    typeUsed[it.category] += cost;
    totalUsed += cost;
    return true;
  };

  if (style === 'CONSUMABLES') {
    // Pack as many top consumables as fit (up to 4 slots to keep room for gear if desired, or up to consumable cap)
    const consumablePool = pool.filter((p) => p.category === 'CONSUMABLE');
    for (const cand of consumablePool) {
      if (chosen.length >= MAX_POUCH_SLOTS) break;
      tryAdd(cand.id);
    }
    // Ensure remaining slots get top weapon/armor/relic diversity first, then best remaining
    const gearPriority: ItemCategory[] = ['WEAPON', 'ARMOR', 'RELIC'];
    for (const cat of gearPriority) {
      if (chosen.length >= MAX_POUCH_SLOTS) break;
      const best = pool.find((p) => p.category === cat && canFit(p.id) && countPicked(p.id) < (save.inventory[p.id] ?? 0));
      if (best) tryAdd(best.id);
    }
    for (const cand of pool) {
      if (chosen.length >= MAX_POUCH_SLOTS) break;
      tryAdd(cand.id);
    }
  } else {
    const categoryOrder: ItemCategory[] =
      style === 'OFFENSE'
        ? ['WEAPON', 'RELIC', 'CONSUMABLE', 'ARMOR']
        : ['ARMOR', 'CONSUMABLE', 'RELIC', 'WEAPON'];

    // Pass 1: pick highest-scoring item for each category in preferred priority order
    for (const cat of categoryOrder) {
      if (chosen.length >= MAX_POUCH_SLOTS) break;
      const bestForCat = pool.find(
        (p) =>
          p.category === cat &&
          countPicked(p.id) < (save.inventory[p.id] ?? 0) &&
          canFit(p.id)
      );
      if (bestForCat) {
        tryAdd(bestForCat.id);
      }
    }

    // Pass 2: fill remaining slots greedily by playstyle score
    for (const cand of pool) {
      if (chosen.length >= MAX_POUCH_SLOTS) break;
      tryAdd(cand.id);
    }
  }

  return Array.from({ length: MAX_POUCH_SLOTS }, (_, i) => chosen[i] ?? null);
}

export const INSTANT_EVENT_DESCRIPTIONS: Record<string, string> = {
  gold_pouch: '通路に落ちていた金貨袋からまとまったゴールドを拾い上げる突発イベント。',
  gentle_breeze: '迷宮に吹き込む温かな風で、パーティ全員のHPが30%回復する。',
  hidden_rack: '忘れられた物資棚から大量の素材や装備品を見つけ出す。',
  falling_rocks: '天井からの落石罠。盗賊カイトが同行していると回避して金貨を発見する。',
  blessed_statue: '戦女神の像から強い加護を授かり、その探索中の攻撃+20%・防御+5を得る。',
  stray_slime: '黄金に輝くはぐれスライムを一撃で倒し、大量のゴールドと魔石を獲得する。',
  meteor_blessing: '天井の裂け目から降り注ぐ流星光で、攻撃+30%・防御+6・連携100%＆魔石+2を得る大幸運イベント。',
  treasure_goblin: '財宝を背負った大黄金ゴブリンを捕獲し、大量ゴールド・素材・高確率の装備品を手に入れる！',
  lost_shrine_revive: '古代の蘇生祭壇が輝き、倒れた仲間を全員75%HPで蘇生＆全員HP50%回復！',
  ancient_supply_cache: '伝説の補給箱を発見し、持ち込み中の全消費アイテムの使用回数が+1回復＆素材を獲得！',
  gem_vein: '2周目以降の壁面に輝く希少鉱脈。魔石とゴールドを大量に採掘できる突発イベント。',
  chaos_roulette: '2周目以降の巨大ランダムルーレット！黄金の嵐・神速狂戦士化・素材大爆発など超大型の運命が発動。',
};

export const MAX_ITEM_REFINE = 5;

export function getItemRefineMult(refineLevel: number): number {
  return 1 + Math.max(0, Math.min(MAX_ITEM_REFINE, refineLevel)) * 0.15;
}

export function getItemEffectiveStats(
  itemId: string,
  refineLevels?: Record<string, number>
): ItemStats | undefined {
  const item = ITEMS[itemId];
  if (!item?.stats) return undefined;
  const lv = Math.max(0, Math.min(MAX_ITEM_REFINE, (refineLevels ?? {})[itemId] ?? 0));
  if (lv === 0) return item.stats;
  const mult = getItemRefineMult(lv);
  const s = item.stats;
  return {
    atk: s.atk !== undefined ? (s.atk >= 0 ? Math.round(s.atk * mult) : s.atk) : undefined,
    def: s.def !== undefined ? (s.def >= 0 ? Math.round(s.def * mult) : s.def) : undefined,
    maxHp: s.maxHp !== undefined ? Math.round(s.maxHp * mult) : undefined,
    spd: s.spd !== undefined ? Math.round(s.spd * mult) : undefined,
    crit: s.crit !== undefined ? Math.round(s.crit * mult) : undefined,
    lifesteal: s.lifesteal !== undefined ? Math.round(s.lifesteal * mult) : undefined,
    thorns: s.thorns !== undefined ? Math.round(s.thorns * mult) : undefined,
    goldBonus: s.goldBonus !== undefined ? Math.round(s.goldBonus * mult) : undefined,
    dropBonus: s.dropBonus !== undefined ? Math.round(s.dropBonus * mult) : undefined,
    regenPerRoom: s.regenPerRoom !== undefined ? Math.round(s.regenPerRoom * mult) : undefined,
  };
}

export function getItemEffectiveAutoPower(
  itemId: string,
  refineLevels?: Record<string, number>
): number {
  const item = ITEMS[itemId];
  if (!item?.autoEffect) return 0;
  const lv = Math.max(0, Math.min(MAX_ITEM_REFINE, (refineLevels ?? {})[itemId] ?? 0));
  if (item.autoEffect.kind === 'REVIVE') {
    return Math.min(100, item.autoEffect.power + lv * 7);
  }
  return Math.round(item.autoEffect.power * getItemRefineMult(lv));
}

export function getItemRefineCost(
  itemId: string,
  currentLevel: number
): { gold: number; iron: number; stone: number; scroll: number } {
  const item = ITEMS[itemId];
  const rarityFactor = item?.rarity === 'EPIC' ? 2.1 : item?.rarity === 'RARE' ? 1.45 : 1;
  const step = currentLevel + 1;
  return {
    gold: Math.round((55 + currentLevel * 65) * rarityFactor),
    iron: item?.category === 'CONSUMABLE' ? step : Math.round((2 + currentLevel * 2) * (item?.rarity === 'EPIC' ? 1.5 : 1)),
    stone: currentLevel >= 1 || item?.rarity !== 'COMMON' ? 1 + currentLevel : 0,
    scroll: currentLevel >= 2 || item?.rarity === 'EPIC' ? currentLevel : 0,
  };
}

export function getItemRefineRangeCost(
  itemId: string,
  fromLevel: number,
  toLevel: number = MAX_ITEM_REFINE
): { gold: number; iron: number; stone: number; scroll: number; steps: number } {
  const start = Math.max(0, Math.min(MAX_ITEM_REFINE, fromLevel));
  const end = Math.max(start, Math.min(MAX_ITEM_REFINE, toLevel));
  let gold = 0;
  let iron = 0;
  let stone = 0;
  let scroll = 0;
  for (let lv = start; lv < end; lv++) {
    const c = getItemRefineCost(itemId, lv);
    gold += c.gold;
    iron += c.iron;
    stone += c.stone;
    scroll += c.scroll;
  }
  return { gold, iron, stone, scroll, steps: end - start };
}

export function getItemSalvageReward(itemId: string): {
  gold: number;
  materials: MaterialBag;
} {
  const item = ITEMS[itemId];
  if (!item) {
    return {
      gold: 0,
      materials: {
        iron_ore: 0,
        magic_stone: 0,
        ancient_scroll: 0,
        abyss_shard: 0,
        void_gear: 0,
        chaos_prism: 0,
      },
    };
  }
  if (item.rarity === 'EPIC') {
    return {
      gold: Math.round(item.sellPrice * 0.5),
      materials: {
        iron_ore: 3,
        magic_stone: 2,
        ancient_scroll: 1,
        abyss_shard: 0,
        void_gear: 0,
        chaos_prism: 0,
      },
    };
  }
  if (item.rarity === 'RARE') {
    return {
      gold: Math.round(item.sellPrice * 0.5),
      materials: {
        iron_ore: 2,
        magic_stone: 1,
        ancient_scroll: 0,
        abyss_shard: 0,
        void_gear: 0,
        chaos_prism: 0,
      },
    };
  }
  return {
    gold: Math.round(item.sellPrice * 0.5),
    materials: {
      iron_ore: 1,
      magic_stone: 0,
      ancient_scroll: 0,
      abyss_shard: 0,
      void_gear: 0,
      chaos_prism: 0,
    },
  };
}

export interface CrestExchangeOption {
  id: string;
  title: string;
  description: string;
  crestCost: number;
  rewardKind: 'IRON' | 'STONE' | 'SCROLL' | 'GOLD';
  amount: number;
}

export const CREST_EXCHANGE_OPTIONS: CrestExchangeOption[] = [
  {
    id: 'ex_iron',
    title: '鉄鉱石セット ×5',
    description: '装備の鍛造・精錬に使える鉄鉱石をまとめて交換します。',
    crestCost: 1,
    rewardKind: 'IRON',
    amount: 5,
  },
  {
    id: 'ex_stone',
    title: '魔石セット ×3',
    description: '加護の祭壇や上級鍛造で使う魔石を3個入手します。',
    crestCost: 1,
    rewardKind: 'STONE',
    amount: 3,
  },
  {
    id: 'ex_scroll',
    title: '古文書セット ×2',
    description: '最上級装備や覚醒に必要な古文書を2冊入手します。',
    crestCost: 1,
    rewardKind: 'SCROLL',
    amount: 2,
  },
  {
    id: 'ex_gold',
    title: '王室報奨金袋',
    description: '周回数に応じたまとまったゴールドに換金します。',
    crestCost: 1,
    rewardKind: 'GOLD',
    amount: 320,
  },
];

export const SYNERGIES: SynergyDef[] = [
  {
    id: 'bond_aegis_prayer',
    kind: 'BOND',
    name: '絆：鉄壁の聖陣',
    conditionText: '重騎士ガルド ＋ 聖職者リリア',
    effectText: 'パーティ被ダメ -8% · 被回復量 +15%',
    bonus: { dmgReductionPct: 8, healReceivedPct: 15 },
  },
  {
    id: 'bond_arcane_volley',
    kind: 'BOND',
    name: '絆：魔導弾幕',
    conditionText: '狩人レン ＋ 魔導士ノア',
    effectText: '連携ゲージ蓄積 +35% · 仲間速度 +12%',
    bonus: { unisonChargePct: 35, allySpdPct: 12 },
  },
  {
    id: 'bond_shadow_ambush',
    kind: 'BOND',
    name: '絆：影の急襲',
    conditionText: '盗賊カイト ＋ 狩人レン',
    effectText: '全員会心率 +10% · 獲得ゴールド +15%',
    bonus: { critPct: 10, goldPct: 15 },
  },
  {
    id: 'bond_bastion_blast',
    kind: 'BOND',
    name: '絆：守護と殲滅',
    conditionText: '重騎士ガルド ＋ 魔導士ノア',
    effectText: '仲間能力 +20% · 仲間HP +15%',
    bonus: { allyPowerPct: 20, allyHpPct: 15 },
  },
  {
    id: 'bond_swift_grace',
    kind: 'BOND',
    name: '絆：神速の支援',
    conditionText: '聖職者リリア ＋ 盗賊カイト',
    effectText: '仲間速度 +15% · 部屋移動HP +18',
    bonus: { allySpdPct: 15, roomHeal: 18 },
  },
  {
    id: 'set_crimson_flame',
    kind: 'SET',
    name: '共鳴：紅蓮の業火',
    conditionText: '炎系（紅蓮の太刀・火炎爆弾・不死鳥の羽・竜の心臓石・炎帝の加護）から2種以上',
    effectText: '攻撃力 +15% · 炎上追撃率 +15%',
    bonus: { atkPct: 15, burnChance: 15 },
  },
  {
    id: 'set_holy_sanctuary',
    kind: 'SET',
    name: '共鳴：聖光の加護陣',
    conditionText: '聖系（騎士槍・ミスリル・聖剣・聖域・聖光の鈴・聖杯・聖樹の加護など）から2種以上',
    effectText: '部屋移動HP +25 · 被ダメ -6%',
    bonus: { roomHeal: 25, dmgReductionPct: 6 },
  },
  {
    id: 'set_abyss_pact',
    kind: 'SET',
    name: '共鳴：深淵と吸血の契約',
    conditionText: '闇系（深淵の大剣・影縫い・吸血の牙・狂戦士の指輪・紅月の加護）から2種以上',
    effectText: '吸血 +7% · 会心ダメージ +20%',
    bonus: { lifestealPct: 7, critDmgPct: 20 },
  },
  {
    id: 'set_storm_tempest',
    kind: 'SET',
    name: '共鳴：疾風迅雷',
    conditionText: '風雷系（疾風の短剣・雷鳴の魔杖・風精のブーツ・疾風/雷鳴の加護）から2種以上',
    effectText: '攻撃速度 +15% · 会心率 +8%',
    bonus: { spdPct: 15, critPct: 8 },
  },
  {
    id: 'set_ultimate_overlord',
    kind: 'SET',
    name: '共鳴：神域の覇者',
    conditionText: '最強装備4種（ジェネシス・イージス・覇王冠・アンブロシア）から2種以上',
    effectText: '全攻防HP +18% · 仲間能力 +15%',
    bonus: { atkPct: 18, defPct: 18, hpPct: 18, allyPowerPct: 15 },
  },
];

export function getActiveSynergies(save: SaveState): SynergyDef[] {
  const activeAllies = new Set(save.activeAllies ?? []);
  const activeBlessings = new Set(save.activeBlessings ?? []);
  const uniquePouchItems = new Set(save.pouch.filter((id): id is string => Boolean(id)));

  const tagCounts: Record<string, number> = {};
  uniquePouchItems.forEach((id) => {
    const item = ITEMS[id];
    item?.tags?.forEach((t) => {
      tagCounts[t] = (tagCounts[t] ?? 0) + 1;
    });
  });
  if (activeBlessings.has('flame_blessing')) tagCounts.FLAME = (tagCounts.FLAME ?? 0) + 1;
  if (activeBlessings.has('tree_blessing') || activeBlessings.has('shield_blessing')) {
    tagCounts.HOLY = (tagCounts.HOLY ?? 0) + 1;
  }
  if (activeBlessings.has('vampire_blessing')) tagCounts.DARK = (tagCounts.DARK ?? 0) + 1;
  if (activeBlessings.has('wind_blessing') || activeBlessings.has('thunder_blessing')) {
    tagCounts.STORM = (tagCounts.STORM ?? 0) + 1;
  }

  const out: SynergyDef[] = [];
  if (activeAllies.has('knight_gald') && activeAllies.has('cleric_lilia')) {
    out.push(SYNERGIES.find((s) => s.id === 'bond_aegis_prayer')!);
  }
  if (activeAllies.has('ranger_ren') && activeAllies.has('mage_noah')) {
    out.push(SYNERGIES.find((s) => s.id === 'bond_arcane_volley')!);
  }
  if (activeAllies.has('thief_kaito') && activeAllies.has('ranger_ren')) {
    out.push(SYNERGIES.find((s) => s.id === 'bond_shadow_ambush')!);
  }
  if (activeAllies.has('knight_gald') && activeAllies.has('mage_noah')) {
    out.push(SYNERGIES.find((s) => s.id === 'bond_bastion_blast')!);
  }
  if (activeAllies.has('cleric_lilia') && activeAllies.has('thief_kaito')) {
    out.push(SYNERGIES.find((s) => s.id === 'bond_swift_grace')!);
  }

  if ((tagCounts.FLAME ?? 0) >= 2) out.push(SYNERGIES.find((s) => s.id === 'set_crimson_flame')!);
  if ((tagCounts.HOLY ?? 0) >= 2) out.push(SYNERGIES.find((s) => s.id === 'set_holy_sanctuary')!);
  if ((tagCounts.DARK ?? 0) >= 2) out.push(SYNERGIES.find((s) => s.id === 'set_abyss_pact')!);
  if ((tagCounts.STORM ?? 0) >= 2) out.push(SYNERGIES.find((s) => s.id === 'set_storm_tempest')!);
  if ((tagCounts.ULTIMATE ?? 0) >= 2) out.push(SYNERGIES.find((s) => s.id === 'set_ultimate_overlord')!);

  return out.filter(Boolean);
}

export function getSynergySummary(save: SaveState): Required<SynergyBonus> {
  const list = getActiveSynergies(save);
  const out: Required<SynergyBonus> = {
    atkPct: 0,
    defPct: 0,
    hpPct: 0,
    spdPct: 0,
    critPct: 0,
    critDmgPct: 0,
    lifestealPct: 0,
    dmgReductionPct: 0,
    burnChance: 0,
    roomHeal: 0,
    healReceivedPct: 0,
    unisonChargePct: 0,
    allyPowerPct: 0,
    allySpdPct: 0,
    allyHpPct: 0,
    goldPct: 0,
  };
  list.forEach((syn) => {
    const b = syn.bonus;
    out.atkPct += b.atkPct ?? 0;
    out.defPct += b.defPct ?? 0;
    out.hpPct += b.hpPct ?? 0;
    out.spdPct += b.spdPct ?? 0;
    out.critPct += b.critPct ?? 0;
    out.critDmgPct += b.critDmgPct ?? 0;
    out.lifestealPct += b.lifestealPct ?? 0;
    out.dmgReductionPct += b.dmgReductionPct ?? 0;
    out.burnChance += b.burnChance ?? 0;
    out.roomHeal += b.roomHeal ?? 0;
    out.healReceivedPct += b.healReceivedPct ?? 0;
    out.unisonChargePct += b.unisonChargePct ?? 0;
    out.allyPowerPct += b.allyPowerPct ?? 0;
    out.allySpdPct += b.allySpdPct ?? 0;
    out.allyHpPct += b.allyHpPct ?? 0;
    out.goldPct += b.goldPct ?? 0;
  });
  return out;
}

export function getCompendiumStats(save: SaveState) {
  const validEnemyIds = new Set(Object.keys(ENEMIES));
  const validEventIds = new Set([
    ...DUNGEON_EVENTS.map((e) => e.id),
    ...INSTANT_EVENTS.map((e) => e.id),
  ]);
  const showTrueEndgameItems = isTrueEndgameVisible(save);
  const discoveredItemSet = new Set(save.discoveredItems ?? []);
  const validItemIds = new Set(
    Object.keys(ITEMS).filter(
      (id) => !ITEMS[id]?.isForgeExclusive || showTrueEndgameItems || discoveredItemSet.has(id)
    )
  );

  const enemyCount = new Set((save.discoveredEnemies ?? []).filter((id) => validEnemyIds.has(id))).size;
  const eventCount = new Set((save.discoveredEvents ?? []).filter((id) => validEventIds.has(id))).size;
  const itemCount = new Set((save.discoveredItems ?? []).filter((id) => validItemIds.has(id))).size;

  const totalEnemies = validEnemyIds.size;
  const totalEvents = validEventIds.size;
  const totalItems = validItemIds.size;

  const foundAll = enemyCount + eventCount + itemCount;
  const totalAll = totalEnemies + totalEvents + totalItems;

  return {
    enemyCount,
    totalEnemies,
    enemyPct: totalEnemies > 0 ? Math.round((enemyCount / totalEnemies) * 100) : 0,
    eventCount,
    totalEvents,
    eventPct: totalEvents > 0 ? Math.round((eventCount / totalEvents) * 100) : 0,
    itemCount,
    totalItems,
    itemPct: totalItems > 0 ? Math.round((itemCount / totalItems) * 100) : 0,
    foundAll,
    totalAll,
    overallPct: totalAll > 0 ? Math.round((foundAll / totalAll) * 100) : 0,
  };
}

export function getCompendiumBonuses(save: SaveState) {
  const { overallPct } = getCompendiumStats(save);
  const atkPct = (overallPct >= 25 ? 10 : 0) + (overallPct >= 100 ? 15 : 0);
  const goldPct = overallPct >= 50 ? 15 : 0;
  const hpPct = (overallPct >= 75 ? 15 : 0) + (overallPct >= 100 ? 15 : 0);
  const dropPct = overallPct >= 75 ? 15 : 0;
  const defPct = overallPct >= 100 ? 15 : 0;
  return {
    overallPct,
    atkPct,
    defPct,
    hpPct,
    goldPct,
    dropPct,
  };
}

export function getEnemyStageHint(enemyId: string): string {
  if (enemyId === 'mimic') {
    return '2周目以降のイベント（ミミック宝箱）';
  }
  const matched = STAGES.filter(
    (s) =>
      !s.isEndless &&
      (s.enemyPool.includes(enemyId) || s.eliteId === enemyId || s.bossId === enemyId)
  ).map((s) => (s.isSecret ? `裏ステージ${s.id}(${s.minLoop ?? 2}周目〜)` : `ステージ${s.id}`));
  if (matched.length === 0) return '迷宮内のどこか';
  return matched.join(' · ');
}

export function getItemMeterCost(itemId: string): number {
  const item = ITEMS[itemId];
  if (!item) return 0;
  if (item.isForgeExclusive) return 10;
  if (item.isUltimate) return 5;
  return RARITY_COST[item.rarity] ?? 1;
}

export function getPouchMeterUsage(pouch: (string | null)[]): {
  total: number;
  byCategory: TypeMeterCaps;
} {
  const byCategory: TypeMeterCaps = {
    WEAPON: 0,
    ARMOR: 0,
    CONSUMABLE: 0,
    RELIC: 0,
  };
  let total = 0;
  pouch.forEach((itemId) => {
    if (!itemId) return;
    const item = ITEMS[itemId];
    if (!item) return;
    const cost = getItemMeterCost(itemId);
    byCategory[item.category] += cost;
    total += cost;
  });
  return { total, byCategory };
}

export function getMaxTypeMeterCeiling(loopCount: number): number {
  return Math.min(10, 4 + Math.max(1, loopCount));
}

export function getMaxTotalMeterCeiling(loopCount: number): number {
  return Math.min(15, 10 + Math.max(1, loopCount) * 2);
}

export function getTypeMeterExpandCost(
  category: ItemCategory,
  currentCap: number
): { gold: number; crests: number; magicStone: number } {
  const base = INITIAL_TYPE_METER_CAPS[category];
  const steps = Math.max(0, currentCap - base);
  return {
    gold: 60 + steps * 55,
    crests: 1 + Math.floor(steps / 2),
    magicStone: currentCap >= 4 ? 1 : 0,
  };
}

export function getTotalMeterExpandCost(currentTotalCap: number): {
  gold: number;
  crests: number;
  magicStone: number;
} {
  const steps = Math.max(0, currentTotalCap - INITIAL_TOTAL_METER_CAP);
  return {
    gold: 75 + steps * 50,
    crests: 1 + Math.floor(steps / 3),
    magicStone: currentTotalCap >= 9 ? 1 : 0,
  };
}

export function getAllyGearCost(currentRank: number): {
  gold: number;
  iron: number;
  stone: number;
  scroll: number;
} {
  return {
    gold: 65 + currentRank * 70,
    iron: 2 + currentRank * 2,
    stone: 1 + currentRank,
    scroll: currentRank >= 2 ? currentRank - 1 : 0,
  };
}

export function computePartyPower(save: SaveState): number {
  let atk = 12 + (save.heroUpgradeLevel - 1) * 4;
  let def = 3 + (save.heroUpgradeLevel - 1) * 1.5;
  let hp = 110 + (save.heroUpgradeLevel - 1) * 20;
  let bonus = 0;

  save.pouch.forEach((itemId) => {
    if (!itemId) return;
    const item = ITEMS[itemId];
    if (!item) return;
    const stats = getItemEffectiveStats(itemId, save.itemRefineLevels);
    if (stats) {
      atk += stats.atk ?? 0;
      def += stats.def ?? 0;
      hp += stats.maxHp ?? 0;
      bonus += (stats.crit ?? 0) * 0.6 + (stats.spd ?? 0) * 0.5 + (stats.lifesteal ?? 0) * 1.2;
    }
    if (item.autoEffect) {
      bonus += getItemEffectiveAutoPower(itemId, save.itemRefineLevels) * 0.35;
    }
  });

  let blessAllyPct = 0;
  save.activeBlessings.forEach((bId) => {
    const lv = save.unlockedBlessings[bId] ?? 0;
    const defB = BLESSINGS.find((b) => b.id === bId);
    if (!defB || lv <= 0) return;
    const b = defB.getBonuses(lv);
    atk *= 1 + (b.atkPct ?? 0) / 100;
    def *= 1 + (b.defPct ?? 0) / 100;
    hp *= 1 + (b.hpPct ?? 0) / 100;
    blessAllyPct += b.allyPowerPct ?? 0;
    bonus += (b.lifestealPct ?? 0) * 1.5 + (b.chainLightningChance ?? 0) * 0.4 + (b.burnChance ?? 0) * 0.4;
  });

  const compBonus = getCompendiumBonuses(save);
  const skillBonus = getSkillTreeBonuses(save.unlockedSkills, save.spMasteryLevel);
  const achBonus = getAchievementBonuses(save);
  const synBonus = getSynergySummary(save);
  atk *= 1 + (compBonus.atkPct + skillBonus.atkPct + achBonus.atkPct + synBonus.atkPct) / 100;
  def *= 1 + (compBonus.defPct + skillBonus.defPct + achBonus.defPct + synBonus.defPct) / 100;
  hp *= 1 + (compBonus.hpPct + skillBonus.hpPct + achBonus.hpPct + synBonus.hpPct) / 100;
  bonus +=
    (skillBonus.critPct + achBonus.critPct + synBonus.critPct) * 0.6 +
    (skillBonus.critDmgPct + achBonus.critDmgPct + synBonus.critDmgPct) * 0.25 +
    (skillBonus.spdPct + achBonus.spdPct + synBonus.spdPct) * 0.5 +
    (skillBonus.lifestealPct + achBonus.lifestealPct + synBonus.lifestealPct) * 1.2 +
    (skillBonus.dmgReductionPct + achBonus.dmgReductionPct + synBonus.dmgReductionPct) * 1.5 +
    synBonus.burnChance * 0.4;

  const shareRate = skillBonus.heroStatSharePct / 100;
  save.activeAllies.forEach((allyId) => {
    const lv = save.hiredAllies[allyId] ?? 0;
    const rank = save.allyAwakenings[allyId] ?? 0;
    const gear = (save.allyGearLevels ?? {})[allyId] ?? 0;
    const ally = getAllyDef(allyId, save);
    if (!ally || lv <= 0) return;
    const atkMult =
      (1 + (lv - 1) * 0.2 + rank * 0.12 + gear * 0.16) *
      (1 + (skillBonus.allyPowerPct + blessAllyPct + achBonus.allyPowerPct + synBonus.allyPowerPct) / 100);
    const hpMult =
      (1 + (lv - 1) * 0.2 + rank * 0.12 + gear * 0.14) *
      (1 + (skillBonus.allyHpPct + blessAllyPct + achBonus.allyHpPct + synBonus.allyHpPct) / 100);
    const sharedAtk = atk * shareRate;
    const sharedHp = hp * shareRate;
    bonus += (ally.baseAtk * atkMult + sharedAtk) * 1.15 + (ally.baseHp * hpMult + sharedHp) * 0.14;
  });

  return Math.round(atk * 1.6 + def * 1.4 + hp * 0.18 + bonus);
}

export interface FeatureUnlockDef {
  tab: TownTab;
  label: string;
  requiredStageCleared: number;
  requiredStageName: string;
  lockDescription: string;
  guideTitle: string;
  guideBody: string;
}

export const FEATURE_UNLOCKS: Record<TownTab, FeatureUnlockDef> = {
  PREP: {
    tab: 'PREP',
    label: '持ち込み準備',
    requiredStageCleared: 0,
    requiredStageName: '',
    lockDescription: '倉庫から最大5つの持ち物を袋に詰めて自動探索へ出発します。',
    guideTitle: '基本の遊び方：5つの持ち物で自動攻略',
    guideBody:
      'まずは所持品を「持ち込み袋（5枠）」に詰め、右下の「自動攻略へ出発する」を押しましょう。探索中に使った装備や回復薬は帰還時にすべて消費されるため、手に入れたゴールドで「道具屋」から補充するのがコツです。',
  },
  SHOP: {
    tab: 'SHOP',
    label: '道具屋',
    requiredStageCleared: 0,
    requiredStageName: '',
    lockDescription: 'ゴールドで武器・防具・回復薬を購入できます。ステージ踏破ごとに品揃えが増えます。',
    guideTitle: '道具屋：探索ごとの補充と品揃え拡大',
    guideBody:
      'ステージを踏破して戻ると在庫が補充され、新しい商品や購入上限も増えていきます。序盤は「旅人の剣」や「赤い回復薬」を予備として揃えておくと安定します。',
  },
  ACHIEVEMENTS: {
    tab: 'ACHIEVEMENTS',
    label: '実績',
    requiredStageCleared: 0,
    requiredStageName: '',
    lockDescription: 'チャレンジ的な実績を達成するほど勇者と仲間が永続強化され、全実績解除で【極】強化ボスラッシュが開放されます。',
    guideTitle: 'チャレンジ実績：解除するほど強くなる永続報酬',
    guideBody:
      '縛り攻略や一撃必殺などの実績を解除するたび、勇者と仲間の攻防HPやゴールド効率が永続で伸びていきます。全12実績をコンプリートすると「【極】強化ボスラッシュ」が開放され、踏破時に2%の超低確率で最強装備4種のいずれか1つを狙えます！',
  },
  TAVERN: {
    tab: 'TAVERN',
    label: '酒場・仲間',
    requiredStageCleared: 1,
    requiredStageName: 'ステージ1「苔むす迷宮」',
    lockDescription: '仲間を最大2人まで雇って連れ歩けます。隊列の入れ替えや仲間の訓練・特技覚醒・専属武具鍛錬が可能です。',
    guideTitle: '酒場・仲間：隊列と武具鍛錬で共闘',
    guideBody:
      '最大2人の仲間を雇って一緒に戦えます。レベル訓練・特技覚醒に加え、素材を使った「専属武具鍛錬」で仲間の火力を大幅底上げできます。前衛に盾役、後衛に回復や魔導士を配置して連携奥義を決めましょう！',
  },
  COMPENDIUM: {
    tab: 'COMPENDIUM',
    label: '冒険記録',
    requiredStageCleared: 1,
    requiredStageName: 'ステージ1「苔むす迷宮」',
    lockDescription: '遭遇した魔物・イベント・入手アイテムを図鑑に記録し、コンプリート率に応じた永続ボーナスを得られます。',
    guideTitle: '冒険記録（図鑑）：周回を引き継ぐ永続強化',
    guideBody:
      '出会った魔物や手に入れたアイテムはすべて記録されます。25%・50%・75%・100%の達成ごとに永続ステータスボーナスが発動し、2周目以降にもそのまま引き継がれます。',
  },
  FORGE: {
    tab: 'FORGE',
    label: '鍛冶屋',
    requiredStageCleared: 2,
    requiredStageName: 'ステージ2「紅蓮の坑道」',
    lockDescription: 'ダンジョンで拾った「鉄鉱石」「魔石」「古文書」を使って強力な装備や魔道具を鍛造します。',
    guideTitle: 'ドワーフの鍛冶屋：素材から切り札を鍛造',
    guideBody:
      '道具屋では買えない強力な装備や魔道具を素材から作れます。レア度や格が高い装備ほどメーター負荷（RARE=2 / EPIC=3 / 最強=5 / 鍛冶限定=10）も大きくなるため、袋の上限と相談しながら持ち込みましょう。',
  },
  SHRINE: {
    tab: 'SHRINE',
    label: '加護の祭壇',
    requiredStageCleared: 3,
    requiredStageName: 'ステージ3「呪われし聖堂」',
    lockDescription: '「魔石」を捧げて勇者に永続の加護（パッシブ効果）を宿します。探索で消費されない強力な強化要素です。',
    guideTitle: '加護の祭壇：消費されない永続パッシブ',
    guideBody:
      'アイテムと違い、一度解放して宿した「加護」は帰還しても消えません。魔石が集まったら解放・強化し、プレイスタイルに合わせて発動する加護を切り替えましょう。',
  },
  SKILLS: {
    tab: 'SKILLS',
    label: 'スキル',
    requiredStageCleared: 4,
    requiredStageName: 'ステージ4「氷結の鐘楼」',
    lockDescription: 'SP（スキルポイント）を消費して便利機能ツリーおよび4系統の戦闘スキルツリーを習得します。',
    guideTitle: 'スキルツリー：便利機能と4系統の戦闘強化',
    guideBody:
      '「快適・便利の道」は最初からSPを使って習得でき、ステージ4踏破後は「剣聖」「守護」「探求」「絆の指揮（味方専用）」の4戦闘ツリーとSP極限鍛錬も解放されます。習得したスキルは「振り直し」や転生でリセットされます！',
  },
};

export interface FeatureUnlocks {
  tavern: boolean;
  compendium: boolean;
  forge: boolean;
  shrine: boolean;
  skills: boolean;
  meterExpand: boolean;
  heroTrain: boolean;
}

export function getFeatureUnlocks(save: SaveState): FeatureUnlocks {
  const effectiveCleared = save.loopCount >= 2 ? 99 : save.highestClearedStage;
  return {
    tavern: effectiveCleared >= FEATURE_UNLOCKS.TAVERN.requiredStageCleared,
    compendium: effectiveCleared >= FEATURE_UNLOCKS.COMPENDIUM.requiredStageCleared,
    forge: effectiveCleared >= FEATURE_UNLOCKS.FORGE.requiredStageCleared,
    shrine: effectiveCleared >= FEATURE_UNLOCKS.SHRINE.requiredStageCleared,
    skills: effectiveCleared >= FEATURE_UNLOCKS.SKILLS.requiredStageCleared,
    meterExpand: effectiveCleared >= 1,
    heroTrain: true,
  };
}

export function isTabUnlocked(tab: TownTab, save: SaveState): boolean {
  if (tab === 'SKILLS') return true;
  const effectiveCleared = save.loopCount >= 2 ? 99 : save.highestClearedStage;
  return effectiveCleared >= FEATURE_UNLOCKS[tab].requiredStageCleared;
}

export function getNextUnlockHint(save: SaveState): string | null {
  if (save.loopCount >= 2) return null;
  const cleared = save.highestClearedStage;
  if (cleared === 0) {
    return '次の解除目標：ステージ1「苔むす迷宮」を踏破すると「酒場・仲間」「冒険記録」「メーター上限開放」が解禁されます！';
  }
  if (cleared === 1) {
    return '次の解除目標：ステージ2「紅蓮の坑道」を踏破すると「鍛冶屋」が解禁されます！';
  }
  if (cleared === 2) {
    return '次の解除目標：ステージ3「呪われし聖堂」を踏破すると「加護の祭壇」が解禁されます！';
  }
  if (cleared === 3) {
    return '次の解除目標：ステージ4「氷結の鐘楼」を踏破すると「戦闘スキルツリー（4系統＆SP極限鍛錬）」が解禁されます！';
  }
  return null;
}

export interface FeatureAnnouncementDef {
  id: string;
  badge: string;
  title: string;
  description: string;
  spriteId: string;
  accent: 'amber' | 'emerald' | 'sky' | 'purple' | 'rose';
  targetTab?: TownTab;
  actionLabel?: string;
  isUnlocked: (save: SaveState) => boolean;
}

export const FEATURE_ANNOUNCEMENTS: FeatureAnnouncementDef[] = [
  {
    id: 'unlock_s1',
    badge: '拠点機能解放',
    title: '「酒場・仲間」「冒険記録」「メーター上限開放」が解放！',
    description:
      'ステージ1踏破により、仲間を最大2人雇って隊列を組める「酒場」、遭遇記録で永続強化される「図鑑」、持ち込み容量を増やせる「メーター上限開放」が使えるようになりました。',
    spriteId: 'ally_knight',
    accent: 'emerald',
    targetTab: 'TAVERN',
    actionLabel: '酒場を開く',
    isUnlocked: (save) => save.loopCount >= 2 || save.highestClearedStage >= 1,
  },
  {
    id: 'unlock_s2',
    badge: '拠点機能解放',
    title: '「ドワーフの鍛冶屋」が解放！',
    description:
      'ダンジョンで集めた素材から強力な装備や魔道具を鍛造できるほか、装備精錬（+1〜+5）・余剰分解・踏破の証交換所が利用可能になりました！',
    spriteId: 'item_flame_katana',
    accent: 'amber',
    targetTab: 'FORGE',
    actionLabel: '鍛冶屋を開く',
    isUnlocked: (save) => save.loopCount >= 2 || save.highestClearedStage >= 2,
  },
  {
    id: 'unlock_s3',
    badge: '拠点機能解放',
    title: '「加護の祭壇」が解放！',
    description:
      '「魔石」を捧げて勇者に消えない永続パッシブ効果「加護」を宿せるようになりました。装備と異なり帰還しても消費されません！',
    spriteId: 'bless_flame',
    accent: 'sky',
    targetTab: 'SHRINE',
    actionLabel: '加護の祭壇を開く',
    isUnlocked: (save) => save.loopCount >= 2 || save.highestClearedStage >= 3,
  },
  {
    id: 'unlock_s4',
    badge: '拠点機能解放',
    title: '戦闘スキルツリー（4系統）＆ SP極限鍛錬が解放！',
    description:
      '「スキル」タブで、剣聖・守護・探求・絆の指揮（味方専用）の4戦闘ツリーおよび無限強化「SP極限鍛錬」が解放されました！',
    spriteId: 'item_excalibur',
    accent: 'amber',
    targetTab: 'SKILLS',
    actionLabel: 'スキルツリーを見る',
    isUnlocked: (save) => save.loopCount >= 2 || save.highestClearedStage >= 4,
  },
  {
    id: 'unlock_reincarnate',
    badge: '転生解放',
    title: '魔王討伐達成！「転生（第2周目）」が可能に！',
    description:
      'ステージ6踏破おめでとうございます！持ち込み画面から「転生」を実行でき、図鑑・実績・踏破の証(+2)を引き継いで初期SP増加＆新たな周回世界へ旅立てます。',
    spriteId: 'boss_dragon',
    accent: 'amber',
    targetTab: 'PREP',
    actionLabel: '転生メニューを見る',
    isUnlocked: (save) => save.loopCount === 1 && canReincarnate(save),
  },
  {
    id: 'unlock_loop2',
    badge: '2周目報酬',
    title: '図鑑の詳細解説・仮潜入・裏ステージ7＆希少イベント解放！',
    description:
      '【2周目報酬】①図鑑の魔物・武器アイテムに背景解説ストーリーが追加 ②過去の周回倍率で低効率G・魔石稼ぎができる「仮潜入」解放 ③裏ステージ7「蒼炎の深淵窟」＆ミミック等の新イベントが出現！',
    spriteId: 'item_sage_orb',
    accent: 'sky',
    targetTab: 'COMPENDIUM',
    actionLabel: '図鑑で解説を読む',
    isUnlocked: (save) => save.loopCount >= 2,
  },
  {
    id: 'unlock_custom_ally',
    badge: '隠しキャラ解放',
    title: '隠し仲間「まっさらな仲間（オリキャラ枠）」が酒場に現れた！',
    description:
      '酒場の片隅に、何色にも染まっていない不思議な旅人「まっさらちゃん」が姿を現しました！名前・役割・色や16×16ドット絵を自由に作れるあなただけのオリジナル仲間を作成できます！',
    spriteId: 'ally_custom_blank',
    accent: 'amber',
    targetTab: 'TAVERN',
    actionLabel: '酒場で作成する',
    isUnlocked: (save) => isCustomAllyUnlocked(save) && !save.customAlly?.created,
  },
  {
    id: 'unlock_loop3',
    badge: '3周目報酬',
    title: 'マイセット（プリセット4枠）＆ 裏ステージ8解放！',
    description:
      '【3周目報酬】①「持ち込み」タブで装備・仲間・隊列・加護を一発保存＆切替できる「マイセット（4枠）」が解放 ②裏ステージ8「時空の歪み回廊」が出現しました！',
    spriteId: 'item_aegis_armor',
    accent: 'emerald',
    targetTab: 'PREP',
    actionLabel: 'マイセットを使う',
    isUnlocked: (save) => save.loopCount >= 3,
  },
  {
    id: 'unlock_loop4',
    badge: '4周目到達',
    title: '裏ステージ9「終焉の星界玉座」が解放！',
    description:
      '第4周目到達により、終焉神オメガドラゴンが待ち受ける最後の裏ステージ9がステージ選択に出現しました！',
    spriteId: 'boss_omega_dragon',
    accent: 'purple',
    targetTab: 'PREP',
    actionLabel: 'ステージを見る',
    isUnlocked: (save) => save.loopCount >= 4,
  },
  {
    id: 'unlock_boss_rush',
    badge: '全実績制覇報酬',
    title: '【極】終焉の強化ボスラッシュが解放！',
    description:
      '全12実績の制覇おめでとうございます！強化された歴代ボス9体と連戦する極限ステージが解放され、踏破時に2%の超低確率で最強装備4種（ジェネシス・イージス・覇王冠・アンブロシア）のいずれか1つがドロップします（確定ドロップなし）！',
    spriteId: 'item_god_blade',
    accent: 'rose',
    targetTab: 'PREP',
    actionLabel: 'ボスラッシュを確認',
    isUnlocked: (save) => areAllAchievementsUnlocked(save),
  },
  {
    id: 'unlock_endless',
    badge: '5周目クリア報酬',
    title: '【無限】終わらぬ深淵回廊（第6周目基準チャレンジ）解放！',
    description:
      '第5周目制覇おめでとうございます！周回倍率や仮潜入に左右されない「第6周目基準（21.67倍）」の固定難易度から始まり、階層が進むほど敵が強大化する最高難易度チャレンジ迷宮が解放されました！',
    spriteId: 'item_infinity_crown',
    accent: 'purple',
    targetTab: 'PREP',
    actionLabel: '無限回廊を確認',
    isUnlocked: (save) => isEndlessUnlocked(save),
  },
  {
    id: 'unlock_endless_100',
    badge: '真のエンドコンテンツ解放',
    title: '無限回廊 100F突破！裏実績・神域鍛造・超越スキルツリー（32x/64x）解放！',
    description:
      '無限回廊100階到達おめでとうございます！①永続強化の「裏実績（全6種）」②鍛冶屋限定の究極装備4種 ③大量SPを消費して圧倒的な力と「32倍速(10SP) / 64倍速(20SP)」を得る新スキルツリー「深淵超越の道」が解禁されました！',
    spriteId: 'item_void_lance',
    accent: 'purple',
    targetTab: 'SKILLS',
    actionLabel: '超越スキルを見る',
    isUnlocked: (save) => isTrueEndgameUnlocked(save),
  },
];

export function getPendingFeatureAnnouncements(save: SaveState): FeatureAnnouncementDef[] {
  const seen = new Set(save.seenAnnouncements ?? []);
  return FEATURE_ANNOUNCEMENTS.filter((a) => !seen.has(a.id) && a.isUnlocked(save));
}



