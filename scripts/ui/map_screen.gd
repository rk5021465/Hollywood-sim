extends Control
## Illustrated interactive map (Part 13 Maps / Part 29 locations).
## Districts are drawn as coloured regions; tap a pin to travel there.
## A supplied map image (assets/maps/nexa_city_map.png) replaces the drawing.

var main
var district := ""
var map_area: Control
var pins: Control
var list: VBoxContainer
var map_tex: Texture2D


func setup(_args: Dictionary) -> void:
	district = str(Data.locations.get(str(Game.s.location), {}).get("district", "residential"))
	UI.screen_bg(self, Color("0b1226"))
	var root := UI.vbox(10)
	add_child(UI.margin(root, 16))
	root.add_child(UI.header("Map of " + ("Nexa" if not _offworld() else "the Multiverse"), func(): main.pop(), Color.WHITE))
	var tabs_sc := ScrollContainer.new()
	tabs_sc.vertical_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	tabs_sc.custom_minimum_size = Vector2(0, 70)
	root.add_child(tabs_sc)
	var tabs := UI.hbox(8)
	tabs_sc.add_child(tabs)
	for d in Data.districts.keys():
		if not Game.check_cond(Data.districts[d].get("if", {})):
			continue
		var b := UI.holo_btn(str(Data.districts[d].name), _set_district.bind(str(d)), Color(str(Data.districts[d].get("color", "3fa9ff"))), 60)
		b.custom_minimum_size = Vector2(180, 60)
		b.size_flags_horizontal = Control.SIZE_SHRINK_BEGIN
		tabs.add_child(b)
	map_area = Control.new()
	map_area.custom_minimum_size = Vector2(0, 560)
	map_area.clip_contents = true
	map_area.draw.connect(_draw_map)
	map_area.resized.connect(_layout_pins)
	root.add_child(map_area)
	pins = UI.full(Control.new())
	pins.mouse_filter = Control.MOUSE_FILTER_IGNORE
	map_area.add_child(pins)
	list = UI.vbox(8)
	root.add_child(UI.scroll(list))
	map_tex = Assets.image("maps", "map_" + district)
	refresh()


func _offworld() -> bool:
	return bool(Data.districts.get(district, {}).get("offworld", false))


func _set_district(d: String) -> void:
	district = d
	map_tex = Assets.image("maps", "map_" + district)
	refresh()


func _visible_locs() -> Array:
	var out: Array = []
	for id in Data.locations.keys():
		var l: Dictionary = Data.locations[id]
		if str(l.get("district", "")) != district or bool(l.get("hidden", false)):
			continue
		if not Game.check_cond(l.get("if", {})):
			continue
		out.append(id)
	return out


func refresh() -> void:
	map_area.queue_redraw()
	_layout_pins()
	UI.clear(list)
	var dd: Dictionary = Data.districts.get(district, {})
	list.add_child(UI.label(str(dd.get("desc", "")), 18, Color("b8c6e6")))
	for id in _visible_locs():
		var l: Dictionary = Data.locations[id]
		var here: bool = str(Game.s.location) == id
		var open_slots: Array = l.get("open", [0, 1, 2, 3])
		var open: bool = int(Game.s.time_slot) in open_slots.map(func(x): return int(x))
		var t := "%s%s%s" % [l.get("name", id), "  (you are here)" if here else "", "" if open else "  — closed now"]
		var b := UI.btn(t, _travel.bind(str(id)), 64, 20)
		b.disabled = here
		list.add_child(b)


func _layout_pins() -> void:
	if pins == null:
		return
	UI.clear(pins)
	var sz := map_area.size
	for id in _visible_locs():
		var l: Dictionary = Data.locations[id]
		var mp: Array = l.get("map", [0.5, 0.5])
		var b := Button.new()
		b.text = "● " + str(l.get("short", l.get("name", id)))
		b.add_theme_font_size_override("font_size", Settings.font_size(16))
		b.add_theme_stylebox_override("normal", UI.box(Color(0, 0, 0, 0.6), 10, Color.WHITE if str(Game.s.location) == id else Color(1, 1, 1, 0.3), 2, 6))
		b.add_theme_color_override("font_color", Color.WHITE)
		b.position = Vector2(float(mp[0]) * sz.x - 70, float(mp[1]) * sz.y - 22)
		b.custom_minimum_size = Vector2(140, 44)
		b.mouse_filter = Control.MOUSE_FILTER_STOP
		b.pressed.connect(_travel.bind(str(id)))
		pins.add_child(b)


func _draw_map() -> void:
	var sz := map_area.size
	if map_tex:
		map_area.draw_texture_rect(map_tex, Rect2(Vector2.ZERO, sz), false)
		return
	var dd: Dictionary = Data.districts.get(district, {})
	var col := Color(str(dd.get("color", "3fa9ff")))
	if _offworld():
		map_area.draw_rect(Rect2(Vector2.ZERO, sz), Color("070418"))
		var rng := RandomNumberGenerator.new()
		rng.seed = hash(district)
		for i in 80:
			map_area.draw_circle(Vector2(rng.randf() * sz.x, rng.randf() * sz.y), rng.randf_range(1, 2.5), Color(1, 1, 1, rng.randf_range(0.3, 1)))
		for id in _visible_locs():
			var mp: Array = Data.locations[id].get("map", [0.5, 0.5])
			map_area.draw_circle(Vector2(float(mp[0]) * sz.x, float(mp[1]) * sz.y), 46, Color(col.r, col.g, col.b, 0.35))
		return
	map_area.draw_rect(Rect2(Vector2.ZERO, sz), col.darkened(0.75))
	# blocks & roads
	var rng2 := RandomNumberGenerator.new()
	rng2.seed = hash(district) + 7
	for x in range(0, int(sz.x), 90):
		map_area.draw_rect(Rect2(x, 0, 14, sz.y), Color(0.25, 0.27, 0.33))
	for y in range(0, int(sz.y), 110):
		map_area.draw_rect(Rect2(0, y, sz.x, 14), Color(0.25, 0.27, 0.33))
	for x in range(14, int(sz.x), 90):
		for y in range(14, int(sz.y), 110):
			var g := rng2.randf()
			var c := col.darkened(0.45) if g > 0.25 else Color("2f6b3a")
			map_area.draw_rect(Rect2(x + 4, y + 4, 68, 88), c)
	map_area.draw_rect(Rect2(Vector2.ZERO, sz), col, false, 4)


func _travel(id: String) -> void:
	Game.s.location = id
	Audio.play_sfx("transition")
	Events.fire("travel")
	main.pop()
	if main.top_name() == "hub":
		var hub: Control = main.stack.back()
		hub.call("refresh")
		hub.call("_first_visit_fire")
