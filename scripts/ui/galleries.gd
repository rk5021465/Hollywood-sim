extends Control
## Character, Card and Scene galleries (Part 21).
## args: {"tab": "characters" | "cards" | "scenes"}

var main
var tab := "characters"
var body: VBoxContainer


func setup(args: Dictionary) -> void:
	tab = str(args.get("tab", "characters"))
	UI.screen_bg(self, Color("0b1024"))
	var root := UI.vbox(10)
	add_child(UI.margin(root, 16))
	root.add_child(UI.header("Galleries", func(): main.pop(), UI.HOLO_GOLD))
	var tabs := UI.hbox()
	root.add_child(tabs)
	for t in [["characters", "Characters"], ["cards", "Cards"], ["scenes", "Scenes"]]:
		tabs.add_child(UI.holo_btn(t[1], _set_tab.bind(t[0]), UI.HOLO_PURPLE, 60))
	body = UI.vbox(10)
	root.add_child(UI.scroll(body))
	refresh()


func _set_tab(t: String) -> void:
	tab = t
	refresh()


func refresh() -> void:
	UI.clear(body)
	match tab:
		"cards": _cards()
		"scenes": _scenes()
		_: _characters()


func _characters() -> void:
	var g := UI.grid(3)
	body.add_child(g)
	for id in Data.characters.keys():
		var c: Dictionary = Data.characters[id]
		if bool(c.get("hidden", false)) or str(c.get("style", "")) == "pet":
			continue
		var unlocked := bool(Game.s.gallery.characters.get(id, false))
		var v := VBoxContainer.new()
		v.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		var pv := PortraitView.new()
		pv.custom_minimum_size = Vector2(0, 190)
		pv.set_char(id, "normal")
		pv.dim = not unlocked
		if not unlocked:
			pv.modulate = Color(0, 0, 0, 0.85)
		v.add_child(pv)
		var b := UI.btn(Data.char_name(id) if unlocked else "???", _char_detail.bind(id), 60, 18)
		b.disabled = not unlocked
		v.add_child(b)
		g.add_child(v)


func _char_detail(id: String) -> void:
	var c := Data.character(id)
	var m := UI.modal(self, Data.char_name(id), 660)
	var top := UI.hbox(12)
	m.body.add_child(top)
	var pv := PortraitView.new()
	pv.custom_minimum_size = Vector2(240, 300)
	pv.size_flags_horizontal = Control.SIZE_SHRINK_BEGIN
	pv.set_char(id, "normal")
	top.add_child(pv)
	var info := UI.vbox(4)
	top.add_child(info)
	var age := int(c.get("age", 0))
	if id == "peter":
		age = int(Game.s.player.age)
	elif str(Game.s.get("era", "teen")) == "adult" and age > 0:
		age += 10
	if age > 0:
		info.add_child(UI.label("Age: %d" % age, 20))
	if c.has("role"):
		info.add_child(UI.label(str(c.role), 19, Settings.accent()))
	if c.has("crew"):
		info.add_child(UI.label("Crew: " + str(Data.crews.get(str(c.crew), {}).get("name", c.crew)), 19, Color(str(Data.crews.get(str(c.crew), {}).get("color", "ffffff")))))
	info.add_child(UI.label("Personality: " + str(c.get("personality", "—")), 18))
	m.body.add_child(UI.label(str(c.get("bio", "")), 19))
	if c.has("powers"):
		m.body.add_child(UI.label("Powers: " + ", ".join(c.powers), 19, UI.HOLO_PURPLE))
	if id != "peter":
		for k in Game.REL_KEYS:
			var row := UI.hbox()
			row.add_child(UI.label(k.capitalize(), 17, Color("aab6d6"), false))
			row.add_child(UI.bar(Game.rel_get(id, k), 100, Color("e9406c") if k == "rivalry" else Settings.accent(), 10))
			m.body.add_child(row)
	if c.has("stats"):
		if Cards.owns("stat_inspection") or id == "peter":
			var parts: Array = []
			for k in c.stats.keys():
				parts.append("%s %d" % [Game.STAT_NAMES.get(k, k).left(3), int(c.stats[k])])
			m.body.add_child(UI.label("Stats: " + "  ".join(parts), 17, Color("b8c6e6")))
		else:
			m.body.add_child(UI.label("Stats: hidden (requires Stat Inspection card)", 17, Color("8fa0c8")))
	if c.has("crew"):
		var cr: Dictionary = Data.crews.get(str(c.crew), {})
		m.body.add_child(UI.label("Crew info: %s — %s" % [cr.get("name", ""), cr.get("desc", "")], 17, Color("b8c6e6")))


func _cards() -> void:
	body.add_child(UI.label("Collected %d / %d" % [Game.s.cards.size(), Data.cards.size()], 20, Color("aab6d6")))
	var ids: Array = Data.cards.keys()
	ids.sort_custom(func(a, b): return Data.rarity_index(str(Data.card(a).get("rarity", ""))) < Data.rarity_index(str(Data.card(b).get("rarity", ""))))
	var g := UI.grid(3)
	body.add_child(g)
	for id in ids:
		var c := CardArt.new()
		c.custom_minimum_size = Vector2(0, 290)
		c.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		c.set_card(id, not Game.s.cards.has(id))
		c.tapped.connect(_card_info)
		g.add_child(c)


func _card_info(id: String) -> void:
	var d := Data.card(id)
	var owned: bool = Game.s.cards.has(id)
	var m := UI.modal(self, str(d.get("name", id)) if owned else "Unknown card", 600)
	m.body.add_child(UI.label(Data.RARITY_NAMES.get(str(d.get("rarity", "")), ""), 22, Data.RARITY_COLORS.get(str(d.get("rarity", "")), Color.WHITE)))
	if owned:
		m.body.add_child(UI.label(str(d.get("desc", "")), 20))
	m.body.add_child(UI.label("How to unlock: " + str(d.get("unlock", "???")) if owned or not bool(d.get("special", false)) else "How to unlock: a special event…", 18, Color("aab6d6")))


func _scenes() -> void:
	var seen: Dictionary = Game.s.gallery.scenes
	body.add_child(UI.label("Replay story scenes you've completed.", 20, Color("aab6d6")))
	for ch in Data.chapters:
		body.add_child(UI.label("Chapter %d — %s" % [int(ch.n), ch.title], 22, UI.HOLO_GOLD))
		for sid in Data.scenes.keys():
			var sc: Dictionary = Data.scenes[sid]
			if int(sc.get("chapter", -1)) != int(ch.n):
				continue
			var unlocked := seen.has(sid)
			var b := UI.btn(str(sc.get("title", sid)) if unlocked else "🔒 Locked scene", _replay.bind(sid), 60, 19)
			b.disabled = not unlocked
			body.add_child(b)


func _replay(sid: String) -> void:
	main.push("story", {"scene": sid, "replay": true})
