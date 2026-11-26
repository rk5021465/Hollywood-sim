extends Control
## Card reveal animation (Part 9): dim -> opening sound -> particles ->
## glowing silhouette -> artwork fades in -> rarity -> rarity sound -> name ->
## description -> added to inventory. Each rarity has its own colours,
## particle amount, timing and extra effects; Transcendent tiers get rays,
## a white flash and a second particle burst.

signal finished

var shade: ColorRect
var card: CardArt
var glow: ColorRect
var info: VBoxContainer
var particles: CPUParticles2D
var rays: Control
var can_close := false
var rarity := "common"


func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_STOP


func play(card_id: String) -> void:
	var d := Data.card(card_id)
	rarity = str(d.get("rarity", "common"))
	var ri := Data.rarity_index(rarity)
	var rc: Color = Data.RARITY_COLORS.get(rarity, Color.WHITE)
	var spd := 1.0 + ri * 0.18   # rarer = slower, more dramatic

	shade = ColorRect.new()
	shade.color = Color(0, 0, 0, 0)
	UI.full(shade)
	shade.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(shade)

	rays = Control.new()
	UI.full(rays)
	rays.mouse_filter = Control.MOUSE_FILTER_IGNORE
	rays.modulate.a = 0.0
	rays.draw.connect(_draw_rays.bind(rc))
	add_child(rays)

	var cc := CenterContainer.new()
	UI.full(cc)
	cc.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(cc)
	var v := UI.vbox(18)
	v.alignment = BoxContainer.ALIGNMENT_CENTER
	v.custom_minimum_size = Vector2(620, 0)
	v.mouse_filter = Control.MOUSE_FILTER_IGNORE
	cc.add_child(v)

	var holder := Control.new()
	holder.custom_minimum_size = Vector2(360, 520)
	holder.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	holder.mouse_filter = Control.MOUSE_FILTER_IGNORE
	v.add_child(holder)
	glow = ColorRect.new()
	glow.color = Color(rc.r, rc.g, rc.b, 0.0)
	glow.position = Vector2(-20, -20)
	glow.size = Vector2(400, 560)
	glow.mouse_filter = Control.MOUSE_FILTER_IGNORE
	holder.add_child(glow)
	card = CardArt.new()
	card.set_card(card_id)
	card.size = Vector2(360, 520)
	card.pivot_offset = card.size / 2.0
	card.reveal = 0.0
	card.show_text = false
	card.modulate = Color(0, 0, 0, 0)
	card.scale = Vector2(0.6, 0.6)
	card.mouse_filter = Control.MOUSE_FILTER_IGNORE
	holder.add_child(card)

	particles = CPUParticles2D.new()
	particles.position = Vector2(180, 260)
	particles.amount = 24 + ri * 26
	particles.lifetime = 1.6
	particles.one_shot = false
	particles.explosiveness = 0.2
	particles.emission_shape = CPUParticles2D.EMISSION_SHAPE_SPHERE
	particles.emission_sphere_radius = 180.0
	particles.direction = Vector2(0, -1)
	particles.spread = 180.0
	particles.gravity = Vector2(0, -60)
	particles.initial_velocity_min = 20.0
	particles.initial_velocity_max = 90.0 + ri * 30
	particles.scale_amount_min = 2.0
	particles.scale_amount_max = 5.0 + ri
	particles.color = rc
	particles.emitting = false
	holder.add_child(particles)

	info = UI.vbox(8)
	info.modulate.a = 0.0
	info.mouse_filter = Control.MOUSE_FILTER_IGNORE
	v.add_child(info)
	var rl := UI.label(Data.RARITY_NAMES.get(rarity, "").to_upper(), 30, rc)
	rl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	info.add_child(rl)
	var nl := UI.label(str(d.get("name", card_id)), 44, Color.WHITE)
	nl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	info.add_child(nl)
	var cat := UI.label("%s  •  %s" % [d.get("category", ""), "Active" if d.has("active") else "Passive"], 22, Color("b8c6e6"))
	cat.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	info.add_child(cat)
	var dl := UI.label(str(d.get("desc", "")), 24, Color("e6ecff"))
	dl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	info.add_child(dl)
	var tap := UI.label("Added to Card Inventory  —  tap to continue", 20, Color("8fa0c8"))
	tap.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	info.add_child(tap)

	# ---- sequence
	var A := Settings.anim(1.0)
	var tw := create_tween()
	tw.tween_property(shade, "color:a", 0.88, 0.35 * A)
	tw.tween_callback(_start_particles)
	tw.tween_property(card, "modulate", Color(rc.r, rc.g, rc.b, 1.0), 0.5 * A * spd)
	tw.parallel().tween_property(card, "scale", Vector2(1, 1), 0.5 * A * spd).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
	tw.parallel().tween_property(glow, "color:a", 0.25 + ri * 0.05, 0.5 * A * spd)
	if ri >= 3:
		tw.tween_property(card, "rotation", 0.08, 0.12 * A)
		tw.tween_property(card, "rotation", -0.08, 0.12 * A)
		tw.tween_property(card, "rotation", 0.0, 0.12 * A)
	if ri >= 4:
		tw.tween_property(rays, "modulate:a", 1.0, 0.4 * A)
	if ri >= 6:
		tw.tween_callback(_flash)
		tw.tween_interval(0.25 * A)
	tw.tween_property(card, "modulate", Color.WHITE, 0.6 * A * spd)
	tw.parallel().tween_method(_set_reveal, 0.0, 1.0, 0.8 * A * spd)
	var _cb1 := func():
		card.show_text = true
		card.queue_redraw()
		Audio.play_sfx("card_" + rarity)
	tw.tween_callback(_cb1)
	tw.tween_property(info, "modulate:a", 1.0, 0.4 * A)
	if ri >= 6:
		tw.tween_callback(_second_burst.bind(holder, rc))
	tw.tween_callback(func(): can_close = true)


func _start_particles() -> void:
	Audio.play_sfx("card_open")
	particles.emitting = true


func _set_reveal(x: float) -> void:
	card.reveal = x
	card.queue_redraw()


func _flash() -> void:
	var f := ColorRect.new()
	f.color = Color(1, 1, 1, 0.9)
	UI.full(f)
	f.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(f)
	var tw := create_tween()
	tw.tween_property(f, "color:a", 0.0, Settings.anim(0.6))
	tw.tween_callback(f.queue_free)


func _second_burst(holder: Control, rc: Color) -> void:
	var p := CPUParticles2D.new()
	p.position = Vector2(180, 260)
	p.amount = 160
	p.one_shot = true
	p.explosiveness = 0.95
	p.lifetime = 1.4
	p.spread = 180.0
	p.gravity = Vector2.ZERO
	p.initial_velocity_min = 200.0
	p.initial_velocity_max = 520.0
	p.scale_amount_min = 3.0
	p.scale_amount_max = 8.0
	p.color = rc.lightened(0.4)
	holder.add_child(p)
	p.emitting = true


func _draw_rays(rc: Color) -> void:
	var c := rays.size / 2.0
	var r: float = rays.size.length()
	for i in 16:
		var a := i * TAU / 16.0 + Time.get_ticks_msec() * 0.0002
		var p1 := c + Vector2(cos(a - 0.06), sin(a - 0.06)) * r
		var p2 := c + Vector2(cos(a + 0.06), sin(a + 0.06)) * r
		rays.draw_colored_polygon(PackedVector2Array([c, p1, p2]), Color(rc.r, rc.g, rc.b, 0.12))


func _process(_d: float) -> void:
	if rays and rays.modulate.a > 0.0:
		rays.queue_redraw()


func _gui_input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.pressed:
		accept_event()
		if can_close:
			can_close = false
			var tw := create_tween()
			tw.tween_property(self, "modulate:a", 0.0, Settings.anim(0.25))
			var _cb2 := func():
				finished.emit()
				queue_free()
			tw.tween_callback(_cb2)
