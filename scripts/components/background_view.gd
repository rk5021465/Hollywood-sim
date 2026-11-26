class_name BackgroundView
extends Control
## Full-screen scene background. Uses the supplied image when present
## (assets/backgrounds/<folder>/<bg_id>.png); otherwise paints an original
## illustrated fallback chosen from keywords in the background ID.
## Supports a slow "ken burns" drift and a time-of-day tint.

var bg_id := ""
var tex: Texture2D = null
var drift := true
var tint_by_time := false
var _t := 0.0


func _init() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	clip_contents = true
	resized.connect(queue_redraw)


func set_bg(id: String) -> void:
	bg_id = id
	tex = Assets.background(id)
	_t = 0.0
	queue_redraw()


func _process(delta: float) -> void:
	if drift and tex and not bool(Settings.get_v("reduce_motion")):
		_t += delta
		queue_redraw()


func _draw() -> void:
	if tex:
		var ts := tex.get_size()
		var sc: float = max(size.x / ts.x, size.y / ts.y) * 1.06
		var dsz := ts * sc
		var off := Vector2(sin(_t * 0.05) * 0.5 + 0.5, cos(_t * 0.04) * 0.5 + 0.5) * (dsz - size)
		draw_texture_rect(tex, Rect2(-off, dsz), false)
	else:
		_paint_fallback()
	if tint_by_time and Game.active:
		var tints := [Color(1, 0.95, 0.8, 0.0), Color(1, 0.9, 0.6, 0.05), Color(1, 0.5, 0.3, 0.18), Color(0.05, 0.08, 0.3, 0.45)]
		draw_rect(Rect2(Vector2.ZERO, size), tints[int(Game.s.time_slot)])


func _grad(top: Color, bottom: Color, y0: float = 0.0, y1: float = -1.0) -> void:
	if y1 < 0:
		y1 = size.y
	draw_polygon(PackedVector2Array([Vector2(0, y0), Vector2(size.x, y0), Vector2(size.x, y1), Vector2(0, y1)]),
		PackedColorArray([top, top, bottom, bottom]))


func _has(words: Array) -> bool:
	for w in words:
		if bg_id.contains(w):
			return true
	return false


func _paint_fallback() -> void:
	var w := size.x
	var h := size.y
	var rng := RandomNumberGenerator.new()
	rng.seed = hash(bg_id)
	var night := _has(["night", "space", "void", "cave", "dark", "zero", "planet", "multiverse", "shadow", "oa"])
	if _has(["cave", "ruin"]):
		_grad(Color("15121c"), Color("2a2230"))
		for i in 14:
			var x := rng.randf() * w
			var ln := rng.randf_range(0.06, 0.22) * h
			draw_colored_polygon(PackedVector2Array([Vector2(x - 18, 0), Vector2(x + 18, 0), Vector2(x, ln)]), Color("231c2a"))
		for i in 5:
			var x := w * (0.12 + i * 0.19)
			draw_rect(Rect2(x - 22, h * 0.55, 44, h * 0.3), Color("4a4650"))
			draw_circle(Vector2(x, h * 0.53), 26, Color("55515c"))
			draw_circle(Vector2(x - 8, h * 0.525), 4, Color("ff5a3a", 0.7))
			draw_circle(Vector2(x + 8, h * 0.525), 4, Color("ff5a3a", 0.7))
		draw_rect(Rect2(0, h * 0.85, w, h * 0.15), Color("1c1822"))
		return
	if _has(["oa", "lantern", "emerald"]):
		_grad(Color("021a10"), Color("0b3d22"))
		draw_circle(Vector2(w * 0.5, h * 0.3), w * 0.32, Color("3ddc97", 0.18))
		draw_arc(Vector2(w * 0.5, h * 0.3), w * 0.22, 0, TAU, 48, Color("3ddc97"), 10)
		for i in 7:
			var x := w * (0.05 + i * 0.15)
			var th := rng.randf_range(0.25, 0.55) * h
			draw_rect(Rect2(x, h - th, w * 0.09, th), Color("0f5a35"))
			draw_rect(Rect2(x + w * 0.02, h - th + 20, w * 0.05, 8), Color("7affc4", 0.6))
		_stars(rng, 40)
		return
	if _has(["planet", "space", "multiverse", "void", "portal", "realm", "world"]):
		_grad(Color("05031a"), Color("1c0b3a"))
		_stars(rng, 90)
		var pc := Color.from_hsv(rng.randf(), 0.5, 0.8)
		draw_circle(Vector2(w * rng.randf_range(0.2, 0.8), h * 0.32), w * 0.2, pc)
		draw_arc(Vector2(w * 0.5, h * 0.62), w * 0.35, 0, TAU, 64, Color("9b5cff", 0.5), 6)
		draw_arc(Vector2(w * 0.5, h * 0.62), w * 0.25, 0, TAU, 64, Color("3fa9ff", 0.5), 4)
		return
	if _has(["hospital"]):
		_grad(Color("e9f3f7"), Color("cfe2ea"))
		draw_rect(Rect2(w * 0.1, h * 0.12, w * 0.35, h * 0.22), Color("a9d6ef"))
		draw_rect(Rect2(w * 0.1, h * 0.12, w * 0.35, h * 0.22), Color("ffffff"), false, 8)
		draw_rect(Rect2(w * 0.25, h * 0.6, w * 0.65, h * 0.12), Color("ffffff"))
		draw_rect(Rect2(w * 0.25, h * 0.56, w * 0.18, h * 0.06), Color("dfe9f3"))
		draw_rect(Rect2(w * 0.25, h * 0.72, w * 0.65, h * 0.04), Color("8aa0b0"))
		draw_rect(Rect2(w * 0.72, h * 0.18, w * 0.12, w * 0.12), Color("e9406c", 0.85))
		draw_rect(Rect2(w * 0.76, h * 0.18 + w * 0.02, w * 0.04, w * 0.08), Color.WHITE)
		draw_rect(Rect2(w * 0.74, h * 0.18 + w * 0.04, w * 0.08, w * 0.04), Color.WHITE)
		draw_rect(Rect2(0, h * 0.8, w, h * 0.2), Color("b9ccd6"))
		return
	if _has(["jungle", "forest", "picnic", "park", "garden"]):
		_grad(Color("9fd7ff") if not night else Color("0b1a2e"), Color("d8f5c8") if not night else Color("12301f"))
		for layer in 3:
			var col: Color = [Color("2f7a46"), Color("23633a"), Color("17482a")][layer]
			for i in 9:
				var x := rng.randf() * w
				var y := h * (0.45 + layer * 0.12)
				draw_rect(Rect2(x - 8, y, 16, h * 0.25), Color("5a3a22"))
				draw_circle(Vector2(x, y), rng.randf_range(50, 95), col)
		draw_rect(Rect2(0, h * 0.82, w, h * 0.18), Color("3c7a2e"))
		return
	if _has(["school", "classroom", "library", "corridor", "cafeteria", "arena", "playground", "track"]):
		_grad(Color("ffd9a8"), Color("f5efe6"))
		if _has(["classroom", "library"]):
			draw_rect(Rect2(w * 0.08, h * 0.12, w * 0.84, h * 0.25), Color("2f4a3a"))
			draw_rect(Rect2(w * 0.08, h * 0.12, w * 0.84, h * 0.25), Color("8a5a2a"), false, 10)
			for i in 3:
				for j in 3:
					draw_rect(Rect2(w * (0.1 + j * 0.3), h * (0.55 + i * 0.12), w * 0.22, h * 0.05), Color("b98a5a"))
			if _has(["library"]):
				for i in 6:
					draw_rect(Rect2(w * (0.05 + i * 0.16), h * 0.4, w * 0.12, h * 0.12), Color.from_hsv(rng.randf(), 0.5, 0.6))
		elif _has(["arena", "track", "playground"]):
			draw_rect(Rect2(0, h * 0.6, w, h * 0.4), Color("c0553a") if _has(["track"]) else Color("8a7a6a"))
			draw_arc(Vector2(w * 0.5, h * 0.8), w * 0.4, PI, TAU, 40, Color.WHITE, 4)
			for i in 12:
				draw_rect(Rect2(i * w / 12.0, h * 0.35, w / 12.0 - 4, h * 0.2), Color.from_hsv(0.6, 0.2, 0.4 + (i % 3) * 0.1))
		else:
			draw_rect(Rect2(w * 0.1, h * 0.25, w * 0.8, h * 0.45), Color("e8dccb"))
			for i in 4:
				for j in 3:
					draw_rect(Rect2(w * (0.15 + i * 0.19), h * (0.3 + j * 0.12), w * 0.12, h * 0.07), Color("8ac4e8"))
			draw_rect(Rect2(w * 0.42, h * 0.58, w * 0.16, h * 0.12), Color("6a4a2a"))
			draw_rect(Rect2(0, h * 0.7, w, h * 0.3), Color("9a9a8a"))
		return
	if _has(["home", "bedroom", "kitchen", "living", "apartment", "house", "villa", "mansion"]):
		_grad(Color("f3e2c8") if not night else Color("2a2438"), Color("e8d2b0") if not night else Color("1e1a2a"))
		draw_rect(Rect2(w * 0.6, h * 0.14, w * 0.3, h * 0.2), Color("9fd7ff") if not night else Color("0b1a3e"))
		draw_rect(Rect2(w * 0.6, h * 0.14, w * 0.3, h * 0.2), Color("ffffff"), false, 6)
		if _has(["bedroom"]):
			draw_rect(Rect2(w * 0.08, h * 0.6, w * 0.55, h * 0.14), Color("5a7ab8"))
			draw_rect(Rect2(w * 0.08, h * 0.56, w * 0.15, h * 0.06), Color.WHITE)
		elif _has(["kitchen"]):
			draw_rect(Rect2(0, h * 0.55, w, h * 0.2), Color("c9b08a"))
			draw_rect(Rect2(w * 0.1, h * 0.25, w * 0.4, h * 0.12), Color("e0d0b8"))
		else:
			draw_rect(Rect2(w * 0.1, h * 0.58, w * 0.6, h * 0.12), Color("a05a3a"))
			draw_rect(Rect2(w * 0.1, h * 0.52, w * 0.6, h * 0.08), Color("b8704a"))
		draw_rect(Rect2(0, h * 0.78, w, h * 0.22), Color("8a6a4a"))
		return
	# default: city / street / mall
	_grad(Color("ffb27a") if not night else Color("0a0f2e"), Color("ffe1b8") if not night else Color("2a1f4a"))
	if night:
		_stars(rng, 50)
	for layer in 2:
		for i in 10:
			var bw := rng.randf_range(0.08, 0.16) * w
			var bh := rng.randf_range(0.25, 0.55) * h * (1.0 - layer * 0.25)
			var x := rng.randf() * w
			var col := Color("3a3a5a") if layer == 0 else Color("23233a")
			draw_rect(Rect2(x, h * 0.78 - bh, bw, bh), col)
			for wy in range(int(bh / 40)):
				for wx in range(int(bw / 26)):
					if rng.randf() < 0.55:
						draw_rect(Rect2(x + 6 + wx * 26, h * 0.78 - bh + 10 + wy * 40, 12, 18), Color("ffd27a", 0.8 if night else 0.35))
	if _has(["mall", "shop", "store", "showroom", "restaurant"]):
		draw_rect(Rect2(w * 0.15, h * 0.5, w * 0.7, h * 0.28), Color("f5f0ff"))
		draw_rect(Rect2(w * 0.15, h * 0.46, w * 0.7, h * 0.06), Color("e9406c"))
		draw_rect(Rect2(w * 0.4, h * 0.62, w * 0.2, h * 0.16), Color("8ac4e8"))
	draw_rect(Rect2(0, h * 0.78, w, h * 0.22), Color("3a3a44"))
	for i in 8:
		draw_rect(Rect2(i * w / 8.0 + 10, h * 0.88, w / 16.0, 6), Color("e8e0a0"))


func _stars(rng: RandomNumberGenerator, n: int) -> void:
	for i in n:
		draw_circle(Vector2(rng.randf() * size.x, rng.randf() * size.y * 0.7), rng.randf_range(1.0, 2.5), Color(1, 1, 1, rng.randf_range(0.4, 1.0)))
