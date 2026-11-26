extends Control
## Main menu (Part 37).

var main


func setup(_args: Dictionary) -> void:
	Audio.play_music("main_menu")
	var bg := BackgroundView.new()
	UI.full(bg)
	bg.set_bg("main_menu_nexa_night")
	add_child(bg)
	var shade := ColorRect.new()
	shade.color = Color(0.02, 0.03, 0.1, 0.45)
	UI.full(shade)
	add_child(shade)

	var hero := Assets.background("main_menu_peter")
	if hero:
		var tr := TextureRect.new()
		tr.texture = hero
		tr.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		tr.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		tr.set_anchors_and_offsets_preset(Control.PRESET_CENTER_TOP)
		tr.offset_left = -300
		tr.offset_right = 300
		tr.offset_top = 170
		tr.offset_bottom = 760
		add_child(tr)
	else:
		var pv := PortraitView.new()
		pv.set_anchors_and_offsets_preset(Control.PRESET_CENTER_TOP)
		pv.offset_left = -260
		pv.offset_right = 260
		pv.offset_top = 170
		pv.offset_bottom = 720
		pv.set_char("peter", "serious")
		add_child(pv)

	var p := CPUParticles2D.new()
	p.position = Vector2(360, 1300)
	p.amount = 60
	p.lifetime = 7.0
	p.preprocess = 7.0
	p.emission_shape = CPUParticles2D.EMISSION_SHAPE_RECTANGLE
	p.emission_rect_extents = Vector2(400, 10)
	p.direction = Vector2(0, -1)
	p.spread = 15.0
	p.gravity = Vector2.ZERO
	p.initial_velocity_min = 60.0
	p.initial_velocity_max = 160.0
	p.scale_amount_min = 1.5
	p.scale_amount_max = 4.0
	p.color = Color(0.55, 0.75, 1.0, 0.7)
	add_child(p)

	var v := UI.vbox(14)
	v.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	v.offset_left = 60
	v.offset_right = -60
	v.offset_top = 60
	v.offset_bottom = -40
	add_child(v)
	var t := UI.label("NEXA", 110, Color("eaf4ff"))
	t.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	t.add_theme_color_override("font_outline_color", UI.HOLO_BLUE)
	t.add_theme_constant_override("outline_size", 10)
	v.add_child(t)
	var st := UI.label("THE TRANSCENDENT SYSTEM", 30, UI.HOLO_GOLD)
	st.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	v.add_child(st)
	var spacer := Control.new()
	spacer.size_flags_vertical = Control.SIZE_EXPAND_FILL
	v.add_child(spacer)

	var has_any := SaveManager.latest_slot() >= 0
	var cont := UI.holo_btn("Continue", _continue, UI.HOLO_GOLD, 80)
	cont.disabled = not has_any
	v.add_child(cont)
	v.add_child(UI.holo_btn("New Game", _new_game, UI.HOLO_BLUE, 80))
	var row := UI.hbox()
	v.add_child(row)
	var lb := UI.holo_btn("Load Game", func(): main.push("saves", {"mode": "load"}), UI.HOLO_BLUE, 72)
	lb.disabled = not has_any
	row.add_child(lb)
	row.add_child(UI.holo_btn("Settings", func(): main.push("settings"), UI.HOLO_BLUE, 72))
	var row2 := UI.hbox()
	v.add_child(row2)
	row2.add_child(UI.holo_btn("Characters", func(): _gallery("characters"), UI.HOLO_PURPLE, 72))
	row2.add_child(UI.holo_btn("Cards", func(): _gallery("cards"), UI.HOLO_PURPLE, 72))
	row2.add_child(UI.holo_btn("Scenes", func(): _gallery("scenes"), UI.HOLO_PURPLE, 72))
	var row3 := UI.hbox()
	v.add_child(row3)
	row3.add_child(UI.holo_btn("Credits", func(): main.push("credits"), UI.HOLO_BLUE, 64))
	row3.add_child(UI.holo_btn("Exit", func(): UI.confirm(self, "Exit NEXA?", func(): get_tree().quit(), "Exit"), Color("e9406c"), 64))
	var ver := UI.label("v0.1  •  Offline  •  Phases 1–12 foundation build", 18, Color("8fa0c8"))
	ver.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	v.add_child(ver)


func _continue() -> void:
	var slot := SaveManager.latest_slot()
	if slot >= 0 and SaveManager.load_slot(slot):
		main.go("hub")


func _new_game() -> void:
	if SaveManager.latest_slot() >= 0:
		UI.confirm(self, "Start a new game? Existing saves stay in their slots, but the autosave will be overwritten.", func(): main.go("creator"), "Start")
	else:
		main.go("creator")


func _gallery(tab: String) -> void:
	if not Game.active:
		# Show unlocks from the latest save without starting the game.
		var slot := SaveManager.latest_slot()
		if slot >= 0:
			var d := SaveManager.read_slot(slot)
			Game.s = SaveManager.migrate(d.state, int(d.get("version", 0)))
		else:
			Game.s = Game.default_state()
	main.push("gallery", {"tab": tab})
