"use strict";
class LocationType {
    constructor(name, symbol, description, enterAction, presentAction, extraReset = null, nextCost = null, enterCount = 1, canWorkTogether = true, startWater = 0) {
        this.extraReset = null;
        this.name = name;
        this.symbol = symbol;
        this.description = description;
        this.enterAction = (enterAction ? Object.create(getAction(enterAction)) : null);
        this.presentAction = (presentAction ? Object.create(getAction(presentAction)) : null);
        this.nextCost = nextCost;
        this.enterCount = enterCount;
        if (extraReset) {
            this.extraReset = extraReset;
        }
        this.canWorkTogether = canWorkTogether;
        this.startWater = startWater;
    }
    getEnterAction(entered) {
        if (entered >= this.enterCount) {
            return Object.create(getAction("Walk"));
        }
        if (this.name == "Complete Goal" && zones[currentZone].goalComplete) {
            return Object.create(getAction("Mine"));
        }
        return this.enterAction;
    }
    reset(...args) {
        if (this.extraReset)
            return this.extraReset(...args);
        return 0;
    }
}
function storeCompletions(completions, priorCompletions) {
    return completions + priorCompletions;
}
function getNextActivateCost() {
    return `${realms[currentRealm].getNextActivateAmount()} gold nuggets, 1s`;
}
function startCollectManaCost(completions, priorCompletions, zone, x, y) {
    return `${writeNumber(this.presentAction ? this.presentAction.getProjectedDuration(getMapLocation(x, y, true, zone.index)) / 1000 : -1, 2)}s`;
}
function getLocationType(name) {
    return locationTypes.find(a => a.name == name);
}
const locationTypes = [
    new LocationType("Solid Rock", "█", "Some kind of rock, too hard to dig through.", null, null, null),
    new LocationType("Tunnel", ".", "A bare stone passage, empty of any ornamentation.", "Walk", null, null),
    new LocationType("Limestone", "#", "A whole bunch of relatively soft rock.", "Mine", null, null),
    new LocationType("Travertine", "«", "A whole bunch of rock, but much harder than usual.", "Mine Travertine", null, null),
    new LocationType("Granite", "╖", "This stone just doesn't want to budge.", "Mine Granite", null, null),
    new LocationType("Basalt", "╣", "{'0':'You''ve hit a wall.','4':'The wall hits back.'}", "Mine Basalt", null, null),
    new LocationType("Basalt Plume", "¶", "{'2': 'The Verdant nature of this realm is getting metaphorical:'} This basalt seems to be growing out of a volcanic vent (Growth: 4000+1t). When you cut through it you'll have just long enough to get across before it collapses into the lava below.", "Mine Basalt Plume", null, null),
    new LocationType("Chert", "■", "You'd think it was the hard rock all around it, but it's a different colour.", "Mine Chert", null, null),
    new LocationType("Gold ore", "+", "Rocks with veins of gold ore.", "Mine Gold", null, null),
    new LocationType("Iron ore", "%", "Rocks with veins of iron ore.", "Mine Iron", null, null),
    new LocationType("Salt", "░", "A wall of rock salt.  It only takes so long to mine it because you want to sort out the salt and not carry a ton of gravel with you. {'3':'Getting salt in your wounds is painful, and will deal damage equal to that you started with every 2 seconds'}" , "Mine Salt", null, null),
    new LocationType("Mana-infused Rock", "¤", "A whole bunch of rock.  But this time, it glows!", "Mine", "Collect Mana", storeCompletions, startCollectManaCost),
    new LocationType("Mana Spring", "*", "Pure mana, flowing out of the rock.  Each time you absorb the mana, the cost to do so next time increases.", "Walk", "Collect Mana", storeCompletions, startCollectManaCost),
    new LocationType("Strange Machine", "♥", "A strange machine labelled '{'0':'Clone Machine','1':'Rune Enhancer','2':'Rune Enhancer', '3':'Deal Maker', '4':'Time Stretcher'}'.  What could it do?", "Walk", "Activate Machine", null, getNextActivateCost),
    new LocationType("Vaporizer", "=", "A machine for extracting the magic right out of gold. ({MANA_PER_GOLD} mana per gold)", "Walk", "Turn Gold to Mana", null),
    new LocationType("Fountain", "^", "A healing fountain, activated by the runes around its base.", "Walk", "Heal", null, null, undefined, false),
    new LocationType("Bottomless Pit", " ", "A bottomless pit.", "Cross Pit", null, null),
    new LocationType("Lava", "~", "A bottomless pit full of lava.  At least, you're not going to be walking on the bottom, so it's bottomless enough for you.  Your bridges might not last very long here,{'0':'but probably long enough for one clone.','3':'and the poor clone that crosses that melting bridge will take 1+Zone damage'}  ", "Cross Lava", null, null, null, Infinity),
    new LocationType("Goblin", "g", "An ugly humanoid more likely to try and kill you than to let you by.\n{STATS}", "Attack Creature", null, null),
    new LocationType("Goblin Chieftain", "c", "This one is uglier than the last two.  Probably meaner, too.\n{STATS}", "Attack Creature", null, null),
    new LocationType("Goblin Champion", "m", "The largest of the goblins.  You're going to have to work hard to take him down.\n{STATS}", "Attack Creature", null, null),
    new LocationType("Skeleton", "s", "An undead.  It's not very dangerous, but it is resilient.\n{STATS}", "Attack Creature", null, null),
    new LocationType("Golem", "G", "A towering golem made out of finely crafted stone.  There aren't even any chinks in its armour!\n{STATS}", "Attack Creature", null, null),
    new LocationType("Guardian", "X", "This massive creature exudes an aura of implacable doom.\n{STATS}", "Attack Creature", null, null),
    new LocationType("Weaken Rune", "W", "Weakens adjacent creatures.", "Walk", null, null),
    new LocationType("Wither Rune", "H", "This rune kills plants next to it.", "Walk", null, null),
    new LocationType("Teleport To Rune", "T", "This rune allows someone or something to come through from another place.", "Walk", null, null),
    new LocationType("Teleport To Rune - Charged", "t", "This rune allows someone or something to come through from another place.", "Walk", null, null),
    new LocationType("Teleport From Rune", "F", "This rune allows someone to slip beyond to another place.", "Walk", null, null),
    new LocationType("Duplication Rune", "D", "Once charged, this rune increases the yield of mining in the 8 tiles next to it.", "Walk", null, null),
    new LocationType("Duplication Rune - Charged", "d", "This rune increases the yield of mining in the 8 tiles next to it.", "Walk", null, null),
    new LocationType("Pump Rune", "P", "This rune drains water from it and orthogonally adjacent tiles.", "Walk", null, null),
    new LocationType("Coal", "○", "Bituminous coal is present in these rocks.", "Mine Coal", null, null),
    new LocationType("Gem", "☼", "You can find gems studded in the walls here.  Each time you extract a gem from this tile (in one reset), it gets a bit harder to get the next one.", "Mine Gem", "Collect Gem", null),
    new LocationType("Gem Tunnel", "©", "You can find gems studded in the walls here.  Each time you extract a gem from this tile (in one reset), it gets a bit harder to get the next one.", "Mine Gem", "Collect Gem", null),
    new LocationType("Furnace", "╬", "A large box full of fire, hot enough to melt iron ore {'3':'and burn your skin, dealing 1/3rd of a damage per second'}.", "Walk", "Make Iron Bars", null),
    new LocationType("Anvil - Bridge", "⎶", "An anvil on which you can make a bridge out of {'0':2,'1':4} iron bars.", "Walk", "Create Bridge", null),
    new LocationType("Anvil - Long Bridge", "║", "An anvil on which you can make a bridge out of {'0':2,'1':4} iron bars.  These pits are a bit wider than the others, so it'll take a bit longer to craft the bridge (though your old ones still work for some reason).", "Walk", "Create Long Bridge", null),
    new LocationType("Anvil - Sword", ")", "An anvil on which you can make a sword out of {'0':3,'1':6} iron bars.", "Walk", "Create Sword", null),
    new LocationType("Anvil - Shield", "[", "An anvil on which you can make a shield out of {'0':5,'1':10} iron bars.", "Walk", "Create Shield", null),
    new LocationType("Anvil - Armour", "]", "An anvil on which you can make a suit of armour out of {'0':4,'1':8} iron bars.", "Walk", "Create Armour", null),
    new LocationType("Steel Furnace", "▣", "A large box full of fire. This one has a slot for coal and a slot for iron bars {'3':'and gets even hotter than the other, dealing 1 damage per second.'}.", "Walk", "Make Steel Bars", null),
    new LocationType("Anvil - Upgrade Bridge", "&", "An anvil on which you can upgrade an iron bridge into a steel bridge using {'0':1,'1':2} steel bar.", "Walk", "Upgrade Bridge", null),
    new LocationType("Anvil - Upgrade Sword", "(", "An anvil on which you can upgrade an iron sword into a steel sword using {'0':2,'1':4} steel bars.", "Walk", "Upgrade Sword", null),
    new LocationType("Anvil - Upgrade Shield", "{", "An anvil on which you can upgrade an iron shield into a steel shield using {'0':2,'1':4} steel bars.", "Walk", "Upgrade Shield", null),
    new LocationType("Anvil - Upgrade Armour", "}", "An anvil on which you can upgrade an iron suit of armour into a steel suit of armour using {'0':2,'1':4} steel bars.", "Walk", "Upgrade Armour", null),
    new LocationType("Portal", "Θ", "A portal to another zone.", "Walk", "Portal", null),
    new LocationType("Complete Goal", "√", "A strange energy field where you can obtain additional powers.", "Complete Goal", null, null),
    new LocationType("Locked Goal", "ᛉ", "This energy field is contained by a mystic lock. You'll need 20 gems to unlock it.", "Walk", "Complete Goal2", null),
    new LocationType("Mushroom", "♠", "A giant mushroom which grows quickly.  It's harder to cut the longer you wait. {'0':'(Growth: 1+0.1t)', '2':'(Growth: 1+0.5t)', '3': 'Your clones take 1/3rd of a damage per second while cutting it. (Growth: 1+0.1t)'}", "Chop", null, null),
    new LocationType("Kudzushroom", "♣", "A giant mushroom which grows quickly.  It grows so fast each clone needs to make its own way every time {'0':'(Growth: 1+0.1t)', '2':'(Growth: 1+0.5t)', '3': 'Your clones take 1/3rd of a damage per second while cutting it. (Growth: 1+0.1t)'}", "Kudzu Chop", null, null, null, Infinity, false),
    new LocationType("Sporeshroom", "α", "A giant mushroom which grows quickly.  While you cut it, it lets out poisonous spores, injuring your clones cutting it for {'0':'1 damage per second (Growth: 1+0.1t)', '2':'1 damage per second (Growth: 1+0.5t)', '3': '2 damage per second (Growth: 1+0.1t)'}", "Spore Chop", null, null),
    new LocationType("Oystershroom", "§", "A giant mushroom which grows extremely quickly.  You don't think you've ever seen a mushroom grow that fast. {'0':'(Growth: 1+0.2t)', '2':'(Growth: 1+1.0t)', '3': 'Your clones take 1/3rd of a damage per second while cutting it. (Growth: 1+0.2t)'}", "Oyster Chop", null, null),
    new LocationType("Springshroom", "δ", "A giant mushroom which grows quickly.  It seems to continually spray water. {'0':'(Growth: 1+0.1t)', '2':'(Growth: 1+0.5t)', '3': 'Your clones take 1/3rd of a damage per second while cutting it. (Growth: 1+0.1t)'}", "Chop", null, null, null, undefined, true, 0.001),
    new LocationType("Anvil - Axe", "¢", "An anvil on which you can make an axe out of {'0':'an iron bar','1':'2 iron bars'}.  This won't be useful to you for at least a few zones.", "Walk", "Create Axe", null),
    new LocationType("Anvil - Pick", "¥", "An anvil on which you can make a pick out of {'0':'an iron bar','1':'2 iron bars'}.", "Walk", "Create Pick", null),
    new LocationType("Anvil - Hammer", "£", "An anvil on which you can make a hammer out of {'0':'an iron bar','1':'2 iron bars'}. This won't be useful for a long time..", "Walk", "Create Hammer", null),
    new LocationType("Spring", "0", "Deep water - it'll spread out and drown you if you're not careful!", "Walk", null, null, null, undefined, true, 1),
    new LocationType("Sword Enchanter", "|", "An anvil on which you can enchant a steel sword using {'0':3,'1':6} gems.", "Walk", "Enchant Sword", null),
    new LocationType("Shield Enchanter", "<", "An anvil on which you can enchant a steel shield using {'0':3,'1':6} gems.", "Walk", "Enchant Shield", null),
    new LocationType("Armour Enchanter", ">", "An anvil on which you can enchant a steel suit of armour using {'0':3,'1':6} gems.", "Walk", "Enchant Armour", null),
    new LocationType("Timelike Barrier", "1", "A wall made of a strange energy that saps your mana. {'4':'Its duration does not compound.'}", "Enter Barrier", null, null),
    new LocationType("Timelike Barrier", "2", "A wall made of a strange energy that saps your mana. {'4':'Its duration does not compound.'}", "Enter Barrier", null, null),
    new LocationType("Timelike Barrier", "3", "A wall made of a strange energy that saps your mana. {'4':'Its duration does not compound.'}", "Enter Barrier", null, null),
    new LocationType("Altar", "†", "Any clone that activates this will die, but mark their kin with blood. {'1': 'As with everything else here, this costs more - only every second clone with grant a blood mark.'}", "Walk", "Sacrifice", null, null, null, false),
	new LocationType("Demongate", "ɤ", "Only those marked with blood may pass.", "Demonic Checkpoint", null, null),
    new LocationType("Rune Carver", "ᚥ", "Here you can carve runes into a runestone and inlay them with power. Requires {'0':'1 gem, 1 gold and 1 obsidian', '1':'2 gems, 2 gold and 2 obsidian'}.", "Walk", "Create Runestone", null),	
	new LocationType("Crystal Shaper", "⊕", "Here you can create a Crystal Ball by combining {'0':'2 gems and 1', '1':'4 gems and 2'} obsidian.", "Walk", "Create Crystal Ball", null),
	    new LocationType("Obsidian", "►", "Volcanic glass that glows eerily when lit - hard to mine without cutting yourself.", "Mine Obsidian", null, null),
    new LocationType("Exit", "!", "A door.  Opening to the outside world", "Exit", null, null),
    new LocationType("Not a location", "", "", null, null),
];
if ((new URL(document.location.href).searchParams).get("save") === "separate") {
    locationTypes.forEach((locationType) => {
        if (locationType.name === "Portal")
            return;
        locationType.canWorkTogether = false;
    });
    console.log("Location types set to not work together.");
}
//# sourceMappingURL=location_types.js.map
