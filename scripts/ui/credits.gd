extends Control
## Credits screen.

var main


func setup(_args: Dictionary) -> void:
	UI.screen_bg(self, Color("070a18"))
	var root := UI.vbox(14)
	add_child(UI.margin(root, 24))
	root.add_child(UI.header("Credits", func(): main.pop(), UI.HOLO_GOLD))
	var v := UI.vbox(14)
	root.add_child(UI.scroll(v))
	for line in [
		["NEXA — THE TRANSCENDENT SYSTEM", 34, UI.HOLO_GOLD],
		["Original story & creative direction", 22, UI.HOLO_BLUE],
		["Created by the game's author", 22, Color.WHITE],
		["Game code & systems", 22, UI.HOLO_BLUE],
		["Built with Godot Engine 4 (MIT licence) — godotengine.org", 20, Color.WHITE],
		["Artwork", 22, UI.HOLO_BLUE],
		["AI-generated illustrations supplied by the author. Built-in fallback art is drawn procedurally in code.", 20, Color.WHITE],
		["Music & sound", 22, UI.HOLO_BLUE],
		["Add your own original or licensed audio in assets/music and assets/sound. Fallback tones are synthesized in code.", 20, Color.WHITE],
		["Fan-work notice", 22, UI.HOLO_BLUE],
		["This is a personal fan project. Character names and concepts from other franchises belong to their owners. Use original names and art before any public release.", 18, Color("b8c6e6")],
	]:
		var l := UI.label(str(line[0]), int(line[1]), line[2])
		l.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		v.add_child(l)
