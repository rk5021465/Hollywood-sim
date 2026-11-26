extends Control
## The Transcendent System interface (Phase 3/4/12): private holographic menu.
## Tabs: Status, Quests, Cards, Skills, Inventory, Achievements, Titles, Shop,
## Notifications, History, and (once unlocked) Shadow Army and White Lantern.

var main
var tab := "status"
var tab_bar: HBoxContainer
var content: VBoxContainer
var quest_filter := "main"
var inv_filter := "all"

const BLUE := UI.HOLO_BLUE
const PURPLE := UI.HOLO_PURPLE
const GOLD := UI.HOLO_GOLD
const TXT := Color("e6f0ff")
const DIM := Color("8fa3cc")


func setup(args: Dictionary) -> void:
	tab = str(args.get("tab", "status"))
	if not Game.has_flag("system_active") and tab != "inventory":
		tab = "inventory"
	Audio.play_sfx("system")
	UI.screen_bg(self, UI.HOLO_BG)
	var grid_fx := Control.new()
	UI.full(grid_fx)
	grid_fx.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var _cb1 := func():
		for i in range(0, 2000, 60):
			grid_fx.draw_line(Vector2(i, 0), Vector2(i, 3000), Color(0.25, 0.5, 1.0, 0.05), 1)
			grid_fx.draw_line(Vector2(0, i), Vector2(2000, i), Color(0.25, 0.5, 1.0, 0.05), 1)
	grid_fx.draw.connect(_cb1)
	add_child(grid_fx)
	var root := UI.vbox(10)
	add_child(UI.margin(root, 16))
	root.add_child(UI.header("SYSTEM" if Game.has_flag("system_active") else "Bag", func(): main.pop(), BLUE))
	var ts := ScrollContainer.new()
	ts.vertical_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	ts.custom_minimum_size = Vector2(0, 74)
	root.add_child(ts)
	tab_bar = UI.hbox(8)
	ts.add_child(tab_bar)
	content = UI.vbox(12)
	root.add_child(UI.scroll(content))
	modulate.a = 0.0
	create_tween().tween_property(self, "modulate:a", 1.0, Settings.anim(0.25))
	Events.stats_changed.connect(_soft_refresh)
	refresh()


func _exit_tree() -> void:
	if Events.stats_changed.is_connected(_soft_refresh):
		Events.stats_changed.disconnect(_soft_refresh)


func _soft_refresh() -> void:
	if is_inside_tree() and tab in ["status", "skills", "inventory"]:
		refresh.call_deferred()


func _tabs() -> Array:
	if not Game.has_flag("system_active"):
		return [["inventory", "Bag"]]
	var t := [["status", "Status"], ["quests", "Quests"], ["cards", "Cards"], ["skills", "Skills"], ["inventory", "Inventory"],
		["achievements", "Achievements"], ["titles", "Titles"], ["shop", "Shop"], ["notifications", "Alerts"], ["history", "History"]]
	if Cards.owns("arise") or Game.s.shadows.size() > 0:
		t.insert(4, ["shadows", "Shadow Army"])
	if bool(Game.s.ring.get("unlocked", false)):
		t.insert(4, ["lantern", "White Lantern"])
	return t


func refresh() -> void:
	UI.clear(tab_bar)
	for t in _tabs():
		var col := GOLD if t[0] == tab else BLUE
		var b := UI.holo_btn(t[1], _set_tab.bind(t[0]), col, 64)
		b.custom_minimum_size = Vector2(150, 64)
		b.size_flags_horizontal = Control.SIZE_SHRINK_BEGIN
		b.add_theme_font_size_override("font_size", Settings.font_size(20))
		tab_bar.add_child(b)
	UI.clear(content)
	match tab:
		"status": _status()
		"quests": _quests()
		"cards": _cards()
		"skills": _skills()
		"inventory": _inventory()
		"achievements": _achievements()
		"titles": _titles()
		"shop": _shop()
		"notifications": _list(Game.s.notifications, "No notifications yet.")
		"history": _list(Game.s.history, "No history yet.")
		"shadows": _shadows()
		"lantern": _lantern()


func _set_tab(t: String) -> void:
	tab = t
	Audio.play_sfx("system")
	refresh()


func _panel(color: Color = BLUE) -> VBoxContainer:
	var p := UI.holo_panel(color)
	content.add_child(p)
	var v := UI.vbox(8)
	p.add_child(v)
	return v


func _l(t: String, size: int = 22, c: Color = TXT) -> Label:
	return UI.label(t, size, c)


# ---------------------------------------------------------------- status
func _status() -> void:
	var v := _panel(BLUE)
	var top := UI.hbox(14)
	v.add_child(top)
	var pv := PortraitView.new()
	pv.custom_minimum_size = Vector2(180, 220)
	pv.size_flags_horizontal = Control.SIZE_SHRINK_BEGIN
	pv.set_char("peter", "serious")
	top.add_child(pv)
	var info := UI.vbox(4)
	top.add_child(info)
	info.add_child(_l("Name: " + Game.player_name(), 24, GOLD))
	info.add_child(_l("Age: %d" % int(Game.s.player.age)))
	info.add_child(_l("Level: %d" % int(Game.s.level)))
	info.add_child(_l("Rank: %s" % Game.rank_name(), 22, PURPLE))
	info.add_child(_l("Power: %d" % Game.power_score()))
	info.add_child(_l("Nexa Coins: %d" % int(Game.s.coins), 22, Color("ffd36a")))
	var t := str(Game.s.titles.get("equipped", ""))
	if t != "":
		info.add_child(_l("Title: " + str(Data.titles.get(t, {}).get("name", t)), 20, GOLD))
	v.add_child(_l("EXP %d / %d" % [int(Game.s.exp), Game.exp_to_next()], 18, DIM))
	v.add_child(UI.bar(int(Game.s.exp), Game.exp_to_next(), BLUE, 14))
	v.add_child(_l("HP %d / %d     Energy %d / %d" % [Game.hp(), Game.max_hp(), Game.energy_now(), Game.max_energy()], 18, DIM))

	var sv := _panel(PURPLE)
	var sp := int(Game.s.stat_points)
	sv.add_child(_l("STATS" + ("   (%d points available)" % sp if sp > 0 else ""), 24, PURPLE))
	for st in Game.STATS:
		var row := UI.hbox(8)
		var base := Game.base_stat(st)
		var total := Game.get_stat(st)
		var bonus := total - base
		row.add_child(_l(Game.STAT_NAMES[st], 22))
		var val := _l("%d%s" % [total, ("  (+%d)" % bonus) if bonus > 0 else ""], 22, GOLD if bonus > 0 else TXT)
		val.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
		row.add_child(val)
		if sp > 0:
			var _cb2 := func():
				Game.spend_stat_point(st)
				refresh()
			var b := UI.holo_btn("+", _cb2, GOLD, 56)
			b.custom_minimum_size = Vector2(70, 56)
			b.size_flags_horizontal = Control.SIZE_SHRINK_END
			row.add_child(b)
		sv.add_child(row)
	sv.add_child(_l("Skill points: %d   (spend in Cards → Upgrade)" % int(Game.s.skill_points), 18, DIM))

	var rv := _panel(BLUE)
	rv.add_child(_l("REPUTATION", 22, BLUE))
	for k in Game.REP_KEYS:
		var row := UI.hbox(8)
		row.add_child(_l(k.capitalize(), 20))
		row.add_child(UI.bar(clampi(int(Game.s.reputation.get(k, 0)) + 100, 0, 1100), 1100, PURPLE, 12))
		row.add_child(_l(str(int(Game.s.reputation.get(k, 0))), 20, DIM))
		rv.add_child(row)
	if Cards.owns("stat_inspection"):
		content.add_child(UI.holo_btn("Inspect another person (Stat Inspection)", _inspect_menu, GOLD))
	else:
		content.add_child(_l("Stat Inspection card required to inspect others.", 18, DIM))


func _inspect_menu() -> void:
	var m := UI.modal(self, "Stat Inspection", 640)
	var list := UI.vbox(8)
	var sc := UI.scroll(list)
	sc.custom_minimum_size = Vector2(0, 700)
	m.body.add_child(sc)
	for id in Data.characters.keys():
		var c: Dictionary = Data.characters[id]
		if id == "peter" or not c.has("stats") or not bool(Game.s.gallery.characters.get(id, false)):
			continue
		list.add_child(UI.btn(str(c.name), _inspect.bind(id, m.shade), 64))


func _inspect(id: String, shade: Control) -> void:
	shade.queue_free()
	var c := Data.character(id)
	var m := UI.modal(self, "[ INSPECT ] " + str(c.name), 620)
	var lv := Cards.level("stat_inspection")
	var st: Dictionary = c.get("stats", {})
	var p := 0
	for k in st.keys():
		p += int(st[k])
	m.body.add_child(_l("Estimated rank: %s" % _rank_for(p), 24, GOLD))
	if lv < 3 and p > Game.power_score() * 3:
		m.body.add_child(_l("Their power is far beyond yours. The System can't read details yet (Stat Inspection Lv.3).", 20, Color("ff8fa3")))
		return
	for k in st.keys():
		m.body.add_child(_l("%s: %d" % [Game.STAT_NAMES.get(k, k), int(st[k])], 20))
	m.body.add_child(_l("Powers: " + ", ".join(c.get("powers", [])), 20, PURPLE))


func _rank_for(p: int) -> String:
	var r := "Unranked"
	for x in Game.RANKS:
		if p >= int(x[1]):
			r = str(x[0])
	return r


# ---------------------------------------------------------------- quests
func _quests() -> void:
	var row := UI.hbox(6)
	content.add_child(row)
	for t in [["main", "Main"], ["special", "Special"], ["emergency", "Emergency"], ["daily", "Daily"], ["side", "Side"]]:
		var n: int = Quests.list_by_type(t[0]).filter(func(i): return str(i.status) != "completed").size()
		var _cb3 := func():
			quest_filter = t[0]
			refresh()
		var b := UI.holo_btn("%s%s" % [t[1], (" (%d)" % n) if n > 0 else ""], _cb3, GOLD if quest_filter == t[0] else BLUE, 60)
		b.add_theme_font_size_override("font_size", Settings.font_size(17))
		row.add_child(b)
	var list := Quests.list_by_type(quest_filter)
	if list.is_empty():
		content.add_child(_l("No %s quests right now." % quest_filter, 20, DIM))
		if quest_filter == "daily":
			content.add_child(_l("Daily quests appear every morning after the System awakens.", 18, DIM))
	for inst in list:
		var col: Color = {"main": GOLD, "special": PURPLE, "emergency": Color("ff4f7b"), "daily": BLUE, "side": Color("3ddc97")}.get(str(inst.type), BLUE)
		var v := _panel(col)
		var head := UI.hbox()
		v.add_child(head)
		head.add_child(_l(str(inst.name), 24, col))
		var diff := _l("Rank " + str(inst.difficulty), 20, DIM)
		diff.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
		head.add_child(diff)
		if str(inst.desc) != "":
			v.add_child(_l(str(inst.desc), 19, Color("c8d6f5")))
		v.add_child(_l(Quests.objective_text(inst), 20))
		v.add_child(_l("Rewards: " + Quests.reward_text(inst.rewards), 18, GOLD))
		if int(inst.deadline) >= 0:
			var left := int(inst.deadline) - int(Game.s.date.day_index)
			v.add_child(_l("Time limit: %s" % ("ends today" if left <= 0 else "%d day(s) left" % left), 18, Color("ff8fa3")))
		if not (inst.fail as Dictionary).is_empty():
			v.add_child(_l("Failure: penalty applies", 16, Color("ff8fa3")))
		var st := str(inst.status)
		var row2 := UI.hbox()
		v.add_child(row2)
		match st:
			"offered":
				var _cb4 := func():
					Quests.accept(str(inst.id))
					refresh()
				row2.add_child(UI.holo_btn("Accept", _cb4, GOLD, 60))
				if not (str(inst.type) in ["main", "emergency"]):
					var _cb5 := func():
						Quests.decline(str(inst.id))
						refresh()
					row2.add_child(UI.holo_btn("Decline", _cb5, BLUE, 60))
			"active":
				var tracked: bool = str(Game.s.quests.tracked) == str(inst.id)
				var _cb6 := func():
					Game.s.quests.tracked = str(inst.id)
					Events.quest_updated.emit()
					refresh()
				row2.add_child(UI.holo_btn("Tracking ●" if tracked else "Track", _cb6, GOLD if tracked else BLUE, 60))
			"completed":
				row2.add_child(_l("✔ COMPLETED", 22, Color("3ddc97")))
			"failed":
				row2.add_child(_l("✖ FAILED", 22, Color("ff4f7b")))


# ---------------------------------------------------------------- cards
func _cards() -> void:
	var owned := Cards.owned()
	content.add_child(_l("Collected %d / %d cards  •  Skill points: %d" % [owned.size(), Data.cards.size(), int(Game.s.skill_points)], 20, DIM))
	var combos := Cards.available_combos()
	if combos.size() > 0:
		content.add_child(UI.holo_btn("Card Combinations (%d available)" % combos.size(), _combo_menu, PURPLE, 64))
	var ids: Array = owned.keys()
	ids.sort_custom(func(a, b): return Data.rarity_index(str(Data.card(a).get("rarity", ""))) > Data.rarity_index(str(Data.card(b).get("rarity", ""))))
	if ids.is_empty():
		content.add_child(_l("No cards yet. Complete quests to receive cards.", 20, DIM))
	var g := UI.grid(3)
	content.add_child(g)
	for id in ids:
		var c := CardArt.new()
		c.custom_minimum_size = Vector2(0, 300)
		c.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		c.set_card(id)
		c.tapped.connect(_card_detail)
		g.add_child(c)


func _card_detail(id: String) -> void:
	var d := Data.card(id)
	var m := UI.modal(self, str(d.get("name", id)), 660)
	var top := UI.hbox(14)
	m.body.add_child(top)
	var c := CardArt.new()
	c.custom_minimum_size = Vector2(230, 330)
	c.size_flags_horizontal = Control.SIZE_SHRINK_BEGIN
	c.set_card(id)
	top.add_child(c)
	var info := UI.vbox(6)
	top.add_child(info)
	var rc: Color = Data.RARITY_COLORS.get(str(d.get("rarity", "")), Color.WHITE)
	info.add_child(UI.label(Data.RARITY_NAMES.get(str(d.get("rarity", "")), ""), 22, rc))
	info.add_child(UI.label("Category: " + str(d.get("category", "")), 20))
	info.add_child(UI.label("Level %d / %d" % [Cards.level(id), Cards.max_level(id)], 20))
	if Cards.level(id) < Cards.max_level(id):
		info.add_child(UI.bar(int(Cards.owned()[id].exp), Cards.exp_needed(id), rc, 12))
		info.add_child(UI.label("Card EXP %d / %d" % [int(Cards.owned()[id].exp), Cards.exp_needed(id)], 16))
	else:
		info.add_child(UI.label("MASTERED", 20, GOLD))
	m.body.add_child(UI.label(str(d.get("desc", "")), 21))
	if d.has("passive"):
		var parts: Array = []
		for st in d.passive.keys():
			parts.append("+%d %s" % [int(round(float(d.passive[st]) * (1.0 + (Cards.level(id) - 1) * 0.25))), Game.STAT_NAMES.get(st, st)])
		m.body.add_child(UI.label("Passive: " + ", ".join(parts), 19, Color("3ddc97")))
	if d.has("active"):
		var a: Dictionary = d.active
		m.body.add_child(UI.label("Active skill: %s — Power ×%.1f, Energy %d, Cooldown %d turn(s)%s" % [a.get("name", "Skill"), float(a.get("power", 1.0)) + Cards.level(id) * 0.1, int(a.get("energy", 0)), int(a.get("cooldown", 0)), (", effect: " + str(a.effect)) if str(a.get("effect", "none")) != "none" else ""], 19, BLUE))
	m.body.add_child(UI.label("Unlock: " + str(d.get("unlock", "—")), 17, DIM))
	var row := UI.hbox()
	m.body.add_child(row)
	if Cards.level(id) < Cards.max_level(id):
		var _cb7 := func():
			if Cards.upgrade(id):
				m.shade.queue_free()
				refresh()
				_card_detail(id)
		row.add_child(UI.btn("Upgrade (%d SP)" % Cards.upgrade_cost(id), _cb7, 64))
	if d.has("active"):
		var inlo: bool = id in Game.s.loadout
		var _cb8 := func():
			Cards.toggle_loadout(id)
			m.shade.queue_free()
			refresh()
		row.add_child(UI.btn("Unequip" if inlo else "Equip skill", _cb8, 64))
	if Cards.can_evolve(id):
		var _cb9 := func():
			m.shade.queue_free()
			Cards.evolve(id)
			refresh()
		m.body.add_child(UI.holo_btn("EVOLVE → " + str(Data.card(str(d.evolves_to)).get("name", "")), _cb9, GOLD, 72))
	elif d.has("evolves_to") and not Cards.owns(str(d.evolves_to)):
		m.body.add_child(UI.label("Evolution: master this card (Lv.%d) and meet: %s" % [Cards.max_level(id), str(d.get("evolve_hint", "a special condition"))], 17, DIM))


func _combo_menu() -> void:
	var m := UI.modal(self, "Card Combinations", 640)
	for combo in Cards.available_combos():
		var t := "%s + %s → %s (both Lv.%d+)" % [Data.card(str(combo.a)).get("name", ""), Data.card(str(combo.b)).get("name", ""), Data.card(str(combo.result)).get("name", ""), int(combo.get("req_level", 5))]
		m.body.add_child(UI.label(t, 20))
		var _cb10 := func():
			if Cards.combine(combo):
				m.shade.queue_free()
				refresh()
		m.body.add_child(UI.holo_btn("Combine", _cb10, PURPLE, 60))


# ---------------------------------------------------------------- skills
func _skills() -> void:
	var v := _panel(GOLD)
	v.add_child(_l("SKILL LOADOUT (%d/%d) — used in battles" % [Game.s.loadout.size(), Cards.LOADOUT_SIZE], 22, GOLD))
	for id in Game.s.loadout:
		var a: Dictionary = Data.card(id).get("active", {})
		v.add_child(_l("◆ %s — %s (EN %d, CD %d)" % [a.get("name", id), Data.card(id).get("name", id), int(a.get("energy", 0)), int(a.get("cooldown", 0))], 20))
	if Game.s.loadout.is_empty():
		v.add_child(_l("No active skills equipped.", 20, DIM))
	var av := _panel(BLUE)
	av.add_child(_l("ACTIVE CARDS", 22, BLUE))
	for id in Cards.owned().keys():
		var d := Data.card(id)
		if not d.has("active"):
			continue
		var row := UI.hbox()
		row.add_child(_l("%s  Lv.%d" % [d.get("name", id), Cards.level(id)], 20))
		var on: bool = id in Game.s.loadout
		var _cb11 := func():
			Cards.toggle_loadout(id)
			refresh()
		var b := UI.holo_btn("Equipped" if on else "Equip", _cb11, GOLD if on else BLUE, 56)
		b.custom_minimum_size = Vector2(160, 56)
		b.size_flags_horizontal = Control.SIZE_SHRINK_END
		row.add_child(b)
		av.add_child(row)
	var pv := _panel(PURPLE)
	pv.add_child(_l("PASSIVE BONUSES FROM CARDS", 22, PURPLE))
	for st in Game.STATS:
		var b := Cards.passive_bonus(st)
		if b > 0:
			pv.add_child(_l("+%d %s" % [b, Game.STAT_NAMES[st]], 20))


# ---------------------------------------------------------------- inventory
func _inventory() -> void:
	var cats := [["all", "All"], ["consumable", "Consumables"], ["clothes", "Clothes"], ["costume", "Costumes"], ["weapon", "Weapons"], ["accessory", "Accessories"], ["material", "Materials"], ["collectible", "Collectibles"], ["pets", "Pets"], ["vehicles", "Vehicles"]]
	var g := UI.grid(4)
	content.add_child(g)
	for c in cats:
		var _cb12 := func():
			inv_filter = c[0]
			refresh()
		var b := UI.holo_btn(c[1], _cb12, GOLD if inv_filter == c[0] else BLUE, 54)
		b.add_theme_font_size_override("font_size", Settings.font_size(16))
		g.add_child(b)
	var ev := _panel(GOLD)
	ev.add_child(_l("EQUIPPED", 20, GOLD))
	for slot in Game.s.equipment.keys():
		var it := str(Game.s.equipment[slot])
		var row := UI.hbox()
		row.add_child(_l("%s: %s" % [slot.capitalize(), Data.items.get(it, {}).get("name", "—") if it != "" else "—"], 19))
		if it != "":
			var _cb13 := func():
				Game.unequip(slot)
				refresh()
			var ub := UI.btn("Remove", _cb13, 52, 18)
			ub.custom_minimum_size = Vector2(140, 52)
			ub.size_flags_horizontal = Control.SIZE_SHRINK_END
			row.add_child(ub)
		ev.add_child(row)
	if inv_filter == "pets":
		for p in Game.s.pets:
			content.add_child(_l("🐾 %s (%s) — Happiness %d, Hunger %d" % [p.name, Data.pets.get(str(p.species_id), {}).get("name", p.species), int(p.happiness), int(p.hunger)], 20))
		if Game.s.pets.is_empty():
			content.add_child(_l("No pets yet. Visit the Pet Shop.", 20, DIM))
		return
	if inv_filter == "vehicles":
		for vid in Game.s.vehicles:
			content.add_child(_l("🚗 " + str(Data.items.get(vid, {}).get("name", vid)), 20))
		if Game.s.vehicles.is_empty():
			content.add_child(_l("No vehicles yet. Visit the showroom.", 20, DIM))
		return
	var shown := 0
	for id in Game.s.inventory.keys():
		var it: Dictionary = Data.items.get(id, {})
		var cat := str(it.get("cat", "material"))
		if inv_filter != "all" and cat != inv_filter:
			continue
		shown += 1
		var v := _panel(BLUE)
		var row := UI.hbox()
		v.add_child(row)
		row.add_child(_l("%s  ×%d" % [it.get("name", id), int(Game.s.inventory[id])], 21))
		if cat == "consumable":
			var b := UI.holo_btn("Use", _use_item.bind(id), GOLD, 54)
			b.custom_minimum_size = Vector2(120, 54)
			b.size_flags_horizontal = Control.SIZE_SHRINK_END
			row.add_child(b)
		elif it.has("slot"):
			var on: bool = str(Game.s.equipment.get(str(it.slot), "")) == id
			var _cb14 := func():
				Game.equip(id)
				refresh()
			var b2 := UI.holo_btn("Equipped" if on else "Equip", _cb14, GOLD if on else BLUE, 54)
			b2.custom_minimum_size = Vector2(150, 54)
			b2.size_flags_horizontal = Control.SIZE_SHRINK_END
			row.add_child(b2)
		v.add_child(_l(str(it.get("desc", "")) + _stat_text(it.get("stats", {})), 18, DIM))
	if shown == 0:
		content.add_child(_l("Nothing here yet.", 20, DIM))


func _stat_text(st: Dictionary) -> String:
	if st.is_empty():
		return ""
	var p: Array = []
	for k in st.keys():
		p.append("+%d %s" % [int(st[k]), Game.STAT_NAMES.get(k, k)])
	return "  [" + ", ".join(p) + "]"


func _use_item(id: String) -> void:
	var it: Dictionary = Data.items.get(id, {})
	if not Game.remove_item(id):
		return
	var u: Dictionary = it.get("use", {})
	if u.has("hp") or u.has("energy"):
		Game.restore(int(u.get("hp", 0)) if u.has("hp") else 0, int(u.get("energy", 0)) if u.has("energy") else 0)
	if u.has("stats"):
		for st in u.stats.keys():
			Game.add_stat(st, int(u.stats[st]), "used " + str(it.get("name", id)))
	if u.has("card_random"):
		Cards.grant_random(str(u.card_random), str(it.get("name", id)))
	if u.has("exp"):
		Game.add_exp(int(u.exp), "used " + str(it.get("name", id)))
	Game.notify("Used %s." % it.get("name", id), "info")
	refresh()


# ---------------------------------------------------------------- achievements & titles
func _achievements() -> void:
	content.add_child(_l("Unlocked %d / %d" % [Game.s.achievements.size(), Data.achievements.size()], 20, DIM))
	for id in Data.achievements.keys():
		var a: Dictionary = Data.achievements[id]
		var got: bool = Game.s.achievements.has(id)
		var v := _panel(GOLD if got else Color(0.3, 0.35, 0.5))
		v.add_child(_l(("🏆 " if got else "🔒 ") + str(a.get("name", id)), 22, GOLD if got else DIM))
		v.add_child(_l(str(a.get("desc", "")), 18, TXT if got else DIM))


func _titles() -> void:
	var owned: Array = Game.s.titles.owned
	if owned.is_empty():
		content.add_child(_l("No titles yet. Titles come from quests and achievements.", 20, DIM))
	for id in owned:
		var t: Dictionary = Data.titles.get(id, {})
		var eq: bool = str(Game.s.titles.equipped) == str(id)
		var v := _panel(GOLD if eq else BLUE)
		v.add_child(_l(str(t.get("name", id)), 22, GOLD))
		v.add_child(_l(str(t.get("desc", "")) + _stat_text(t.get("bonus", {})), 18, DIM))
		var _cb15 := func():
			Game.s.titles.equipped = "" if eq else str(id)
			Events.stats_changed.emit()
			refresh()
		v.add_child(UI.holo_btn("Equipped" if eq else "Equip title", _cb15, GOLD if eq else BLUE, 56))


# ---------------------------------------------------------------- shop
func _shop() -> void:
	var shop: Dictionary = Data.shops.get("system_shop", {})
	content.add_child(_l("System Shop — pay with Nexa Coins. Balance: %d" % int(Game.s.coins), 20, GOLD))
	for id in shop.get("items", []):
		var it: Dictionary = Data.items.get(id, {})
		if it.is_empty() or not Game.check_cond(it.get("if", {})):
			continue
		var v := _panel(PURPLE)
		var row := UI.hbox()
		v.add_child(row)
		row.add_child(_l(str(it.get("name", id)), 21))
		var _cb16 := func():
			if Game.spend_coins(int(it.get("price", 0)), "System Shop: " + str(it.get("name", id))):
				Game.add_item(id)
				Game.notify("Purchased %s." % it.get("name", id), "info")
				refresh()
		var b := UI.holo_btn("◈ %d" % int(it.get("price", 0)), _cb16, GOLD, 54)
		b.custom_minimum_size = Vector2(150, 54)
		b.size_flags_horizontal = Control.SIZE_SHRINK_END
		row.add_child(b)
		v.add_child(_l(str(it.get("desc", "")), 18, DIM))


func _list(arr: Array, empty: String) -> void:
	if arr.is_empty():
		content.add_child(_l(empty, 20, DIM))
	for e in arr.slice(0, 80):
		content.add_child(_l("Day %d — %s" % [int(e.get("day", 0)) + 1, e.get("t", "")], 19))


# ---------------------------------------------------------------- shadow army
func _shadows() -> void:
	var v := _panel(PURPLE)
	v.add_child(_l("SHADOW ARMY — %d soldiers" % Game.s.shadows.size(), 24, PURPLE))
	v.add_child(_l("Deployed formation (max 3): " + ", ".join(Game.s.formation.map(func(x): return str(Data.shadows.get(x, {}).get("name", x)))), 19))
	v.add_child(UI.holo_btn("ARISE (summon preview)", _arise_fx, PURPLE, 64))
	if Game.s.shadows.is_empty():
		content.add_child(_l("Defeat eligible enemies during story missions to extract shadows.", 20, DIM))
	for id in Game.s.shadows.keys():
		var d: Dictionary = Data.shadows.get(id, {})
		var sd: Dictionary = Game.s.shadows[id]
		var p := _panel(Color("6b3fd1"))
		var row := UI.hbox(12)
		p.add_child(row)
		var pv := PortraitView.new()
		pv.custom_minimum_size = Vector2(120, 140)
		pv.size_flags_horizontal = Control.SIZE_SHRINK_BEGIN
		pv.set_custom({"style": "shadow", "hair_style": int(d.get("hair_style", 4)), "aura": "7a3fd1"}, "characters/shadows", id)
		row.add_child(pv)
		var info := UI.vbox(4)
		row.add_child(info)
		info.add_child(_l("%s  [%s]" % [d.get("name", id), d.get("rank", "Soldier")], 22, Color("c9a8ff")))
		info.add_child(_l("Lv.%d  •  Power %d  •  EXP %d/%d" % [int(sd.level), Game.shadow_power(id), int(sd.exp), int(sd.level) * 50], 18))
		info.add_child(_l("Ability: " + str(d.get("ability", "")), 18, DIM))
		var eq := str(sd.get("equip", ""))
		info.add_child(_l("Equipment: " + (str(Data.items.get(eq, {}).get("name", eq)) if eq != "" else "none"), 18, DIM))
		var row2 := UI.hbox()
		p.add_child(row2)
		var deployed: bool = id in Game.s.formation
		var _cb17 := func():
			if deployed:
				Game.s.formation.erase(id)
			elif Game.s.formation.size() < 3:
				Game.s.formation.append(id)
			else:
				Game.notify("Formation full (3).", "warn")
			refresh()
		row2.add_child(UI.holo_btn("Recall" if deployed else "Deploy", _cb17, GOLD if deployed else PURPLE, 56))
		var _cb18 := func():
			if Game.spend_coins(int(sd.level) * 100, "shadow training"):
				sd.exp = int(sd.exp) + 30
				while int(sd.exp) >= int(sd.level) * 50:
					sd.exp = int(sd.exp) - int(sd.level) * 50
					sd.level = int(sd.level) + 1
					Game.notify("%s reached Lv.%d" % [d.get("name", id), int(sd.level)], "system")
				refresh()
		row2.add_child(UI.holo_btn("Train ◈%d" % (int(sd.level) * 100), _cb18, PURPLE, 56))
		row2.add_child(UI.holo_btn("Equip", _shadow_equip.bind(id), BLUE, 56))


func _shadow_equip(id: String) -> void:
	var m := UI.modal(self, "Shadow Equipment", 600)
	var any := false
	for item_id in Game.s.inventory.keys():
		var it: Dictionary = Data.items.get(item_id, {})
		if str(it.get("cat", "")) != "shadow_gear":
			continue
		any = true
		var _cb19 := func():
			Game.s.shadows[id].equip = item_id
			m.shade.queue_free()
			refresh()
		m.body.add_child(UI.btn("%s (+%d power)" % [it.get("name", item_id), int(it.get("shadow_power", 0))], _cb19, 60))
	if not any:
		m.body.add_child(UI.label("No shadow gear. Buy some in the System Shop.", 20))


func _arise_fx() -> void:
	Audio.play_sfx("card_mythical")
	var r := ColorRect.new()
	r.color = Color(0.1, 0.0, 0.2, 0.0)
	UI.full(r)
	add_child(r)
	var l := UI.label("ARISE", 120, Color("c9a8ff"))
	UI.full(l)
	l.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	l.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	l.add_theme_color_override("font_outline_color", Color("3b1a7a"))
	l.add_theme_constant_override("outline_size", 16)
	l.modulate.a = 0.0
	r.add_child(l)
	var p := CPUParticles2D.new()
	p.position = Vector2(360, 1200)
	p.amount = 140
	p.lifetime = 2.0
	p.emission_shape = CPUParticles2D.EMISSION_SHAPE_RECTANGLE
	p.emission_rect_extents = Vector2(380, 20)
	p.direction = Vector2(0, -1)
	p.spread = 10.0
	p.gravity = Vector2.ZERO
	p.initial_velocity_min = 300.0
	p.initial_velocity_max = 600.0
	p.scale_amount_min = 3.0
	p.scale_amount_max = 9.0
	p.color = Color("7a3fd1")
	r.add_child(p)
	var tw := create_tween()
	tw.tween_property(r, "color:a", 0.9, Settings.anim(0.4))
	tw.tween_property(l, "modulate:a", 1.0, Settings.anim(0.3))
	tw.tween_interval(Settings.anim(1.4))
	tw.tween_property(r, "modulate:a", 0.0, Settings.anim(0.5))
	tw.tween_callback(r.queue_free)


# ---------------------------------------------------------------- white lantern
func _lantern() -> void:
	var ring: Dictionary = Game.s.ring
	var v := _panel(Color.WHITE)
	v.add_child(_l("WHITE LANTERN RING", 26, Color.WHITE))
	var ringv := Control.new()
	ringv.custom_minimum_size = Vector2(0, 220)
	var _cb20 := func():
		var c := ringv.size / 2.0
		var aura := Color(_aura_color(str(ring.get("aura", "white"))))
		for i in 5:
			ringv.draw_circle(c, 100 - i * 12, Color(aura.r, aura.g, aura.b, 0.08 + i * 0.03))
		ringv.draw_arc(c, 60, 0, TAU, 48, Color.WHITE, 12)
		ringv.draw_circle(c, 26, aura)
	ringv.draw.connect(_cb20)
	v.add_child(ringv)
	v.add_child(_l("Ring Level %d  •  Mastery %d%%  •  Energy %d%%" % [int(ring.level), int(ring.mastery), int(ring.energy)], 20))
	v.add_child(UI.bar(int(ring.mastery), 100, Color.WHITE, 12))
	var cost := int(ring.level) * 1500
	var _cb21 := func():
		if int(ring.mastery) < min(100, int(ring.level) * 20):
			Game.notify("Not enough mastery. Complete Lantern missions and battles.", "warn")
		elif Game.spend_coins(cost, "ring upgrade"):
			ring.level = int(ring.level) + 1
			Game.notify("White Lantern ring reached Level %d" % int(ring.level), "system")
			Events.stats_changed.emit()
			refresh()
	v.add_child(UI.holo_btn("Upgrade ring (◈%d, needs Mastery %d%%)" % [cost, min(100, int(ring.level) * 20)], _cb21, Color.WHITE, 64))
	var av := _panel(UI.HOLO_GOLD)
	av.add_child(_l("AURA MASTERY", 22, GOLD))
	var ag := UI.grid(3)
	av.add_child(ag)
	for a in ring.get("auras", ["white"]):
		var on: bool = str(ring.aura) == str(a)
		var _cb22 := func():
			ring.aura = str(a)
			refresh()
		ag.add_child(UI.holo_btn(str(a).capitalize() + (" ●" if on else ""), _cb22, Color(_aura_color(str(a))), 56))
	var sv := _panel(BLUE)
	sv.add_child(_l("RING ABILITIES", 22, BLUE))
	for id in Cards.owned().keys():
		if str(Data.card(id).get("category", "")) == "Cosmic":
			sv.add_child(_l("◆ " + str(Data.card(id).get("name", id)) + " — " + str(Data.card(id).get("desc", "")), 18))
	var mv := _panel(PURPLE)
	mv.add_child(_l("LANTERN MISSIONS", 22, PURPLE))
	for qid in Data.quests.keys():
		var q: Dictionary = Data.quests[qid]
		if not bool(q.get("lantern", false)):
			continue
		var state := "done" if Quests.is_done(qid) else ("active" if Quests.is_present(qid) else "available")
		var row := UI.hbox()
		row.add_child(_l("%s  [%s]" % [q.get("name", qid), state], 19))
		if state == "available" and Game.check_cond(q.get("if", {})):
			var _cb23 := func():
				Quests.offer(qid, true)
				refresh()
			var b := UI.holo_btn("Start", _cb23, PURPLE, 54)
			b.custom_minimum_size = Vector2(120, 54)
			b.size_flags_horizontal = Control.SIZE_SHRINK_END
			row.add_child(b)
		mv.add_child(row)


func _aura_color(a: String) -> String:
	return {"white": "ffffff", "green": "3ddc97", "blue": "3fa9ff", "violet": "9b5cff", "gold": "f5c542", "crimson": "e9406c", "orange": "ff8a1f", "indigo": "4b4bff", "rainbow": "ff7ab8"}.get(a, "ffffff")


func on_back() -> bool:
	return false
