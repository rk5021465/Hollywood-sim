extends Control
## Save / Load (Part 24): autosave slot + 5 manual slots, backups, delete.
## args: {"mode": "save" | "load"}

var main
var mode := "load"
var body: VBoxContainer


func setup(args: Dictionary) -> void:
	mode = str(args.get("mode", "load"))
	if not Game.active:
		mode = "load"
	UI.screen_bg(self)
	var root := UI.vbox(10)
	add_child(UI.margin(root, 18))
	root.add_child(UI.header("Save Game" if mode == "save" else "Load Game", func(): main.pop()))
	if Game.active:
		var row := UI.hbox()
		root.add_child(row)
		row.add_child(UI.btn("Save mode", func(): _mode("save"), 56, 20))
		row.add_child(UI.btn("Load mode", func(): _mode("load"), 56, 20))
	body = UI.vbox(10)
	root.add_child(UI.scroll(body))
	refresh()


func _mode(m: String) -> void:
	mode = m
	refresh()


func refresh() -> void:
	UI.clear(body)
	for slot in SaveManager.SLOTS:
		var d := SaveManager.read_slot(slot)
		var p := UI.panel(Color(0, 0, 0, 0), 14, Settings.accent() if slot == 0 else Color(0.5, 0.5, 0.6, 0.4), 2, 14)
		body.add_child(p)
		var v := UI.vbox(6)
		p.add_child(v)
		v.add_child(UI.label("Autosave" if slot == 0 else "Slot %d" % slot, 24, Settings.accent()))
		if d.is_empty():
			v.add_child(UI.label("Empty", 20, UI.muted()))
		else:
			var m: Dictionary = d.get("meta", {})
			var pt := int(float(m.get("playtime", 0)))
			v.add_child(UI.label("Ch.%d %s • Lv.%d" % [int(m.get("chapter", 0)), m.get("chapter_title", ""), int(m.get("level", 1))], 20))
			v.add_child(UI.label("%s • Saved %s • Played %dh %02dm" % [m.get("date", ""), m.get("saved_at", ""), pt / 3600, (pt / 60) % 60], 17, UI.muted()))
		var row := UI.hbox()
		v.add_child(row)
		if mode == "save" and slot != 0:
			row.add_child(UI.btn("Save here", _save.bind(slot, d.is_empty()), 60, 20))
		if mode == "load" and not d.is_empty():
			row.add_child(UI.btn("Load", _load.bind(slot), 60, 20))
		if not d.is_empty() and slot != 0:
			row.add_child(UI.btn("Delete", func(): UI.confirm(self, "Delete slot %d?" % slot, func(): _delete(slot), "Delete"), 60, 20))


func _save(slot: int, empty: bool) -> void:
	if empty:
		_do_save(slot)
	else:
		UI.confirm(self, "Overwrite slot %d?" % slot, func(): _do_save(slot), "Overwrite")


func _do_save(slot: int) -> void:
	if SaveManager.save(slot):
		Game.notify("Game saved to slot %d." % slot, "info")
	refresh()


func _load(slot: int) -> void:
	if SaveManager.load_slot(slot):
		main.go("hub")


func _delete(slot: int) -> void:
	SaveManager.delete_slot(slot)
	refresh()
