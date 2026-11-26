extends Control
## Housing + pets (Part 15): owned properties, moving house, illustrated rooms,
## furniture placement, garage with vehicles, and pet care.

var main
var room := ""
var tab := "home"   # home / pets
var body: VBoxContainer
var bgv: BackgroundView


func setup(_args: Dictionary) -> void:
	bgv = BackgroundView.new()
	UI.full(bgv)
	add_child(bgv)
	var shade := ColorRect.new()
	shade.color = Color(0, 0, 0, 0.35)
	UI.full(shade)
	add_child(shade)
	var root := UI.vbox(10)
	add_child(UI.margin(root, 16))
	root.add_child(UI.header("My Home", func(): main.pop(), Color.WHITE))
	var tabs := UI.hbox()
	root.add_child(tabs)
	tabs.add_child(UI.holo_btn("Rooms", func(): _tab("home"), UI.HOLO_BLUE, 60))
	tabs.add_child(UI.holo_btn("Pets (%d)" % Game.s.pets.size(), func(): _tab("pets"), UI.HOLO_PURPLE, 60))
	tabs.add_child(UI.holo_btn("Properties", func(): _tab("props"), UI.HOLO_GOLD, 60))
	body = UI.vbox(10)
	root.add_child(UI.scroll(body))
	Audio.play_music("home")
	refresh()


func house_id() -> String:
	return str(Game.s.houses.current)


func house() -> Dictionary:
	return Data.houses.get(house_id(), {"name": "Home", "rooms": ["bedroom"], "comfort": 1})


func _tab(t: String) -> void:
	tab = t
	refresh()


func refresh() -> void:
	UI.clear(body)
	var rooms: Array = house().get("rooms", ["bedroom"])
	if room == "" or not (room in rooms):
		room = str(rooms[0])
	bgv.set_bg("%s_%s" % [house_id(), room])
	match tab:
		"pets": _pets()
		"props": _props()
		_: _rooms()


func comfort() -> int:
	var c := int(house().get("comfort", 1))
	var fur: Dictionary = Game.s.houses.furniture.get(house_id(), {})
	for r in fur.keys():
		for f in fur[r]:
			c += int(Data.items.get(str(f), {}).get("comfort", 1))
	return c


func _rooms() -> void:
	var h := house()
	var p := UI.panel(Color(0.04, 0.06, 0.16, 0.85), 12, Color(1, 1, 1, 0.15), 1, 12)
	body.add_child(p)
	var v := UI.vbox(6)
	p.add_child(v)
	v.add_child(UI.label(str(h.get("name", "")), 28, Color.WHITE))
	v.add_child(UI.label("Comfort: %d  (higher comfort = better rest)" % comfort(), 19, Color("ffd36a")))
	var rg := UI.grid(3)
	body.add_child(rg)
	for r in h.get("rooms", []):
		rg.add_child(_room_btn(str(r)))
	var fur: Array = Game.s.houses.furniture.get(house_id(), {}).get(room, [])
	body.add_child(UI.label("Furniture in the %s" % room, 22, Color.WHITE))
	if fur.is_empty():
		body.add_child(UI.label("Empty. Buy furniture at the Furniture Store and place it here.", 18, Color("c5d0ee")))
	for f in fur:
		var it: Dictionary = Data.items.get(str(f), {})
		var row := UI.hbox()
		row.add_child(UI.label("▪ %s (comfort +%d)" % [it.get("name", f), int(it.get("comfort", 1))], 19, Color("e6ecff")))
		var b := UI.btn("Store", _store.bind(str(f)), 52, 18)
		b.custom_minimum_size = Vector2(120, 52)
		b.size_flags_horizontal = Control.SIZE_SHRINK_END
		row.add_child(b)
		body.add_child(row)
	var placeable: Array = []
	for id in Game.s.inventory.keys():
		if str(Data.items.get(id, {}).get("cat", "")) == "furniture":
			placeable.append(id)
	if placeable.size() > 0:
		body.add_child(UI.label("Place from inventory", 20, Color.WHITE))
		for id in placeable:
			body.add_child(UI.btn("Place %s (×%d)" % [Data.items[id].get("name", id), int(Game.s.inventory[id])], _place.bind(id), 60, 19))
	if room == "garage":
		body.add_child(UI.label("Vehicles", 22, Color.WHITE))
		if Game.s.vehicles.is_empty():
			body.add_child(UI.label("Your garage is empty. Visit the Car Showroom.", 18, Color("c5d0ee")))
		for vid in Game.s.vehicles:
			body.add_child(UI.label("🚗 " + str(Data.items.get(vid, {}).get("name", vid)), 20, Color("e6ecff")))
	body.add_child(UI.holo_btn("Rest here (restore HP/EN, uses time)", _rest, UI.HOLO_BLUE, 70))


func _room_btn(r: String) -> Button:
	return UI.holo_btn(r.capitalize() + (" ●" if r == room else ""), _set_room.bind(r), UI.HOLO_GOLD if r == room else UI.HOLO_BLUE, 60)


func _set_room(r: String) -> void:
	room = r
	refresh()


func _place(id: String) -> void:
	if not Game.remove_item(id):
		return
	var all: Dictionary = Game.s.houses.furniture
	if not all.has(house_id()):
		all[house_id()] = {}
	if not all[house_id()].has(room):
		all[house_id()][room] = []
	all[house_id()][room].append(id)
	Game.notify("Placed %s." % Data.items.get(id, {}).get("name", id), "info")
	refresh()


func _store(id: String) -> void:
	var arr: Array = Game.s.houses.furniture.get(house_id(), {}).get(room, [])
	arr.erase(id)
	Game.add_item(id)
	refresh()


func _rest() -> void:
	Game.restore(-1 if comfort() >= 6 else Game.max_hp() / 2, -1 if comfort() >= 4 else Game.max_energy() * 2 / 3)
	Game.notify("You rest at home. (Comfort %d)" % comfort(), "info")
	Events.fire("rest_home")
	Game.advance_slot()
	refresh()


func _props() -> void:
	for id in Game.s.houses.owned:
		var hd: Dictionary = Data.houses.get(str(id), {})
		var p := UI.panel(Color(0.04, 0.06, 0.16, 0.85), 12, UI.HOLO_GOLD if id == house_id() else Color(1, 1, 1, 0.15), 2, 12)
		body.add_child(p)
		var v := UI.vbox(6)
		p.add_child(v)
		v.add_child(UI.label(str(hd.get("name", id)), 24, Color.WHITE))
		v.add_child(UI.label(str(hd.get("desc", "")), 18, Color("c5d0ee")))
		if id == house_id():
			v.add_child(UI.label("You live here.", 18, UI.HOLO_GOLD))
		else:
			v.add_child(UI.holo_btn("Move in", _move.bind(str(id)), UI.HOLO_GOLD, 60))
	body.add_child(UI.label("Buy more properties at the Nexa Realty office (Commercial District).", 18, Color("c5d0ee")))


func _move(id: String) -> void:
	Game.s.houses.current = id
	Game.notify("You moved into %s." % Data.houses.get(id, {}).get("name", id), "event")
	Events.fire("move_house")
	refresh()


func _pets() -> void:
	if Game.s.pets.is_empty():
		body.add_child(UI.label("No pets yet. Adopt one at the Pet Shop in the Commercial District.", 20, Color("e6ecff")))
		return
	for pet in Game.s.pets:
		var p := UI.panel(Color(0.04, 0.06, 0.16, 0.88), 12, UI.HOLO_PURPLE, 2, 12)
		body.add_child(p)
		var h := UI.hbox(12)
		p.add_child(h)
		var pv := PortraitView.new()
		pv.custom_minimum_size = Vector2(150, 150)
		pv.size_flags_horizontal = Control.SIZE_SHRINK_BEGIN
		pv.set_pet(str(pet.species), str(pet.get("color", "c08040")), str(pet.species_id))
		h.add_child(pv)
		var v := UI.vbox(4)
		h.add_child(v)
		v.add_child(UI.label("%s the %s" % [pet.name, Data.pets.get(str(pet.species_id), {}).get("name", pet.species)], 22, Color.WHITE))
		v.add_child(UI.label("Happiness", 16, Color("ffd36a")))
		v.add_child(UI.bar(int(pet.happiness), 100, Color("ffd36a"), 12))
		v.add_child(UI.label("Fullness", 16, Color("9affd0")))
		v.add_child(UI.bar(int(pet.hunger), 100, Color("3ddc97"), 12))
		v.add_child(UI.label("Bond with you: %d" % int(pet.bond), 16, Color("c9a8ff")))
		var mood := "Overjoyed!" if int(pet.happiness) > 80 else ("Content." if int(pet.happiness) > 50 else ("Lonely…" if int(pet.happiness) > 25 else "Very sad. Spend time together!"))
		v.add_child(UI.label(mood, 16, Color("e6ecff")))
		var row := UI.hbox(6)
		p.add_child(row)
		row.add_child(UI.btn("Feed", _feed.bind(pet), 56, 18))
		row.add_child(UI.btn("Play", _play.bind(pet), 56, 18))
		row.add_child(UI.btn("Walk", _walk.bind(pet), 56, 18))


func _feed(pet: Dictionary) -> void:
	if Game.has_item("pet_food"):
		Game.remove_item("pet_food")
	elif not Game.spend_coins(20, "pet food"):
		return
	pet.hunger = 100
	pet.happiness = min(100, int(pet.happiness) + 5)
	Game.notify("%s happily eats." % pet.name, "info")
	Events.fire("pet_care")
	refresh()


func _play(pet: Dictionary) -> void:
	pet.happiness = min(100, int(pet.happiness) + 15)
	pet.bond = min(100, int(pet.bond) + 3)
	Game.notify("You play with %s." % pet.name, "info")
	Events.fire("pet_care")
	refresh()


func _walk(pet: Dictionary) -> void:
	if Game.is_night():
		Game.notify("It's too late for a walk.", "warn")
		return
	pet.happiness = min(100, int(pet.happiness) + 25)
	pet.bond = min(100, int(pet.bond) + 5)
	Game.add_stat("stamina", 1, "walked " + str(pet.name))
	Game.notify("A lovely walk with %s." % pet.name, "info")
	Events.fire("pet_care")
	Game.advance_slot()
	refresh()
