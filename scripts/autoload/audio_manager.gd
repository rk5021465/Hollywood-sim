extends Node
## Music + sound effects with separate Music / SFX / UI / Voice buses.
## Music files: res://assets/music/<id>.ogg|mp3|wav
## Sound files: res://assets/sound/<id>.ogg|mp3|wav
## If a sound file is missing, a short synthesized tone is used so the game
## still gives audio feedback. Missing music is silent (logged once).

const BUSES := ["Music", "SFX", "UI", "Voice"]
const AUDIO_EXTS := ["ogg", "mp3", "wav"]

# Fallback synthesized tones: id -> [frequencies..., note_length]
const TONES := {
	"click": [[880.0], 0.04], "notify": [[660.0, 990.0], 0.08], "message": [[784.0, 1046.0], 0.07],
	"call": [[523.0, 659.0, 523.0, 659.0], 0.12], "quest": [[523.0, 659.0, 784.0], 0.09],
	"levelup": [[523.0, 659.0, 784.0, 1046.0], 0.1], "transition": [[330.0, 220.0], 0.12],
	"hit": [[140.0], 0.08], "win": [[523.0, 784.0, 1046.0], 0.12], "lose": [[392.0, 330.0, 262.0], 0.16],
	"system": [[1200.0, 1500.0], 0.06], "card_open": [[300.0, 450.0, 600.0], 0.08],
	"card_common": [[660.0], 0.12], "card_uncommon": [[660.0, 880.0], 0.1],
	"card_rare": [[660.0, 880.0, 990.0], 0.1], "card_epic": [[523.0, 784.0, 988.0, 1175.0], 0.1],
	"card_legendary": [[523.0, 659.0, 784.0, 1046.0, 1318.0], 0.1],
	"card_mythical": [[440.0, 659.0, 880.0, 1108.0, 1318.0, 1760.0], 0.09],
	"card_transcendent": [[392.0, 523.0, 659.0, 784.0, 1046.0, 1318.0, 1568.0], 0.11],
	"card_beyond_transcendent": [[262.0, 392.0, 523.0, 784.0, 1046.0, 1568.0, 2093.0], 0.12],
}

var music_a: AudioStreamPlayer
var music_b: AudioStreamPlayer
var current_music := ""
var _sfx_pool: Array = []
var _tone_cache: Dictionary = {}
var _missing: Dictionary = {}


func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	for b in BUSES:
		if AudioServer.get_bus_index(b) == -1:
			AudioServer.add_bus()
			var idx := AudioServer.bus_count - 1
			AudioServer.set_bus_name(idx, b)
			AudioServer.set_bus_send(idx, "Master")
	music_a = _make_player("Music")
	music_b = _make_player("Music")
	for i in 6:
		_sfx_pool.append(_make_player("SFX"))
	apply_volumes()


func _make_player(bus: String) -> AudioStreamPlayer:
	var p := AudioStreamPlayer.new()
	p.bus = bus
	add_child(p)
	return p


func apply_volumes() -> void:
	if not is_inside_tree():
		return
	var map := {"Music": "music_volume", "SFX": "sfx_volume", "UI": "ui_volume", "Voice": "voice_volume"}
	for b in map.keys():
		var idx := AudioServer.get_bus_index(b)
		if idx >= 0:
			var v := clampf(float(Settings.get_v(map[b])), 0.0, 1.0)
			AudioServer.set_bus_volume_db(idx, linear_to_db(max(v, 0.0001)))
			AudioServer.set_bus_mute(idx, v <= 0.001)


func _find_stream(folder: String, id: String) -> AudioStream:
	for ext in AUDIO_EXTS:
		var p := "res://assets/%s/%s.%s" % [folder, id, ext]
		if ResourceLoader.exists(p):
			var s = load(p)
			if s is AudioStream:
				return s
	return null


func play_music(id: String, fade: float = 1.0) -> void:
	if id == "" or id == current_music:
		return
	current_music = id
	var stream := _find_stream("music", id)
	var old := music_a if music_a.playing else music_b
	var new_p := music_b if old == music_a else music_a
	if stream == null:
		if not _missing.has("music/" + id):
			_missing["music/" + id] = true
			print("[Audio] missing music: ", id)
	else:
		if stream is AudioStreamOggVorbis:
			stream.loop = true
		elif stream is AudioStreamMP3:
			stream.loop = true
		new_p.stream = stream
		new_p.volume_db = -40.0
		new_p.play()
		create_tween().tween_property(new_p, "volume_db", 0.0, fade)
	if old.playing:
		var tw := create_tween()
		tw.tween_property(old, "volume_db", -40.0, fade)
		tw.tween_callback(old.stop)


func stop_music() -> void:
	current_music = ""
	music_a.stop()
	music_b.stop()


func play_sfx(id: String, bus: String = "SFX") -> void:
	if id == "":
		return
	var stream := _find_stream("sound", id)
	if stream == null:
		stream = _tone(id)
	if stream == null:
		return
	for p in _sfx_pool:
		if not p.playing:
			p.bus = bus
			p.stream = stream
			p.play()
			return


func ui(id: String = "click") -> void:
	play_sfx(id, "UI")


func _tone(id: String) -> AudioStream:
	if _tone_cache.has(id):
		return _tone_cache[id]
	if not TONES.has(id):
		return null
	var spec: Array = TONES[id]
	var freqs: Array = spec[0]
	var note_len: float = spec[1]
	var rate := 22050
	var data := PackedByteArray()
	for f in freqs:
		var n := int(rate * note_len)
		for i in n:
			var env := 1.0 - float(i) / n
			var v := sin(TAU * float(f) * i / rate) * 0.28 * env
			var s := int(clampf(v, -1.0, 1.0) * 32767.0)
			data.append(s & 0xFF)
			data.append((s >> 8) & 0xFF)
	var wav := AudioStreamWAV.new()
	wav.format = AudioStreamWAV.FORMAT_16_BITS
	wav.mix_rate = rate
	wav.stereo = false
	wav.data = data
	_tone_cache[id] = wav
	return wav
