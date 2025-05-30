import { v4 as uuidv4 } from 'uuid';
import { CardType } from './types';
// --- Shared Game Constants & Data ---
export const PLACEHOLDER_AVATARS = [
    'https://picsum.photos/seed/avatar1/100/100', 'https://picsum.photos/seed/avatar2/100/100',
    'https://picsum.photos/seed/avatar3/100/100', 'https://picsum.photos/seed/avatar4/100/100',
    'https://picsum.photos/seed/avatar5/100/100', 'https://picsum.photos/seed/avatar6/100/100',
];
export const INITIAL_PLAYER_CARDS_HAND_SIZE = 4; // 2 door, 2 treasure
export const MAX_CARDS_IN_HAND = 5;
export const MIN_PLAYERS_TO_START = 2;
export const MOCK_DOOR_DECK_DATA = [
    { name: 'Горшечное растение', type: CardType.Monster, description: 'На удивление агрессивное комнатное растение.', level: 1, treasures: 1, badStuff: 'Потеряй уровень. Чувствуешь себя увядшим.', imageUrl: 'https://picsum.photos/seed/plant_monster/150/200' },
    { name: 'Проклятие! Неуклюжесть', type: CardType.Curse, description: 'Ты спотыкаешься о собственные ноги!', badStuff: 'Сбрось один экипированный предмет. Если его нет — потеряй уровень.', imageUrl: 'https://picsum.photos/seed/curse_clumsy/150/200' },
    { name: 'Мистический эльф', type: CardType.Race, description: 'Ты — эльф. Получаешь +1 при побеге. Помогая другим эльфам — даёшь им +1 в бою.', imageUrl: 'https://picsum.photos/seed/elf_race_card/150/200' },
    { name: 'Храбрый рыцарь', type: CardType.Class, description: 'Ты — рыцарь. Можешь сбросить до 3 карт в бою, получая по +1 за каждую. Побеждает при равенстве.', imageUrl: 'https://picsum.photos/seed/knight_class_card/150/200' },
    { name: 'Гигантский паук', type: CardType.Monster, description: 'Совсем не маленький и не милый.', level: 4, treasures: 2, badStuff: 'Увяз в паутине! Потеряй 2 уровня или сбрось 2 предмета.', imageUrl: 'https://picsum.photos/seed/giant_spider/150/200' },
    { name: 'Древний дракон', type: CardType.Monster, description: 'Великолепный и ужасающий зверь из легенд.', level: 20, treasures: 5, badStuff: 'Сожжён дотла! Ты погиб. Потеряй всё.', imageUrl: 'https://picsum.photos/seed/ancient_dragon/150/200' },
    { name: 'Ворчливый тролль', type: CardType.Monster, description: 'Охраняет мост. Ненавидит загадки. И тебя.', level: 10, treasures: 3, badStuff: 'Огреб! Потеряй 2 уровня и лучший предмет.', imageUrl: 'https://picsum.photos/seed/grumpy_troll/150/200' },
    { name: 'Мудрый волшебник', type: CardType.Class, description: 'Ты — волшебник. Можешь сбросить руку, чтобы автоматически сбежать. Бонус против магических монстров.', imageUrl: 'https://picsum.photos/seed/wizard_class/150/200' },
    { name: 'Гоблин-воришка', type: CardType.Monster, description: 'Мелкий, зелёный и очень колючий.', level: 2, treasures: 1, badStuff: 'Крадёт самый слабый предмет. Если ничего нет — потеряй уровень.', imageUrl: 'https://picsum.photos/seed/goblin_sneak/150/200' },
    { name: 'Проклятие плохого прицела', type: CardType.Curse, description: 'Ты вдруг не попадаешь даже в сарай.', badStuff: '—2 в следующем бою.', imageUrl: 'https://picsum.photos/seed/curse_bad_aim/150/200' },
    { name: 'Дварф-воин', type: CardType.Race, description: 'Ты — дварф. Можешь носить сколько угодно Больших предметов. +1 за каждый в бою.', imageUrl: 'https://picsum.photos/seed/dwarf_race/150/200' },
    { name: 'Теневой преследователь', type: CardType.Monster, description: 'Существо тьмы, трудно попасть.', level: 8, treasures: 2, badStuff: 'Истощён. Потеряй 2 уровня.', imageUrl: 'https://picsum.photos/seed/shadow_stalker/150/200' },
    { name: 'Тайный проход', type: CardType.SpecialDoor, description: 'Ты находишь тайный ход! Немедленно возьми 2 карты Сокровищ. Сбрось эту карту.', imageUrl: 'https://picsum.photos/seed/secret_passage/150/200' },
    { name: 'Бродячий менестрель', type: CardType.SpecialDoor, description: 'Дружелюбный менестрель помогает тебе. +3 в следующем бою. Потом сбрось.', imageUrl: 'https://picsum.photos/seed/minstrel_help/150/200' },
    { name: 'Орк-громила', type: CardType.Monster, description: 'Большой, тупой и любит крушить.', level: 6, treasures: 2, badStuff: 'Раздавлен! Сбрось 2 карты с руки.', imageUrl: 'https://picsum.photos/seed/orc_brute/150/200' },
    { name: 'Визжащая банши', type: CardType.Monster, description: 'Её вой леденит душу.', level: 7, treasures: 2, badStuff: 'Потеряй уровень от страха. Если у тебя 1 уровень — потеряй предмет.', imageUrl: 'https://picsum.photos/seed/banshee_monster/150/200' },
    { name: 'Проклятие вечного раздражения', type: CardType.Curse, description: 'Всё начинает бесить.', badStuff: 'Ты не можешь помогать в бою, пока проклятие не снято или ты не получишь уровень.', imageUrl: 'https://picsum.photos/seed/curse_annoy/150/200' },
    { name: 'Гном-механик', type: CardType.Race, description: 'Ты — гном. Можешь нейтрализовать одну ловушку, сбросив карту. +1 к побегу от механических монстров.', imageUrl: 'https://picsum.photos/seed/gnome_race/150/200' },
    { name: 'Клирик мелких чудес', type: CardType.Class, description: 'Ты — клирик. Один раз за игру можешь сбросить 3 карты, чтобы отменить проклятие.', imageUrl: 'https://picsum.photos/seed/cleric_class/150/200' },
    { name: 'Желатиновый октаэдр', type: CardType.Monster, description: 'На удивление чёткий для слизня.', level: 5, treasures: 2, badStuff: 'Поглощён! Один случайный предмет растворяется. Если нет — потеряй уровень.', imageUrl: 'https://picsum.photos/seed/gelatinous_octa/150/200' },
    { name: 'Дружелюбный имп', type: CardType.SpecialDoor, description: 'Маленький имп предлагает сделку...', badStuff: 'Выбор: получи Сокровище или потеряй уровень. Сбрось карту.', imageUrl: 'https://picsum.photos/seed/friendly_imp/150/200' },
    { name: 'Кобольд-шахтёр', type: CardType.Monster, description: 'С киркой и злобой.', level: 3, treasures: 1, badStuff: 'Крадёт 100 золотых монет в предметах. Если меньше — теряешь всё.', imageUrl: 'https://picsum.photos/seed/kobold_miner/150/200' },
    { name: 'Проклятие! Скользкие ладони', type: CardType.Curse, description: 'Всё выскальзывает из рук!', badStuff: 'Оружие падает. Если не было — —2 в следующем бою.', imageUrl: 'https://picsum.photos/seed/curse_greased/150/200' },
    { name: 'Божественное вмешательство', type: CardType.SpecialDoor, description: 'Боги улыбаются тебе! Выбери: снять проклятие или победить монстра до 5 уровня. Сбрось карту.', imageUrl: 'https://picsum.photos/seed/divine_intervention/150/200' },
    { name: 'Мистическая черепаха', type: CardType.Monster, description: 'Медленная, но прочная.', level: 9, treasures: 3, badStuff: 'Ты впадаешь в раздумья и теряешь следующий ход.', imageUrl: 'https://picsum.photos/seed/mystic_turtle/150/200' },
    { name: 'Проклятие икоты', type: CardType.Curse, description: 'Ик! Ты не можешь... ик!.. остановиться!', badStuff: '—1 ко всем боям и побегам до снятия или +2 уровня.', imageUrl: 'https://picsum.photos/seed/curse_hiccups/150/200' },
    { name: 'Бард отвлечения', type: CardType.Class, description: 'Ты — бард. Один раз за бой можешь попытаться отвлечь монстра (50% шанс, —2 к уровню монстра).', imageUrl: 'https://picsum.photos/seed/bard_class/150/200' },
    { name: 'Монетка жулика', type: CardType.SpecialDoor, description: 'Подозрительно тяжёлая монета. Получи 200 золотых. Сбрось.', value: 200, imageUrl: 'https://picsum.photos/seed/cheating_coin/150/200' },
];
export const MOCK_TREASURE_DECK_DATA = [
    { name: 'Поющий меч', type: CardType.Item, description: 'Напевает бодрую боевую мелодию. +2 бонус. Стоит 400 золотых.', bonus: 2, value: 400, imageUrl: 'https://picsum.photos/seed/singing_sword/150/200' },
    { name: 'Сапоги скорости', type: CardType.Item, description: 'Ты не быстрее, но тебе так кажется. +2 бонус. Обувь. 400 золотых.', bonus: 2, value: 400, imageUrl: 'https://picsum.photos/seed/speed_boots/150/200' },
    { name: 'Шлем блеска', type: CardType.Item, description: 'Слепит врагов (иногда). +1 бонус. Головной убор. 200 золотых.', bonus: 1, value: 200, imageUrl: 'https://picsum.photos/seed/brilliant_helm/150/200' },
    { name: 'Зачарованные доспехи', type: CardType.Item, description: 'Светятся и пахнут лавандой. +3 бонус. Броня. 600 золотых.', bonus: 3, value: 600, imageUrl: 'https://picsum.photos/seed/enchanted_armor/150/200' },
    { name: 'Зелье храбрости', type: CardType.OneShot, description: 'Жидкая отвага! +2 к любой стороне в бою. Одноразовое. 100 золотых.', bonus: 2, value: 100, imageUrl: 'https://picsum.photos/seed/bravery_potion/150/200' },
    { name: 'Получи уровень', type: CardType.OneShot, description: 'Ура! Ты поднимаешься на 1 уровень. Можно сыграть в любой момент.', value: 0, imageUrl: 'https://picsum.photos/seed/gain_level_card/150/200' },
    { name: 'Амулет защиты', type: CardType.Item, description: 'Защищает от мелких проклятий. +1 бонус. 250 золотых.', bonus: 1, value: 250, imageUrl: 'https://picsum.photos/seed/amulet_protection/150/200' },
    { name: 'Заточенный кинжал', type: CardType.Item, description: 'Остренькая палочка. +1 бонус. Одна рука. 100 золотых.', bonus: 1, value: 100, imageUrl: 'https://picsum.photos/seed/sharp_dagger/150/200' },
    { name: 'Зелье исцеления', type: CardType.OneShot, description: 'Восстанавливает 1 уровень, потерянный в бою, или даёт сбежать. Одноразовое. 150 золотых.', value: 150, imageUrl: 'https://picsum.photos/seed/healing_potion_again/150/200' },
    { name: 'Полированный щит', type: CardType.Item, description: 'Отражает оскорбления и мелкие заклинания. +2 бонус. Одна рука. 350 золотых.', bonus: 2, value: 350, imageUrl: 'https://picsum.photos/seed/polished_shield_again/150/200' },
    { name: 'Плащ малой невидимости', type: CardType.Item, description: 'Становишься чуть менее заметным. +1 к побегу. +1 бонус. Броня. 300 золотых.', bonus: 1, value: 300, imageUrl: 'https://picsum.photos/seed/cloak_invis/150/200' },
    { name: 'Остроконечная шляпа размышлений', type: CardType.Item, description: 'Ты выглядишь умно. После победы над монстром можешь вытянуть доп. карту (50% шанс). Головной убор. 200 золотых.', bonus: 0, value: 200, imageUrl: 'https://picsum.photos/seed/pointy_hat/150/200' },
    { name: 'Зелье сверх-колючести', type: CardType.OneShot, description: '+4 бонус одному игроку в бою. Одноразовое. 250 золотых.', bonus: 4, value: 250, imageUrl: 'https://picsum.photos/seed/potion_stabby/150/200' },
    { name: 'Щит чуть лучшей защиты', type: CardType.Item, description: 'Чуть лучше защищает. +1 бонус. Одна рука. 150 золотых.', bonus: 1, value: 150, imageUrl: 'https://picsum.photos/seed/shield_warding/150/200' },
    { name: 'Свиток удобного забвения', type: CardType.OneShot, description: 'Заставляет игрока (включая тебя) забыть одно проклятие. Одноразовое. 300 золотых.', value: 300, imageUrl: 'https://picsum.photos/seed/scroll_forget/150/200' },
    { name: 'Сапоги пинания (дверей)', type: CardType.Item, description: 'Созданы для пинков! +1 бонус, если монстр из двери. Обувь. 250 золотых.', bonus: 1, value: 250, imageUrl: 'https://picsum.photos/seed/boots_kicking/150/200' },
    { name: 'Кольцо лёгкого раздражения', type: CardType.Item, description: 'Тыкаешь врага. —1 к бою для него. Тебе бонуса не даёт. 100 золотых.', bonus: 0, value: 100, imageUrl: 'https://picsum.photos/seed/ring_annoy/150/200' },
    { name: 'Фляжка сомнительной жидкости', type: CardType.OneShot, description: 'Выпить? +2 бонус или потеря уровня (50/50). Одноразовое. 50 золотых.', value: 50, imageUrl: 'https://picsum.photos/seed/flask_questionable/150/200' },
    { name: 'Реально большой камень', type: CardType.Item, description: 'Это просто большой камень. +3 бонус. Две руки. Большой. 0 золотых.', bonus: 3, value: 0, imageUrl: 'https://picsum.photos/seed/big_rock/150/200' },
    { name: 'Карта в никуда', type: CardType.OneShot, description: 'Смотри верхние 3 карты любой колоды, положи обратно в любом порядке. 100 золотых.', value: 100, imageUrl: 'https://picsum.photos/seed/map_nowhere/150/200' },
    { name: 'Кольцо желаний (с браком)', type: CardType.Item, description: 'Один раз за игру перебрось кубик. Если выпадет 1 — ломается. Без бонуса. 500 золотых.', value: 500, imageUrl: 'https://picsum.photos/seed/wishing_ring/150/200' },
];
export const createDeck = (cardData) => {
    return cardData.map(data => ({ ...data, id: uuidv4() }));
};
// Initialize decks here
export let MOCK_DOOR_DECK = createDeck(MOCK_DOOR_DECK_DATA);
export let MOCK_TREASURE_DECK = createDeck(MOCK_TREASURE_DECK_DATA);
export const calculateGear = (equippedItems) => {
    return equippedItems.reduce((totalBonus, item) => totalBonus + (item.bonus || 0), 0);
};
