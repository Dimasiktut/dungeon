
import { Card, CardType, Player, TurnPhase } from './types';

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
  { id: 'd1', name: 'Potted Plant', type: CardType.Monster, description: 'A surprisingly aggressive houseplant.', level: 1, treasures: 1, badStuff: 'Lose a level. You feel a bit wilted.', imageUrl: 'https://picsum.photos/seed/plant_monster/150/200' },
  { id: 'd2', name: 'Curse! Clumsiness', type: CardType.Curse, description: 'You trip over your own feet!', badStuff: 'Discard one equipped Item. If none, lose a level.', imageUrl: 'https://picsum.photos/seed/curse_clumsy/150/200' },
  { id: 'd3', name: 'Mystic Elf', type: CardType.Race, description: 'You are an Elf. Elves gain +1 when fleeing. May assist other Elves in combat for +1.', imageUrl: 'https://picsum.photos/seed/elf_race_card/150/200' },
  { id: 'd4', name: 'Brave Knight', type: CardType.Class, description: 'You are a Knight. May discard up to 3 cards in combat for +1 bonus each. Wins ties in combat.', imageUrl: 'https://picsum.photos/seed/knight_class_card/150/200' },
  { id: 'd5', name: 'Giant Spider', type: CardType.Monster, description: 'Itsy bitsy? Not this one!', level: 4, treasures: 2, badStuff: 'Caught in a web! Lose 2 levels or discard 2 items.', imageUrl: 'https://picsum.photos/seed/giant_spider/150/200' },
  { id: 'd6', name: 'Curse! Tax Season', type: CardType.Curse, description: 'The Royal Tax Collector demands his due!', badStuff: 'Discard items worth at least 500 Gold Pieces, or lose 2 levels.', imageUrl: 'https://picsum.photos/seed/curse_tax/150/200' },
  { id: 'd7', name: 'Hidden Trap', type: CardType.SpecialDoor, description: 'You triggered a hidden trap! Lose 1 level. Discard this card.', badStuff: 'Ouch! That smarts. Lose 1 level.', imageUrl: 'https://picsum.photos/seed/trap_door/150/200' },
  { id: 'd8', name: 'Ancient Dragon', type: CardType.Monster, description: 'A magnificent and terrifying beast of legend.', level: 20, treasures: 5, badStuff: 'Incinerated! You are dead. Lose all your stuff.', imageUrl: 'https://picsum.photos/seed/ancient_dragon/150/200' },
  { id: 'd9', name: 'Grumpy Troll', type: CardType.Monster, description: 'Guards a bridge. Hates riddles. And you.', level: 10, treasures: 3, badStuff: 'Clubbed! Lose 2 levels and your best item.', imageUrl: 'https://picsum.photos/seed/grumpy_troll/150/200' },
  { id: 'd10',name: 'Wise Wizard', type: CardType.Class, description: 'You are a Wizard. May discard hand to flee automatically. Bonus against magical monsters.', imageUrl: 'https://picsum.photos/seed/wizard_class/150/200'},
  { id: 'd11', name: 'Goblin Sneak', type: CardType.Monster, description: 'Small, green, and annoyingly stabby.', level: 2, treasures: 1, badStuff: 'Steals your smallest item. If none, lose a level.', imageUrl: 'https://picsum.photos/seed/goblin_sneak/150/200' },
  { id: 'd12', name: 'Curse of Bad Aim', type: CardType.Curse, description: 'Suddenly, you can\'t hit the broad side of a barn.', badStuff: 'Suffer -2 in your next combat.', imageUrl: 'https://picsum.photos/seed/curse_bad_aim/150/200' },
  { id: 'd13', name: 'Dwarven Fighter', type: CardType.Race, description: 'You are a Dwarf. Can carry any number of Big items. +1 bonus for each Big item in combat.', imageUrl: 'https://picsum.photos/seed/dwarf_race/150/200' },
  { id: 'd14', name: 'Shadow Stalker', type: CardType.Monster, description: 'A creature of darkness, hard to hit.', level: 8, treasures: 2, badStuff: 'Drained of life. Lose 2 levels.', imageUrl: 'https://picsum.photos/seed/shadow_stalker/150/200' },
  { id: 'd15', name: 'Secret Passage', type: CardType.SpecialDoor, description: 'You find a secret passage! Draw 2 Treasure cards immediately. Discard this card.', imageUrl: 'https://picsum.photos/seed/secret_passage/150/200' },
  { id: 'd16', name: 'Wandering Minstrel', type: CardType.SpecialDoor, description: 'A friendly minstrel offers to help. Gain +2 in your next combat. Discard after use.', imageUrl: 'https://picsum.photos/seed/minstrel_help/150/200' },
  { id: 'd17', name: 'Orc Brute', type: CardType.Monster, description: 'Big, dumb, and loves to smash.', level: 6, treasures: 2, badStuff: 'Smashed! Discard 2 cards from your hand.', imageUrl: 'https://picsum.photos/seed/orc_brute/150/200' },
  { id: 'd18', name: 'Screaming Banshee', type: CardType.Monster, description: 'Her wail chills you to the bone.', level: 7, treasures: 2, badStuff: 'Lose a level from sheer terror. If level 1, lose an item.', imageUrl: 'https://picsum.photos/seed/banshee_monster/150/200' },
  { id: 'd19', name: 'Curse of Perpetual Annoyance', type: CardType.Curse, description: 'Everything just seems... irritating.', badStuff: 'You cannot help others in combat until this curse is removed or you gain a level.', imageUrl: 'https://picsum.photos/seed/curse_annoy/150/200' },
  { id: 'd20', name: 'Gnome Tinkerer', type: CardType.Race, description: 'You are a Gnome. Can disable one trap card targeting you by discarding a card. +1 to Run Away from mechanical monsters.', imageUrl: 'https://picsum.photos/seed/gnome_race/150/200' },
  { id: 'd21', name: 'Cleric of Minor Miracles', type: CardType.Class, description: 'You are a Cleric. Once per game, may discard 3 cards to cancel a Curse targeting you.', imageUrl: 'https://picsum.photos/seed/cleric_class/150/200' },
  { id: 'd22', name: 'Gelatinous Octahedron', type: CardType.Monster, description: 'It\'s surprisingly well-defined for a blob.', level: 5, treasures: 2, badStuff: 'Engulfed! One random item you have equipped is dissolved. If no items, lose a level.', imageUrl: 'https://picsum.photos/seed/gelatinous_octa/150/200' },
  { id: 'd23', name: 'Friendly Imp', type: CardType.SpecialDoor, description: 'A tiny imp offers you a deal...', badStuff: 'Option: Gain a Treasure, or lose a level. Your choice. Discard this card.', imageUrl: 'https://picsum.photos/seed/friendly_imp/150/200' },
  { id: 'd24', name: 'Kobold Miner', type: CardType.Monster, description: 'Armed with a pickaxe and a bad attitude.', level: 3, treasures: 1, badStuff: 'Steals 100 Gold Pieces worth of items. If you have less, lose what you have.', imageUrl: 'https://picsum.photos/seed/kobold_miner/150/200' },
  { id: 'd25', name: 'Curse! Greased Palms', type: CardType.Curse, description: 'Everything feels slippery!', badStuff: 'Your equipped weapon (if any) clatters to the floor. -2 in your next combat if you had no weapon.', imageUrl: 'https://picsum.photos/seed/curse_greased/150/200' },
  { id: 'd26', name: 'Divine Intervention', type: CardType.SpecialDoor, description: 'The gods smile upon you! Choose one: Cancel a curse affecting you, OR automatically defeat a monster of Level 5 or less currently in play. Discard this card.', imageUrl: 'https://picsum.photos/seed/divine_intervention/150/200' },
  ...Array.from({ length: 5 }, (_, i) => ({
    id: `d_generic${i}`,
    name: `Generic Monster ${i+1}`,
    type: CardType.Monster,
    description: `A generic monster. Level ${ (i % 5) + 1 }. It's generically monstrous.`,
    level: (i % 5) + 1,
    treasures: 1,
    badStuff: 'Lose a level. How generic.',
    imageUrl: `https://picsum.photos/seed/generic_door${i}/150/200`,
  }))
];

export const MOCK_TREASURE_DECK: Card[] = [
  { id: 't1', name: 'Singing Sword', type: CardType.Item, description: 'It hums a jaunty battle tune. +2 Bonus. Worth 400 Gold Pieces.', bonus: 2, value: 400, imageUrl: 'https://picsum.photos/seed/singing_sword/150/200' },
  { id: 't2', name: 'Boots of Speed', type: CardType.Item, description: 'Makes you run faster... or at least feel like it. +2 Bonus. Footgear. Worth 400 Gold Pieces.', bonus: 2, value: 400, imageUrl: 'https://picsum.photos/seed/speed_boots/150/200' },
  { id: 't3', name: 'Helm of Brilliance', type: CardType.Item, description: 'So shiny it blinds your foes (sometimes). +1 Bonus. Headgear. Worth 200 Gold Pieces.', bonus: 1, value: 200, imageUrl: 'https://picsum.photos/seed/brilliant_helm/150/200' },
  { id: 't4', name: 'Enchanted Armor', type: CardType.Item, description: 'Glows faintly and smells of lavender. +3 Bonus. Armor. Worth 600 Gold Pieces.', bonus: 3, value: 600, imageUrl: 'https://picsum.photos/seed/enchanted_armor/150/200' },
  { id: 't5', name: 'Potion of Bravery', type: CardType.OneShot, description: 'Liquid courage! +2 to either side in combat. Usable once only. Worth 100 Gold Pieces.', bonus: 2, value: 100, imageUrl: 'https://picsum.photos/seed/bravery_potion/150/200' },
  { id: 't6', name: 'Impressive Scroll', type: CardType.Item, description: 'Looks very important. Confers no bonus, but allows you to look down on others. Worth 0 Gold Pieces.', value: 0, imageUrl: 'https://picsum.photos/seed/impressive_scroll/150/200' },
  { id: 't7', name: 'Gain A Level', type: CardType.OneShot, description: 'Huzzah! You go up one level. Play at any time.', value: 0, imageUrl: 'https://picsum.photos/seed/gain_level_card/150/200' },
  { id: 't8', name: 'Bag of Holding (Small)', type: CardType.Item, description: 'Allows you to carry one extra Big item. No bonus. Worth 300 Gold Pieces.', value: 300, imageUrl: 'https://picsum.photos/seed/bag_of_holding/150/200' },
  { id: 't9', name: 'Amulet of Protection', type: CardType.Item, description: 'Wards off minor curses. +1 Bonus. Worth 250 Gold Pieces.', bonus: 1, value: 250, imageUrl: 'https://picsum.photos/seed/amulet_protection/150/200' },
  { id: 't10', name: 'Healing Potion', type: CardType.OneShot, description: 'Restores 1 Level if lost in current combat, or use to automatically escape. Usable once. Worth 150 GP.', value: 150, imageUrl: 'https://picsum.photos/seed/healing_potion/150/200' },
  { id: 't11', name: 'Swift Boots', type: CardType.Item, description: '+1 to Run Away. Footgear. Worth 300 Gold Pieces.', bonus: 0, value: 300, imageUrl: 'https://picsum.photos/seed/swift_boots_item/150/200' }, // Run Away bonus not directly combat
  { id: 't12', name: 'Sharpened Dagger', type: CardType.Item, description: 'A pointy stick. +1 Bonus. 1 Hand. Worth 100 Gold Pieces.', bonus: 1, value: 100, imageUrl: 'https://picsum.photos/seed/sharp_dagger/150/200' },
  { id: 't13', name: 'Potion of Strength', type: CardType.OneShot, description: 'Hulk out! +3 to your side in combat. Usable once. Worth 200 GP.', bonus: 3, value: 200, imageUrl: 'https://picsum.photos/seed/strength_potion/150/200' },
  { id: 't14', name: 'Scroll of Confusion', type: CardType.OneShot, description: 'Target monster loses 2 levels for this combat. Usable once. Worth 250 GP.', value: 250, imageUrl: 'https://picsum.photos/seed/scroll_confusion/150/200' },
  { id: 't15', name: 'Polished Shield', type: CardType.Item, description: 'Reflects insults and minor spells. +2 Bonus. 1 Hand. Worth 350 GP.', bonus: 2, value: 350, imageUrl: 'https://picsum.photos/seed/polished_shield/150/200'},
  { id: 't16', name: 'Cloak of Minor Invisibility', type: CardType.Item, description: 'Makes you slightly harder to see. +1 to Run Away. +1 Bonus. Armor. Worth 300 GP.', bonus: 1, value: 300, imageUrl: 'https://picsum.photos/seed/cloak_invis/150/200' },
  { id: 't17', name: 'Pointy Hat of Pondering', type: CardType.Item, description: 'Makes you look smart. May draw an extra card after defeating a monster (50% chance, GM decides or roll die). Headgear. Worth 200 GP.', bonus: 0, value: 200, imageUrl: 'https://picsum.photos/seed/pointy_hat/150/200' },
  { id: 't18', name: 'Potion of Extra Stabby', type: CardType.OneShot, description: '+4 Bonus to one player in combat. Usable once. Worth 250 GP.', bonus: 4, value: 250, imageUrl: 'https://picsum.photos/seed/potion_stabby/150/200' },
  { id: 't19', name: 'Shield of Slightly Better Warding', type: CardType.Item, description: 'It wards... slightly better. +1 Bonus. 1 Hand. Worth 150 GP.', bonus: 1, value: 150, imageUrl: 'https://picsum.photos/seed/shield_warding/150/200' },
  { id: 't20', name: 'Scroll of Convenient Forgetfulness', type: CardType.OneShot, description: 'Make one player (including yourself) discard a Curse affecting them. Usable once. Worth 300 GP.', value: 300, imageUrl: 'https://picsum.photos/seed/scroll_forget/150/200' },
  { id: 't21', name: 'Boots of Kicking (Doors)', type: CardType.Item, description: 'These boots were made for kicking! +1 Bonus specifically when fighting a monster revealed by kicking open a door. Footgear. Worth 250 GP.', bonus: 1, value: 250, imageUrl: 'https://picsum.photos/seed/boots_kicking/150/200' },
  { id: 't22', name: 'Ring of Minor Annoyance', type: CardType.Item, description: 'Allows you to tap an opponent lightly, distracting them. -1 to one chosen opponent in the next combat they are in. No combat bonus for you. Worth 100 GP.', bonus: 0, value: 100, imageUrl: 'https://picsum.photos/seed/ring_annoy/150/200' },
  ...Array.from({ length: 5 }, (_, i) => ({
    id: `t_generic${i}`,
    name: `Generic Treasure ${i+1}`,
    type: CardType.Item,
    description: `A shiny bauble! Worth ${ (i + 1) * 50 } Gold Pieces. Bonus ${i % 3}. It's generically valuable.`,
    value: (i+1) * 50,
    bonus: i % 3,
    imageUrl: `https://picsum.photos/seed/generic_treasure${i}/150/200`,
  }))
];

export const MOCK_PLAYERS_INITIAL: Player[] = [
    { id: 'p1', name: 'Heroic Halfling', avatarUrl: PLACEHOLDER_AVATARS[0], level: 1, gear: 0, equippedItems: [], cardsInHand: [], isHost: true },
    { id: 'p2', name: 'Elven Archer', avatarUrl: PLACEHOLDER_AVATARS[1], level: 1, gear: 0, equippedItems: [], cardsInHand: [] },
];

export const calculateGear = (equippedItems: Card[]): number => {
  return equippedItems.reduce((totalBonus, item) => totalBonus + (item.bonus || 0), 0);
};
