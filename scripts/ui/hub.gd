extends Control
## The main gameplay screen: an illustrated location with HUD, quest tracker,
## activities, NPCs, story button and the bottom navigation bar.
## Players move between locations through the Map (no free roaming).

var main
var bg: BackgroundView
var hud_box: VBoxContainer
var body: VBoxContainer
var tracker: PanelContainer
var nav: HBoxContainer
var phone_btn: Button
var sys_btn: Button


func setup(_args: Dictionary) -> void:
	Game.active = true
	bg = BackgroundView.new()
	bg.tint_by_time = true
	UI.full(bg)
	add_child(bg)
	var shade := ColorRect.new()
	shade.color = Color(0, 0, 0, 0.25)
	UI.full(shade)
	shade.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(shade)
	var root := UI.vbox(10)
	add_child(UI.margin(root, 16))
	hud_box = UI.vbox(6)
	root.add_child(hud_box)
	tracker = UI.panel(Color(0.04, 0.06, 0.16, 0.85), 12, UI.HOLO_PURPLE, 2, 12)
	root.add_child(tracker)
	body = UI.vbox(10)
	root.add_child(UI.scroll(body))
	nav = UI.hbox(8)
	root.add_child(nav)
	_build_nav()
	for sig in [Events.stats_changed, Events.coins_changed, Events.quest_updated, Events.message_received]:
		sig.connect(_refresh_hud)
	Events.time_changed.connect(refresh)
	refresh()
	_first_visit_fire()


func _exit_tree() -> void:
	for sig in [Events.stats_changed, Events.coins_changed, Events.quest_updated, Events.message_received]:
		if sig.is_connected(_refresh_hud):
			sig.disconnect(_refresh_hud)
	if Events.time_changed.is_connected(refresh):
		Events.time_changed.disconnect(refresh)


func loc() -> Dictionary:
	return Data.locations.get(str(Game.s.location), Data.locations.get("home_bedroom", {}))


func _first_visit_fire() -> void:
	Events.fire("visit:" + str(Game.s.location))
	var d := str(loc().get("district", ""))
	if d != "":
		Events.fire("visit_district:" + d)


func refresh() -> void:
	if not is_inside_tree():
		return
	var l := loc()
	bg.set_bg(str(l.get("bg_night", l.get("bg", ""))) if Game.is_night() and l.has("bg_night") else str(l.get("bg", "")))
	Audio.play_music(str(l.get("music", "city")))
	_refresh_hud()
	_build_body()


func _refresh_hud(_arg = null) -> void:
	if not is_inside_tree():
		return
	UI.clear(hud_box)
	var top := UI.panel(Color(0.04, 0.06, 0.16, 0.85), 12, UI.HOLO_BLUE, 2, 12)
	hud_box.add_child(top)
	var v := UI.vbox(6)
	top.add_child(v)
	var r1 := UI.hbox(8)
	v.add_child(r1)
	var lvl := UI.label("Lv.%d  •  %s" % [int(Game.s.level), Game.rank_name()] if Game.has_flag("system_active") else Game.player_name(), 24, UI.HOLO_GOLD)
	r1.add_child(lvl)
	var coins := UI.label("◈ %d" % int(Game.s.coins), 24, Color("ffd36a"))
	coins.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	r1.add_child(coins)
	if Game.has_flag("system_active"):
		var exp_row := UI.hbox(6)
		exp_row.add_child(UI.label("EXP", 16, Color("9fb4e0"), false))
		exp_row.add_child(UI.bar(int(Game.s.exp), Game.exp_to_next(), UI.HOLO_BLUE, 12))
		v.add_child(exp_row)
	var r2 := UI.hbox(8)
	v.add_child(r2)
	r2.add_child(UI.label("HP", 16, Color("ff9aa8"), false))
	r2.add_child(UI.bar(Game.hp(), Game.max_hp(), Color("e9406c"), 12))
	r2.add_child(UI.label("EN", 16, Color("9affd0"), false))
	r2.add_child(UI.bar(Game.energy_now(), Game.max_energy(), Color("3ddc97"), 12))
	var r3 := UI.hbox(8)
	v.add_child(r3)
	r3.add_child(UI.label("%s  •  %s" % [Game.date_string(), Game.slot_name()], 18, Color("cdd8f5")))
	var dist := UI.label("⌖ " + str(Data.districts.get(str(loc().get("district", "")), {}).get("name", "")), 18, Color("cdd8f5"))
	dist.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	r3.add_child(dist)
	_refresh_tracker()
	if phone_btn:
		var unread := 0
		for k in Game.s.unread.keys():
			unread += int(Game.s.unread[k])
		var calls: int = Game.s.pending_calls.size()
		phone_btn.text = "Phone" + ((" (%d)" % (unread + calls)) if unread + calls > 0 else "")
	if sys_btn:
		sys_btn.text = "System" if Game.has_flag("system_active") else "???"
		sys_btn.disabled = not Game.has_flag("system_active")


func _refresh_tracker() -> void:
	UI.clear(tracker)
	var v := UI.vbox(4)
	tracker.add_child(v)
	var tq := Quests.tracked()
	if not Game.has_flag("system_active"):
		tracker.visible = Story.can_play_next()
		v.add_child(UI.label("Story continues…", 20, UI.HOLO_PURPLE))
		return
	tracker.visible = true
	if tq.is_empty():
		v.add_child(UI.label("No tracked quest — open the System to choose one.", 18, Color("b0bde0")))
	else:
		v.add_child(UI.label("◆ " + str(tq.name), 21, UI.HOLO_PURPLE))
		v.add_child(UI.label(Quests.objective_text(tq), 18, Color("dfe6ff")))
	var tap := Button.new()
	tap.flat = true
	UI.full(tap)
	tap.pressed.connect(func(): main.push("system", {"tab": "quests"}))
	tracker.add_child(tap)


func _build_nav() -> void:
	nav.add_child(_nav_btn("Map", func(): main.push("map")))
	phone_btn = _nav_btn("Phone", func(): main.push("phone"))
	nav.add_child(phone_btn)
	sys_btn = _nav_btn("System", func(): main.push("system", {"tab": "status"}))
	nav.add_child(sys_btn)
	nav.add_child(_nav_btn("Bag", func(): main.push("system", {"tab": "inventory"})))
	nav.add_child(_nav_btn("Menu", _menu))


func _nav_btn(t: String, cb: Callable) -> Button:
	var b := UI.holo_btn(t, cb, UI.HOLO_BLUE, 76)
	b.add_theme_font_size_override("font_size", Settings.font_size(20))
	return b


func _build_body() -> void:
	UI.clear(body)
	var l := loc()
	var head := UI.panel(Color(0.04, 0.06, 0.16, 0.8), 12, Color(1, 1, 1, 0.15), 1, 14)
	body.add_child(head)
	var hv := UI.vbox(4)
	head.add_child(hv)
	hv.add_child(UI.label(str(l.get("name", "Unknown")), 32, Color.WHITE))
	hv.add_child(UI.label(str(l.get("desc", "")), 19, Color("c5d0ee")))
	# story
	if Story.can_play_next():
		var sb := UI.holo_btn("▶  Continue Story: " + str(Story.next_scene().get("title", "")), _play_story, UI.HOLO_GOLD, 88)
		body.add_child(sb)
	elif Story.next_id() != "":
		body.add_child(_info("Story: " + Story.requirement_text()))
	else:
		body.add_child(_info("Story: " + Story.requirement_text()))
	# pending calls
	for npc in Game.s.pending_calls.keys():
		body.add_child(UI.holo_btn("📞  Call %s" % Data.char_name(npc), func(): main.push("phone", {"app": "calls"}), Color("3ddc97"), 70))
	# appointments here
	for a in Game.s.appointments:
		if int(a.day) == int(Game.s.date.day_index) and str(a.location) == str(Game.s.location) and int(Game.s.time_slot) >= int(a.get("slot", 0)):
			body.add_child(UI.holo_btn("★  %s" % a.title, _hangout.bind(a), Color("ff7ab8"), 76))
	# closed?
	var open_slots: Array = l.get("open", [0, 1, 2, 3])
	if not (int(Game.s.time_slot) in open_slots.map(func(x): return int(x))):
		body.add_child(_info("This place is closed right now (%s). Come back later." % Game.slot_name()))
	else:
		_build_npcs(l)
		_build_activities(l)
	# always-available
	var g := UI.grid(2)
	body.add_child(g)
	var residential: bool = str(l.get("district", "")) == "residential"
	if residential or bool(l.get("home", false)) or str(l.get("district", "")) in ["oa", "multiverse"]:
		g.add_child(_act_btn("Sleep (end day)", _sleep))
	if residential:
		g.add_child(_act_btn("My Home", func(): main.push("housing")))
	if not Game.is_night():
		g.add_child(_act_btn("Wait (%s → next)" % Game.slot_name(), func(): Game.advance_slot()))


func _info(t: String) -> PanelContainer:
	var p := UI.panel(Color(0.04, 0.06, 0.16, 0.75), 12, Color(1, 1, 1, 0.1), 1, 12)
	p.add_child(UI.label(t, 19, Color("c5d0ee")))
	return p


func _act_btn(t: String, cb: Callable) -> Button:
	var b := UI.btn(t, cb, 76, 21)
	b.add_theme_stylebox_override("normal", UI.box(Color(0.06, 0.09, 0.2, 0.88), 12, Color(1, 1, 1, 0.2), 1, 10))
	b.add_theme_color_override("font_color", Color("eef2ff"))
	return b


func _build_npcs(l: Dictionary) -> void:
	var here: Array = []
	for n in l.get("npcs", []):
		var npc_id := str(n.get("id", ""))
		if not Game.check_cond(n.get("if", {})):
			continue
		var sl: Array = n.get("slots", [0, 1, 2])
		if not (int(Game.s.time_slot) in sl.map(func(x): return int(x))):
			continue
		here.append(npc_id)
	if here.is_empty():
		return
	body.add_child(UI.label("People here", 20, Color("dfe6ff")))
	var row := UI.grid(3)
	body.add_child(row)
	for npc_id in here:
		var card := VBoxContainer.new()
		card.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		var pv := PortraitView.new()
		pv.custom_minimum_size = Vector2(0, 150)
		pv.set_char(npc_id, "normal")
		card.add_child(pv)
		var b := _act_btn(Data.char_name(npc_id), _talk.bind(npc_id))
		b.custom_minimum_size = Vector2(0, 60)
		card.add_child(b)
		row.add_child(card)


func _build_activities(l: Dictionary) -> void:
	var acts: Array = l.get("activities", [])
	if acts.is_empty():
		return
	body.add_child(UI.label("Activities", 20, Color("dfe6ff")))
	var g := UI.grid(2)
	body.add_child(g)
	for a in acts:
		if not Game.check_cond(a.get("if", {})):
			continue
		var sl: Array = a.get("slots", [0, 1, 2, 3])
		if not (int(Game.s.time_slot) in sl.map(func(x): return int(x))):
			continue
		var label_t := str(a.get("label", a.get("id", "")))
		if int(a.get("energy", 0)) > 0:
			label_t += "  (−%d EN)" % int(a.energy)
		if int(a.get("cost", 0)) > 0:
			label_t += "  ◈%d" % int(a.cost)
		g.add_child(_act_btn(label_t, _do_activity.bind(a)))


# ---------------------------------------------------------------- actions
func _play_story() -> void:
	main.go("story", {"scene": Story.next_id()})


func _sleep() -> void:
	SaveManager.autosave()
	var r := ColorRect.new()
	r.color = Color(0, 0, 0, 0)
	UI.full(r)
	add_child(r)
	var tw := create_tween()
	tw.tween_property(r, "color:a", 1.0, Settings.anim(0.5))
	tw.tween_callback(func(): Game.sleep())
	tw.tween_property(r, "color:a", 0.0, Settings.anim(0.6))
	tw.tween_callback(r.queue_free)


func _talk(npc_id: String) -> void:
	var entries: Array = Data.talk.get(npc_id, [])
	var matching: Array = entries.filter(func(e): return Game.check_cond(e.get("if", {})) and not (e.has("once") and Game.has_flag("talk_" + str(e.once))))
	var lines: Array
	if matching.is_empty():
		lines = [{"s": npc_id, "e": "normal", "t": "Hey, {player}."}]
	else:
		var best := -999
		for e in matching:
			best = max(best, int(e.get("priority", 0)))
		var top: Array = matching.filter(func(e): return int(e.get("priority", 0)) == best)
		var pick: Dictionary = top.pick_random()
		lines = pick.get("lines", [])
		if pick.has("once"):
			Game.set_flag("talk_" + str(pick.once))
		for k in pick.get("rel", {}).keys():
			Game.rel_add(npc_id, k, int(pick.rel[k]))
	if not Game.s.talked_today.has(npc_id):
		Game.s.talked_today[npc_id] = true
		Game.rel_add(npc_id, "familiarity", 2)
		Game.rel_add(npc_id, "friendship", 1)
	Game.unlock_character(npc_id)
	Events.fire("talk:" + npc_id)
	Events.fire("talk_any")
	main.push("story", {"lines": lines, "bg": str(loc().get("bg", "")), "call": false, "replay": false, "inline": true})


func _hangout(a: Dictionary) -> void:
	var npc := str(a.npc)
	var entries: Array = Data.talk.get(npc + "_hangout", [])
	var lines: Array = [{"s": npc, "e": "happy", "t": "Glad you came, {player}!"}]
	var matching: Array = entries.filter(func(e): return Game.check_cond(e.get("if", {})))
	if matching.size() > 0:
		lines = matching.pick_random().get("lines", lines)
	Game.s.appointments.erase(a)
	Game.rel_add(npc, "friendship", 6)
	Game.rel_add(npc, "trust", 3)
	Game.remember(npc, "hangout_day_%d" % int(Game.s.date.day_index))
	Events.fire("hangout:" + npc)
	Events.fire("hangout")
	Game.advance_slot()
	main.push("story", {"lines": lines, "bg": str(loc().get("bg", ""))})


func _do_activity(a: Dictionary) -> void:
	var t := str(a.get("type", ""))
	var en := int(a.get("energy", 0))
	var cost := int(a.get("cost", 0))
	match t:
		"travel":
			Game.s.location = str(a.to)
			refresh()
			_first_visit_fire()
			return
		"shop":
			main.push("shop", {"shop": str(a.shop)})
			return
		"job":
			main.push("job", {"job": str(a.job)})
			return
		"class":
			if not Game.use_energy(en):
				Game.notify("Too tired. Rest first.", "warn")
				return
			main.push("job", {"job": "class", "class_subject": str(a.get("subject", "general"))})
			return
		"competition":
			main.push("competition", {"id": str(a.comp)})
			return
		"spar":
			if not Game.use_energy(en):
				Game.notify("Too tired. Rest first.", "warn")
				return
			main.push("combat", {"enemy": str(a.enemy), "story": false})
			return
		"home":
			main.push("housing")
			return
		"phone_app":
			main.push("phone", {"app": str(a.app)})
			return
	# Instant activities
	if en > 0 and not Game.use_energy(en):
		Game.notify("Not enough energy. Rest, eat or sleep.", "warn")
		return
	if cost > 0 and not Game.spend_coins(cost, str(a.get("label", t))):
		return
	match t:
		"train", "study":
			var kind := "mind" if t == "study" else "body"
			var bonus := Cards.training_bonus(kind)
			var stats: Dictionary = a.get("stats", {})
			var first := true
			for st in stats.keys():
				Game.add_stat(st, int(stats[st]) + (bonus if first else 0), str(a.get("label", t)))
				first = false
			Events.fire(t)
		"rest":
			Game.restore(-1 if bool(a.get("full", false)) else Game.max_hp() / 3, Game.max_energy() / 2)
			Game.notify("You feel rested.", "info")
		"eat":
			Game.restore(Game.max_hp() / 4, int(a.get("restore", 40)))
			Events.fire("eat_meal")
			Game.notify("Delicious!", "info")
		"help":
			Game.add_rep("public", int(a.get("rep", 1)))
			Events.fire("help_someone")
			Game.notify(str(a.get("result", "You helped someone. They thank you warmly.")), "info")
		"explore":
			_explore(a)
		"event":
			pass
	if a.has("rel"):
		for npc in a.rel.keys():
			for k in a.rel[npc].keys():
				Game.rel_add(npc, k, int(a.rel[npc][k]))
	if a.has("event"):
		Events.fire(str(a.event))
	Events.fire("act:" + str(a.get("id", t)))
	if int(a.get("exp", 0)) > 0 and Game.has_flag("system_active"):
		Game.add_exp(int(a.exp), str(a.get("label", t)))
	if int(a.get("slot", 1)) > 0:
		Game.advance_slot(int(a.get("slot", 1)))
	else:
		refresh()


func _explore(a: Dictionary) -> void:
	var finds: Array = a.get("finds", [])
	var roll := randf()
	if finds.size() > 0 and roll < 0.6:
		var f: Dictionary = finds.pick_random()
		Game.grant_rewards(f.get("r", {}), "exploring")
		Game.notify(str(f.get("t", "You found something.")), "event")
	else:
		Game.notify("You explore for a while. Nothing unusual… this time.", "info")
	Events.fire("explore:" + str(Game.s.location))
	Events.fire("explore")


func _menu() -> void:
	var m := UI.modal(self, "Menu", 560)
	var _cb1 := func():
		m.shade.queue_free()
		main.push("saves", {"mode": "save"})
	m.body.add_child(UI.btn("Save Game", _cb1))
	var _cb2 := func():
		m.shade.queue_free()
		main.push("saves", {"mode": "load"})
	m.body.add_child(UI.btn("Load Game", _cb2))
	var _cb3 := func():
		m.shade.queue_free()
		main.push("settings")
	m.body.add_child(UI.btn("Settings", _cb3))
	var _cb4 := func():
		m.shade.queue_free()
		main.push("gallery", {"tab": "characters"})
	m.body.add_child(UI.btn("Galleries", _cb4))
	var _cb5 := func():
		m.shade.queue_free()
		SaveManager.autosave()
		Game.active = false
		main.go("menu")
	m.body.add_child(UI.btn("Main Menu (autosave)", _cb5))
