extends Control
## Root controller: screen stack navigation, overlays (toasts, card reveals),
## Android back button and pause/resume autosave.

const SCREENS := {
	"menu": "res://scripts/ui/main_menu.gd",
	"creator": "res://scripts/ui/character_creator.gd",
	"story": "res://scripts/ui/story_player.gd",
	"hub": "res://scripts/ui/hub.gd",
	"system": "res://scripts/ui/system_menu.gd",
	"phone": "res://scripts/ui/phone.gd",
	"combat": "res://scripts/ui/combat.gd",
	"competition": "res://scripts/ui/competition.gd",
	"shop": "res://scripts/ui/shop.gd",
	"housing": "res://scripts/ui/housing.gd",
	"job": "res://scripts/ui/job.gd",
	"gallery": "res://scripts/ui/galleries.gd",
	"settings": "res://scripts/ui/settings_screen.gd",
	"saves": "res://scripts/ui/save_screen.gd",
	"map": "res://scripts/ui/map_screen.gd",
	"credits": "res://scripts/ui/credits.gd",
}

var screen_layer: Control
var overlay_layer: Control
var toast_box: VBoxContainer
var stack: Array = []
var reveal_queue: Array = []
var reveal_busy := false
signal reveals_done


func _ready() -> void:
	theme = UI.make_theme()
	screen_layer = UI.full(Control.new())
	add_child(screen_layer)
	overlay_layer = UI.full(Control.new())
	overlay_layer.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(overlay_layer)
	toast_box = UI.vbox(8)
	toast_box.set_anchors_and_offsets_preset(Control.PRESET_TOP_WIDE)
	toast_box.offset_top = 90
	toast_box.offset_left = 24
	toast_box.offset_right = -24
	toast_box.mouse_filter = Control.MOUSE_FILTER_IGNORE
	overlay_layer.add_child(toast_box)
	Events.notify.connect(_on_notify)
	Events.card_granted.connect(_on_card)
	Events.settings_changed.connect(_on_settings)
	get_tree().set_auto_accept_quit(false)
	go("menu")
	if "--smoke" in OS.get_cmdline_user_args():
		var t = load("res://scripts/smoke_test.gd").new()
		t.main = self
		add_child(t)
		t.run.call_deferred()


func _on_settings() -> void:
	theme = UI.make_theme()


# ---------------------------------------------------------------- navigation
func _make(screen_name: String, args: Dictionary) -> Control:
	var script = load(SCREENS[screen_name])
	var c: Control = script.new()
	c.set_meta("screen_name", screen_name)
	UI.full(c)
	if "main" in c:
		c.main = self
	screen_layer.add_child(c)
	if c.has_method("setup"):
		c.setup(args)
	return c


func go(screen_name: String, args: Dictionary = {}) -> void:
	## Replace the whole stack with one screen.
	for c in stack:
		c.queue_free()
	stack.clear()
	Assets.clear_cache()
	stack.append(_make(screen_name, args))


func push(screen_name: String, args: Dictionary = {}) -> Control:
	if stack.size() > 0:
		stack.back().visible = false
	var c := _make(screen_name, args)
	stack.append(c)
	return c


func pop() -> void:
	if stack.size() <= 1:
		return
	var top: Control = stack.pop_back()
	top.queue_free()
	var under: Control = stack.back()
	under.visible = true
	if under.has_method("refresh"):
		under.refresh()


func top_name() -> String:
	return str(stack.back().get_meta("screen_name")) if stack.size() > 0 else ""


func _notification(what: int) -> void:
	match what:
		NOTIFICATION_WM_GO_BACK_REQUEST:
			_back()
		NOTIFICATION_WM_CLOSE_REQUEST:
			SaveManager.autosave()
			get_tree().quit()
		NOTIFICATION_APPLICATION_PAUSED, NOTIFICATION_APPLICATION_FOCUS_OUT:
			SaveManager.autosave()


func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed and event.keycode == KEY_ESCAPE:
		_back()


func _back() -> void:
	# Close the topmost modal overlay first, if any.
	if reveal_busy:
		return
	var top: Control = stack.back() if stack.size() > 0 else null
	if top == null:
		return
	if top.has_method("on_back") and top.on_back():
		return
	if stack.size() > 1:
		pop()
	elif top_name() == "hub":
		var _cb1 := func():
			SaveManager.autosave()
			Game.active = false
			go("menu")
		UI.confirm(top, "Return to the main menu? Your game will be autosaved.", _cb1)
	elif top_name() == "menu":
		UI.confirm(top, "Exit NEXA?", func(): get_tree().quit(), "Exit")


# ---------------------------------------------------------------- toasts
func _on_notify(text: String, kind: String) -> void:
	var colors := {"system": UI.HOLO_BLUE, "quest": UI.HOLO_PURPLE, "quest_done": UI.HOLO_GOLD, "warn": Color("e9406c"),
		"card": UI.HOLO_GOLD, "message": Color("3ddc97"), "news": Color("ffb21f"), "achievement": UI.HOLO_GOLD, "event": Color("ff7ab8")}
	var col: Color = colors.get(kind, Settings.accent())
	var p := UI.panel(Color(0.04, 0.06, 0.15, 0.94), 12, col, 2, 12)
	p.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var l := UI.label(text, 22, Color("eef4ff"))
	p.add_child(l)
	toast_box.add_child(p)
	if kind != "message" and kind != "news":
		Audio.ui("notify")
	p.modulate.a = 0.0
	var tw := create_tween()
	tw.tween_property(p, "modulate:a", 1.0, Settings.anim(0.2))
	tw.tween_interval(2.6)
	tw.tween_property(p, "modulate:a", 0.0, Settings.anim(0.4))
	tw.tween_callback(p.queue_free)
	while toast_box.get_child_count() > 4:
		toast_box.get_child(0).queue_free()
		break


# ---------------------------------------------------------------- card reveals
func _on_card(card_id: String, is_new: bool) -> void:
	if not is_new:
		return
	reveal_queue.append(card_id)
	if not reveal_busy:
		_next_reveal()


func _next_reveal() -> void:
	if reveal_queue.is_empty():
		reveal_busy = false
		reveals_done.emit()
		return
	reveal_busy = true
	var id: String = reveal_queue.pop_front()
	var rv = load("res://scripts/ui/card_reveal.gd").new()
	UI.full(rv)
	overlay_layer.add_child(rv)
	rv.finished.connect(_next_reveal)
	rv.play(id)


func wait_reveals() -> void:
	## Await this from screens that must pause while cards are being revealed.
	if reveal_busy:
		await reveals_done
