extends Node
## Dynamic quest engine.
## Templates live in data/quests/quests.json. Quests progress when gameplay
## events fire (Events.fire("attend_class")). Daily quests are generated each
## morning from the pool according to context (weekday, chapter, era, flags).
## Situational quests are offered when a matching event happens in the world.

const TYPES := ["main", "special", "emergency", "daily", "side"]
const DIFFICULTY := ["E", "D", "C", "B", "A", "S", "SS", "SSS"]


func _ready() -> void:
	Events.game_event.connect(on_event)


func q() -> Dictionary:
	return Game.s.quests


func tpl(id: String) -> Dictionary:
	return Data.quests.get(id, {})


func is_done(tpl_id: String) -> bool:
	return q().done.has(tpl_id)


func is_active(tpl_id: String) -> bool:
	for inst in q().list.values():
		if str(inst.tpl) == tpl_id and str(inst.status) == "active":
			return true
	return false


func is_present(tpl_id: String) -> bool:
	for inst in q().list.values():
		if str(inst.tpl) == tpl_id and str(inst.status) in ["active", "offered"]:
			return true
	return false


func list_by_type(t: String) -> Array:
	var out: Array = []
	for inst in q().list.values():
		if str(inst.type) == t:
			out.append(inst)
	out.sort_custom(func(a, b): return int(a.created) > int(b.created))
	return out


func active_quests() -> Array:
	return q().list.values().filter(func(i): return str(i.status) == "active")


func offer(tpl_id: String, auto_accept: bool = false) -> String:
	var t := tpl(tpl_id)
	if t.is_empty():
		push_warning("Unknown quest template: " + tpl_id)
		return ""
	var daily := str(t.get("type", "side")) == "daily"
	if not daily and not bool(t.get("repeatable", false)) and (is_done(tpl_id) or is_present(tpl_id)):
		return ""
	if daily and is_present(tpl_id):
		return ""
	q().counter = int(q().counter) + 1
	var inst_id := "%s_%d" % [tpl_id, int(q().counter)]
	var objs: Array = []
	for o in t.get("objectives", []):
		objs.append({"event": str(o.event), "target": int(o.get("target", 1)), "count": 0, "text": str(o.get("text", o.event))})
	var days := int(t.get("days", 0))
	var inst := {
		"id": inst_id, "tpl": tpl_id, "type": str(t.get("type", "side")),
		"name": str(t.get("name", tpl_id)), "desc": str(t.get("desc", "")),
		"difficulty": str(t.get("difficulty", "E")), "objectives": objs,
		"rewards": t.get("rewards", {}), "fail": t.get("fail", {}),
		"deadline": (int(Game.s.date.day_index) + days) if days > 0 else -1,
		"status": "offered", "created": int(Game.s.date.day_index) * 10 + int(Game.s.time_slot),
	}
	q().list[inst_id] = inst
	Audio.play_sfx("system")
	var label: String = {"main": "MAIN QUEST", "special": "SPECIAL QUEST", "emergency": "EMERGENCY QUEST", "daily": "DAILY QUEST", "side": "QUEST"}.get(inst.type, "QUEST")
	if auto_accept or daily or bool(t.get("auto_accept", false)):
		accept(inst_id, true)
		Game.notify("[%s] %s" % [label, inst.name], "quest")
	else:
		Game.notify("[%s offered] %s — open the System to accept." % [label, inst.name], "quest")
	Events.quest_updated.emit()
	return inst_id


func accept(inst_id: String, silent: bool = false) -> void:
	if not q().list.has(inst_id):
		return
	var inst: Dictionary = q().list[inst_id]
	inst.status = "active"
	if q().tracked == "" or inst.type in ["main", "emergency"]:
		q().tracked = inst_id
	Game.log_history("Quest accepted: " + str(inst.name))
	if not silent:
		Audio.play_sfx("quest")
	Events.quest_updated.emit()
	_check_complete(inst)


func decline(inst_id: String) -> void:
	if not q().list.has(inst_id):
		return
	var inst: Dictionary = q().list[inst_id]
	if inst.type in ["main", "emergency"]:
		Game.notify("This quest cannot be declined.", "warn")
		return
	q().list.erase(inst_id)
	Events.quest_updated.emit()


func on_event(event_name: String, data: Dictionary) -> void:
	if not Game.active:
		return
	var n := int(data.get("n", 1))
	for inst in q().list.values():
		if str(inst.status) != "active":
			continue
		var changed := false
		for o in inst.objectives:
			if str(o.event) == event_name and int(o.count) < int(o.target):
				o.count = min(int(o.target), int(o.count) + n)
				changed = true
		if changed:
			Events.quest_updated.emit()
			_check_complete(inst)
	_situational(event_name)


func _check_complete(inst: Dictionary) -> void:
	if str(inst.status) != "active":
		return
	for o in inst.objectives:
		if int(o.count) < int(o.target):
			return
	complete(str(inst.id))


func complete(inst_id: String) -> void:
	var inst: Dictionary = q().list.get(inst_id, {})
	if inst.is_empty() or str(inst.status) == "completed":
		return
	inst.status = "completed"
	q().done[str(inst.tpl)] = int(Game.s.date.day_index)
	Game.s.stats_counters.quests_done = int(Game.s.stats_counters.quests_done) + 1
	Audio.play_sfx("quest")
	Game.notify("QUEST COMPLETE: %s" % inst.name, "quest_done")
	Game.log_history("Quest completed: " + str(inst.name))
	Game.grant_rewards(inst.rewards, "quest: " + str(inst.name))
	if q().tracked == inst_id:
		q().tracked = ""
		var act := active_quests()
		if act.size() > 0:
			q().tracked = str(act[0].id)
	# Completed quests stay visible until the next day's cleanup.
	Events.quest_completed.emit(str(inst.tpl))
	Events.quest_updated.emit()
	Events.fire("quest_done:" + str(inst.tpl))
	var t := tpl(str(inst.tpl))
	if t.has("then"):
		offer(str(t.then))
	Game.check_achievements()


func fail(inst_id: String) -> void:
	var inst: Dictionary = q().list.get(inst_id, {})
	if inst.is_empty():
		return
	inst.status = "failed"
	Game.notify("QUEST FAILED: %s" % inst.name, "warn")
	Game.log_history("Quest failed: " + str(inst.name))
	var f: Dictionary = inst.get("fail", {})
	if not f.is_empty():
		if f.has("coins"):
			Game.add_coins(-min(int(Game.s.coins), int(f.coins)), "quest penalty")
		for npc in f.get("rel", {}).keys():
			for k in f.rel[npc].keys():
				Game.rel_add(npc, k, int(f.rel[npc][k]))
		for fl in f.get("flags", []):
			Game.set_flag(str(fl))
	Events.quest_updated.emit()


func on_new_day() -> void:
	var today := int(Game.s.date.day_index)
	for inst_id in q().list.keys().duplicate():
		var inst: Dictionary = q().list[inst_id]
		if str(inst.status) in ["completed", "failed"]:
			q().list.erase(inst_id)
			continue
		if inst.type == "daily":
			if str(inst.status) == "active":
				Game.notify("Daily quest expired: %s" % inst.name, "warn")
			q().list.erase(inst_id)
			continue
		if int(inst.deadline) >= 0 and today > int(inst.deadline) and str(inst.status) in ["active", "offered"]:
			fail(inst_id)
	if Game.has_flag("system_active"):
		generate_dailies()


func generate_dailies() -> void:
	var today := int(Game.s.date.day_index)
	if int(q().daily_day) == today:
		return
	q().daily_day = today
	var pool: Array = []
	for id in Data.quests.keys():
		var t: Dictionary = Data.quests[id]
		if str(t.get("type", "")) == "daily" and Game.check_cond(t.get("if", {})):
			pool.append(id)
	var rng := RandomNumberGenerator.new()
	rng.seed = today * 7919 + 13
	var count := 3
	while count > 0 and pool.size() > 0:
		var idx := rng.randi_range(0, pool.size() - 1)
		offer(str(pool[idx]))
		pool.remove_at(idx)
		count -= 1


func _situational(event_name: String) -> void:
	if not Game.has_flag("system_active"):
		return
	for id in Data.quests.keys():
		var t: Dictionary = Data.quests[id]
		var trig = t.get("trigger", null)
		if not (trig is Dictionary) or str(trig.get("event", "")) != event_name:
			continue
		if is_present(id):
			continue
		if is_done(id) and not bool(t.get("repeatable", false)):
			continue
		if is_done(id) and int(Game.s.date.day_index) - int(q().done[id]) < int(t.get("cooldown_days", 3)):
			continue
		if not Game.check_cond(t.get("if", {})):
			continue
		if randf() > float(trig.get("chance", 1.0)):
			continue
		offer(id)


func objective_text(inst: Dictionary) -> String:
	var lines: Array = []
	for o in inst.objectives:
		lines.append("%s %s (%d/%d)" % ["✔" if int(o.count) >= int(o.target) else "•", o.text, int(o.count), int(o.target)])
	return "\n".join(lines)


func reward_text(r: Dictionary) -> String:
	var parts: Array = []
	if r.has("exp"): parts.append("%d EXP" % int(r.exp))
	if r.has("coins"): parts.append("%d Coins" % int(r.coins))
	if r.has("stat_points"): parts.append("%d Stat Pts" % int(r.stat_points))
	if r.has("skill_points"): parts.append("%d Skill Pts" % int(r.skill_points))
	for st in r.get("stats", {}).keys():
		parts.append("+%d %s" % [int(r.stats[st]), Game.STAT_NAMES.get(st, st)])
	for c in r.get("cards", []):
		parts.append("Card: " + str(Data.card(str(c)).get("name", c)))
	if r.has("card_random"):
		parts.append("Random %s card" % Data.RARITY_NAMES.get(str(r.card_random), r.card_random))
	if r.has("title"):
		parts.append("Title: " + str(Data.titles.get(str(r.title), {}).get("name", r.title)))
	for i in r.get("items", {}).keys():
		parts.append(str(Data.items.get(i, {}).get("name", i)))
	return ", ".join(parts) if parts.size() > 0 else "—"


func tracked() -> Dictionary:
	return q().list.get(str(q().tracked), {})
