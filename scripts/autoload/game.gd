extends Node
## Central game state: stats, progression, economy, time, relationships,
## inventory, reputation, phone data. Everything here is saved by SaveManager.
## Every stat / coin / EXP change goes through a function that records it in
## the System History, so nothing changes silently or randomly.

const STATS := ["strength", "speed", "durability", "agility", "intelligence", "stamina", "energy", "power_mastery"]
const STAT_NAMES := {
	"strength": "Strength", "speed": "Speed", "durability": "Durability", "agility": "Agility",
	"intelligence": "Intelligence", "stamina": "Stamina", "energy": "Energy", "power_mastery": "Power Mastery",
}
const REL_KEYS := ["friendship", "trust", "respect", "familiarity", "rivalry"]
const SLOTS := ["Morning", "Afternoon", "Evening", "Night"]
const WEEKDAYS := ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const MONTHS := ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
const MONTH_DAYS := [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
const RANKS := [
	["Unranked", 0], ["Beginner", 40], ["E Rank", 60], ["D Rank", 90], ["C Rank", 130], ["B Rank", 180],
	["A Rank", 250], ["S Rank", 350], ["SS Rank", 500], ["SSS Rank", 800], ["Transcendent", 1500],
]
const REP_KEYS := ["combat", "school", "hero", "public", "crew_influence"]

var s: Dictionary = {}
var active := false   # true while a game is loaded


func _ready() -> void:
	s = default_state()


func _process(delta: float) -> void:
	if active:
		s["playtime"] = float(s.get("playtime", 0.0)) + delta


# ---------------------------------------------------------------- state
func default_state() -> Dictionary:
	var rel := {}
	for id in Data.characters.keys():
		var ch: Dictionary = Data.characters[id]
		if ch.has("rel_start"):
			rel[id] = _rel_from(ch.rel_start)
	return {
		"player": {
			"name": "Peter Parker", "age": 16, "birth_month": 8, "birth_day": 10,
			"appearance": {"hair_style": 0, "hair_color": 0, "eye_color": 0, "skin": 1, "beard": 0, "outfit": 0, "shoes": 0, "accessory": 0},
		},
		"level": 1, "exp": 0, "coins": 120, "stat_points": 0, "skill_points": 0,
		"stats": {"strength": 3, "speed": 4, "durability": 3, "agility": 4, "intelligence": 18, "stamina": 4, "energy": 2, "power_mastery": 0},
		"hp": -1, "energy_now": -1,
		"flags": {},
		"story": {"next": "c0_intro", "chapter": 0},
		"quests": {"list": {}, "done": {}, "counter": 0, "daily_day": -1, "tracked": ""},
		"cards": {}, "loadout": [],
		"inventory": {}, "equipment": {"outfit": "", "costume": "", "shoes": "", "accessory": "", "weapon": ""},
		"relationships": rel, "memories": {}, "talked_today": {},
		"date": {"day_index": 0, "year": 2125, "month": 4, "day": 7}, "time_slot": 0,
		"location": "home_bedroom",
		"reputation": {"combat": 0, "school": 0, "hero": 0, "public": 0, "crew_influence": 0},
		"messages": {}, "unread": {}, "fired_messages": {},
		"news": [], "social": {"posts": [], "followers": 12},
		"notifications": [], "history": [], "transactions": [], "savings": 0,
		"appointments": [], "pending_calls": {},
		"houses": {"owned": ["gov_apartment"], "current": "gov_apartment", "furniture": {}},
		"pets": [], "vehicles": [], "jobs": {},
		"achievements": {}, "titles": {"owned": [], "equipped": ""},
		"shadows": {}, "formation": [],
		"ring": {"unlocked": false, "level": 1, "mastery": 0, "energy": 100, "aura": "white", "auras": ["white"]},
		"gallery": {"scenes": {}, "backgrounds": {}, "characters": {"peter": true, "mother": true}},
		"contacts": ["mother"],
		"stats_counters": {"quests_done": 0, "coins_earned": 0, "battles_won": 0, "competitions": 0},
		"playtime": 0.0, "era": "teen",
	}


func _rel_from(src) -> Dictionary:
	var r := {"friendship": 0, "trust": 0, "respect": 0, "familiarity": 0, "rivalry": 0}
	if src is Dictionary:
		for k in src.keys():
			r[k] = int(src[k])
	return r


func new_game(appearance: Dictionary) -> void:
	s = default_state()
	s.player.appearance = appearance.duplicate(true)
	active = true
	log_history("A new life begins on Nexa.")
	add_news("intro_day", false)
	Events.stats_changed.emit()
	Events.coins_changed.emit()


func load_state(state: Dictionary) -> void:
	s = state
	active = true
	Events.stats_changed.emit()
	Events.coins_changed.emit()
	Events.time_changed.emit()


func player_name() -> String:
	return str(s.get("player", {}).get("name", "Peter Parker"))


# ---------------------------------------------------------------- flags & conditions
func set_flag(f: String, v: bool = true) -> void:
	if v:
		s.flags[f] = true
	else:
		s.flags.erase(f)


func has_flag(f: String) -> bool:
	return bool(s.flags.get(f, false))


func check_cond(c) -> bool:
	## Evaluates a condition dictionary from story/quest/dialogue data.
	if not (c is Dictionary) or c.is_empty():
		return true
	for key in c.keys():
		var v = c[key]
		var ok := true
		match key:
			"flag": ok = has_flag(str(v))
			"flags": ok = (v as Array).all(func(x): return has_flag(str(x)))
			"not_flag": ok = not has_flag(str(v))
			"rel_gt": ok = rel_get(str(v[0]), str(v[1])) > int(v[2])
			"rel_lt": ok = rel_get(str(v[0]), str(v[1])) < int(v[2])
			"card": ok = Cards.owns(str(v))
			"not_card": ok = not Cards.owns(str(v))
			"quest_done": ok = Quests.is_done(str(v))
			"quest_active": ok = Quests.is_active(str(v))
			"stat_gt": ok = get_stat(str(v[0])) > int(v[1])
			"level_gt": ok = int(s.level) > int(v)
			"chapter_gt": ok = int(s.story.get("chapter", 0)) > int(v)
			"chapter_lt": ok = int(s.story.get("chapter", 0)) < int(v)
			"era": ok = str(s.era) == str(v)
			"min_day": ok = int(s.date.day_index) >= int(v)
			"coins_gt": ok = int(s.coins) > int(v)
			"weekday": ok = is_weekday()
			"weekend": ok = not is_weekday()
			"slot_in": ok = int(s.time_slot) in (v as Array).map(func(x): return int(x))
			"has_item": ok = has_item(str(v))
			"rep_gt": ok = int(s.reputation.get(str(v[0]), 0)) > int(v[1])
			"rank_at_least": ok = rank_index() >= int(v)
			"location": ok = str(s.location) == str(v)
			"system": ok = has_flag("system_active") == bool(v)
			"chance": ok = randf() < float(v)
			_: ok = true
		if not ok:
			return false
	return true


# ---------------------------------------------------------------- stats & progression
func base_stat(st: String) -> int:
	return int(s.stats.get(st, 0))


func get_stat(st: String) -> int:
	var total := base_stat(st)
	total += Cards.passive_bonus(st)
	for slot in s.equipment.keys():
		var item_id := str(s.equipment[slot])
		if item_id != "":
			total += int(Data.items.get(item_id, {}).get("stats", {}).get(st, 0))
	var t := str(s.titles.get("equipped", ""))
	if t != "":
		total += int(Data.titles.get(t, {}).get("bonus", {}).get(st, 0))
	if s.ring.get("unlocked", false):
		total += int(s.ring.get("level", 1)) * int({"energy": 4, "power_mastery": 3, "durability": 2}.get(st, 0))
	return total


func add_stat(st: String, amount: int, reason: String) -> void:
	if not s.stats.has(st) or amount == 0:
		return
	s.stats[st] = max(0, int(s.stats[st]) + amount)
	log_history("%s %s%d (%s)" % [STAT_NAMES.get(st, st), "+" if amount > 0 else "", amount, reason])
	Events.stats_changed.emit()
	check_achievements()


func spend_stat_point(st: String) -> bool:
	if int(s.stat_points) <= 0:
		return false
	s.stat_points = int(s.stat_points) - 1
	add_stat(st, 1, "stat point allocated")
	return true


func exp_to_next() -> int:
	return 40 + int(s.level) * 30


func add_exp(amount: int, reason: String) -> void:
	if amount <= 0:
		return
	s.exp = int(s.exp) + amount
	log_history("+%d EXP (%s)" % [amount, reason])
	while int(s.exp) >= exp_to_next():
		s.exp = int(s.exp) - exp_to_next()
		s.level = int(s.level) + 1
		s.stat_points = int(s.stat_points) + 3
		s.skill_points = int(s.skill_points) + 1
		log_history("LEVEL UP -> Lv.%d (+3 stat points, +1 skill point)" % int(s.level))
		Audio.play_sfx("levelup")
		Events.level_up.emit(int(s.level))
		notify("LEVEL UP! You reached Lv.%d" % int(s.level), "system")
	Events.stats_changed.emit()
	check_achievements()


func power_score() -> int:
	var total := 0
	for st in STATS:
		total += get_stat(st) / 2 if st == "intelligence" else get_stat(st)
	return total + int(s.level) * 2


func rank_index() -> int:
	var p := power_score()
	var idx := 0
	for i in RANKS.size():
		if p >= int(RANKS[i][1]):
			idx = i
	return idx


func rank_name() -> String:
	return str(RANKS[rank_index()][0])


func max_hp() -> int:
	return 60 + get_stat("durability") * 6 + int(s.level) * 4


func max_energy() -> int:
	return 40 + get_stat("energy") * 4 + get_stat("stamina") * 2


func hp() -> int:
	return max_hp() if int(s.hp) < 0 else min(int(s.hp), max_hp())


func energy_now() -> int:
	return max_energy() if int(s.energy_now) < 0 else min(int(s.energy_now), max_energy())


func use_energy(n: int) -> bool:
	if energy_now() < n:
		return false
	s.energy_now = energy_now() - n
	Events.stats_changed.emit()
	return true


func restore(hp_amt: int = -1, en_amt: int = -1) -> void:
	s.hp = -1 if hp_amt < 0 else min(max_hp(), hp() + hp_amt)
	s.energy_now = -1 if en_amt < 0 else min(max_energy(), energy_now() + en_amt)
	Events.stats_changed.emit()


# ---------------------------------------------------------------- economy
func add_coins(n: int, reason: String) -> void:
	if n == 0:
		return
	s.coins = int(s.coins) + n
	if n > 0:
		s.stats_counters.coins_earned = int(s.stats_counters.coins_earned) + n
	s.transactions.push_front({"day": int(s.date.day_index), "amount": n, "reason": reason})
	if s.transactions.size() > 60:
		s.transactions.resize(60)
	log_history("%s%d Nexa Coins (%s)" % ["+" if n > 0 else "", n, reason])
	Events.coins_changed.emit()


func spend_coins(n: int, reason: String) -> bool:
	if int(s.coins) < n:
		notify("Not enough Nexa Coins (need %d)." % n, "warn")
		return false
	add_coins(-n, reason)
	return true


func add_item(id: String, qty: int = 1) -> void:
	s.inventory[id] = int(s.inventory.get(id, 0)) + qty
	if int(s.inventory[id]) <= 0:
		s.inventory.erase(id)


func has_item(id: String) -> bool:
	return int(s.inventory.get(id, 0)) > 0


func remove_item(id: String, qty: int = 1) -> bool:
	if int(s.inventory.get(id, 0)) < qty:
		return false
	add_item(id, -qty)
	return true


func equip(item_id: String) -> void:
	var it: Dictionary = Data.items.get(item_id, {})
	var slot := str(it.get("slot", ""))
	if slot == "" or not s.equipment.has(slot):
		return
	s.equipment[slot] = item_id
	Events.stats_changed.emit()


func unequip(slot: String) -> void:
	s.equipment[slot] = ""
	Events.stats_changed.emit()


func grant_rewards(r: Dictionary, source: String) -> void:
	if r.is_empty():
		return
	if r.has("exp"):
		add_exp(int(r.exp), source)
	if r.has("coins"):
		add_coins(int(r.coins), source)
	if r.has("stat_points"):
		s.stat_points = int(s.stat_points) + int(r.stat_points)
		log_history("+%d stat points (%s)" % [int(r.stat_points), source])
	if r.has("skill_points"):
		s.skill_points = int(s.skill_points) + int(r.skill_points)
		log_history("+%d skill points (%s)" % [int(r.skill_points), source])
	for st in r.get("stats", {}).keys():
		add_stat(st, int(r.stats[st]), source)
	for id in r.get("items", {}).keys():
		add_item(id, int(r.items[id]))
		log_history("Received %s x%d (%s)" % [Data.items.get(id, {}).get("name", id), int(r.items[id]), source])
	for npc in r.get("rel", {}).keys():
		for k in r.rel[npc].keys():
			rel_add(npc, k, int(r.rel[npc][k]))
	for k in r.get("rep", {}).keys():
		add_rep(k, int(r.rep[k]))
	for f in r.get("flags", []):
		set_flag(str(f))
	if r.has("title"):
		grant_title(str(r.title))
	if r.has("ring_mastery"):
		s.ring.mastery = mini(100, int(s.ring.mastery) + int(r.ring_mastery))
	for c in r.get("cards", []):
		Cards.grant(str(c), source)
	if r.has("card_random"):
		Cards.grant_random(str(r.card_random), source)
	Events.stats_changed.emit()


# ---------------------------------------------------------------- relationships & reputation
func rel_get(npc: String, key: String) -> int:
	return int(s.relationships.get(npc, {}).get(key, 0))


func rel_add(npc: String, key: String, amount: int) -> void:
	if not s.relationships.has(npc):
		s.relationships[npc] = _rel_from({})
	s.relationships[npc][key] = clampi(rel_get(npc, key) + amount, 0, 100)
	Events.relationship_changed.emit(npc)


func remember(npc: String, tag: String) -> void:
	if not s.memories.has(npc):
		s.memories[npc] = []
	if not (tag in s.memories[npc]):
		s.memories[npc].append(tag)


func remembers(npc: String, tag: String) -> bool:
	return tag in s.memories.get(npc, [])


func add_rep(key: String, amount: int) -> void:
	s.reputation[key] = clampi(int(s.reputation.get(key, 0)) + amount, -100, 1000)
	if key == "public":
		s.social.followers = max(0, int(s.social.followers) + amount * 25)


func add_contact(npc: String) -> void:
	if not (npc in s.contacts):
		s.contacts.append(npc)
		s.gallery.characters[npc] = true


func unlock_character(npc: String) -> void:
	s.gallery.characters[npc] = true


# ---------------------------------------------------------------- time
func is_weekday() -> bool:
	return weekday_index() < 5


func weekday_index() -> int:
	return int(s.date.day_index) % 7


func date_string() -> String:
	var d: Dictionary = s.date
	return "%s, %d %s %d" % [WEEKDAYS[weekday_index()], int(d.day), MONTHS[int(d.month) - 1], int(d.year)]


func slot_name() -> String:
	return SLOTS[int(s.time_slot)]


func is_night() -> bool:
	return int(s.time_slot) >= 3


func advance_slot(n: int = 1) -> void:
	for i in n:
		if int(s.time_slot) >= 3:
			new_day()
		else:
			s.time_slot = int(s.time_slot) + 1
			check_npc_messages(["afternoon", "evening", "night"][int(s.time_slot) - 1])
	Events.time_changed.emit()


func sleep() -> void:
	new_day()
	Events.time_changed.emit()


func advance_days(n: int) -> void:
	for i in n:
		new_day()
	Events.time_changed.emit()


func new_day() -> void:
	var d: Dictionary = s.date
	d.day_index = int(d.day_index) + 1
	d.day = int(d.day) + 1
	if int(d.day) > MONTH_DAYS[int(d.month) - 1]:
		d.day = 1
		d.month = int(d.month) + 1
		if int(d.month) > 12:
			d.month = 1
			d.year = int(d.year) + 1
	s.time_slot = 0
	s.talked_today = {}
	restore()
	if int(d.month) == int(s.player.birth_month) and int(d.day) == int(s.player.birth_day):
		s.player.age = int(s.player.age) + 1
		notify("Happy birthday! You are now %d." % int(s.player.age), "event")
		log_history("Birthday: age %d" % int(s.player.age))
	# pets
	for p in s.pets:
		p.hunger = clampi(int(p.hunger) - 20, 0, 100)
		p.happiness = clampi(int(p.happiness) - (15 if int(p.hunger) < 30 else 6), 0, 100)
	# savings interest (0.1% per day)
	if int(s.savings) > 0:
		var interest := int(int(s.savings) * 0.001)
		if interest > 0:
			s.savings = int(s.savings) + interest
	# expire old appointments
	s.appointments = s.appointments.filter(func(a): return int(a.day) >= int(d.day_index))
	Quests.on_new_day()
	if not _news_today():
		add_daily_news()
	check_npc_messages(["morning"])
	Events.fire("new_day", {"day": int(d.day_index)})


func time_skip_years(years: int) -> void:
	s.player.age = int(s.player.age) + years
	s.date.year = int(s.date.year) + years
	s.date.day_index = int(s.date.day_index) + years * 365
	s.era = "adult"
	log_history("%d years passed. Age: %d" % [years, int(s.player.age)])
	Events.time_changed.emit()


# ---------------------------------------------------------------- notifications, history, news, messages
func notify(text: String, kind: String = "info") -> void:
	if not active:
		return
	s.notifications.push_front({"t": text, "kind": kind, "day": int(s.date.day_index), "slot": int(s.time_slot)})
	if s.notifications.size() > 80:
		s.notifications.resize(80)
	Events.notify.emit(text, kind)


func log_history(text: String) -> void:
	s.history.push_front({"t": text, "day": int(s.date.day_index)})
	if s.history.size() > 200:
		s.history.resize(200)


func _news_today() -> bool:
	return s.news.size() > 0 and int(s.news[0].day) == int(s.date.day_index)


func add_news(key: String, with_notify: bool = true) -> void:
	var ev: Dictionary = Data.news.get("events", {}).get(key, {})
	if ev.is_empty():
		return
	s.news.push_front({"day": int(s.date.day_index), "headline": str(ev.get("headline", "")), "body": str(ev.get("body", ""))})
	if s.news.size() > 60:
		s.news.resize(60)
	for post in ev.get("social", []):
		add_social_post(str(post.get("author", "nexa_daily")), str(post.get("t", "")), int(post.get("likes", 100)))
	if with_notify:
		notify("News: " + str(ev.get("headline", "")), "news")


func add_daily_news() -> void:
	var pool: Array = Data.news.get("daily", []).filter(func(n): return check_cond(n.get("if", {})))
	if pool.is_empty():
		return
	var n: Dictionary = pool[int(s.date.day_index) % pool.size()]
	s.news.push_front({"day": int(s.date.day_index), "headline": str(n.headline), "body": str(n.get("body", ""))})
	if s.news.size() > 60:
		s.news.resize(60)


func add_social_post(author: String, text: String, likes: int = 50, mine: bool = false) -> void:
	s.social.posts.push_front({"author": author, "t": text, "likes": likes, "liked": false, "comments": [], "day": int(s.date.day_index), "mine": mine})
	if s.social.posts.size() > 60:
		s.social.posts.resize(60)


func receive_message(npc: String, text: String) -> void:
	if not s.messages.has(npc):
		s.messages[npc] = []
	s.messages[npc].append({"from": npc, "t": text, "day": int(s.date.day_index)})
	s.unread[npc] = int(s.unread.get(npc, 0)) + 1
	add_contact(npc)
	Audio.play_sfx("message")
	notify("New message from %s" % Data.char_name(npc), "message")
	Events.message_received.emit(npc)


func send_message(npc: String, text: String) -> void:
	if not s.messages.has(npc):
		s.messages[npc] = []
	s.messages[npc].append({"from": "me", "t": text, "day": int(s.date.day_index)})


func check_npc_messages(triggers: Array) -> void:
	if not active:
		return
	for m in Data.npc_messages:
		var trig := str(m.get("trigger", ""))
		if not (trig in triggers):
			continue
		var mid := str(m.get("id", ""))
		if bool(m.get("once", true)) and s.fired_messages.has(mid):
			continue
		if not check_cond(m.get("if", {})):
			continue
		if randf() > float(m.get("chance", 1.0)):
			continue
		s.fired_messages[mid] = int(s.date.day_index)
		receive_message(str(m.from), str(m.t))
		if m.has("invite"):
			var inv: Dictionary = m.invite
			s.appointments.append({"day": int(s.date.day_index) + int(inv.get("in_days", 1)), "npc": str(m.from), "location": str(inv.location), "title": str(inv.title), "slot": int(inv.get("slot", 1))})
		if m.has("call"):
			s.pending_calls[str(m.from)] = str(m.call)


# ---------------------------------------------------------------- titles & achievements
func grant_title(id: String) -> void:
	if id in s.titles.owned:
		return
	s.titles.owned.append(id)
	notify("Title acquired: %s" % Data.titles.get(id, {}).get("name", id), "system")
	log_history("Title acquired: %s" % Data.titles.get(id, {}).get("name", id))


func check_achievements() -> void:
	if not active:
		return
	for id in Data.achievements.keys():
		if s.achievements.has(id):
			continue
		var a: Dictionary = Data.achievements[id]
		var c: Dictionary = a.get("req", {})
		var ok := true
		for k in c.keys():
			match k:
				"quests_done": ok = ok and int(s.stats_counters.quests_done) >= int(c[k])
				"cards": ok = ok and s.cards.size() >= int(c[k])
				"special_cards": ok = ok and Cards.special_count() >= int(c[k])
				"shadows": ok = ok and s.shadows.size() >= int(c[k])
				"level": ok = ok and int(s.level) >= int(c[k])
				"rank": ok = ok and rank_index() >= int(c[k])
				"coins_earned": ok = ok and int(s.stats_counters.coins_earned) >= int(c[k])
				"battles_won": ok = ok and int(s.stats_counters.battles_won) >= int(c[k])
				"competitions": ok = ok and int(s.stats_counters.competitions) >= int(c[k])
				"pets": ok = ok and s.pets.size() >= int(c[k])
				"houses": ok = ok and s.houses.owned.size() >= int(c[k])
				"flag": ok = ok and has_flag(str(c[k]))
		if ok:
			s.achievements[id] = int(s.date.day_index)
			notify("Achievement: %s" % a.get("name", id), "achievement")
			Audio.play_sfx("quest")
			if a.has("title"):
				grant_title(str(a.title))
			if a.has("reward"):
				grant_rewards(a.reward, "achievement")
			Events.achievement_unlocked.emit(id)


# ---------------------------------------------------------------- shadows & ring
func add_shadow(id: String) -> void:
	if s.shadows.has(id) or not Data.shadows.has(id):
		return
	s.shadows[id] = {"level": 1, "exp": 0, "equip": ""}
	if s.formation.size() < 3:
		s.formation.append(id)
	notify("ARISE! %s joined your Shadow Army." % Data.shadows[id].get("name", id), "system")
	Events.fire("shadow_extracted")
	log_history("Shadow extracted: %s" % Data.shadows[id].get("name", id))
	check_achievements()


func shadow_power(id: String) -> int:
	var d: Dictionary = Data.shadows.get(id, {})
	var lv := int(s.shadows.get(id, {}).get("level", 1))
	var eq := str(s.shadows.get(id, {}).get("equip", ""))
	var bonus := int(Data.items.get(eq, {}).get("shadow_power", 0)) if eq != "" else 0
	return int(d.get("power", 10)) + (lv - 1) * int(d.get("growth", 4)) + bonus


func portrait_costume(char_id: String) -> String:
	if char_id == "peter" and str(s.get("era", "teen")) == "adult":
		return "adult"
	return ""
