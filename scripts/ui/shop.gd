extends Control
## Shops (Part 16): clothes, costumes, pets, furniture, electronics, grocery,
## garage, car showroom, real estate. Everything is bought with Nexa Coins.
## args: {"shop": shop id}

var main
var shop: Dictionary = {}
var shop_id := ""
var list: VBoxContainer
var coins_l: Label


func setup(args: Dictionary) -> void:
	shop_id = str(args.get("shop", ""))
	shop = Data.shops.get(shop_id, {"name": "Shop", "items": []})
	var bgv := BackgroundView.new()
	UI.full(bgv)
	bgv.set_bg(str(shop.get("bg", "city_mall")))
	add_child(bgv)
	var shade := ColorRect.new()
	shade.color = Color(0, 0, 0, 0.5)
	UI.full(shade)
	add_child(shade)
	var root := UI.vbox(10)
	add_child(UI.margin(root, 16))
	root.add_child(UI.header(str(shop.get("name", "Shop")), func(): main.pop(), Color.WHITE))
	coins_l = UI.label("", 22, Color("ffd36a"))
	root.add_child(coins_l)
	if shop.has("desc"):
		root.add_child(UI.label(str(shop.desc), 19, Color("c5d0ee")))
	list = UI.vbox(10)
	root.add_child(UI.scroll(list))
	refresh()


func refresh() -> void:
	coins_l.text = "Balance: ◈ %d Nexa Coins" % int(Game.s.coins)
	UI.clear(list)
	var kind := str(shop.get("type", "items"))
	for id in shop.get("items", []):
		match kind:
			"pets": _pet_row(str(id))
			"houses": _house_row(str(id))
			_: _item_row(str(id))


func _row_panel() -> HBoxContainer:
	var p := UI.panel(Color(0.05, 0.07, 0.16, 0.9), 14, Color(1, 1, 1, 0.15), 1, 12)
	list.add_child(p)
	var h := UI.hbox(12)
	p.add_child(h)
	return h


func _thumb(folder: String, id: String, fallback_color: Color) -> Control:
	var tex := Assets.image(folder, id)
	if tex:
		var tr := TextureRect.new()
		tr.texture = tex
		tr.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		tr.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		tr.custom_minimum_size = Vector2(110, 110)
		return tr
	var c := ColorRect.new()
	c.color = fallback_color
	c.custom_minimum_size = Vector2(110, 110)
	return c


func _buy_btn(price: int, cb: Callable, owned: bool = false) -> Button:
	var b := UI.holo_btn("Owned" if owned else "◈ %d" % price, cb, UI.HOLO_GOLD, 64)
	b.custom_minimum_size = Vector2(150, 64)
	b.size_flags_horizontal = Control.SIZE_SHRINK_END
	b.disabled = owned
	return b


func _item_row(id: String) -> void:
	var it: Dictionary = Data.items.get(id, {})
	if it.is_empty() or not Game.check_cond(it.get("if", {})):
		return
	var h := _row_panel()
	var cat := str(it.get("cat", ""))
	var folder: String = {"vehicles": "vehicles", "costume": "costumes", "furniture": "houses"}.get(cat, "shops")
	h.add_child(_thumb(folder, id, Color(str(it.get("color", "445577")))))
	var v := UI.vbox(4)
	h.add_child(v)
	v.add_child(UI.label(str(it.get("name", id)), 22, Color.WHITE))
	var extra := ""
	for st in it.get("stats", {}).keys():
		extra += "  +%d %s" % [int(it.stats[st]), Game.STAT_NAMES.get(st, st)]
	v.add_child(UI.label(str(it.get("desc", "")) + extra, 17, Color("b8c6e6")))
	var owned := (cat == "vehicles" and id in Game.s.vehicles) or (bool(it.get("unique", false)) and Game.has_item(id))
	h.add_child(_buy_btn(int(it.get("price", 0)), _buy_item.bind(id), owned))


func _buy_item(id: String) -> void:
	var it: Dictionary = Data.items.get(id, {})
	if not Game.spend_coins(int(it.get("price", 0)), "bought " + str(it.get("name", id))):
		return
	if str(it.get("cat", "")) == "vehicles":
		Game.s.vehicles.append(id)
	else:
		Game.add_item(id)
	Audio.play_sfx("quest")
	Game.notify("Purchased %s!" % it.get("name", id), "info")
	Events.fire("buy:" + id)
	Events.fire("purchase")
	Game.check_achievements()
	refresh()


func _pet_row(id: String) -> void:
	var pd: Dictionary = Data.pets.get(id, {})
	if pd.is_empty() or not Game.check_cond(pd.get("if", {})):
		return
	var h := _row_panel()
	var pv := PortraitView.new()
	pv.custom_minimum_size = Vector2(120, 120)
	pv.size_flags_horizontal = Control.SIZE_SHRINK_BEGIN
	pv.set_pet(str(pd.get("species", "cat")), str(pd.get("color", "c08040")), id)
	h.add_child(pv)
	var v := UI.vbox(4)
	h.add_child(v)
	v.add_child(UI.label(str(pd.get("name", id)), 22, Color.WHITE))
	v.add_child(UI.label(str(pd.get("desc", "")), 17, Color("b8c6e6")))
	h.add_child(_buy_btn(int(pd.get("price", 0)), _adopt.bind(id)))


func _adopt(id: String) -> void:
	var pd: Dictionary = Data.pets.get(id, {})
	if int(Game.s.coins) < int(pd.get("price", 0)):
		Game.notify("Not enough Nexa Coins.", "warn")
		return
	var m := UI.modal(self, "Name your new %s" % pd.get("name", "pet"), 600)
	var le := LineEdit.new()
	le.placeholder_text = "Pet name"
	le.max_length = 16
	le.custom_minimum_size = Vector2(0, 64)
	le.add_theme_font_size_override("font_size", Settings.font_size(24))
	m.body.add_child(le)
	var shade: ColorRect = m.shade
	var cb := func():
		var pet_name := le.text.strip_edges()
		if pet_name == "":
			pet_name = str(pd.get("default_name", "Buddy"))
		if not Game.spend_coins(int(pd.get("price", 0)), "adopted " + pet_name):
			return
		Game.s.pets.append({"uid": "%s_%d" % [id, Time.get_ticks_msec()], "species_id": id, "species": str(pd.get("species", "cat")),
			"color": str(pd.get("color", "c08040")), "name": pet_name, "hunger": 80, "happiness": 80, "bond": 0})
		Game.notify("%s joined your family!" % pet_name, "event")
		Game.set_flag("has_pet")
		Events.fire("adopt_pet")
		Game.check_achievements()
		shade.queue_free()
		refresh()
	m.body.add_child(UI.holo_btn("Adopt", cb, UI.HOLO_GOLD, 70))


func _house_row(id: String) -> void:
	var hd: Dictionary = Data.houses.get(id, {})
	if hd.is_empty() or not bool(hd.get("for_sale", true)):
		return
	var h := _row_panel()
	h.add_child(_thumb("houses", id, Color(str(hd.get("color", "556677")))))
	var v := UI.vbox(4)
	h.add_child(v)
	v.add_child(UI.label(str(hd.get("name", id)), 22, Color.WHITE))
	v.add_child(UI.label("%s • %d rooms • Comfort %d" % [hd.get("type", ""), (hd.get("rooms", []) as Array).size(), int(hd.get("comfort", 1))], 17, Color("b8c6e6")))
	v.add_child(UI.label(str(hd.get("desc", "")), 17, Color("b8c6e6")))
	var owned: bool = id in Game.s.houses.owned
	h.add_child(_buy_btn(int(hd.get("price", 0)), _buy_house.bind(id), owned))


func _buy_house(id: String) -> void:
	var hd: Dictionary = Data.houses.get(id, {})
	if not Game.check_cond(hd.get("if", {})):
		Game.notify(str(hd.get("locked_text", "You can't buy this yet.")), "warn")
		return
	if not Game.spend_coins(int(hd.get("price", 0)), "bought property: " + str(hd.get("name", id))):
		return
	Game.s.houses.owned.append(id)
	Game.notify("You now own %s! Move in from My Home." % hd.get("name", id), "event")
	Game.add_news("player_bought_property", false)
	Events.fire("buy_house")
	Game.check_achievements()
	refresh()
