class_name PortraitView
extends Control
## Shows a character portrait. Uses the supplied image for the character +
## expression when it exists (assets/characters/<id>/<id>_<expr>.png).
## Otherwise draws an original stylised fallback portrait that still shows the
## correct colours, hairstyle and expression, so the game is playable before
## any artwork is added.

const HAIR_COLORS := ["2b1d14", "0f0f12", "6b3e1f", "c9a15b", "b23a2a", "e8e8f0", "3b5bd6", "7a3fd1"]
const EYE_COLORS := ["5a3a22", "2f6fd6", "3c9a5c", "8a8a8a", "b07a1f", "9b2bd6"]
const SKIN_TONES := ["ffe0c4", "f2c29b", "d9a074", "b57a4f", "8a5534", "5e3a22"]
const OUTFIT_COLORS := ["2d3a66", "1d1d24", "8a1f2d", "2f6b4a", "e0e0ea", "5a2d8a", "c46a1a"]
const HAIR_STYLE_NAMES := ["Messy", "Swept", "Long", "Buzz", "Spiky"]
const ACCESSORY_NAMES := ["None", "Glasses", "Headband", "Earring"]
const BEARD_NAMES := ["None", "Stubble", "Full"]

var char_id := ""
var expr := "normal"
var costume := ""
var tex: Texture2D = null
var appearance: Dictionary = {}   # overrides for the player (creator preview)
var dim := false
var flip := false
var override_data: Dictionary = {}   # draw something not in characters.json (pets, shadows)


func _init() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	resized.connect(queue_redraw)


func set_char(id: String, e: String = "normal", use_art: bool = true) -> void:
	char_id = id
	expr = e
	costume = Game.portrait_costume(id)
	tex = Assets.portrait(id, e, costume) if use_art else null
	if id == "peter" and appearance.is_empty() and Game.s.has("player"):
		appearance = Game.s.player.get("appearance", {})
	queue_redraw()


func set_pet(species: String, color: String, image_id: String = "") -> void:
	override_data = {"style": "pet", "species": species, "color": color}
	tex = Assets.image("pets", image_id if image_id != "" else species)
	queue_redraw()


func set_custom(data: Dictionary, image_folder: String = "", image_id: String = "") -> void:
	override_data = data
	tex = Assets.image(image_folder, image_id) if image_folder != "" else null
	queue_redraw()


func set_appearance(a: Dictionary) -> void:
	appearance = a.duplicate()
	queue_redraw()


func _draw() -> void:
	var mod := Color(0.45, 0.45, 0.5) if dim else Color.WHITE
	if tex:
		var ts := tex.get_size()
		var sc: float = min(size.x / ts.x, size.y / ts.y)
		var dsz := ts * sc
		var pos := Vector2((size.x - dsz.x) / 2.0, size.y - dsz.y)
		draw_texture_rect(tex, Rect2(pos, dsz), false, mod)
		return
	var d: Dictionary = override_data if not override_data.is_empty() else Data.character(char_id)
	match str(d.get("style", "human")):
		"pet":
			_draw_pet(str(d.get("species", "cat")), Color(str(d.get("color", "c08040"))), mod)
		_:
			_draw_human(d, mod)


func _c(hex: String, mod: Color) -> Color:
	return Color(hex) * mod


func _draw_human(d: Dictionary, mod: Color) -> void:
	var style := str(d.get("style", "human"))
	var w := size.x
	var h := size.y
	var cx := w / 2.0
	var r: float = min(w, h) * 0.16
	var hy := h * 0.34
	var skin := _c(str(d.get("skin", "f2c29b")), mod)
	var hair := _c(str(d.get("hair", "2b1d14")), mod)
	var eyes := _c(str(d.get("eyes", "5a3a22")), mod)
	var outfit := _c(str(d.get("outfit", d.get("color", "2d3a66"))), mod)
	var hair_style := int(d.get("hair_style", 0))
	var beard := 0
	var acc := 0
	if char_id == "peter":
		var a := appearance
		skin = _c(SKIN_TONES[int(a.get("skin", 1)) % SKIN_TONES.size()], mod)
		hair = _c(HAIR_COLORS[int(a.get("hair_color", 0)) % HAIR_COLORS.size()], mod)
		eyes = _c(EYE_COLORS[int(a.get("eye_color", 0)) % EYE_COLORS.size()], mod)
		outfit = _c(OUTFIT_COLORS[int(a.get("outfit", 0)) % OUTFIT_COLORS.size()], mod)
		hair_style = int(a.get("hair_style", 0)) % HAIR_STYLE_NAMES.size()
		beard = int(a.get("beard", 0))
		acc = int(a.get("accessory", 0))
		if costume == "adult" and beard == 0:
			beard = 1
	if style == "shadow":
		skin = Color(0.12, 0.08, 0.2) * mod
		hair = Color(0.2, 0.1, 0.35) * mod
		outfit = Color(0.1, 0.05, 0.18) * mod
		eyes = Color("a86bff")
	elif style == "statue":
		skin = Color(0.55, 0.55, 0.5) * mod
		hair = Color(0.45, 0.45, 0.42) * mod
		outfit = Color(0.5, 0.5, 0.46) * mod
		eyes = Color("ff5a3a")
	# aura (adult Peter / shadows / villains / heroes with aura)
	var aura := str(d.get("aura", ""))
	if char_id == "peter" and costume == "adult":
		aura = "ffffff"
	if aura != "":
		var ac := Color(aura)
		for i in 4:
			draw_circle(Vector2(cx, h * 0.55), min(w, h) * (0.48 - i * 0.05), Color(ac.r, ac.g, ac.b, 0.06 + i * 0.03))
	# body
	var top := hy + r * 1.35
	var body := PackedVector2Array([
		Vector2(cx - r * 0.55, top), Vector2(cx + r * 0.55, top),
		Vector2(cx + r * 2.3, h), Vector2(cx - r * 2.3, h)])
	draw_colored_polygon(body, outfit)
	draw_colored_polygon(PackedVector2Array([Vector2(cx - r * 0.35, top - 4), Vector2(cx + r * 0.35, top - 4), Vector2(cx + r * 0.25, top + r * 0.5), Vector2(cx - r * 0.25, top + r * 0.5)]), skin.darkened(0.12))
	draw_line(Vector2(cx, top + r * 0.5), Vector2(cx, h), outfit.darkened(0.25), 3)
	if str(d.get("cape", "")) != "":
		var cape := Color(str(d.cape)) * mod
		draw_colored_polygon(PackedVector2Array([Vector2(cx - r * 0.9, top + 6), Vector2(cx - r * 2.6, h), Vector2(cx - r * 2.0, h)]), cape)
		draw_colored_polygon(PackedVector2Array([Vector2(cx + r * 0.9, top + 6), Vector2(cx + r * 2.6, h), Vector2(cx + r * 2.0, h)]), cape)
	# neck + head
	draw_rect(Rect2(cx - r * 0.3, hy + r * 0.7, r * 0.6, r * 0.75), skin.darkened(0.08))
	if hair_style == 2:
		draw_colored_polygon(PackedVector2Array([Vector2(cx - r * 1.1, hy - r * 0.2), Vector2(cx + r * 1.1, hy - r * 0.2), Vector2(cx + r * 1.2, hy + r * 1.6), Vector2(cx - r * 1.2, hy + r * 1.6)]), hair)
	draw_circle(Vector2(cx, hy), r, skin)
	draw_circle(Vector2(cx - r * 0.98, hy + r * 0.1), r * 0.2, skin.darkened(0.06))
	draw_circle(Vector2(cx + r * 0.98, hy + r * 0.1), r * 0.2, skin.darkened(0.06))
	_draw_hair(cx, hy, r, hair, hair_style, style)
	if style == "villain":
		draw_colored_polygon(PackedVector2Array([Vector2(cx - r * 0.7, hy - r * 0.7), Vector2(cx - r * 1.1, hy - r * 1.8), Vector2(cx - r * 0.3, hy - r * 0.95)]), hair.lightened(0.2))
		draw_colored_polygon(PackedVector2Array([Vector2(cx + r * 0.7, hy - r * 0.7), Vector2(cx + r * 1.1, hy - r * 1.8), Vector2(cx + r * 0.3, hy - r * 0.95)]), hair.lightened(0.2))
	_draw_face(cx, hy, r, eyes, skin, style)
	if beard >= 1:
		var bc := Color(hair.r, hair.g, hair.b, 0.45 if beard == 1 else 0.95)
		draw_arc(Vector2(cx, hy + r * 0.15), r * 0.82, 0.25, PI - 0.25, 18, bc, r * (0.12 if beard == 1 else 0.28))
	match acc:
		1:
			draw_arc(Vector2(cx - r * 0.38, hy - r * 0.02), r * 0.24, 0, TAU, 20, Color(0.1, 0.1, 0.12) * mod, 3)
			draw_arc(Vector2(cx + r * 0.38, hy - r * 0.02), r * 0.24, 0, TAU, 20, Color(0.1, 0.1, 0.12) * mod, 3)
			draw_line(Vector2(cx - r * 0.14, hy - r * 0.02), Vector2(cx + r * 0.14, hy - r * 0.02), Color(0.1, 0.1, 0.12) * mod, 3)
		2:
			draw_rect(Rect2(cx - r, hy - r * 0.62, r * 2.0, r * 0.2), Color("e9406c") * mod)
		3:
			draw_circle(Vector2(cx + r * 1.0, hy + r * 0.4), r * 0.08, Color("f5c542") * mod)
	# crew / hero emblem on chest
	var emblem := str(d.get("emblem", ""))
	if emblem != "":
		draw_circle(Vector2(cx, top + r * 1.3), r * 0.28, Color(emblem) * mod)


func _draw_hair(cx: float, hy: float, r: float, hair: Color, style_i: int, style: String) -> void:
	if style == "statue":
		draw_arc(Vector2(cx, hy), r * 1.02, PI, TAU, 24, hair, r * 0.25)
		return
	match style_i:
		0:  # messy
			draw_arc(Vector2(cx, hy - r * 0.05), r * 0.98, PI * 1.02, TAU * 0.99, 24, hair, r * 0.42)
			for i in 5:
				var x := cx - r * 0.8 + i * r * 0.4
				draw_colored_polygon(PackedVector2Array([Vector2(x - r * 0.22, hy - r * 0.55), Vector2(x + r * 0.22, hy - r * 0.55), Vector2(x + r * 0.05, hy - r * 0.15)]), hair)
		1:  # swept
			draw_arc(Vector2(cx, hy - r * 0.05), r * 0.98, PI, TAU, 24, hair, r * 0.45)
			draw_colored_polygon(PackedVector2Array([Vector2(cx - r * 0.9, hy - r * 0.5), Vector2(cx + r * 0.9, hy - r * 0.75), Vector2(cx + r * 0.2, hy - r * 0.2)]), hair)
		2:  # long
			draw_arc(Vector2(cx, hy - r * 0.05), r * 0.98, PI, TAU, 24, hair, r * 0.45)
			draw_colored_polygon(PackedVector2Array([Vector2(cx - r, hy - r * 0.5), Vector2(cx + r * 0.3, hy - r * 0.6), Vector2(cx - r * 0.2, hy - r * 0.1)]), hair)
		3:  # buzz
			draw_arc(Vector2(cx, hy), r * 1.0, PI * 1.05, TAU * 0.98, 24, hair, r * 0.18)
		_:  # spiky
			draw_arc(Vector2(cx, hy - r * 0.05), r * 0.98, PI, TAU, 24, hair, r * 0.4)
			for i in 7:
				var a := PI + i * PI / 6.0
				var base := Vector2(cx, hy) + Vector2(cos(a), sin(a)) * r * 0.85
				var tip := Vector2(cx, hy) + Vector2(cos(a), sin(a)) * r * 1.65
				var side := Vector2(-sin(a), cos(a)) * r * 0.22
				draw_colored_polygon(PackedVector2Array([base - side, tip, base + side]), hair)


func _draw_face(cx: float, hy: float, r: float, eye_col: Color, skin: Color, style: String) -> void:
	var ey := hy - r * 0.02
	var ex := r * 0.38
	var ink := Color(0.12, 0.08, 0.06)
	var e := expr
	var white := Color(1, 1, 1)
	if style == "shadow" or style == "statue":
		draw_circle(Vector2(cx - ex, ey), r * 0.12, eye_col)
		draw_circle(Vector2(cx + ex, ey), r * 0.12, eye_col)
		return
	# eyes
	if e == "happy":
		draw_arc(Vector2(cx - ex, ey + r * 0.05), r * 0.15, PI, TAU, 10, ink, 3)
		draw_arc(Vector2(cx + ex, ey + r * 0.05), r * 0.15, PI, TAU, 10, ink, 3)
	else:
		var er := r * (0.2 if e == "surprised" else 0.16)
		var squash := 0.55 if e in ["serious", "angry"] else 1.0
		for sx in [-1, 1]:
			var c := Vector2(cx + sx * ex, ey)
			draw_set_transform(c, 0, Vector2(1, squash))
			draw_circle(Vector2.ZERO, er, white)
			draw_circle(Vector2(0, er * 0.15), er * 0.65, eye_col)
			draw_circle(Vector2(0, er * 0.15), er * 0.3, ink)
			draw_circle(Vector2(-er * 0.25, -er * 0.2), er * 0.18, white)
			draw_set_transform(Vector2.ZERO, 0, Vector2.ONE)
	# brows
	var by := ey - r * 0.32
	var bw := r * 0.22
	match e:
		"angry":
			draw_line(Vector2(cx - ex - bw, by - r * 0.06), Vector2(cx - ex + bw, by + r * 0.08), ink, 4)
			draw_line(Vector2(cx + ex + bw, by - r * 0.06), Vector2(cx + ex - bw, by + r * 0.08), ink, 4)
		"sad":
			draw_line(Vector2(cx - ex - bw, by + r * 0.06), Vector2(cx - ex + bw, by - r * 0.06), ink, 3)
			draw_line(Vector2(cx + ex + bw, by + r * 0.06), Vector2(cx + ex - bw, by - r * 0.06), ink, 3)
		"surprised":
			draw_arc(Vector2(cx - ex, by + r * 0.02), bw, PI * 1.1, TAU * 0.95, 10, ink, 3)
			draw_arc(Vector2(cx + ex, by + r * 0.02), bw, PI * 1.1, TAU * 0.95, 10, ink, 3)
		"confused":
			draw_line(Vector2(cx - ex - bw, by), Vector2(cx - ex + bw, by), ink, 3)
			draw_line(Vector2(cx + ex - bw, by - r * 0.1), Vector2(cx + ex + bw, by - r * 0.02), ink, 3)
		_:
			draw_line(Vector2(cx - ex - bw, by), Vector2(cx - ex + bw, by), ink, 3)
			draw_line(Vector2(cx + ex - bw, by), Vector2(cx + ex + bw, by), ink, 3)
	# mouth
	var my := hy + r * 0.48
	var mouth := Color(0.55, 0.2, 0.2)
	match e:
		"happy":
			draw_arc(Vector2(cx, my - r * 0.12), r * 0.25, 0.2, PI - 0.2, 14, mouth, 4)
		"sad", "hurt":
			draw_arc(Vector2(cx, my + r * 0.14), r * 0.2, PI + 0.3, TAU - 0.3, 14, mouth, 3)
		"surprised":
			draw_circle(Vector2(cx, my), r * 0.1, mouth)
		"angry":
			draw_line(Vector2(cx - r * 0.2, my + 2), Vector2(cx + r * 0.2, my - 2), mouth, 4)
		"confused":
			draw_polyline(PackedVector2Array([Vector2(cx - r * 0.2, my), Vector2(cx - r * 0.07, my - 4), Vector2(cx + r * 0.07, my + 4), Vector2(cx + r * 0.2, my)]), mouth, 3)
		_:
			draw_line(Vector2(cx - r * 0.15, my), Vector2(cx + r * 0.15, my), mouth, 3)
	if e in ["happy", "embarrassed"]:
		draw_circle(Vector2(cx - r * 0.6, hy + r * 0.3), r * 0.1, Color(1, 0.5, 0.5, 0.35))
		draw_circle(Vector2(cx + r * 0.6, hy + r * 0.3), r * 0.1, Color(1, 0.5, 0.5, 0.35))


func _draw_pet(species: String, col: Color, mod: Color) -> void:
	var w := size.x
	var h := size.y
	var cx := w / 2.0
	var r: float = min(w, h) * 0.2
	var c := col * mod
	var by := h * 0.66
	draw_set_transform(Vector2(cx, by), 0, Vector2(1.3, 0.85))
	draw_circle(Vector2.ZERO, r * 1.2, c)
	draw_set_transform(Vector2.ZERO, 0, Vector2.ONE)
	var head := Vector2(cx, h * 0.4)
	match species:
		"cat":
			for sx in [-1, 1]:
				draw_colored_polygon(PackedVector2Array([head + Vector2(sx * r * 0.9, -r * 0.3), head + Vector2(sx * r * 0.75, -r * 1.25), head + Vector2(sx * r * 0.2, -r * 0.7)]), c)
		"dog":
			for sx in [-1, 1]:
				draw_set_transform(head + Vector2(sx * r * 0.95, r * 0.1), sx * 0.3, Vector2(0.45, 1.0))
				draw_circle(Vector2.ZERO, r * 0.6, c.darkened(0.25))
				draw_set_transform(Vector2.ZERO, 0, Vector2.ONE)
		"rabbit":
			for sx in [-1, 1]:
				draw_set_transform(head + Vector2(sx * r * 0.4, -r * 1.3), sx * 0.12, Vector2(0.3, 1.0))
				draw_circle(Vector2.ZERO, r * 0.8, c)
				draw_set_transform(Vector2.ZERO, 0, Vector2.ONE)
		"parrot":
			draw_colored_polygon(PackedVector2Array([head + Vector2(r * 0.6, 0), head + Vector2(r * 1.3, r * 0.3), head + Vector2(r * 0.6, r * 0.45)]), Color("f5c542") * mod)
			draw_colored_polygon(PackedVector2Array([Vector2(cx - r * 0.4, by - r * 0.3), Vector2(cx - r * 1.8, by + r * 0.4), Vector2(cx - r * 0.2, by + r * 0.6)]), c.darkened(0.3))
		"dragon":
			for sx in [-1, 1]:
				draw_colored_polygon(PackedVector2Array([head + Vector2(sx * r * 0.4, -r * 0.8), head + Vector2(sx * r * 0.9, -r * 1.6), head + Vector2(sx * r * 0.7, -r * 0.6)]), Color("f5e6c0") * mod)
				draw_colored_polygon(PackedVector2Array([Vector2(cx + sx * r * 0.8, by - r * 0.4), Vector2(cx + sx * r * 2.4, by - r * 1.6), Vector2(cx + sx * r * 1.7, by + r * 0.2)]), c.darkened(0.3))
	draw_circle(head, r, c)
	draw_circle(head + Vector2(-r * 0.35, -r * 0.1), r * 0.14, Color.WHITE)
	draw_circle(head + Vector2(r * 0.35, -r * 0.1), r * 0.14, Color.WHITE)
	draw_circle(head + Vector2(-r * 0.35, -r * 0.08), r * 0.08, Color(0.1, 0.1, 0.1))
	draw_circle(head + Vector2(r * 0.35, -r * 0.08), r * 0.08, Color(0.1, 0.1, 0.1))
	if species != "parrot":
		draw_circle(head + Vector2(0, r * 0.25), r * 0.1, Color(0.2, 0.1, 0.1))
