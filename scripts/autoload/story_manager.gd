extends Node
## Story progression. Scenes are data (data/story/*.json).
## Each scene has "next" and optional "requires" (a condition dictionary).
## When the next scene's requirement is met the hub's Story button plays it.


func scene(id: String) -> Dictionary:
	return Data.scenes.get(id, {})


func next_id() -> String:
	return str(Game.s.story.get("next", ""))


func next_scene() -> Dictionary:
	return scene(next_id())


func can_play_next() -> bool:
	var sc := next_scene()
	if sc.is_empty():
		return false
	return Game.check_cond(sc.get("requires", {}))


func requirement_text() -> String:
	var sc := next_scene()
	if sc.is_empty():
		return "To be continued — the next arc is in development."
	return str(sc.get("hint", "Keep living your life. The story continues soon."))


func start_scene(id: String) -> void:
	var sc := scene(id)
	if sc.is_empty():
		return
	Game.s.story.chapter = max(int(Game.s.story.get("chapter", 0)), int(sc.get("chapter", 0)))
	if sc.has("location"):
		Game.s.location = str(sc.location)


func finish_scene(id: String) -> String:
	## Marks a scene as seen and returns the scene to chain into ("" = go to hub).
	var sc := scene(id)
	Game.s.gallery.scenes[id] = true
	if sc.has("bg"):
		Game.s.gallery.backgrounds[str(sc.bg)] = true
	var nxt := str(sc.get("next", ""))
	Game.s.story.next = nxt
	if sc.has("location_after"):
		Game.s.location = str(sc.location_after)
	Game.log_history("Story: %s" % sc.get("title", id))
	Events.fire("scene_done:" + id)
	if nxt != "" and bool(sc.get("chain", false)) and can_play_next():
		return nxt
	return ""


func chapter_title(n: int) -> String:
	for c in Data.chapters:
		if int(c.n) == n:
			return str(c.title)
	return "Chapter %d" % n
