extends Control
## Settings (Part 20). Saved to user://settings.cfg immediately.

var main
var body: VBoxContainer


func setup(_args: Dictionary) -> void:
	UI.screen_bg(self)
	var root := UI.vbox(10)
	add_child(UI.margin(root, 18))
	root.add_child(UI.header("Settings", func(): main.pop()))
	body = UI.vbox(12)
	root.add_child(UI.scroll(body))
	refresh()


func refresh() -> void:
	UI.clear(body)
	_section("Text")
	_slider("Text size", "text_size", 0.8, 1.4, 0.05)
	_choice("Text colour", "text_color", ["default", "white", "cream", "cyan", "gold"])
	_choice("Font", "font", ["default", "custom1", "custom2"], "Custom fonts: put main.ttf / alt.ttf in assets/fonts/")
	_slider("Typewriter speed (0 = instant)", "typewriter_speed", 0.0, 120.0, 5.0)
	_toggle("Auto-read dialogue", "auto_read")
	_slider("Auto-read delay (s)", "auto_delay", 0.6, 4.0, 0.2)
	_section("Display")
	_choice("Theme", "theme", ["dark", "light"])
	_choice("Accent colour", "accent", ["blue", "purple", "gold", "crimson", "green"])
	_slider("Animation speed", "animation_speed", 0.5, 2.0, 0.1)
	_toggle("Reduce motion", "reduce_motion")
	_choice("Screen orientation", "orientation", ["portrait", "landscape", "auto"])
	_section("Audio")
	_slider("Music volume", "music_volume", 0.0, 1.0, 0.05)
	_slider("Sound effects volume", "sfx_volume", 0.0, 1.0, 0.05)
	_slider("UI sounds volume", "ui_volume", 0.0, 1.0, 0.05)
	_slider("Dialogue / voice volume", "voice_volume", 0.0, 1.0, 0.05)
	_section("Language")
	_choice("Language", "language", ["en"], "Only English text exists so far. Other languages are planned.")
	_section("Game")
	_toggle("Autosave", "autosave")
	if Game.active:
		body.add_child(UI.btn("Save / Load", func(): main.push("saves", {"mode": "save"})))
	body.add_child(UI.btn("Reset all settings", func(): UI.confirm(self, "Reset every setting to default?", _reset, "Reset")))
	var missing := Assets.missing.size()
	body.add_child(UI.label("Artwork: %d image IDs are using built-in fallback art this session (see Output log)." % missing, 17, UI.muted()))


func _reset() -> void:
	Settings.reset()
	refresh()


func _section(t: String) -> void:
	body.add_child(UI.spacer(6))
	body.add_child(UI.label(t, 26, Settings.accent()))


func _slider(label_t: String, key: String, mn: float, mx: float, step: float) -> void:
	var v := UI.vbox(4)
	body.add_child(v)
	var l := UI.label("%s: %s" % [label_t, _fmt(float(Settings.get_v(key)))], 21)
	v.add_child(l)
	var s := HSlider.new()
	s.min_value = mn
	s.max_value = mx
	s.step = step
	s.value = float(Settings.get_v(key))
	s.custom_minimum_size = Vector2(0, 48)
	s.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	s.value_changed.connect(func(x): l.text = "%s: %s" % [label_t, _fmt(x)])
	s.drag_ended.connect(func(_c): Settings.set_v(key, s.value))
	v.add_child(s)


func _fmt(x: float) -> String:
	return str(snappedf(x, 0.01))


func _choice(label_t: String, key: String, options: Array, note: String = "") -> void:
	body.add_child(UI.label(label_t, 21))
	var row := UI.hbox(6)
	body.add_child(row)
	for o in options:
		var on := str(Settings.get_v(key)) == str(o)
		var b := UI.btn(str(o).capitalize() + (" ●" if on else ""), _set_choice.bind(key, o), 56, 18)
		row.add_child(b)
	if note != "":
		body.add_child(UI.label(note, 16, UI.muted()))


func _set_choice(key: String, v) -> void:
	Settings.set_v(key, v)
	refresh()


func _toggle(label_t: String, key: String) -> void:
	var on := bool(Settings.get_v(key))
	body.add_child(UI.btn("%s: %s" % [label_t, "ON" if on else "OFF"], _set_choice.bind(key, not on), 60, 20))
