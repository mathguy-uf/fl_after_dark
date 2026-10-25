"use strict";

// FLORIDA AFTER DARK -----------------------------------------------------------
// The editable game data lives first: items, locations, radio stations, events.
// The game engine follows below so hobbyist changes stay straightforward.

const SAVE_KEY = "floridaAfterDarkSave_v1";
const SETTINGS_KEY = "floridaAfterDarkSettings_v1";

const ITEM_LABELS = {
  flashlight: "flashlight",
  roadMap: "road map",
  fishingLure: "fishing lure",
  motelKey: "motel key stamped 17",
  strangeCoin: "strange coin",
  cassetteTape: "cassette tape marked SIDE B ONLY",
  coordinatesReceipt: "coordinates written on a receipt"
};

const locations = {
  gainesville: { name: "Gainesville", description: "The last open gas station clicks off behind you. Spanish moss hangs motionless over a road that looks much longer than it did this afternoon.", connections: ["paynesPrairie", "suwanneeRiver", "citrusStand"], risk: 1 },
  paynesPrairie: { name: "Paynes Prairie", description: "The prairie opens beneath a moonless sky. Low fog sits where the bison and horses are supposed to be sleeping.", connections: ["gainesville", "ocalaForest", "boatRamp"], risk: 2 },
  ocalaForest: { name: "Ocala National Forest", description: "Pines close around the road. Every reflective marker flashes like an eye and then becomes a reflective marker again.", connections: ["paynesPrairie", "abandonedMotel", "spaceCoast"], risk: 3 },
  cedarKey: { name: "Cedar Key", description: "Salt air rolls across the causeway. Porch lights glow over water black enough to erase the horizon.", connections: ["suwanneeRiver", "oldFishingPier", "citrusStand"], risk: 2 },
  oldFishingPier: { name: "Old Fishing Pier", description: "The pier creaks over the Gulf. Someone left a folding chair facing the water and, thoughtfully, no one in it.", connections: ["cedarKey", "boatRamp"], risk: 2 },
  citrusStand: { name: "Roadside Citrus Stand", description: "A hand-painted sign promises ORANGES / BOILED PEANUTS / ICE / MAYBE BAIT. The stand should be closed. A bare bulb says otherwise.", connections: ["gainesville", "cedarKey", "abandonedMotel"], risk: 1 },
  abandonedMotel: { name: "Abandoned Motel", description: "The vacancy sign still works, although several letters have resigned. Every visible door has the number 17 screwed into it.", connections: ["citrusStand", "ocalaForest", "stAugustine"], risk: 4 },
  suwanneeRiver: { name: "Suwannee River", description: "The river slides past like dark glass. Somewhere downstream, a fish jumps once and seems embarrassed by the attention.", connections: ["gainesville", "cedarKey", "boatRamp"], risk: 2 },
  boatRamp: { name: "Forgotten Boat Ramp", description: "A concrete ramp disappears into tannic water. There are fresh tire tracks, but they stop before reaching the road.", connections: ["suwanneeRiver", "paynesPrairie", "oldFishingPier"], risk: 3 },
  stAugustine: { name: "St. Augustine", description: "Old walls and empty streets catch the yellow streetlights. The tourist trains are asleep. Probably.", connections: ["abandonedMotel", "spaceCoast"], risk: 2 },
  spaceCoast: { name: "Space Coast", description: "Launch towers blink red beyond the flat horizon. The Atlantic is out there, doing something enormous in the dark.", connections: ["stAugustine", "ocalaForest", "evergladesRoad"], risk: 2 },
  evergladesRoad: { name: "Everglades Road", description: "The road runs arrow-straight between sawgrass and black water. Bugs strike the windshield like very small opinions.", connections: ["spaceCoast", "keysCauseway", "station17"], risk: 4 },
  keysCauseway: { name: "Keys Causeway", description: "Concrete and moonlit water alternate for miles. The guardrail is warm from a day that ended hours ago.", connections: ["evergladesRoad"], risk: 2 },
  station17: { name: "Station 17", description: "A narrow service road ends at a low concrete relay building. Its tower has no lights, but your radio is suddenly perfectly clear.", connections: ["evergladesRoad"], risk: 5, hidden: true }
};

const radioStations = [
  { frequency: "88.5 FM", text: "Public radio. A calm voice discusses mangrove restoration as if the night is normal." },
  { frequency: "91.7 FM", text: "Old country music fades in and out beneath soft static. The singer keeps trying to get back home." },
  { frequency: "94.1 FM", text: "Sports talk. Someone is passionately explaining why a 9–7 season is actually evidence of destiny." },
  { frequency: "96.9 FM", text: "Marine weather: light chop, warm water, visibility good. Then: 'Visibility inland: uncertain.'" },
  { frequency: "99.3 FM", text: "A preacher speaks gently about storms, patience, and unfamiliar exits after midnight." },
  { frequency: "101.1 FM", text: "Weather: humid, scattered lightning, sunrise at 7:31. The announcer adds, 'Tomorrow occurred normally.'" },
  { frequency: "103.7 FM", special: true, text: "Static. Three tones. A voice: '...if you're hearing this, do not take County Road 347.'" },
  { frequency: "107.9 FM", special: true, text: "No music. Numbers are read slowly over cicadas: 29... 41... 17... then silence." }
];

// Choice properties can be: result, time, curiosity, fuel, item, radioIndex, ending.
const events = [
  { id: "armadillo", locations: ["gainesville", "paynesPrairie", "citrusStand"], strange: false, text: "An armadillo trots across the road with the confidence of someone who has never read a traffic law.", choices: [
    { label: "WAIT FOR IT", result: "It reaches the shoulder, pauses, and appears to reconsider several life choices.", time: 3, curiosity: 1 },
    { label: "ROLL PAST SLOWLY", result: "The armadillo remains professionally indifferent.", time: 1 }
  ]},
  { id: "deer", locations: ["paynesPrairie", "ocalaForest"], strange: false, text: "Your headlights catch a deer at the edge of the road. For one second there are two. Then one. Then none.", choices: [
    { label: "STOP AND WATCH", result: "Nothing returns. Fog moves across the grass where the deer stood.", time: 5, curiosity: 1 },
    { label: "MOVE ON", result: "You decide depth perception is a daytime hobby.", time: 1 }
  ]},
  { id: "alligator", locations: ["boatRamp", "evergladesRoad", "paynesPrairie"], strange: false, text: "An alligator lies beside the road, chin up, looking like a suitcase that developed opinions.", choices: [
    { label: "GIVE IT SPACE", result: "Excellent decision. The alligator contributes nothing further to the evening.", time: 2 },
    { label: "MEMORIZE THE MOMENT", result: "You remain in the car. Your imaginary photo is excellent.", curiosity: 1 }
  ]},
  { id: "raccoon", locations: ["gainesville", "citrusStand", "abandonedMotel"], strange: false, text: "A raccoon stands on a trash can holding half a honey bun. You have interrupted a private dinner.", choices: [
    { label: "APOLOGIZE", result: "The raccoon does not accept, but it allows you to leave.", curiosity: 1 },
    { label: "BACK AWAY", result: "Diplomatic relations remain stable." }
  ]},
  { id: "ibis", locations: ["stAugustine", "spaceCoast"], strange: false, text: "Three ibis inspect an empty parking lot. One pecks a French fry of uncertain age.", choices: [
    { label: "OBSERVE", result: "The ibis discover nothing useful. Neither do you.", time: 3 },
    { label: "LEAVE THEM TO IT", result: "They have seniority here." }
  ]},
  { id: "anhinga", locations: ["boatRamp", "suwanneeRiver"], strange: false, text: "An anhinga dries its wings on a NO SWIMMING sign, which feels like commentary.", choices: [
    { label: "NOD RESPECTFULLY", result: "The bird remains a bird. This is reassuring.", curiosity: 1 },
    { label: "CHECK THE WATER", result: "Something large rolls once beneath the surface. You check enough.", time: 4, curiosity: 1 }
  ]},
  { id: "pelican", locations: ["cedarKey", "oldFishingPier", "keysCauseway"], strange: false, text: "A pelican lands nearby with the subtlety of a dropped laundry bag.", choices: [
    { label: "WATCH THE WATER", result: "Mullet flash below the surface. Farther out, something bigger turns once.", time: 4 },
    { label: "CONTINUE", result: "The pelican has already forgotten you." }
  ]},
  { id: "fishing-line", locations: ["oldFishingPier", "cedarKey"], strange: false, text: "Fresh line is tied to the railing. The lure is sized for snook or redfish. The line disappears into black water.", choices: [
    { label: "REEL IT IN", result: "The hook is empty, but the lure is good. You keep it.", item: "fishingLure", time: 5 },
    { label: "LEAVE IT", result: "Whatever owns the line can keep negotiating with the Gulf." }
  ]},
  { id: "tarpon", locations: ["keysCauseway", "cedarKey"], strange: false, text: "A tarpon rolls under a bridge light, silver for half a second, then gone.", choices: [
    { label: "WATCH FOR ANOTHER", result: "Only ripples return, plus one extremely ambitious mosquito.", time: 5, curiosity: 1 },
    { label: "KEEP MOVING", result: "Some things are better as one-second events." }
  ]},
  { id: "grouper-sign", locations: ["cedarKey", "oldFishingPier"], strange: false, text: "A chalkboard outside a closed seafood place reads: GROUPER — MARKET PRICE. Underneath: ASK THE MARKET.", choices: [
    { label: "APPRECIATE THE SIGN", result: "Florida has spoken.", curiosity: 1 },
    { label: "MOVE ON", result: "The market declines comment." }
  ]},
  { id: "store", locations: ["gainesville", "spaceCoast", "keysCauseway"], strange: false, text: "A convenience store glows ahead like a tiny fluorescent embassy. The pump still takes cards.", choices: [
    { label: "TOP OFF FUEL", result: "The tank clicks full enough for bad decisions again.", fuel: 32, time: 9 },
    { label: "BUY COFFEE", result: "It tastes like hot optimism.", curiosity: 1, time: 6 },
    { label: "LEAVE", result: "The clerk watches you go, then flips the sign to CLOSED." }
  ]},
  { id: "truck", locations: ["suwanneeRiver", "ocalaForest", "evergladesRoad"], strange: false, text: "A pickup sits on the shoulder with its hood raised. No driver is visible. Hazard lights blink perfectly on beat.", choices: [
    { label: "CALL OUT", result: "No answer. From the ditch: one frog, loudly.", time: 4, curiosity: 1 },
    { label: "KEEP DRIVING", result: "The hazard lights continue in your mirror until the bend." }
  ]},
  { id: "mosquitoes", locations: ["evergladesRoad", "boatRamp", "paynesPrairie"], strange: false, text: "You crack the window. Florida enters the vehicle in mosquito form.", choices: [
    { label: "WINDOW UP", result: "Too late for three of them. You negotiate individually.", time: 3 },
    { label: "ACCEPT YOUR FATE", result: "This is not rewarded.", time: 5, curiosity: -1 }
  ]},
  { id: "lightning", locations: ["gainesville", "paynesPrairie", "spaceCoast", "evergladesRoad"], strange: false, text: "Heat lightning flashes behind distant clouds. For a moment, every tree becomes a paper cutout.", choices: [
    { label: "WATCH", result: "The next flash comes from a different direction than expected.", time: 3, curiosity: 1 },
    { label: "KEEP GOING", result: "Thunder never arrives." }
  ]},
  { id: "manatee", locations: ["cedarKey", "keysCauseway"], strange: false, text: "A soft exhale comes from the water. A manatee nose appears, takes one look at the night, and submerges again.", choices: [
    { label: "WAIT QUIETLY", result: "It surfaces once more farther away. A normal, excellent thing.", time: 5 },
    { label: "CONTINUE", result: "You leave the manatee to its much better itinerary." }
  ]},
  { id: "payphone", locations: ["citrusStand", "abandonedMotel"], strange: true, text: "An abandoned payphone begins ringing. There is no cord running from the box to anything you can see.", choices: [
    { label: "ANSWER", result: "A voice says, 'You are about eleven minutes late.' Then a dial tone.", time: 3, curiosity: 2 },
    { label: "IGNORE IT", result: "It rings exactly seventeen times and stops." },
    { label: "LOOK AROUND", result: "The parking lot is empty. Your radio turns itself to 103.7 FM.", time: 4, curiosity: 1, radioIndex: 6 }
  ]},
  { id: "headlights", locations: ["ocalaForest", "evergladesRoad", "suwanneeRiver"], strange: true, text: "Headlights appear in your mirror. They stay the same distance back through every curve.", choices: [
    { label: "SLOW DOWN", result: "They slow too, then vanish beneath a dead streetlight.", time: 6, curiosity: 2 },
    { label: "DON'T LOOK AGAIN", result: "You look again. Nothing is there.", time: 2 }
  ]},
  { id: "wrong-weather", locations: ["spaceCoast", "stAugustine", "keysCauseway"], strange: true, text: "The radio weather report says, 'Tomorrow remained partly cloudy all day.' The announcer clears his throat and continues.", choices: [
    { label: "TURN IT UP", result: "The forecast repeats, word for word, including the mistake.", time: 3, curiosity: 2 },
    { label: "TURN IT OFF", result: "Static continues for two seconds after the radio powers down." }
  ]},
  { id: "swamp-light", locations: ["evergladesRoad", "paynesPrairie"], strange: true, text: "A pale green light hangs low over the wetlands. It does not blink, drift, or behave like an aircraft.", choices: [
    { label: "STOP AND WATCH", result: "After seven silent seconds it goes out. The frogs resume all at once.", time: 7, curiosity: 2 },
    { label: "KEEP DRIVING", result: "It remains beside you for a mile, then is simply absent." }
  ]},
  { id: "wrong-road", locations: ["ocalaForest", "evergladesRoad"], strange: true, text: "A narrow paved road branches into the trees. Your paper map shows no road here. Your phone shows no service, which feels smug.", choices: [
    { label: "DRIVE PAST", result: "In the mirror, there is no turnoff behind you." },
    { label: "STOP AT THE TURN", result: "A rusted sign reads COUNTY 17. The arrow points into darkness.", time: 4, curiosity: 2 }
  ]},
  { id: "fisherman", locations: ["oldFishingPier"], strange: true, clue: true, text: "A fisherman stands at the far end of the pier. Without turning, he says your name and asks if the redfish are running yet.", choices: [
    { label: "ASK HOW HE KNOWS", result: "'Radio,' he says. 'Everybody's on the radio tonight.' He flicks you an old coin.", item: "strangeCoin", time: 6, curiosity: 2 },
    { label: "TALK ABOUT FISH", result: "He discusses snook, tarpon, and tides. When you glance away, the pier is empty. A coin sits on the rail.", item: "strangeCoin", time: 8, curiosity: 1 }
  ]},
  { id: "motel-doors", locations: ["abandonedMotel"], strange: true, clue: true, text: "You count the motel doors. Every room is numbered 17. There are twelve doors.", choices: [
    { label: "TRY A DOOR", result: "Locked. A key drops from the ice machine behind you.", item: "motelKey", time: 5, curiosity: 1 },
    { label: "CHECK THE OFFICE", result: "The register is blank except for tonight's date, written over and over. A key waits on the desk.", item: "motelKey", time: 6, curiosity: 2 }
  ]},
  { id: "room17", locations: ["abandonedMotel"], strange: true, clue: true, requiresItem: "motelKey", text: "The key marked 17 opens the third door you try. Inside: one chair, one unplugged television, and a cassette tape on the carpet.", choices: [
    { label: "TAKE THE TAPE", result: "The label reads SIDE B ONLY. There is no Side A label.", item: "cassetteTape", time: 5, curiosity: 2 },
    { label: "TAKE IT AND LEAVE", result: "The television clicks once as you close the door.", item: "cassetteTape", time: 3, curiosity: 1 }
  ]},
  { id: "receipt", locations: ["citrusStand"], strange: true, clue: true, text: "No one is at the citrus stand. Beside the register is a fresh receipt for $0.17. Coordinates are written on the back.", choices: [
    { label: "TAKE THE RECEIPT", result: "The coordinates point south. Very far south.", item: "coordinatesReceipt", time: 3, curiosity: 2 },
    { label: "POCKET IT", result: "The bare bulb flickers once as the receipt leaves the counter.", item: "coordinatesReceipt", curiosity: 1 }
  ]},
  { id: "radio-coordinates", locations: ["gainesville", "suwanneeRiver", "spaceCoast"], strange: true, text: "The radio snaps to life by itself. A voice reads coordinates, pauses, then says: 'Receipt confirms.'", choices: [
    { label: "WRITE THEM DOWN", result: "You copy the numbers onto an old receipt from the cup holder.", item: "coordinatesReceipt", time: 4, curiosity: 2 },
    { label: "TURN OFF RADIO", result: "The display goes dark. The voice finishes the coordinates anyway." }
  ]},
  { id: "cassette-click", locations: ["stAugustine", "spaceCoast"], strange: true, requiresItem: "cassetteTape", text: "From under the dashboard comes the click of a cassette deck. Your car does not have a cassette deck.", choices: [
    { label: "LISTEN", result: "Highway noise. Your own turn signal. Then: 'Station seventeen.'", time: 5, curiosity: 2 },
    { label: "EJECT NOTHING", result: "Your empty cup holder opens by itself. Rude, but harmless." }
  ]},
  { id: "launch-countdown", locations: ["spaceCoast"], strange: true, text: "A distant loudspeaker begins a countdown from ten. At zero, nothing launches. Every red tower light goes dark for one second.", choices: [
    { label: "WAIT", result: "The lights return. The speaker says, 'Hold complete.'", time: 5, curiosity: 2 },
    { label: "MOVE ON", result: "A second countdown begins as you leave, starting at seventeen." }
  ]},
  { id: "river-song", locations: ["suwanneeRiver"], strange: true, text: "Music drifts across the river: three guitar chords, repeated slowly. No lights show on the opposite bank.", choices: [
    { label: "LISTEN", result: "The fourth chord never comes. Somehow that becomes the unsettling part.", time: 6, curiosity: 2 },
    { label: "HUM THE FOURTH CHORD", result: "Across the river, the song stops immediately.", time: 2, curiosity: 2 }
  ]},
  { id: "station-sign", locations: ["evergladesRoad"], strange: true, text: "A road sign appears in your headlights: STATION 17 — SERVICE ACCESS. Someone painted over it, badly, with black paint.", choices: [
    { label: "CHECK THE MAP", result: "There is no Station 17 on the printed map. There is a fresh pencil mark where the sign points.", time: 4, curiosity: 2 },
    { label: "IGNORE IT", result: "The next mile marker is 17. So is the next one." }
  ]},
  { id: "station-door", locations: ["station17"], strange: true, text: "The relay building door stands open. Inside, green lights blink beside racks of obsolete radio equipment. A tape machine is running.", choices: [
    { label: "STEP INSIDE", ending: "broadcast" },
    { label: "LISTEN FROM THE DOOR", result: "The tape is playing tonight's radio messages in reverse order. The newest message has not happened yet.", time: 4, curiosity: 2 },
    { label: "LEAVE NOW", result: "The tower stays silent behind you. Your radio keeps playing a station with no frequency." }
  ]}
];

const weatherOptions = ["Humid", "Warm mist", "Heat lightning", "Cloudy", "Still air", "Light rain"];

const game = { seed: 0, rngState: 0, weather: "Humid", radioIndex: 1, eventHistory: [], player: null, inProgress: false };
let typeTimer = null;
let settings = loadSettings();

// Seeded random ---------------------------------------------------------------
function seedRandom(seed) { game.rngState = seed >>> 0; }
function random() {
  game.rngState = (1664525 * game.rngState + 1013904223) >>> 0;
  return game.rngState / 4294967296;
}
function randomChoice(list) { return list[Math.floor(random() * list.length)]; }
function generateSeed() { return Math.floor(1000 + Math.random() * 9000); }

// Player / startup ------------------------------------------------------------
function makePlayer() {
  return {
    location: "gainesville", fuel: 82, miles: 0, time: 47, curiosity: 0,
    inventory: ["flashlight", "roadMap"],
    visitedLocations: ["gainesville"],
    discoveredLocations: ["gainesville", "paynesPrairie", "suwanneeRiver", "citrusStand"]
  };
}

function prepareTitleSeed() {
  if (!game.seed) game.seed = generateSeed();
  document.getElementById("title-seed").textContent = game.seed;
}

let travelTimer = null;
function cancelTravel() { clearTimeout(travelTimer); travelTimer = null; }
function beginNight() {
  cancelTravel();
  seedRandom(game.seed || generateSeed());
  game.weather = "Humid"; game.radioIndex = 1; game.eventHistory = [];
  game.player = makePlayer(); game.inProgress = true;
  document.getElementById("title-screen").hidden = true;
  document.getElementById("game-screen").hidden = false;
  updateHUD();
  showNarrative("The gas station behind you has already turned off its lights.\nThe road south is empty.\nYour radio keeps losing the station.\nYou should probably go home.\nYou don't.");
  showLocationActions();
  setStatus("Night initialized.");
}

function newNight() {
  if (game.inProgress && !window.confirm("Start a new night? Unsaved progress will be lost.")) return;
  cancelTravel(); closeAllOverlays(); game.seed = generateSeed(); game.inProgress = false;
  document.getElementById("game-screen").hidden = true;
  document.getElementById("title-screen").hidden = false;
  prepareTitleSeed();
}

// Travel / encounters ---------------------------------------------------------
function travelTo(key) {
  if (!game.inProgress) return;
  const from = locations[game.player.location], dest = locations[key];
  if (!dest || !from.connections.includes(key)) return setStatus("That road is not available from here.");
  if (dest.hidden && !game.player.discoveredLocations.includes(key)) return setStatus("You do not know how to reach that place yet.");

  const miles = 7 + Math.floor(random() * 18);
  const fuelCost = 3 + Math.floor(miles / 8);
  game.player.fuel = Math.max(0, game.player.fuel - fuelCost);
  game.player.miles += miles;
  advanceTime(8 + Math.floor(random() * 18));
  game.player.location = key;
  if (!game.player.visitedLocations.includes(key)) game.player.visitedLocations.push(key);
  discoverConnections(key); maybeChangeWeather(); updateHUD();
  if (game.player.fuel <= 0) return endGame("fuel");

  showNarrative(`You drive ${miles} miles to ${dest.name}.\n\n${dest.description}`);
  game.scene={kind:"location"}; showChoices([]);
  const chance = Math.min(.78, .42 + dest.risk * .07 + game.player.curiosity * .01);
  if (random() < chance) travelTimer = window.setTimeout(() => { if (game.inProgress && game.player.location === key) triggerEvent(key); }, settings.motionDisabled ? 0 : 350);
  else showLocationActions();
}

function discoverConnections(key) {
  locations[key].connections.forEach((neighbor) => {
    if (!locations[neighbor].hidden && !game.player.discoveredLocations.includes(neighbor)) game.player.discoveredLocations.push(neighbor);
  });
  checkStationDiscovery();
}

function checkStationDiscovery() {
  const ready = hasItem("coordinatesReceipt") && hasItem("cassetteTape") && hasItem("strangeCoin");
  if (ready && !game.player.discoveredLocations.includes("station17")) {
    game.player.discoveredLocations.push("station17");
    setStatus("ROUTE DISCOVERED: STATION 17. Reach it from Everglades Road.");
    flickerScreen();
  }
}

// Deliberate exploration guarantees the three clue chains instead of making
// the ending depend on repeated lucky random rolls.
function clueEventFor(key) {
  if (key === "citrusStand" && !hasItem("coordinatesReceipt")) return events.find(e => e.id === "receipt");
  if (key === "oldFishingPier" && !hasItem("strangeCoin")) return events.find(e => e.id === "fisherman");
  if (key === "abandonedMotel" && !hasItem("motelKey")) return events.find(e => e.id === "motel-doors");
  if (key === "abandonedMotel" && hasItem("motelKey") && !hasItem("cassetteTape")) return events.find(e => e.id === "room17");
  if (key === "station17") return events.find(e => e.id === "station-door");
  return null;
}

function exploreCurrentLocation() {
  advanceTime(4); updateHUD();
  triggerEvent(game.player.location, true);
}

function triggerEvent(key, deliberate = false) {
  const forced = deliberate ? clueEventFor(key) : null;
  const eligible = events.filter(e => e.locations.includes(key) && (!e.requiresItem || hasItem(e.requiresItem)));
  if (!eligible.length) { showNarrative(`${locations[key].description}\n\nNothing unusual happens for several minutes. This is unusual enough.`); return showLocationActions(); }
  const fresh = eligible.filter(e => !game.eventHistory.slice(-6).includes(e.id));
  const event = forced || randomChoice(fresh.length ? fresh : eligible);
  game.eventHistory.push(event.id); game.eventHistory = game.eventHistory.slice(-16);
  if (event.strange) flickerScreen();
  showNarrative(event.text);
  showChoices(event.choices.map(choice => ({ label: choice.label, action: () => resolveChoice(choice) })));
}

function resolveChoice(choice) {
  if (choice.time) advanceTime(choice.time);
  if (choice.curiosity) game.player.curiosity = Math.max(0, game.player.curiosity + choice.curiosity);
  if (choice.fuel) game.player.fuel = Math.min(100, game.player.fuel + choice.fuel);
  if (Number.isInteger(choice.radioIndex)) game.radioIndex = choice.radioIndex;
  if (choice.item) addItem(choice.item);
  updateHUD(); checkStationDiscovery();
  if (choice.ending) return endGame(choice.ending);
  showNarrative(choice.result || "You decide that is enough of that for now.");
  showChoices([{ label: "CONTINUE", action: showLocationScene }, { label: "RADIO", action: openRadio }, { label: "MAP", action: openMap }]);
}

function showLocationScene() { showNarrative(locations[game.player.location].description); showLocationActions(); }

function showLocationActions() {
  const key = game.player.location, loc = locations[key];
  const choices = [{ label: "EXPLORE AREA", action: exploreCurrentLocation }];
  loc.connections.filter(n => !locations[n].hidden || game.player.discoveredLocations.includes(n)).forEach(n => {
    choices.push({ label: `DRIVE TO ${locations[n].name}`, action: () => travelTo(n) });
  });
  if (key === "gainesville") choices.push({ label: "DRIVE HOME", action: () => endGame("home") });
  showChoices(choices);
}

// Radio -----------------------------------------------------------------------
function openRadio() { if (game.inProgress) { renderRadio(); openOverlay("radio-overlay"); } }
function tuneRadio(direction) { game.radioIndex = (game.radioIndex + direction + radioStations.length) % radioStations.length; advanceTime(1); updateHUD(); renderRadio(); }
function renderRadio() {
  const s = radioStations[game.radioIndex]; let text = s.text;
  if (s.frequency === "103.7 FM" && hasItem("coordinatesReceipt")) text = "Three tones. A voice: 'Receipt confirmed. Southbound traffic continue until the mile markers repeat.'";
  if (s.frequency === "107.9 FM" && hasItem("cassetteTape")) text = "The numbers stop. A tape hiss begins. Your cassette contains the same hiss, synchronized exactly.";
  if (s.special && game.player.discoveredLocations.includes("station17")) text += " Beneath it all, a signal pulses seventeen times.";
  document.getElementById("radio-frequency").textContent = s.frequency;
  document.getElementById("radio-text").textContent = text;
  if (s.special) flickerScreen();
}

// Map / inventory -------------------------------------------------------------
function openMap() { if (game.inProgress) { renderMap(); openOverlay("map-overlay"); } }
function renderMap() {
  const map = document.getElementById("map-content"); map.replaceChildren();
  Object.entries(locations).forEach(([key, loc]) => {
    if (loc.hidden && !game.player.discoveredLocations.includes(key)) return;
    const known = game.player.discoveredLocations.includes(key);
    const node = document.createElement("div");
    node.className = `map-node${known ? "" : " unknown"}${game.player.location === key ? " current" : ""}`;
    const title = document.createElement("strong"); title.textContent = known ? loc.name : "???";
    const small = document.createElement("small");
    const neighbors = loc.connections.filter(n => !locations[n].hidden || game.player.discoveredLocations.includes(n)).map(n => game.player.discoveredLocations.includes(n) ? locations[n].name : "???");
    small.textContent = known ? `→ ${neighbors.join(" / ") || "end of road"}` : "route not yet explored";
    node.append(title, small); map.appendChild(node);
  });
}

function openInventory() {
  if (!game.inProgress) return;
  const list = document.getElementById("inventory-list"); list.replaceChildren();
  game.player.inventory.forEach(item => { const li = document.createElement("li"); li.textContent = ITEM_LABELS[item] || item; list.appendChild(li); });
  openOverlay("inventory-overlay");
}
function addItem(item) { if (!game.player.inventory.includes(item)) { game.player.inventory.push(item); setStatus(`ITEM ACQUIRED: ${ITEM_LABELS[item] || item}`); } }
function hasItem(item) { return !!game.player && game.player.inventory.includes(item); }

// Endings ---------------------------------------------------------------------
function endGame(type) {
  cancelTravel(); game.inProgress = false; game.ending = type; closeAllOverlays();
  const text = {
    broadcast: "ENDING: THE SOURCE\n\nInside Station 17, the tape machine is recording a voice you recognize as your own. It is calmly reading tomorrow night's weather.\n\nA green light marked TRANSMIT clicks on.\nSomewhere in Florida, a car radio finds 103.7 FM.",
    home: "ENDING: HOME BEFORE SUNRISE\n\nYou turn toward Gainesville and keep driving until familiar streetlights replace the dark roads.\n\nAt home, the radio display glows 103.7 for one second after you remove the key.\nYou decide not to mention this to anyone before breakfast.",
    fuel: `ENDING: EMPTY\n\nThe engine coughs once near ${locations[game.player.location].name} and the car rolls quietly to the shoulder.\n\nThe night becomes very large without the engine running.\nFar away, a radio tower blinks seventeen times.`
  }[type];
  showNarrative(text); showChoices([{ label: "NEW NIGHT", action: restartFromEnding }, { label: "LOAD SAVED NIGHT", action: loadGame }]); setStatus("Night concluded.");
}
function restartFromEnding() { cancelTravel(); game.seed = generateSeed(); game.inProgress = false; document.getElementById("game-screen").hidden = true; document.getElementById("title-screen").hidden = false; prepareTitleSeed(); }

// Time / HUD ------------------------------------------------------------------
function advanceTime(minutes) { game.player.time += minutes; }
function maybeChangeWeather() { if (random() < .24) game.weather = randomChoice(weatherOptions); }
function formatTime(minutes) { const total = minutes % 1440, h24 = Math.floor(total / 60), min = total % 60; return `${h24 % 12 || 12}:${String(min).padStart(2, "0")} ${h24 >= 12 ? "PM" : "AM"}`; }
function fuelBar(fuel) { const n = Math.max(0, Math.min(10, Math.round(fuel / 10))); return "█".repeat(n) + "░".repeat(10 - n); }
function updateHUD() {
  const p = game.player; if (!p) return;
  document.getElementById("hud-time").textContent = formatTime(p.time);
  document.getElementById("hud-location").textContent = locations[p.location].name;
  document.getElementById("hud-weather").textContent = game.weather;
  document.getElementById("hud-fuel").textContent = fuelBar(p.fuel);
  document.getElementById("hud-fuel").setAttribute("aria-label", `Fuel ${p.fuel} percent`);
  document.getElementById("hud-miles").textContent = String(p.miles).padStart(3, "0");
  document.getElementById("hud-seed").textContent = game.seed;
}

// UI --------------------------------------------------------------------------
function showNarrative(text) {
  game.sceneText = text;
  const target = document.getElementById("narrative");
  if (typeTimer) clearInterval(typeTimer);
  target.textContent = text;
  target.setAttribute("tabindex", "-1");
  target.focus({preventScroll:true});
}
function showChoices(choices) {
  const box = document.getElementById("choices"); box.replaceChildren();
  choices.forEach(c => { const b = document.createElement("button"); b.type = "button"; b.textContent = `[ ${c.label} ]`; b.addEventListener("click", c.action); box.appendChild(b); });
}
function setStatus(text) { document.getElementById("status-message").textContent = text; }
function flickerScreen() {
  if (settings.motionDisabled || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const shell = document.querySelector(".crt-shell"); shell.classList.remove("screen-flicker"); void shell.offsetWidth; shell.classList.add("screen-flicker");
}

// Save / load -----------------------------------------------------------------
function saveGame() {
  if (!game.player) return setStatus("Nothing to save yet.");
  try { localStorage.setItem(SAVE_KEY, JSON.stringify({ version: 1, ...game })); setStatus("Night saved to this browser."); }
  catch (err) { console.error(err); setStatus("This browser blocked local saving. The night is still playable."); }
}
function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return setStatus("No saved night found in this browser.");
    const s = JSON.parse(raw);
    if (s.version !== 1 || !s.player || !locations[s.player.location]) throw Error("Invalid save");
    if (s.story && (!Array.isArray(s.story.evidence) || !Array.isArray(s.story.actionLog) || !s.story.flags || typeof s.story.flags !== "object")) throw Error("Invalid story");
    if(s.story?.decisions && Object.values(s.story.decisions).some(v=>v!==0&&v!==1)) throw Error("Invalid decisions");
    if(s.scene && !["opening","location","function","decision","result","event"].includes(s.scene.kind)) throw Error("Invalid scene");
    if(s.scene?.kind==="decision" && !decisionMoments.some(m=>m.id===s.scene.id)) throw Error("Invalid decision scene");
    if(s.scene?.kind==="function" && !Object.hasOwn(sceneFunctions,s.scene.name)) throw Error("Invalid function scene");
    if(s.story?.nightStats && (!Array.isArray(s.story.nightStats.strange)||!Array.isArray(s.story.nightStats.floridaMen))) throw Error("Invalid night statistics");
    if(s.story?.report){
      const r=s.story.report;
      if(!Object.hasOwn(NIGHT_ENDINGS,r.key)||!["epilogue","summary"].includes(r.stage)||![r.miles,r.locations,r.total,r.strange,r.floridaMen].every(n=>Number.isInteger(n)&&n>=0)) throw Error("Invalid night report");
    }
    const player = normalizePlayer(s.player);
    cancelTravel(); closeAllOverlays();
    Object.assign(game, {seed:Number(s.seed)||generateSeed(), rngState:Number(s.rngState)>>>0,
      weather:typeof s.weather === "string" ? s.weather : "Humid", player,
      radioIndex:Number.isInteger(s.radioIndex)&&s.radioIndex>=0&&s.radioIndex<radioStations.length?s.radioIndex:1,
      eventHistory:Array.isArray(s.eventHistory)?s.eventHistory:[], inProgress:s.inProgress!==false,
      story:s.story||freshStoryState(), scene:s.scene||null, ending:s.ending||null});
    document.getElementById("title-screen").hidden=true;
    document.getElementById("game-screen").hidden=false;
    updateHUD(); restoreScene(); setStatus("Saved night loaded.");
  } catch (err) { console.error(err); setStatus("The saved night could not be loaded. Your current night is unchanged."); }
}
function normalizePlayer(s) {
  const b = makePlayer();
  return {
    location: locations[s.location] ? s.location : b.location,
    fuel: Number.isFinite(s.fuel) ? Math.max(0, Math.min(100, s.fuel)) : b.fuel,
    miles: Number.isFinite(s.miles) ? Math.max(0, s.miles) : b.miles,
    time: Number.isFinite(s.time) ? s.time : b.time,
    curiosity: Number.isFinite(s.curiosity) ? Math.max(0, s.curiosity) : 0,
    inventory: Array.isArray(s.inventory) ? s.inventory.filter(i => ITEM_LABELS[i]) : b.inventory,
    visitedLocations: Array.isArray(s.visitedLocations) ? s.visitedLocations.filter(k => locations[k]) : b.visitedLocations,
    discoveredLocations: Array.isArray(s.discoveredLocations) ? s.discoveredLocations.filter(k => locations[k]) : b.discoveredLocations
  };
}

// Settings / overlays ---------------------------------------------------------
function loadSettings() { try { const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}"); return { theme: ["green", "amber", "gameboy"].includes(s.theme) ? s.theme : "green", motionDisabled: !!s.motionDisabled }; } catch { return { theme: "green", motionDisabled: false }; } }
function saveSettings() { try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch (err) { console.warn("Settings were not saved", err); } }
function applySettings() {
  document.body.classList.remove("theme-green", "theme-amber", "theme-gameboy", "no-motion"); document.body.classList.add(`theme-${settings.theme}`); if (settings.motionDisabled) document.body.classList.add("no-motion");
  document.querySelectorAll('input[name="theme"]').forEach(r => { r.checked = r.value === settings.theme; }); document.getElementById("motion-toggle").checked = settings.motionDisabled;
}
let overlayOpener = null;
function openOverlay(id) {
  closeAllOverlays(); overlayOpener=document.activeElement;
  const o=document.getElementById(id); o.hidden=false;
  document.getElementById("app").inert=true;
  o.querySelector("button, input")?.focus();
}
function closeAllOverlays() {
  document.querySelectorAll(".overlay").forEach(o=>o.hidden=true);
  document.getElementById("app").inert=false;
  if (overlayOpener?.isConnected) overlayOpener.focus();
  overlayOpener=null;
}
document.addEventListener("keydown", e=>{
  const o=document.querySelector(".overlay:not([hidden])");
  if (!o || e.key!=="Tab") return;
  const list=[...o.querySelectorAll("button,input")];
  const first=list[0],last=list[list.length-1];
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
});

// Sanity checks ---------------------------------------------------------------
function validateData() {
  Object.entries(locations).forEach(([k, loc]) => loc.connections.forEach(n => { if (!locations[n]) console.warn(`${k} links to missing ${n}`); }));
  events.forEach(e => { e.locations.forEach(k => { if (!locations[k]) console.warn(`${e.id} references missing ${k}`); }); if (!e.choices?.length) console.warn(`${e.id} has no choices`); });
}

function init() {
  validateData(); applySettings(); prepareTitleSeed();
  document.getElementById("begin-button").onclick = beginNight;
  document.getElementById("radio-button").onclick = openRadio;
  document.getElementById("map-button").onclick = openMap;
  document.getElementById("inventory-button").onclick = openInventory;
  document.getElementById("save-button").onclick = saveGame;
  document.getElementById("load-button").onclick = loadGame;
  document.getElementById("new-button").onclick = newNight;
  document.getElementById("settings-button").onclick = () => openOverlay("settings-overlay");
  document.getElementById("tune-down").onclick = () => tuneRadio(-1);
  document.getElementById("tune-up").onclick = () => tuneRadio(1);
  document.querySelectorAll("[data-close]").forEach(b => b.onclick = closeAllOverlays);
  document.querySelectorAll('input[name="theme"]').forEach(r => r.onchange = () => { settings.theme = r.value; applySettings(); saveSettings(); });
  document.getElementById("motion-toggle").onchange = e => { settings.motionDisabled = e.target.checked; applySettings(); saveSettings(); };
  document.querySelectorAll(".overlay").forEach(o => o.onclick = e => { if (e.target === o) closeAllOverlays(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeAllOverlays(); });
}

document.addEventListener("DOMContentLoaded", init);

