class_name CardArt
extends Control
## Draws a full ability card: rarity frame, artwork (supplied image or an
## original emblem fallback), name, rarity gems and level.

var card_id := ""
var locked := false
var show_text := true
var reveal := 1.0   # 0..1 used by the reveal animation (art fades in)
var tex: Texture2D = null
signal tapped(card_id: String)


func _init() -> void:
	mouse_filter = Control.MOUSE_FILTER_STOP
	resized.connect(queue_redraw)


func set_card(id: String, is_locked: bool = false) -> void:
	card_id = id
	locked = is_locked
	tex = null if is_locked else Assets.card_art(id)
	queue_redraw()


func _gui_input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		tapped.emit(card_id)
		accept_event()


func _draw() -> void:
	var d := Data.card(card_id)
	var rarity := str(d.get("rarity", "common"))
	var rc: Color = Data.RARITY_COLORS.get(rarity, Color.WHITE)
	var w := size.x
	var h := size.y
	var dark := Color(0.06, 0.07, 0.14)
	var frame := StyleBoxFlat.new()
	frame.bg_color = dark if not locked else Color(0.1, 0.1, 0.12)
	frame.set_corner_radius_all(int(w * 0.07))
	frame.border_color = rc if not locked else Color(0.3, 0.3, 0.35)
	frame.set_border_width_all(max(3, int(w * 0.025)))
	draw_style_box(frame, Rect2(Vector2.ZERO, size))
	var art := Rect2(w * 0.08, h * 0.08, w * 0.84, h * 0.58)
	draw_rect(art, Color(rc.r * 0.25, rc.g * 0.25, rc.b * 0.3) if not locked else Color(0.08, 0.08, 0.1))
	if locked:
		_text("?", Vector2(0, art.position.y + art.size.y * 0.62), w, int(h * 0.22), Color(0.35, 0.35, 0.4))
	elif tex:
		var ts := tex.get_size()
		var sc: float = max(art.size.x / ts.x, art.size.y / ts.y)
		var src_size := art.size / sc
		var src := Rect2((ts - src_size) / 2.0, src_size)
		draw_texture_rect_region(tex, art, src, Color(1, 1, 1, reveal))
	else:
		_emblem(str(d.get("category", "Combat")), art, rc)
	if rarity in ["transcendent", "beyond_transcendent", "mythical"] and not locked:
		draw_rect(art, Color(rc.r, rc.g, rc.b, 0.12 * reveal))
	draw_rect(art, rc.darkened(0.2) if not locked else Color(0.25, 0.25, 0.3), false, 2)
	if not show_text:
		return
	var name_text: String = "???" if locked else str(d.get("name", card_id))
	_text(name_text, Vector2(0, h * 0.76), w, int(clampf(w * 0.085, 12, 34)), Color.WHITE)
	var gems := Data.rarity_index(rarity) + 1
	var gr := w * 0.028
	var total_w := gems * gr * 2.6
	for i in gems:
		var gx := (w - total_w) / 2.0 + gr * 1.3 + i * gr * 2.6
		draw_circle(Vector2(gx, h * 0.84), gr, rc if not locked else Color(0.3, 0.3, 0.35))
	if not locked:
		var rn: String = Data.RARITY_NAMES.get(rarity, "")
		var lv := Cards.level(card_id)
		var sub := rn + ("  Lv.%d" % lv if lv > 0 else "")
		_text(sub, Vector2(0, h * 0.93), w, int(clampf(w * 0.06, 10, 24)), rc.lightened(0.3))


func _text(t: String, pos: Vector2, width: float, fsize: int, col: Color) -> void:
	var font := get_theme_default_font()
	draw_string(font, Vector2(pos.x + 6, pos.y), t, HORIZONTAL_ALIGNMENT_CENTER, width - 12, fsize, col)


func _emblem(cat: String, art: Rect2, rc: Color) -> void:
	var c := art.get_center()
	var r: float = min(art.size.x, art.size.y) * 0.32
	var col := Color(rc.r, rc.g, rc.b, reveal)
	var glow := Color(rc.r, rc.g, rc.b, 0.18 * reveal)
	for i in 3:
		draw_circle(c, r * (1.5 - i * 0.18), glow)
	match cat:
		"Mind":
			draw_set_transform(c, 0, Vector2(1.0, 0.55))
			draw_circle(Vector2.ZERO, r, col)
			draw_set_transform(Vector2.ZERO, 0, Vector2.ONE)
			draw_circle(c, r * 0.4, Color(0.05, 0.05, 0.1, reveal))
			draw_circle(c, r * 0.18, col.lightened(0.5))
		"Body":
			draw_colored_polygon(PackedVector2Array([c + Vector2(0, -r), c + Vector2(r * 0.9, -r * 0.5), c + Vector2(r * 0.7, r * 0.6), c + Vector2(0, r * 1.1), c + Vector2(-r * 0.7, r * 0.6), c + Vector2(-r * 0.9, -r * 0.5)]), col)
			draw_line(c + Vector2(0, -r * 0.6), c + Vector2(0, r * 0.7), Color(0.05, 0.05, 0.1, reveal), 5)
		"Cosmic":
			draw_arc(c, r, 0, TAU, 40, col, r * 0.22)
			draw_circle(c, r * 0.45, col.lightened(0.4))
			for i in 8:
				var a := i * TAU / 8.0
				draw_line(c + Vector2(cos(a), sin(a)) * r * 1.2, c + Vector2(cos(a), sin(a)) * r * 1.5, col, 3)
		"Shadow":
			draw_colored_polygon(PackedVector2Array([c + Vector2(0, -r * 1.3), c + Vector2(r * 0.7, -r * 0.1), c + Vector2(r * 0.5, r), c + Vector2(-r * 0.5, r), c + Vector2(-r * 0.7, -r * 0.1)]), Color(0.35, 0.15, 0.6, reveal))
			draw_circle(c + Vector2(-r * 0.22, r * 0.1), r * 0.1, col)
			draw_circle(c + Vector2(r * 0.22, r * 0.1), r * 0.1, col)
		"Support":
			draw_rect(Rect2(c - Vector2(r * 0.25, r), Vector2(r * 0.5, r * 2)), col)
			draw_rect(Rect2(c - Vector2(r, r * 0.25), Vector2(r * 2, r * 0.5)), col)
		"Speed":
			for i in 3:
				var o := Vector2(-r * 0.4 + i * r * 0.45, 0)
				draw_colored_polygon(PackedVector2Array([c + o + Vector2(-r * 0.3, -r), c + o + Vector2(r * 0.25, 0), c + o + Vector2(-r * 0.3, r), c + o + Vector2(-r * 0.05, 0)]), col)
		_:  # Combat
			var pts := PackedVector2Array()
			for i in 10:
				var a := -PI / 2 + i * TAU / 10.0
				var rr := r * (1.15 if i % 2 == 0 else 0.5)
				pts.append(c + Vector2(cos(a), sin(a)) * rr)
			draw_colored_polygon(pts, col)
