extends Control
## Story / dialogue engine (Phase 2).
## Plays scene data from data/story/*.json: backgrounds, portraits with
## expressions, typewriter text, tap-to-continue, choices, auto-read, skip,
## dialogue history, cinematic transitions, System pop-ups, chapter cards,
## and hands off to combat / competitions, then resumes at a label.
## args: {"scene": id, "replay": bool, "call": bool, "lines": Array (inline scene)}

var main
var scene: Dictionary = {}
var lines: Array = []
var labels: Dictionary = {}
var idx := 0
var replay := false
var call_mode := false
var inline := false   # talk / hangout / phone call snippets (not main story)
var busy := false
var typing := false
var waiting_choice := false
var auto := false
var skipping := false
var history: Array = []

var bg: BackgroundView
var portrait_layer: Control
var slots: Dictionary = {}      # "left"/"center"/"right" -> PortraitView
var slot_char: Dictionary = {}  # pos -> char_id
var panel: PanelContainer
var name_label: Label
var text_label: RichTextLabel
var choice_box: VBoxContainer
var top_bar: HBoxContainer
var auto_btn: Button
var skip_btn: Button
var fx_layer: Control
var system_popup: Control = null
var _type_accum := 0.0
var _auto_timer := 0.0


func setup(args: Dictionary) -> void:
	replay = bool(args.get("replay", false))
	call_mode = bool(args.get("call", false))
	inline = args.has("lines")
	auto = bool(Settings.get_v("auto_read"))
	_build_ui()
	if args.has("lines"):
		_load_inline(args)
	else:
		_load_scene(str(args.get("scene", "")))


func _build_ui() -> void:
	UI.screen_bg(self, Color.BLACK)
	bg = BackgroundView.new()
	UI.full(bg)
	add_child(bg)
	portrait_layer = UI.full(Control.new())
	portrait_layer.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(portrait_layer)
	for pos in ["left", "center", "right"]:
		var pv := PortraitView.new()
		var ranges := {"left": [-0.04, 0.58], "center": [0.2, 0.8], "right": [0.42, 1.04]}
		pv.anchor_left = ranges[pos][0]
		pv.anchor_right = ranges[pos][1]
		pv.anchor_top = 0.14
		pv.anchor_bottom = 0.74
		pv.visible = false
		portrait_layer.add_child(pv)
		slots[pos] = pv
	# tap catcher (whole screen)
	var tap := UI.full(Control.new())
	tap.mouse_filter = Control.MOUSE_FILTER_STOP
	tap.gui_input.connect(_on_tap)
	add_child(tap)
	# dialogue panel
	panel = PanelContainer.new()
	panel.anchor_left = 0.0
	panel.anchor_right = 1.0
	panel.anchor_top = 0.70
	panel.anchor_bottom = 1.0
	panel.offset_left = 14
	panel.offset_right = -14
	panel.offset_bottom = -14
	panel.add_theme_stylebox_override("panel", UI.box(Color(0.04, 0.05, 0.12, 0.9), 18, Settings.accent(), 2, 20))
	panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(panel)
	var pv2 := UI.vbox(8)
	pv2.mouse_filter = Control.MOUSE_FILTER_IGNORE
	panel.add_child(pv2)
	name_label = UI.label("", 28, UI.HOLO_GOLD)
	pv2.add_child(name_label)
	text_label = RichTextLabel.new()
	text_label.bbcode_enabled = true
	text_label.size_flags_vertical = Control.SIZE_EXPAND_FILL
	text_label.mouse_filter = Control.MOUSE_FILTER_IGNORE
	text_label.add_theme_font_size_override("normal_font_size", Settings.font_size(27))
	text_label.add_theme_font_size_override("italics_font_size", Settings.font_size(27))
	text_label.add_theme_font_size_override("bold_font_size", Settings.font_size(27))
	text_label.add_theme_color_override("default_color", Settings.text_color() if Settings.is_dark() else Color("eef2ff"))
	pv2.add_child(text_label)
	# choices
	choice_box = UI.vbox(12)
	choice_box.anchor_left = 0.06
	choice_box.anchor_right = 0.94
	choice_box.anchor_top = 0.32
	choice_box.anchor_bottom = 0.68
	choice_box.alignment = BoxContainer.ALIGNMENT_END
	choice_box.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(choice_box)
	# top controls
	top_bar = UI.hbox(8)
	top_bar.set_anchors_and_offsets_preset(Control.PRESET_TOP_WIDE)
	top_bar.offset_left = 14
	top_bar.offset_right = -14
	top_bar.offset_top = 14
	top_bar.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(top_bar)
	auto_btn = _small_btn("Auto", _toggle_auto)
	skip_btn = _small_btn("Skip", _toggle_skip)
	top_bar.add_child(auto_btn)
	top_bar.add_child(skip_btn)
	top_bar.add_child(_small_btn("Log", _show_history))
	if replay or call_mode or inline:
		top_bar.add_child(_small_btn("Exit", _exit_now))
	else:
		top_bar.add_child(_small_btn("Save", func(): main.push("saves", {"mode": "save"})))
	fx_layer = UI.full(Control.new())
	fx_layer.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(fx_layer)
	_update_toggle_buttons()


func _small_btn(t: String, cb: Callable) -> Button:
	var b := UI.btn(t, cb, 56, 20)
	b.custom_minimum_size = Vector2(110, 56)
	b.add_theme_stylebox_override("normal", UI.box(Color(0, 0, 0, 0.45), 10, Color(1, 1, 1, 0.25), 1, 8))
	return b


func _load_scene(id: String) -> void:
	scene = Story.scene(id)
	if scene.is_empty():
		push_warning("Story scene not found: " + id)
		_finish()
		return
	if not replay and not call_mode:
		Story.start_scene(id)
	_prepare(scene.get("lines", []))
	if scene.has("music"):
		Audio.play_music(str(scene.music))
	busy = true
	await _transition(str(scene.get("transition", "fade")), str(scene.get("bg", "")))
	if scene.has("chapter_card"):
		await _chapter_card(str(scene.chapter_card))
	busy = false
	_advance()


func _load_inline(args: Dictionary) -> void:
	scene = {"id": "", "bg": args.get("bg", "")}
	_prepare(args.lines)
	bg.set_bg(str(args.get("bg", "")))
	if call_mode:
		var bar := UI.panel(Color(0.05, 0.25, 0.15, 0.95), 0, Color(0, 0, 0, 0), 0, 14)
		bar.set_anchors_and_offsets_preset(Control.PRESET_TOP_WIDE)
		bar.offset_top = 84
		bar.mouse_filter = Control.MOUSE_FILTER_IGNORE
		var l := UI.label("📞 On call…", 24, Color.WHITE)
		bar.add_child(l)
		fx_layer.add_child(bar)
	_advance()


func _prepare(src: Array) -> void:
	lines = src
	labels.clear()
	idx = 0
	for i in lines.size():
		var ln = lines[i]
		if ln is Dictionary and str(ln.get("cmd", "")) == "label":
			labels[str(ln.name)] = i


# ---------------------------------------------------------------- flow
func _on_tap(event: InputEvent) -> void:
	if not (event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT):
		return
	if system_popup != null or waiting_choice:
		return
	if skipping:
		skipping = false
		_update_toggle_buttons()
	if typing:
		text_label.visible_ratio = 1.0
		typing = false
		return
	_advance()


func _process(delta: float) -> void:
	if typing:
		var spd := float(Settings.get_v("typewriter_speed"))
		if spd <= 0.0 or skipping:
			text_label.visible_ratio = 1.0
			typing = false
		else:
			_type_accum += delta * spd
			var total := text_label.get_total_character_count()
			text_label.visible_characters = min(total, int(_type_accum))
			if text_label.visible_characters >= total:
				typing = false
	elif (auto or skipping) and not busy and not waiting_choice and system_popup == null:
		_auto_timer += delta
		var delay := 0.08 if skipping else float(Settings.get_v("auto_delay"))
		if _auto_timer >= delay:
			_auto_timer = 0.0
			_advance()


func _advance() -> void:
	if busy:
		return
	busy = true
	_auto_timer = 0.0
	while idx < lines.size():
		var ln = lines[idx]
		idx += 1
		if not (ln is Dictionary):
			continue
		if ln.has("if") and not replay and not Game.check_cond(ln["if"]):
			continue
		if ln.has("cmd"):
			var stop: bool = await _cmd(ln)
			if stop:
				busy = false
				return
			continue
		if ln.has("choice"):
			_show_choices(ln.choice)
			busy = false
			return
		_show_line(ln)
		busy = false
		return
	busy = false
	_finish()


func _jump(label_name: String) -> void:
	if labels.has(label_name):
		idx = int(labels[label_name]) + 1
	else:
		push_warning("Story label not found: " + label_name)


# ---------------------------------------------------------------- lines
func _sub(t: String) -> String:
	return t.replace("{player}", Game.player_name()).replace("{age}", str(Game.s.player.get("age", 16)))


func _show_line(ln: Dictionary) -> void:
	var speaker := str(ln.get("s", "narrator"))
	var text := _sub(str(ln.get("t", "")))
	if ln.has("sfx"):
		Audio.play_sfx(str(ln.sfx))
	var display_name := ""
	if speaker == "narrator":
		text = "[i]" + text + "[/i]"
		_dim_all(true)
	elif speaker == "system":
		display_name = "[ SYSTEM ]"
		text = "[color=#7cc8ff]" + text + "[/color]"
		Audio.play_sfx("system")
	else:
		display_name = str(ln.get("n", Data.char_name(speaker)))
		if speaker in Data.characters or ln.has("e"):
			_show_char(speaker, str(ln.get("e", "")), str(ln.get("p", "")))
		_highlight(speaker)
		if bool(ln.get("think", false)):
			text = "[i](" + text + ")[/i]"
	name_label.text = display_name
	name_label.visible = display_name != ""
	name_label.add_theme_color_override("font_color", UI.HOLO_BLUE if speaker == "system" else Color(str(Data.character(speaker).get("name_color", "f5c542"))))
	text_label.text = text
	text_label.visible_characters = 0
	_type_accum = 0.0
	typing = true
	history.append([display_name, text])
	if history.size() > 200:
		history.pop_front()
	if not replay and Game.active and speaker != "narrator" and speaker != "system":
		Game.unlock_character(speaker)


func _show_char(id: String, e: String, pos: String) -> void:
	var cur_pos := ""
	for p in slot_char.keys():
		if slot_char[p] == id:
			cur_pos = p
	if pos == "":
		pos = cur_pos
	if pos == "":
		pos = "left" if not slot_char.has("left") else ("right" if not slot_char.has("right") else "center")
	if cur_pos != "" and cur_pos != pos:
		_hide_char(id)
	var pv: PortraitView = slots[pos]
	var expr := e if e != "" else (pv.expr if slot_char.get(pos, "") == id else "normal")
	var entering: bool = slot_char.get(pos, "") != id
	slot_char[pos] = id
	pv.set_char(id, expr)
	pv.visible = true
	if entering:
		pv.modulate.a = 0.0
		var dx := -60.0 if pos == "left" else (60.0 if pos == "right" else 0.0)
		pv.position.x += dx
		var tw := create_tween().set_parallel(true)
		tw.tween_property(pv, "modulate:a", 1.0, Settings.anim(0.3))
		tw.tween_property(pv, "position:x", pv.position.x - dx, Settings.anim(0.3))


func _hide_char(id: String) -> void:
	for p in slot_char.keys().duplicate():
		if slot_char[p] == id:
			var pv: PortraitView = slots[p]
			slot_char.erase(p)
			var tw := create_tween()
			tw.tween_property(pv, "modulate:a", 0.0, Settings.anim(0.25))
			tw.tween_callback(func(): pv.visible = false)


func _highlight(id: String) -> void:
	for p in slots.keys():
		var pv: PortraitView = slots[p]
		pv.dim = slot_char.get(p, "") != id
		pv.queue_redraw()


func _dim_all(d: bool) -> void:
	for p in slots.keys():
		slots[p].dim = d
		slots[p].queue_redraw()


func _show_choices(choices: Array) -> void:
	waiting_choice = true
	skipping = false
	_update_toggle_buttons()
	UI.clear(choice_box)
	for c in choices:
		if not replay and c.has("if") and not Game.check_cond(c["if"]):
			continue
		var b := UI.holo_btn(_sub(str(c.t)), _choose.bind(c), Settings.accent(), 76)
		choice_box.add_child(b)


func _choose(c: Dictionary) -> void:
	waiting_choice = false
	UI.clear(choice_box)
	history.append(["» You", _sub(str(c.t))])
	if not replay:
		for f in c.get("flags", []):
			Game.set_flag(str(f))
		for npc in c.get("rel", {}).keys():
			for k in c.rel[npc].keys():
				Game.rel_add(npc, k, int(c.rel[npc][k]))
		for npc in c.get("remember", {}).keys():
			Game.remember(npc, str(c.remember[npc]))
		if c.has("reward"):
			Game.grant_rewards(c.reward, "story choice")
			await main.wait_reveals()
		if c.has("event"):
			Events.fire(str(c.event))
	if c.has("goto"):
		_jump(str(c.goto))
	_advance()


# ---------------------------------------------------------------- commands
func _cmd(ln: Dictionary) -> bool:
	## Returns true when the story must wait for player input.
	var cmd := str(ln.cmd)
	var effect := not replay
	match cmd:
		"label":
			pass
		"goto":
			_jump(str(ln.label))
		"show":
			_show_char(str(ln.c), str(ln.get("e", "normal")), str(ln.get("p", "")))
		"hide":
			_hide_char(str(ln.c))
		"hide_all":
			for p in slot_char.keys().duplicate():
				_hide_char(str(slot_char[p]))
		"bg":
			await _transition(str(ln.get("tr", "fade")), str(ln.id))
		"music":
			Audio.play_music(str(ln.id))
		"sfx":
			Audio.play_sfx(str(ln.id))
		"wait":
			await get_tree().create_timer(Settings.anim(float(ln.get("t", 0.8)))).timeout
		"shake":
			_shake()
		"flash":
			await _overlay_fade(Color.WHITE, 0.08, 0.0, 0.5)
		"chapter":
			await _chapter_card(str(ln.get("t", "")))
		"system":
			_show_system(ln)
			return true
		"combat":
			if not effect:
				_jump(str(ln.get("replay", ln.get("lose", ln.get("win", "")))))
				return false
			main.push("combat", {"enemy": str(ln.enemy), "story": true, "allies": ln.get("allies", []), "on_done": _on_battle_done.bind(ln)})
			return true
		"competition":
			if not effect:
				_jump(str(ln.get("replay", ln.get("lose", ""))))
				return false
			main.push("competition", {"id": str(ln.id), "story": true, "on_done": _on_comp_done.bind(ln)})
			return true
		"timeskip":
			await _timeskip(str(ln.get("t", "Years later")))
			if effect:
				Game.time_skip_years(int(ln.get("years", 1)))
		"end":
			idx = lines.size()
		_:
			if effect:
				await _effect_cmd(cmd, ln)
	return false


func _effect_cmd(cmd: String, ln: Dictionary) -> void:
	match cmd:
		"flag":
			for f in ln.get("set", []):
				Game.set_flag(str(f))
			for f in ln.get("unset", []):
				Game.set_flag(str(f), false)
		"rel":
			for k in ln.get("add", {}).keys():
				Game.rel_add(str(ln.npc), k, int(ln.add[k]))
			if ln.has("remember"):
				Game.remember(str(ln.npc), str(ln.remember))
		"reward":
			Game.grant_rewards(ln.get("r", {}), str(ln.get("why", "story")))
			await main.wait_reveals()
		"card":
			Cards.grant(str(ln.id), str(ln.get("why", "story")))
			await main.wait_reveals()
		"quest":
			Quests.offer(str(ln.id), bool(ln.get("accept", true)))
		"event":
			Events.fire(str(ln.name))
		"days":
			Game.advance_days(int(ln.get("n", 1)))
		"slot":
			Game.s.time_slot = clampi(int(ln.get("n", 0)), 0, 3)
			Events.time_changed.emit()
		"location":
			Game.s.location = str(ln.id)
		"message":
			Game.receive_message(str(ln.from), _sub(str(ln.t)))
		"send_message":
			Game.send_message(str(ln.to), _sub(str(ln.t)))
		"news":
			Game.add_news(str(ln.key))
		"contact":
			Game.add_contact(str(ln.npc))
		"pending_call":
			Game.s.pending_calls[str(ln.npc)] = str(ln.call)
		"shadow":
			Game.add_shadow(str(ln.id))
		"stat":
			for st in ln.get("add", {}).keys():
				Game.add_stat(st, int(ln.add[st]), str(ln.get("why", "story")))
		"unlock_ring":
			Game.s.ring.unlocked = true
			Game.log_history("White Lantern ring bonded.")
		"aura":
			if not (str(ln.id) in Game.s.ring.auras):
				Game.s.ring.auras.append(str(ln.id))
				Game.notify("Aura mastered: %s" % str(ln.id).capitalize(), "system")
		"rep":
			for k in ln.get("add", {}).keys():
				Game.add_rep(k, int(ln.add[k]))
		"restore":
			Game.restore()
		"card_exp_all":
			for cid in Cards.owned().keys():
				Cards.add_card_exp(cid, int(ln.get("n", 100)))
		"set_house":
			if not (str(ln.id) in Game.s.houses.owned):
				Game.s.houses.owned.append(str(ln.id))
			Game.s.houses.current = str(ln.id)
		"autosave":
			SaveManager.autosave()


func _on_battle_done(won: bool, ln: Dictionary) -> void:
	_jump(str(ln.get("win" if won else "lose", "")))
	_advance()


func _on_comp_done(place: int, ln: Dictionary) -> void:
	var need := int(ln.get("place", 3))
	_jump(str(ln.get("win" if place <= need else "lose", "")))
	_advance()


# ---------------------------------------------------------------- system popup
func _show_system(ln: Dictionary) -> void:
	Audio.play_sfx("system")
	var shade := ColorRect.new()
	shade.color = Color(0, 0.02, 0.08, 0.55)
	UI.full(shade)
	add_child(shade)
	system_popup = shade
	var cc := CenterContainer.new()
	UI.full(cc)
	shade.add_child(cc)
	var p := UI.holo_panel(UI.HOLO_BLUE)
	p.custom_minimum_size = Vector2(600, 0)
	cc.add_child(p)
	var v := UI.vbox(18)
	p.add_child(v)
	var t := UI.label("[ SYSTEM ]", 26, UI.HOLO_BLUE)
	t.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	v.add_child(t)
	var msg := UI.label(_sub(str(ln.get("t", ""))), 32, Color("e8f4ff"))
	msg.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	v.add_child(msg)
	var buttons: Array = ln.get("buttons", ["OK"])
	var row := UI.hbox(16)
	v.add_child(row)
	var btns: Array = []
	for i in buttons.size():
		var b := UI.holo_btn(str(buttons[i]), _system_pick.bind(i, ln), UI.HOLO_BLUE if i == 0 else UI.HOLO_PURPLE, 80)
		row.add_child(b)
		btns.append(b)
	p.scale = Vector2(0.85, 0.85)
	p.modulate.a = 0.0
	p.pivot_offset = Vector2(300, 120)
	var tw := create_tween().set_parallel(true)
	tw.tween_property(p, "scale", Vector2.ONE, Settings.anim(0.3)).set_trans(Tween.TRANS_BACK)
	tw.tween_property(p, "modulate:a", 1.0, Settings.anim(0.3))
	if ln.has("force"):
		for b in btns:
			b.disabled = true
		await get_tree().create_timer(1.6).timeout
		if is_instance_valid(shade):
			_system_pick(int(ln.force), ln)


func _system_pick(i: int, ln: Dictionary) -> void:
	if system_popup == null:
		return
	Audio.play_sfx("click")
	system_popup.queue_free()
	system_popup = null
	var opts: Array = ln.get("buttons", ["OK"])
	history.append(["[ SYSTEM ]", "%s → %s" % [ln.get("t", ""), opts[i] if i < opts.size() else ""]])
	if not replay:
		var on: Array = ln.get("on", [])
		if i < on.size() and on[i] is Dictionary:
			var o: Dictionary = on[i]
			for f in o.get("flags", []):
				Game.set_flag(str(f))
			if o.has("goto"):
				_jump(str(o.goto))
	else:
		var on2: Array = ln.get("on", [])
		if i < on2.size() and on2[i] is Dictionary and on2[i].has("goto"):
			_jump(str(on2[i].goto))
	_advance()


# ---------------------------------------------------------------- transitions & fx
func _overlay_fade(col: Color, t_in: float, hold: float, t_out: float) -> void:
	var r := ColorRect.new()
	r.color = Color(col.r, col.g, col.b, 0.0)
	UI.full(r)
	r.mouse_filter = Control.MOUSE_FILTER_IGNORE
	fx_layer.add_child(r)
	var tw := create_tween()
	tw.tween_property(r, "color:a", 1.0, Settings.anim(t_in))
	tw.tween_interval(Settings.anim(hold))
	tw.tween_property(r, "color:a", 0.0, Settings.anim(t_out))
	tw.tween_callback(r.queue_free)
	await get_tree().create_timer(Settings.anim(t_in + hold)).timeout


func _transition(kind: String, new_bg: String) -> void:
	Audio.play_sfx("transition")
	match kind:
		"none":
			if new_bg != "": bg.set_bg(new_bg)
		"black":
			await _overlay_fade(Color.BLACK, 0.5, 0.5, 0.6)
			if new_bg != "": bg.set_bg(new_bg)
		"white":
			await _overlay_fade(Color.WHITE, 0.15, 0.2, 0.8)
			if new_bg != "": bg.set_bg(new_bg)
		"portal":
			await _portal()
			if new_bg != "": bg.set_bg(new_bg)
		"zoom", "blur":
			var tw := create_tween()
			bg.pivot_offset = bg.size / 2.0
			tw.tween_property(bg, "scale", Vector2(1.15, 1.15), Settings.anim(0.4))
			tw.parallel().tween_property(bg, "modulate:a", 0.0, Settings.anim(0.4))
			await tw.finished
			if new_bg != "": bg.set_bg(new_bg)
			var tw2 := create_tween()
			tw2.tween_property(bg, "scale", Vector2.ONE, Settings.anim(0.5))
			tw2.parallel().tween_property(bg, "modulate:a", 1.0, Settings.anim(0.5))
		_:
			await _overlay_fade(Color.BLACK, 0.25, 0.05, 0.35)
			if new_bg != "": bg.set_bg(new_bg)
	if not replay and Game.active and new_bg != "":
		Game.s.gallery.backgrounds[new_bg] = true


func _portal() -> void:
	var c := Control.new()
	UI.full(c)
	c.mouse_filter = Control.MOUSE_FILTER_IGNORE
	fx_layer.add_child(c)
	var rings: Array = []
	for i in 6:
		var r := ColorRect.new()
		r.color = [UI.HOLO_PURPLE, UI.HOLO_BLUE, Color("3ddc97")][i % 3]
		r.size = Vector2(40, 40)
		r.position = size / 2.0 - Vector2(20, 20)
		r.pivot_offset = Vector2(20, 20)
		r.rotation = i * 0.5
		r.modulate.a = 0.0
		c.add_child(r)
		rings.append(r)
	var tw := create_tween().set_parallel(true)
	for i in rings.size():
		tw.tween_property(rings[i], "scale", Vector2(40, 40), Settings.anim(0.9)).set_delay(i * 0.08)
		tw.tween_property(rings[i], "rotation", rings[i].rotation + 3.0, Settings.anim(0.9)).set_delay(i * 0.08)
		tw.tween_property(rings[i], "modulate:a", 0.8, Settings.anim(0.3)).set_delay(i * 0.08)
	await get_tree().create_timer(Settings.anim(1.2)).timeout
	await _overlay_fade(Color.WHITE, 0.1, 0.1, 0.6)
	c.queue_free()


func _chapter_card(t: String) -> void:
	var r := ColorRect.new()
	r.color = Color(0, 0, 0, 0.0)
	UI.full(r)
	r.mouse_filter = Control.MOUSE_FILTER_IGNORE
	fx_layer.add_child(r)
	var l := UI.label(_sub(t), 44, UI.HOLO_GOLD)
	UI.full(l)
	l.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	l.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	l.modulate.a = 0.0
	r.add_child(l)
	var tw := create_tween()
	tw.tween_property(r, "color:a", 0.92, Settings.anim(0.4))
	tw.tween_property(l, "modulate:a", 1.0, Settings.anim(0.5))
	tw.tween_interval(Settings.anim(1.6))
	tw.tween_property(l, "modulate:a", 0.0, Settings.anim(0.4))
	tw.parallel().tween_property(r, "color:a", 0.0, Settings.anim(0.5))
	tw.tween_callback(r.queue_free)
	await tw.finished


func _timeskip(t: String) -> void:
	var r := ColorRect.new()
	r.color = Color(0, 0, 0, 0.0)
	UI.full(r)
	r.mouse_filter = Control.MOUSE_FILTER_IGNORE
	fx_layer.add_child(r)
	var v := UI.vbox(20)
	UI.full(v)
	v.alignment = BoxContainer.ALIGNMENT_CENTER
	r.add_child(v)
	var year_l := UI.label(str(Game.s.date.year), 80, Color("eaf4ff"))
	year_l.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	v.add_child(year_l)
	var l := UI.label(_sub(t), 40, UI.HOLO_GOLD)
	l.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	l.modulate.a = 0.0
	v.add_child(l)
	var start := int(Game.s.date.year)
	var tw := create_tween()
	tw.tween_property(r, "color:a", 1.0, Settings.anim(0.8))
	tw.tween_method(func(x: float): year_l.text = str(start + int(x)), 0.0, 10.0, Settings.anim(2.2))
	tw.tween_property(l, "modulate:a", 1.0, Settings.anim(0.6))
	tw.tween_interval(Settings.anim(1.5))
	tw.tween_property(r, "color:a", 0.0, Settings.anim(0.8))
	tw.parallel().tween_property(v, "modulate:a", 0.0, Settings.anim(0.6))
	tw.tween_callback(r.queue_free)
	await tw.finished


func _shake() -> void:
	if bool(Settings.get_v("reduce_motion")):
		return
	var tw := create_tween()
	for i in 6:
		tw.tween_property(self, "position", Vector2(randf_range(-14, 14), randf_range(-10, 10)), 0.04)
	tw.tween_property(self, "position", Vector2.ZERO, 0.05)


# ---------------------------------------------------------------- controls
func _toggle_auto() -> void:
	auto = not auto
	_update_toggle_buttons()


func _toggle_skip() -> void:
	skipping = not skipping
	_update_toggle_buttons()
	if skipping and not typing and not waiting_choice:
		_advance()


func _update_toggle_buttons() -> void:
	if auto_btn:
		auto_btn.text = "Auto ●" if auto else "Auto"
		skip_btn.text = "Skip ●" if skipping else "Skip"


func _show_history() -> void:
	var m := UI.modal(self, "Dialogue History", 660)
	var v := UI.vbox(8)
	var sc := UI.scroll(v)
	sc.custom_minimum_size = Vector2(0, 760)
	m.body.add_child(sc)
	for h in history:
		var r := UI.rich(("[b]%s[/b]\n" % h[0] if str(h[0]) != "" else "") + str(h[1]), 22)
		v.add_child(r)
	await get_tree().process_frame
	sc.scroll_vertical = int(sc.get_v_scroll_bar().max_value)


func on_back() -> bool:
	if system_popup != null:
		return true
	if replay or call_mode or inline:
		_exit_now()
		return true
	return true   # story cannot be backed out of mid-scene; use Save instead


func _exit_now() -> void:
	main.pop()


func _finish() -> void:
	if replay or call_mode or inline:
		main.pop()
		return
	var nxt := Story.finish_scene(str(scene.get("id", "")))
	SaveManager.autosave()
	if nxt != "":
		_reset_for_next()
		_load_scene(nxt)
	else:
		main.go("hub")


func _reset_for_next() -> void:
	for p in slot_char.keys().duplicate():
		slots[p].visible = false
	slot_char.clear()
	history.append(["", "———"])
	text_label.text = ""
	name_label.text = ""
