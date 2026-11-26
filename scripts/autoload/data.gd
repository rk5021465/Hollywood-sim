extends Node
## Loads all editable game content from res://data/*.json.
## Edit the JSON files to add characters, cards, quests, story scenes, etc.

var characters: Dictionary = {}
var crews: Dictionary = {}
var enemies: Dictionary = {}
var shadows: Dictionary = {}
var cards: Dictionary = {}
var card_combos: Array = []
var quests: Dictionary = {}
var competitions: Dictionary = {}
var items: Dictionary = {}
var pets: Dictionary = {}
var houses: Dictionary = {}
var shops: Dictionary = {}
var locations: Dictionary = {}
var districts: Dictionary = {}
var talk: Dictionary = {}
var calls: Dictionary = {}
var npc_messages: Array = []
var news: Dictionary = {}
var jobs: Dictionary = {}
var achievements: Dictionary = {}
var titles: Dictionary = {}
var calendar: Dictionary = {}
var asset_registry: Dictionary = {}
var scenes: Dictionary = {}      # scene_id -> scene dict
var chapters: Array = []         # [{n, title, file}]
var load_errors: Array = []

const RARITIES := ["common", "uncommon", "rare", "epic", "legendary", "mythical", "transcendent", "beyond_transcendent"]
const RARITY_NAMES := {
	"common": "Common", "uncommon": "Uncommon", "rare": "Rare", "epic": "Epic",
	"legendary": "Legendary", "mythical": "Mythical", "transcendent": "Transcendent",
	"beyond_transcendent": "Beyond Transcendent",
}
const RARITY_COLORS := {
	"common": Color("b8c0cc"), "uncommon": Color("4cd07d"), "rare": Color("3fa9ff"),
	"epic": Color("b76bff"), "legendary": Color("ffb21f"), "mythical": Color("ff4f7b"),
	"transcendent": Color("fff4c2"), "beyond_transcendent": Color("ffffff"),
}


func _ready() -> void:
	var c = load_json("res://data/characters/characters.json")
	characters = c.get("characters", {})
	crews = c.get("crews", {})
	var e = load_json("res://data/characters/enemies.json")
	enemies = e.get("enemies", {})
	shadows = e.get("shadows", {})
	var cd = load_json("res://data/cards/cards.json")
	cards = cd.get("cards", {})
	card_combos = cd.get("combos", [])
	var q = load_json("res://data/quests/quests.json")
	quests = q.get("quests", {})
	competitions = q.get("competitions", {})
	var it = load_json("res://data/items/items.json")
	items = it.get("items", {})
	pets = it.get("pets", {})
	houses = it.get("houses", {})
	shops = load_json("res://data/shops/shops.json").get("shops", {})
	var loc = load_json("res://data/locations/locations.json")
	locations = loc.get("locations", {})
	districts = loc.get("districts", {})
	talk = load_json("res://data/dialogue/npc_talk.json").get("talk", {})
	calls = load_json("res://data/dialogue/calls.json").get("calls", {})
	npc_messages = load_json("res://data/dialogue/npc_messages.json").get("messages", [])
	news = load_json("res://data/news/news.json")
	jobs = load_json("res://data/jobs/jobs.json").get("jobs", {})
	var pr = load_json("res://data/progression/achievements.json")
	achievements = pr.get("achievements", {})
	titles = pr.get("titles", {})
	calendar = load_json("res://data/calendar/calendar.json")
	asset_registry = load_json("res://data/asset_registry.json").get("assets", {})
	var ch = load_json("res://data/story/chapters.json")
	chapters = ch.get("chapters", [])
	for chap in chapters:
		var file_data = load_json("res://data/story/" + str(chap.get("file", "")))
		for sc in file_data.get("scenes", []):
			sc["chapter"] = int(chap.get("n", 0))
			scenes[str(sc.get("id", ""))] = sc
	if load_errors.size() > 0:
		push_warning("Data load problems: %s" % str(load_errors))


func load_json(path: String) -> Dictionary:
	## Loads a JSON file. Never crashes: returns {} and logs on failure.
	var text := ""
	if FileAccess.file_exists(path):
		var f := FileAccess.open(path, FileAccess.READ)
		if f:
			text = f.get_as_text()
	else:
		# Exported builds may store JSON as an imported resource.
		if ResourceLoader.exists(path):
			var res = load(path)
			if res is JSON:
				return res.data if res.data is Dictionary else {}
		load_errors.append("missing: " + path)
		return {}
	var parsed = JSON.parse_string(text)
	if parsed is Dictionary:
		return parsed
	load_errors.append("invalid JSON: " + path)
	push_error("Invalid JSON in " + path)
	return {}


func character(id: String) -> Dictionary:
	return characters.get(id, {"name": id.capitalize(), "color": "8899aa"})


func char_name(id: String) -> String:
	if id == "peter":
		return Game.player_name()
	return str(character(id).get("name", id.capitalize()))


func card(id: String) -> Dictionary:
	return cards.get(id, {})


func rarity_index(r: String) -> int:
	return max(0, RARITIES.find(r))
