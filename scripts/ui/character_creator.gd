extends Control
## Character creator (Part 17) with live preview.
## The fallback portrait is layered (skin / hair / eyes / beard / outfit /
## accessory). When you add Peter's artwork, the chosen values are still saved
## and used for cosmetics and the fallback views.

var main
var app := {"hair_style": 0, "hair_color": 0, "eye_color": 0, "skin": 1, "beard": 0, "outfit": 0, "shoes": 0, "accessory": 0}
var preview: PortraitView
var labels := {}
var expr_i := 0
const EXPRS := ["normal", "happy", "serious", "surprised", "sad", "angry", "confused"]
const SHOES := ["School shoes", "Sneakers", "Boots", "Sandals"]

const OPTIONS := [
	["hair_style", "Hairstyle"], ["hair_color", "Hair colour"], ["eye_color", "Eye colour"],
	["skin", "Skin tone"], ["beard", "Beard"], ["outfit", "Clothing"], ["shoes", "Shoes"], ["accessory", "Accessory"],
]


func setup(_args: Dictionary) -> void:
	Audio.play_music("main_menu")
	UI.screen_bg(self, Color("0b1024"))
	var v := UI.vbox(10)
	add_child(UI.margin(v, 24))
	var t := UI.label("Create Peter Parker", 36, UI.HOLO_GOLD)
	t.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	v.add_child(t)
	var sub := UI.label("Age 16 • Powerless student of Nexa Academy", 20, Color("97a3c4"))
	sub.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	v.add_child(sub)
	var frame := UI.panel(Color("141b36"), 18, UI.HOLO_BLUE, 2, 6)
	frame.custom_minimum_size = Vector2(0, 420)
	v.add_child(frame)
	preview = PortraitView.new()
	preview.custom_minimum_size = Vector2(0, 400)
	frame.add_child(preview)
	preview.set_appearance(app)
	preview.set_char("peter", "normal", false)
	var eb := UI.btn("Preview expression: Normal", _cycle_expr, 56, 20)
	labels["expr_btn"] = eb
	v.add_child(eb)
	var list := UI.vbox(8)
	v.add_child(UI.scroll(list))
	for o in OPTIONS:
		var row := UI.hbox(8)
		var minus := UI.btn("‹", _change.bind(o[0], -1), 64, 30)
		minus.custom_minimum_size = Vector2(80, 64)
		minus.size_flags_horizontal = Control.SIZE_SHRINK_BEGIN
		row.add_child(minus)
		var l := UI.label("", 22)
		l.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		l.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
		labels[o[0]] = l
		row.add_child(l)
		var plus := UI.btn("›", _change.bind(o[0], 1), 64, 30)
		plus.custom_minimum_size = Vector2(80, 64)
		plus.size_flags_horizontal = Control.SIZE_SHRINK_BEGIN
		row.add_child(plus)
		list.add_child(row)
	var row2 := UI.hbox()
	v.add_child(row2)
	row2.add_child(UI.btn("Randomise", _randomise))
	row2.add_child(UI.holo_btn("Begin Story", _start, UI.HOLO_GOLD))
	_refresh()


func _count(key: String) -> int:
	match key:
		"hair_style": return PortraitView.HAIR_STYLE_NAMES.size()
		"hair_color": return PortraitView.HAIR_COLORS.size()
		"eye_color": return PortraitView.EYE_COLORS.size()
		"skin": return PortraitView.SKIN_TONES.size()
		"beard": return PortraitView.BEARD_NAMES.size()
		"outfit": return PortraitView.OUTFIT_COLORS.size()
		"shoes": return SHOES.size()
		"accessory": return PortraitView.ACCESSORY_NAMES.size()
	return 1


func _value_name(key: String) -> String:
	var i := int(app[key])
	match key:
		"hair_style": return PortraitView.HAIR_STYLE_NAMES[i]
		"beard": return PortraitView.BEARD_NAMES[i]
		"shoes": return SHOES[i]
		"accessory": return PortraitView.ACCESSORY_NAMES[i]
	return "%d / %d" % [i + 1, _count(key)]


func _change(key: String, d: int) -> void:
	app[key] = posmod(int(app[key]) + d, _count(key))
	_refresh()


func _randomise() -> void:
	for o in OPTIONS:
		app[o[0]] = randi() % _count(o[0])
	app.beard = 0
	_refresh()


func _cycle_expr() -> void:
	expr_i = (expr_i + 1) % EXPRS.size()
	labels.expr_btn.text = "Preview expression: " + EXPRS[expr_i].capitalize()
	preview.set_char("peter", EXPRS[expr_i], false)
	preview.set_appearance(app)


func _refresh() -> void:
	for o in OPTIONS:
		labels[o[0]].text = "%s: %s" % [o[1], _value_name(o[0])]
	preview.set_appearance(app)


func _start() -> void:
	Game.new_game(app)
	SaveManager.autosave()
	main.go("story", {"scene": Story.next_id()})
