extends Node
## Player settings, stored separately from save slots in user://settings.cfg

const PATH := "user://settings.cfg"

const DEFAULTS := {
	"text_size": 1.0,          # multiplier 0.8 - 1.4
	"text_color": "default",   # default / white / cream / cyan / gold
	"font": "default",         # default / custom1 / custom2
	"theme": "dark",           # dark / light
	"accent": "blue",          # blue / purple / gold / crimson / green
	"music_volume": 0.7,
	"sfx_volume": 0.8,
	"ui_volume": 0.6,
	"voice_volume": 0.8,
	"animation_speed": 1.0,    # 0.5 - 2.0 (higher = faster)
	"typewriter_speed": 45.0,  # characters per second, 0 = instant
	"auto_read": false,
	"auto_delay": 1.6,
	"skip_unread": false,
	"language": "en",
	"orientation": "portrait", # portrait / landscape / auto
	"autosave": true,
	"reduce_motion": false,
}

const ACCENTS := {
	"blue": Color("3fa9ff"), "purple": Color("9b5cff"), "gold": Color("f5c542"),
	"crimson": Color("e9406c"), "green": Color("3ddc97"),
}
const TEXT_COLORS := {
	"default": Color(0, 0, 0, 0), "white": Color("ffffff"), "cream": Color("fff3d6"),
	"cyan": Color("a8ecff"), "gold": Color("ffe08a"),
}
const FONT_PATHS := {
	"custom1": "res://assets/fonts/main.ttf",
	"custom2": "res://assets/fonts/alt.ttf",
}

var values: Dictionary = DEFAULTS.duplicate(true)


func _ready() -> void:
	load_settings()


func get_v(key: String):
	return values.get(key, DEFAULTS.get(key))


func set_v(key: String, value) -> void:
	values[key] = value
	save_settings()
	apply()
	Events.settings_changed.emit()


func load_settings() -> void:
	var cfg := ConfigFile.new()
	if cfg.load(PATH) == OK:
		for k in DEFAULTS.keys():
			values[k] = cfg.get_value("settings", k, DEFAULTS[k])
	apply.call_deferred()


func save_settings() -> void:
	var cfg := ConfigFile.new()
	for k in values.keys():
		cfg.set_value("settings", k, values[k])
	var err := cfg.save(PATH)
	if err != OK:
		push_warning("Settings could not be saved: %s" % err)


func reset() -> void:
	values = DEFAULTS.duplicate(true)
	save_settings()
	apply()
	Events.settings_changed.emit()


func apply() -> void:
	if has_node("/root/Audio"):
		get_node("/root/Audio").apply_volumes()
	match str(values.orientation):
		"landscape":
			DisplayServer.screen_set_orientation(DisplayServer.SCREEN_SENSOR_LANDSCAPE)
		"auto":
			DisplayServer.screen_set_orientation(DisplayServer.SCREEN_SENSOR)
		_:
			DisplayServer.screen_set_orientation(DisplayServer.SCREEN_PORTRAIT)


func accent() -> Color:
	return ACCENTS.get(str(values.accent), ACCENTS.blue)


func is_dark() -> bool:
	return str(values.theme) != "light"


func text_color() -> Color:
	var c: Color = TEXT_COLORS.get(str(values.text_color), Color(0, 0, 0, 0))
	if c.a == 0.0:
		return Color("eef2ff") if is_dark() else Color("1a1d2b")
	return c


func font_size(base: int) -> int:
	return int(round(base * float(values.text_size)))


func custom_font() -> Font:
	var key := str(values.font)
	if FONT_PATHS.has(key) and ResourceLoader.exists(FONT_PATHS[key]):
		return load(FONT_PATHS[key])
	return null


func anim(t: float) -> float:
	## Scales an animation duration by the player's animation speed.
	if bool(values.reduce_motion):
		return 0.01
	return t / max(0.1, float(values.animation_speed))
