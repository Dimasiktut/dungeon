import { Card, CardType, Player, TurnPhase } from './types';

// Строки в этом файле были локализованы на русский язык.
// Strings in this file have been localized to Russian.

export const DEFAULT_MAX_PLAYERS = 4;
export const MIN_PLAYERS = 2;
export const MAX_PLAYERS_ALLOWED = 6;
export const DEFAULT_STARTING_LEVEL = 1;
export const MAX_CARDS_IN_HAND = 5;

export const PLACEHOLDER_AVATARS: string[] = [
  'https://picsum.photos/seed/avatar1/100/100',
  'https://picsum.photos/seed/avatar2/100/100',
  'https://picsum.photos/seed/avatar3/100/100',
  'https://picsum.photos/seed/avatar4/100/100',
  'https://picsum.photos/seed/avatar5/100/100',
  'https://picsum.photos/seed/avatar6/100/100',
];

export const INITIAL_PLAYER_CARDS_HAND_SIZE = 4;

export const MOCK_DOOR_DECK: Card[] = [
  { id: 'd1', name: 'Горшечное Растение', type: CardType.Monster, description: 'Удивительно агрессивное комнатное растение.', level: 1, treasures: 1, badStuff: 'Потеряй уровень. Ты чувствуешь себя немного увядшим.', imageUrl: 'https://picsum.photos/seed/plant_monster/150/200' },
  { id: 'd2', name: 'Проклятие! Неуклюжесть', type: CardType.Curse, description: 'Ты спотыкаешься о собственные ноги!', badStuff: 'Сбрось одну надетую Шмотку. Если нет Шмоток, потеряй уровень.', imageUrl: 'https://picsum.photos/seed/curse_clumsy/150/200' },
  { id: 'd3', name: 'Мистический Эльф', type: CardType.Race, description: 'Ты Эльф. Эльфы получают +1 при Смывке. Могут помогать другим Эльфам в бою за +1.', imageUrl: 'https://picsum.photos/seed/elf_race_card/150/200' },
  { id: 'd4', name: 'Храбрый Рыцарь', type: CardType.Class, description: 'Ты Рыцарь. Можешь сбросить до 3 карт в бою для +1 бонуса за каждую. Побеждаешь при ничьей в бою.', imageUrl: 'https://picsum.photos/seed/knight_class_card/150/200' },
  { id: 'd5', name: 'Гигантский Паук', type: CardType.Monster, description: 'Малюсенький? Только не этот!', level: 4, treasures: 2, badStuff: 'Пойман в паутину! Потеряй 2 уровня или сбрось 2 шмотки.', imageUrl: 'https://picsum.photos/seed/giant_spider/150/200' },
  { id: 'd6', name: 'Проклятие! Сезон Налогов', type: CardType.Curse, description: 'Королевский Сборщик Налогов требует своё!', badStuff: 'Сбрось шмотки общей стоимостью не менее 500 Золотых, или потеряй 2 уровня.', imageUrl: 'https://picsum.photos/seed/curse_tax/150/200' },
  { id: 'd7', name: 'Скрытая Ловушка', type: CardType.SpecialDoor, description: 'Ты активировал скрытую ловушку! Потеряй 1 уровень. Сбрось эту карту.', badStuff: 'Ай! Больно. Потеряй 1 уровень.', imageUrl: 'https://picsum.photos/seed/trap_door/150/200' },
  { id: 'd8', name: 'Древний Дракон', type: CardType.Monster, description: 'Великолепный и ужасающий зверь из легенд.', level: 20, treasures: 5, badStuff: 'Испепелён! Ты мёртв. Потеряй все свои шмотки.', imageUrl: 'https://picsum.photos/seed/ancient_dragon/150/200' },
  { id: 'd9', name: 'Ворчливый Тролль', type: CardType.Monster, description: 'Охраняет мост. Ненавидит загадки. И тебя.', level: 10, treasures: 3, badStuff: 'Оглушён дубиной! Потеряй 2 уровня и свою лучшую шмотку.', imageUrl: 'https://picsum.photos/seed/grumpy_troll/150/200' },
  { id: 'd10',name: 'Мудрый Волшебник', type: CardType.Class, description: 'Ты Волшебник. Можешь сбросить руку, чтобы автоматически смыться. Бонус против магических монстров.', imageUrl: 'https://picsum.photos/seed/wizard_class/150/200'},
  { id: 'd11', name: 'Гоблин-Проныра', type: CardType.Monster, description: 'Маленький, зелёный и раздражающе колючий.', level: 2, treasures: 1, badStuff: 'Крадет твою самую маленькую шмотку. Если нет шмоток, потеряй уровень.', imageUrl: 'https://picsum.photos/seed/goblin_sneak/150/200' },
  { id: 'd12', name: 'Проклятие Плохого Прицела', type: CardType.Curse, description: 'Внезапно ты не можешь попасть даже в амбар.', badStuff: 'Получи -2 в следующем бою.', imageUrl: 'https://picsum.photos/seed/curse_bad_aim/150/200' },
  { id: 'd13', name: 'Дварф-Воитель', type: CardType.Race, description: 'Ты Дварф. Можешь нести любое количество Больших шмоток. +1 бонус за каждую Большую шмотку в бою.', imageUrl: 'https://picsum.photos/seed/dwarf_race/150/200' },
  { id: 'd14', name: 'Теневой Охотник', type: CardType.Monster, description: 'Создание тьмы, трудно попасть.', level: 8, treasures: 2, badStuff: 'Жизнь выпита. Потеряй 2 уровня.', imageUrl: 'https://picsum.photos/seed/shadow_stalker/150/200' },
  { id: 'd15', name: 'Тайный Проход', type: CardType.SpecialDoor, description: 'Ты нашёл тайный проход! Немедленно возьми 2 карты Сокровищ. Сбрось эту карту.', imageUrl: 'https://picsum.photos/seed/secret_passage/150/200' },
  { id: 'd16', name: 'Бродячий Менестрель', type: CardType.SpecialDoor, description: 'Дружелюбный менестрель предлагает помощь. Получи +2 в следующем бою. Сбрось после использования.', imageUrl: 'https://picsum.photos/seed/minstrel_help/150/200' },
  { id: 'd17', name: 'Орк-Громила', type: CardType.Monster, description: 'Большой, глупый и любит крушить.', level: 6, treasures: 2, badStuff: 'Разбит! Сбрось 2 карты с руки.', imageUrl: 'https://picsum.photos/seed/orc_brute/150/200' },
  { id: 'd18', name: 'Кричащая Банши', type: CardType.Monster, description: 'Её вопль пробирает до костей.', level: 7, treasures: 2, badStuff: 'Потеряй уровень от чистого ужаса. Если уровень 1, потеряй шмотку.', imageUrl: 'https://picsum.photos/seed/banshee_monster/150/200' },
  { id: 'd19', name: 'Проклятие Вечного Раздражения', type: CardType.Curse, description: 'Всё кажется... раздражающим.', badStuff: 'Ты не можешь помогать другим в бою, пока это проклятие не будет снято или ты не получишь уровень.', imageUrl: 'https://picsum.photos/seed/curse_annoy/150/200' },
  { id: 'd20', name: 'Гном-Умелец', type: CardType.Race, description: 'Ты Гном. Можешь обезвредить одну карту ловушки, нацеленную на тебя, сбросив карту. +1 к Смывке от механических монстров.', imageUrl: 'https://picsum.photos/seed/gnome_race/150/200' },
  { id: 'd21', name: 'Клирик Малых Чудес', type: CardType.Class, description: 'Ты Клирик. Раз за игру можешь сбросить 3 карты, чтобы отменить Проклятие, нацеленное на тебя.', imageUrl: 'https://picsum.photos/seed/cleric_class/150/200' },
  { id: 'd22', name: 'Студенистый Октаэдр', type: CardType.Monster, description: 'Он удивительно чётко очерчен для кляксы.', level: 5, treasures: 2, badStuff: 'Поглощён! Одна случайная надетая шмотка растворена. Если нет шмоток, потеряй уровень.', imageUrl: 'https://picsum.photos/seed/gelatinous_octa/150/200' },
  { id: 'd23', name: 'Дружелюбный Бес', type: CardType.SpecialDoor, description: 'Крошечный бес предлагает тебе сделку...', badStuff: 'Выбор: Получи Сокровище или потеряй уровень. Твой выбор. Сбрось эту карту.', imageUrl: 'https://picsum.photos/seed/friendly_imp/150/200' },
  { id: 'd24', name: 'Кобольд-Шахтёр', type: CardType.Monster, description: 'Вооружён киркой и скверным характером.', level: 3, treasures: 1, badStuff: 'Крадет шмотки на 100 Золотых. Если у тебя меньше, теряешь всё, что есть.', imageUrl: 'https://picsum.photos/seed/kobold_miner/150/200' },
  { id: 'd25', name: 'Проклятие! Скользкие Руки', type: CardType.Curse, description: 'Всё кажется скользким!', badStuff: 'Твоё надетое оружие (если есть) падает на пол. -2 в следующем бою, если оружия не было.', imageUrl: 'https://picsum.photos/seed/curse_greased/150/200' },
  { id: 'd26', name: 'Божественное Вмешательство', type: CardType.SpecialDoor, description: 'Боги улыбаются тебе! Выбери одно: Отмени проклятие, действующее на тебя, ИЛИ автоматически победи монстра Уровня 5 или меньше, находящегося в игре. Сбрось эту карту.', imageUrl: 'https://picsum.photos/seed/divine_intervention/150/200' },
  ...Array.from({ length: 5 }, (_, i) => ({
    id: `d_generic${i}`,
    name: `Обычный Монстр ${i+1}`,
    type: CardType.Monster,
    description: `Обычный монстр. Уровень ${(i % 5) + 1}. Он чудовищно обычен.`,
    level: (i % 5) + 1,
    treasures: 1,
    badStuff: 'Потеряй уровень. Как банально.',
    imageUrl: `https://picsum.photos/seed/generic_door${i}/150/200`,
  }))
];

export const MOCK_TREASURE_DECK: Card[] = [
  { id: 't1', name: 'Поющий Меч', type: CardType.Item, description: 'Напевает бодрую боевую мелодию. +2 Бонус. Стоит 400 Золотых.', bonus: 2, value: 400, imageUrl: 'https://picsum.photos/seed/singing_sword/150/200' },
  { id: 't2', name: 'Сапоги Скорости', type: CardType.Item, description: 'Заставляют бежать быстрее... или хотя бы так кажется. +2 Бонус. Обувка. Стоят 400 Золотых.', bonus: 2, value: 400, imageUrl: 'https://picsum.photos/seed/speed_boots/150/200' },
  { id: 't3', name: 'Шлем Великолепия', type: CardType.Item, description: 'Такой блестящий, что ослепляет врагов (иногда). +1 Бонус. Головняк. Стоит 200 Золотых.', bonus: 1, value: 200, imageUrl: 'https://picsum.photos/seed/brilliant_helm/150/200' },
  { id: 't4', name: 'Зачарованная Броня', type: CardType.Item, description: 'Слабо светится и пахнет лавандой. +3 Бонус. Броник. Стоит 600 Золотых.', bonus: 3, value: 600, imageUrl: 'https://picsum.photos/seed/enchanted_armor/150/200' },
  { id: 't5', name: 'Зелье Храбрости', type: CardType.OneShot, description: 'Жидкая храбрость! +2 любой стороне в бою. Одноразовое. Стоит 100 Золотых.', bonus: 2, value: 100, imageUrl: 'https://picsum.photos/seed/bravery_potion/150/200' },
  { id: 't6', name: 'Внушительный Свиток', type: CardType.Item, description: 'Выглядит очень важным. Не даёт бонусов, но позволяет смотреть на других свысока. Стоит 0 Золотых.', value: 0, imageUrl: 'https://picsum.photos/seed/impressive_scroll/150/200' },
  { id: 't7', name: 'Получи Уровень', type: CardType.OneShot, description: 'Ура! Ты получаешь один уровень. Играй в любое время.', value: 0, imageUrl: 'https://picsum.photos/seed/gain_level_card/150/200' },
  { id: 't8', name: 'Маленькая Бездонная Сумка', type: CardType.Item, description: 'Позволяет нести одну дополнительную Большую шмотку. Без бонуса. Стоит 300 Золотых.', value: 300, imageUrl: 'https://picsum.photos/seed/bag_of_holding/150/200' },
  { id: 't9', name: 'Амулет Защиты', type: CardType.Item, description: 'Отгоняет мелкие проклятия. +1 Бонус. Стоит 250 Золотых.', bonus: 1, value: 250, imageUrl: 'https://picsum.photos/seed/amulet_protection/150/200' },
  { id: 't10', name: 'Лечебное Зелье', type: CardType.OneShot, description: 'Восстанавливает 1 Уровень, потерянный в текущем бою, или используй для автоматической смывки. Одноразовое. Стоит 150 ЗМ.', value: 150, imageUrl: 'https://picsum.photos/seed/healing_potion/150/200' },
  { id: 't11', name: 'Проворные Сапоги', type: CardType.Item, description: '+1 к Смывке. Обувка. Стоят 300 Золотых.', bonus: 0, value: 300, imageUrl: 'https://picsum.photos/seed/swift_boots_item/150/200' }, // Run Away bonus not directly combat
  { id: 't12', name: 'Заточенный Кинжал', type: CardType.Item, description: 'Острая палка. +1 Бонус. 1 Рука. Стоит 100 Золотых.', bonus: 1, value: 100, imageUrl: 'https://picsum.photos/seed/sharp_dagger/150/200' },
  { id: 't13', name: 'Зелье Силы', type: CardType.OneShot, description: 'Звереешь! +3 твоей стороне в бою. Одноразовое. Стоит 200 ЗМ.', bonus: 3, value: 200, imageUrl: 'https://picsum.photos/seed/strength_potion/150/200' },
  { id: 't14', name: 'Свиток Замешательства', type: CardType.OneShot, description: 'Целевой монстр теряет 2 уровня на этот бой. Одноразовое. Стоит 250 ЗМ.', value: 250, imageUrl: 'https://picsum.photos/seed/scroll_confusion/150/200' },
  { id: 't15', name: 'Полированный Щит', type: CardType.Item, description: 'Отражает оскорбления и мелкие заклинания. +2 Бонус. 1 Рука. Стоит 350 ЗМ.', bonus: 2, value: 350, imageUrl: 'https://picsum.photos/seed/polished_shield/150/200'},
  { id: 't16', name: 'Плащ Малой Невидимости', type: CardType.Item, description: 'Делает тебя немного сложнее заметить. +1 к Смывке. +1 Бонус. Броник. Стоит 300 ЗМ.', bonus: 1, value: 300, imageUrl: 'https://picsum.photos/seed/cloak_invis/150/200' },
  { id: 't17', name: 'Остроконечная Шляпа Раздумий', type: CardType.Item, description: 'Заставляет выглядеть умным. Можешь взять дополнительную карту после победы над монстром (шанс 50%, решает ГМ или бросок кубика). Головняк. Стоит 200 ЗМ.', bonus: 0, value: 200, imageUrl: 'https://picsum.photos/seed/pointy_hat/150/200' },
  { id: 't18', name: 'Зелье Особой Колючести', type: CardType.OneShot, description: '+4 Бонус одному игроку в бою. Одноразовое. Стоит 250 ЗМ.', bonus: 4, value: 250, imageUrl: 'https://picsum.photos/seed/potion_stabby/150/200' },
  { id: 't19', name: 'Щит Чуть Лучшей Защиты', type: CardType.Item, description: 'Он защищает... чуть лучше. +1 Бонус. 1 Рука. Стоит 150 ЗМ.', bonus: 1, value: 150, imageUrl: 'https://picsum.photos/seed/shield_warding/150/200' },
  { id: 't20', name: 'Свиток Удобной Забывчивости', type: CardType.OneShot, description: 'Заставь одного игрока (включая себя) сбросить действующее на него Проклятие. Одноразовое. Стоит 300 ЗМ.', value: 300, imageUrl: 'https://picsum.photos/seed/scroll_forget/150/200' },
  { id: 't21', name: 'Сапоги для Вышибания (Дверей)', type: CardType.Item, description: 'Эти сапоги созданы для пинков! +1 Бонус специально при бое с монстром, появившимся при вышибании двери. Обувка. Стоят 250 ЗМ.', bonus: 1, value: 250, imageUrl: 'https://picsum.photos/seed/boots_kicking/150/200' },
  { id: 't22', name: 'Кольцо Мелкого Раздражения', type: CardType.Item, description: 'Позволяет легонько ткнуть оппонента, отвлекая его. -1 одному выбранному оппоненту в следующем бою, в котором он участвует. Без боевого бонуса для тебя. Стоит 100 ЗМ.', bonus: 0, value: 100, imageUrl: 'https://picsum.photos/seed/ring_annoy/150/200' },
  ...Array.from({ length: 5 }, (_, i) => ({
    id: `t_generic${i}`,
    name: `Обычное Сокровище ${i+1}`,
    type: CardType.Item,
    description: `Блестящая безделушка! Стоит ${(i + 1) * 50} Золотых. Бонус ${i % 3}. Она банально ценна.`,
    value: (i+1) * 50,
    bonus: i % 3,
    imageUrl: `https://picsum.photos/seed/generic_treasure${i}/150/200`,
  }))
];

export const MOCK_PLAYERS_INITIAL: Player[] = [
    { id: 'p1', name: 'Героический Халфлинг', avatarUrl: PLACEHOLDER_AVATARS[0], level: 1, gear: 0, equippedItems: [], cardsInHand: [], isHost: true },
    { id: 'p2', name: 'Эльфийский Лучник', avatarUrl: PLACEHOLDER_AVATARS[1], level: 1, gear: 0, equippedItems: [], cardsInHand: [] },
];

export const calculateGear = (equippedItems: Card[]): number => {
  return equippedItems.reduce((totalBonus, item) => totalBonus + (item.bonus || 0), 0);
};
