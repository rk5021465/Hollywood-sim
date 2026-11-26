extends Node
## Versioned save system: autosave slot 0, manual slots 1-5, .bak backups.
## Older saves are migrated by deep-merging them onto the current default
## state, so new fields added in updates never break existing saves.

const SAVE_VERSION := 1
const SLOTS := 6   # 0 = autosave, 1..5 manual


func slot_path(slot: int) -> String:
	return "user://save_slot_%d.json" % slot


func save(slot: int) -> bool:
	if not Game.active:
		return false
	var path := slot_path(slot)
	if FileAccess.file_exists(path):
		DirAccess.copy_absolute(ProjectSettings.globalize_path(path), ProjectSettings.globalize_path(path + ".bak"))
	var payload := {
		"version": SAVE_VERSION,
		"meta": {
			"chapter": int(Game.s.story.get("chapter", 0)),
			"chapter_title": Story.chapter_title(int(Game.s.story.get("chapter", 0))),
			"level": int(Game.s.level), "date": Game.date_string(),
			"saved_at": Time.get_datetime_string_from_system(false, true),
			"playtime": float(Game.s.playtime),
		},
		"state": Game.s,
	}
	var f := FileAccess.open(path, FileAccess.WRITE)
	if f == null:
		push_error("Save failed: %s" % FileAccess.get_open_error())
		Game.notify("Save failed!", "warn")
		return false
	f.store_string(JSON.stringify(payload))
	f.close()
	return true


func autosave() -> void:
	if Game.active and bool(Settings.get_v("autosave")):
		save(0)


func _read(path: String) -> Dictionary:
	if not FileAccess.file_exists(path):
		return {}
	var f := FileAccess.open(path, FileAccess.READ)
	if f == null:
		return {}
	var parsed = JSON.parse_string(f.get_as_text())
	return parsed if parsed is Dictionary and parsed.has("state") else {}


func read_slot(slot: int) -> Dictionary:
	var d := _read(slot_path(slot))
	if d.is_empty():
		d = _read(slot_path(slot) + ".bak")   # corrupted -> try backup
	return d


func has_save(slot: int) -> bool:
	return not read_slot(slot).is_empty()


func latest_slot() -> int:
	var best := -1
	var best_time := ""
	for i in SLOTS:
		var d := read_slot(i)
		if not d.is_empty():
			var t := str(d.get("meta", {}).get("saved_at", ""))
			if best == -1 or t > best_time:
				best = i
				best_time = t
	return best


func load_slot(slot: int) -> bool:
	var d := read_slot(slot)
	if d.is_empty():
		Game.notify("Save could not be loaded.", "warn")
		return false
	var state: Dictionary = migrate(d.state, int(d.get("version", 0)))
	Game.load_state(state)
	return true


func delete_slot(slot: int) -> void:
	for p in [slot_path(slot), slot_path(slot) + ".bak"]:
		if FileAccess.file_exists(p):
			DirAccess.remove_absolute(ProjectSettings.globalize_path(p))


func migrate(state: Dictionary, from_version: int) -> Dictionary:
	var merged := _deep_merge(Game.default_state(), state)
	if from_version < SAVE_VERSION:
		print("[Save] migrated save from v%d to v%d" % [from_version, SAVE_VERSION])
	return merged


func _deep_merge(base: Dictionary, over: Dictionary) -> Dictionary:
	var out := base.duplicate(true)
	for k in over.keys():
		if out.has(k) and out[k] is Dictionary and over[k] is Dictionary and k not in ["relationships", "flags", "cards", "inventory", "shadows", "messages", "jobs", "memories"]:
			out[k] = _deep_merge(out[k], over[k])
		else:
			out[k] = over[k]
	return out
