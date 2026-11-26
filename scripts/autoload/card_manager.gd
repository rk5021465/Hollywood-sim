extends Node
## Ability card collection: granting, duplicates, levels, upgrades,
## evolution (Beyond Transcendent), combinations and the 4-slot skill loadout.

const LOADOUT_SIZE := 4


func owned() -> Dictionary:
	return Game.s.cards


func owns(id: String) -> bool:
	return owned().has(id)


func level(id: String) -> int:
	return int(owned().get(id, {}).get("level", 0))


func max_level(id: String) -> int:
	return int(Data.card(id).get("max_level", 10))


func exp_needed(id: String) -> int:
	return 20 * max(1, level(id)) * (Data.rarity_index(str(Data.card(id).get("rarity", "common"))) + 1)


func special_count() -> int:
	var n := 0
	for id in owned().keys():
		if bool(Data.card(id).get("special", false)):
			n += 1
	return n


func grant(id: String, source: String = "") -> void:
	var def := Data.card(id)
	if def.is_empty():
		push_warning("Unknown card: " + id)
		return
	if owns(id):
		var bonus := 30 * (Data.rarity_index(str(def.get("rarity", "common"))) + 1)
		add_card_exp(id, bonus)
		Game.notify("Duplicate %s converted into %d card EXP." % [def.get("name", id), bonus], "card")
		return
	owned()[id] = {"level": 1, "exp": 0, "obtained": int(Game.s.date.day_index)}
	if def.has("active") and Game.s.loadout.size() < LOADOUT_SIZE:
		Game.s.loadout.append(id)
	Game.log_history("Card obtained: %s [%s]%s" % [def.get("name", id), Data.RARITY_NAMES.get(str(def.get("rarity", "")), ""), (" — " + source) if source != "" else ""])
	Events.card_granted.emit(id, true)
	Events.stats_changed.emit()
	Events.fire("card:" + id)
	Game.check_achievements()


func grant_random(rarity: String, source: String = "") -> void:
	var pool: Array = []
	var fallback: Array = []
	for id in Data.cards.keys():
		var c: Dictionary = Data.cards[id]
		if bool(c.get("basic", false)) and str(c.get("rarity", "")) == rarity:
			fallback.append(id)
			if not owns(id):
				pool.append(id)
	if pool.size() > 0:
		grant(str(pool.pick_random()), source)
	elif fallback.size() > 0:
		grant(str(fallback.pick_random()), source)
	else:
		Game.add_coins(100, "card pack refund")


func add_card_exp(id: String, amount: int) -> void:
	if not owns(id):
		return
	var c: Dictionary = owned()[id]
	c.exp = int(c.exp) + amount
	while int(c.level) < max_level(id) and int(c.exp) >= exp_needed(id):
		c.exp = int(c.exp) - exp_needed(id)
		c.level = int(c.level) + 1
		Game.notify("%s reached Lv.%d" % [Data.card(id).get("name", id), int(c.level)], "card")
		Game.log_history("Card level up: %s Lv.%d" % [Data.card(id).get("name", id), int(c.level)])
	if int(c.level) >= max_level(id):
		c.exp = 0
	Events.stats_changed.emit()


func upgrade_cost(id: String) -> int:
	return 1 + level(id) / 3


func upgrade(id: String) -> bool:
	if not owns(id) or level(id) >= max_level(id):
		return false
	var cost := upgrade_cost(id)
	if int(Game.s.skill_points) < cost:
		Game.notify("Need %d skill points." % cost, "warn")
		return false
	Game.s.skill_points = int(Game.s.skill_points) - cost
	Game.log_history("Spent %d skill points upgrading %s" % [cost, Data.card(id).get("name", id)])
	add_card_exp(id, exp_needed(id) - int(owned()[id].exp))
	return true


func can_evolve(id: String) -> bool:
	var def := Data.card(id)
	return owns(id) and def.has("evolves_to") and level(id) >= max_level(id) and Game.check_cond(def.get("evolve_req", {})) and not owns(str(def.evolves_to))


func evolve(id: String) -> void:
	if not can_evolve(id):
		return
	var to := str(Data.card(id).evolves_to)
	var idx: int = Game.s.loadout.find(id)
	owned().erase(id)
	if idx >= 0:
		Game.s.loadout.remove_at(idx)
	Game.log_history("Card evolved: %s -> %s" % [Data.card(id).get("name", id), Data.card(to).get("name", to)])
	grant(to, "evolution")
	if idx >= 0 and not (to in Game.s.loadout) and Data.card(to).has("active"):
		Game.s.loadout.insert(min(idx, Game.s.loadout.size()), to)


func available_combos() -> Array:
	var out: Array = []
	for combo in Data.card_combos:
		if owns(str(combo.a)) and owns(str(combo.b)) and not owns(str(combo.result)):
			out.append(combo)
	return out


func combine(combo: Dictionary) -> bool:
	var req := int(combo.get("req_level", 5))
	if level(str(combo.a)) < req or level(str(combo.b)) < req:
		Game.notify("Both cards must be Lv.%d or higher." % req, "warn")
		return false
	grant(str(combo.result), "card combination")
	return true


func passive_bonus(stat: String) -> int:
	var total := 0.0
	for id in owned().keys():
		var p: Dictionary = Data.card(id).get("passive", {})
		if p.has(stat):
			total += float(p[stat]) * (1.0 + (level(id) - 1) * 0.25)
	return int(round(total))


func toggle_loadout(id: String) -> void:
	var lo: Array = Game.s.loadout
	if id in lo:
		lo.erase(id)
	elif lo.size() < LOADOUT_SIZE and Data.card(id).has("active"):
		lo.append(id)
	else:
		Game.notify("Loadout full (4). Remove a card first.", "warn")
	Events.stats_changed.emit()


func training_bonus(kind: String) -> int:
	## Extra stat gain from cards that boost training/learning.
	var bonus := 0
	for id in owned().keys():
		var tb: Dictionary = Data.card(id).get("training_bonus", {})
		bonus += int(tb.get(kind, 0))
	return bonus
