extends Node
## Asset registry: finds artwork by ID.
## Lookup order: data/asset_registry.json override -> naming convention -> null.
## A null result tells the view components to draw their built-in fallback art,
## so missing images never crash the game. Every missing ID is logged once.

const EXTS := ["png", "webp", "jpg", "jpeg"]
const BG_FOLDERS := ["home", "school", "hospital", "jungle", "cave", "city", "shopping", "training", "planets", "multiverse", ""]

var missing: Dictionary = {}   # id -> true (logged)
var _cache: Dictionary = {}    # path -> Texture2D (small, cleared on scene change)


func _find(base_path_no_ext: String) -> String:
	for ext in EXTS:
		var p := "%s.%s" % [base_path_no_ext, ext]
		if ResourceLoader.exists(p):
			return p
	return ""


func _load(path: String) -> Texture2D:
	if path == "":
		return null
	if _cache.has(path):
		return _cache[path]
	var tex = load(path)
	if tex is Texture2D:
		if _cache.size() > 24:
			_cache.clear()
		_cache[path] = tex
		return tex
	return null


func _registry(id: String) -> String:
	var p := str(Data.asset_registry.get(id, ""))
	if p != "" and ResourceLoader.exists(p):
		return p
	return ""


func _log_missing(id: String) -> void:
	if not missing.has(id):
		missing[id] = true
		print("[Assets] missing image, using fallback: ", id)


func portrait(char_id: String, expr: String = "normal", costume: String = "") -> Texture2D:
	var folder := str(Data.character(char_id).get("folder", char_id))
	var ids: Array = []
	if costume != "":
		ids.append("%s_%s_%s" % [char_id, costume, expr])
	ids.append("%s_%s" % [char_id, expr])
	if expr != "normal":
		ids.append("%s_normal" % char_id)
	for id in ids:
		var p := _registry(id)
		if p == "":
			p = _find("res://assets/characters/%s/%s" % [folder, id])
		if p != "":
			return _load(p)
	_log_missing("%s_%s" % [char_id, expr])
	return null


func background(bg_id: String) -> Texture2D:
	if bg_id == "":
		return null
	var p := _registry(bg_id)
	if p == "":
		for f in BG_FOLDERS:
			var base := "res://assets/backgrounds/%s%s" % [(f + "/") if f != "" else "", bg_id]
			p = _find(base)
			if p != "":
				break
	if p == "":
		_log_missing(bg_id)
		return null
	return _load(p)


func card_art(card_id: String) -> Texture2D:
	var rarity := str(Data.card(card_id).get("rarity", "common"))
	var p := _registry(card_id + "_card")
	if p == "":
		p = _find("res://assets/cards/%s/%s_card" % [rarity, card_id])
	if p == "":
		p = _find("res://assets/cards/%s/%s" % [rarity, card_id])
	if p == "":
		_log_missing(card_id + "_card")
		return null
	return _load(p)


func image(folder: String, id: String) -> Texture2D:
	## Generic lookup for pets/, houses/, shops/, vehicles/, costumes/, maps/, icons/, effects/
	var p := _registry(id)
	if p == "":
		p = _find("res://assets/%s/%s" % [folder, id])
	if p == "":
		_log_missing(folder + "/" + id)
		return null
	return _load(p)


func clear_cache() -> void:
	_cache.clear()
