export type Category = {
    name: string;
    items: string[];
};
export enum PROGRESS_TYPE {DEFAULT_PROGRESS, PRE_HARDMODE, HARDMODE}
export const DEFAULT: Category[] = [];
export const PRE_HARDMODE: Category[] = [
  {
    name: "For Any Build",
    items: [
      "Acquire Molten Pickaxe",
      "Acquire Void Bag / Void Portal",
      "Acquire Terraspark Boots",
      "Acquire Shellphone",
      "Acquire Bundle of Horseshoe Balloons",
      "Acquire Stinger Necklace",
      "Acquire Obsidian Shield (Ankh Shield later)",
    ],
  },
  {
    name: "Melee Builds",
    items: [
      "Acquire Night's Edge",
      "Acquire Feral Claws",
      "Acquire Sunfury",
      "Acquire Molten Armor",
      "Acquire Bone Glove",
    ],
  },
  {
    name: "Ranged Builds",
    items: [
      "Acquire Necro Armor",
      "Acquire Bee's Knees",
      "Acquire Quadbarrel Shotgun",
      "Acquire Minishark + Illegal Gun Parts",
      "Acquire Hellwing Bow",
      "Acquire Party Bullets",
      "Acquire Musket Balls (for Crystal Bullets)",
    ],
  },
  {
    name: "Mage Builds",
    items: [
      "Acquire Jungle Armor",
      "Acquire Waterbolt",
      "Acquire Magic Missile",
      "Acquire Bee Gun + Hive Pack",
      "Acquire Demon Scythe",
      "Acquire Mana Flower",
    ],
  },
  {
    name: "Summoner Builds",
    items: [
      "Acquire Obsidian or Bee Armor",
      "Acquire Snapthorn",
      "Acquire Spinal Tap",
      "Acquire Imp Staff",
      "Acquire Foxparks",
      "Acquire Pygmy Necklace",
      "Acquire Houndius Shootius",
    ],
  },
  {
    name: "Other Tasks",
    items: [
      "Isolate crimson biomes (3-wide tunnel)",
      "Complete 30 fishing quests (Golden Rod)",
      "Prepare Plantera arena",
      "Create underground mushroom biome",
      "Create safe fishing holes for each biome",
    ],
  },
];

export const HARDMODE: Category[] = [
  {
    name: "For Any Build",
    items: [
      "Acquire Ankh Shield",
      "Acquire Charm of Myths",
      "Acquire Crystal Assassin Armor",
      "Acquire Fin/Frozen/Harpy/Fairy Wings",
      "Acquire Cross Necklace",
    ],
  },
  {
    name: "Melee Builds",
    items: [
      "Acquire Amarok",
      "Acquire Dao of Pow",
      "Acquire Phasesaber",
      "Acquire Beam Sword",
      "Acquire Ice Sickle",
      "Acquire Celestial Shell",
      "Acquire Warrior Emblem",
      "Acquire Berserker's Glove",
    ],
  },
  {
    name: "Ranged Builds",
    items: [
      "Acquire Onyx Blaster",
      "Acquire Clockwork Assault Rifle",
      "Acquire Megashark",
      "Acquire Daedalus Stormbow",
      "Acquire Shadowflame Bow",
      "Acquire Dart Pistol",
      "Acquire Ranger Emblem",
      "Acquire Rifle Scope",
      "Acquire Molten Quiver",
    ],
  },
  {
    name: "Mage Builds",
    items: [
      "Acquire Sky Fracture",
      "Acquire Crystal Storm",
      "Acquire Crystal Serpent",
      "Acquire Golden Shower",
      "Acquire Nimbus Rod",
      "Acquire Meteor Staff",
      "Acquire Laser Rifle",
      "Acquire Life Drain",
      "Acquire Killing Deck",
      "Acquire Sorcerer Emblem",
      "Acquire Mana Cloak",
    ],
  },
  {
    name: "Summoner Builds",
    items: [
      "Acquire Queen Spider Staff",
      "Acquire Pirate Staff",
      "Acquire Sanguine Staff",
      "Acquire Blade Staff",
      "Acquire Summoner Emblem",
      "Acquire Firecracker",
      "Acquire Monk's Belt",
      "Acquire Huntress's Buckler",
    ],
  },
];
