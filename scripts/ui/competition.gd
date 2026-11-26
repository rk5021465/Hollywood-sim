extends Control
## Power competitions (Part 32): strength / speed / agility / energy control /
## special ability. Three rounds; each round you pick a strategy. Results come
## from your real stats, cards and choices against rival scores — Peter does
## not win automatically.
## args: {"id": competition id, "story": bool, "on_done": Callable(place)}

var main
var comp: Dictionary = {}
var comp_id := ""
var story := false
var on_done: Callable
var round_i := 0
var my_total := 0.0
var rival_totals: Dictionary = {}
var body: VBoxContainer
var log_v: VBoxContainer


func setup(args: Dictionary) -> void:
	comp_id = str(args.get("id", ""))
	comp = Data.competitions.get(comp_id, {})
	story = bool(args.get("story", false))
	on_done = args.get("on_done", Callable())
	var bgv := BackgroundView.new()
	UI.full(bgv)
	bgv.set_bg(str(comp.get("bg", "school_arena")))
	add_child(bgv)
	var shade := ColorRect.new()
	shade.color = Color(0, 0, 0, 0.45)
	UI.full(shade)
	add_child(shade)
	Audio.play_music("battle")
	var root := UI.vbox(12)
	add_child(UI.margin(root, 18))
	if not story:
		root.add_child(UI.header(str(comp.get("name", "Competition")), func(): main.pop(), UI.HOLO_GOLD))
	else:
		root.add_child(UI.label(str(comp.get("name", "Competition")), 34, UI.HOLO_GOLD))
	body = UI.vbox(12)
	root.add_child(UI.scroll(body))
	for r in comp.get("rivals", []):
		rival_totals[str(r.get("id", r.get("name", "?")))] = 0.0
	_intro()


func _intro() -> void:
	UI.clear(body)
	var p := UI.holo_panel(UI.HOLO_GOLD)
	body.add_child(p)
	var v := UI.vbox(8)
	p.add_child(v)
	v.add_child(UI.label(str(comp.get("desc", "")), 22, Color("e6ecff")))
	var parts: Array = []
	for st in comp.get("stats", {}).keys():
		parts.append("%s ×%.1f (yours: %d)" % [Game.STAT_NAMES.get(st, st), float(comp.stats[st]), Game.get_stat(st)])
	v.add_child(UI.label("Scored on: " + ", ".join(parts), 19, Color("b8c6e6")))
	v.add_child(UI.label("Rivals:", 20, UI.HOLO_GOLD))
	for r in comp.get("rivals", []):
		v.add_child(UI.label("• %s" % _rival_name(r), 19, Color("e6ecff")))
	var fee := int(comp.get("entry_fee", 0))
	var en := int(comp.get("energy", 25))
	var b := UI.holo_btn("Begin (−%d EN%s)" % [en, (", ◈%d" % fee) if fee > 0 else ""], _begin, UI.HOLO_GOLD, 80)
	body.add_child(b)


func _rival_name(r: Dictionary) -> String:
	var id := str(r.get("id", ""))
	return str(r.get("name", Data.char_name(id) if id != "" else "Rival"))


func _begin() -> void:
	var fee := int(comp.get("entry_fee", 0))
	if not story:
		if Game.energy_now() < int(comp.get("energy", 25)):
			Game.notify("Too tired to compete. Rest first.", "warn")
			return
		if fee > 0 and not Game.spend_coins(fee, "competition entry"):
			return
		Game.use_energy(int(comp.get("energy", 25)))
	_round()


func _base_score() -> float:
	var s := 0.0
	for st in comp.get("stats", {}).keys():
		s += Game.get_stat(st) * float(comp.stats[st])
	return s


func _round() -> void:
	UI.clear(body)
	var rounds := int(comp.get("rounds", 3))
	body.add_child(UI.label("Round %d / %d" % [round_i + 1, rounds], 30, UI.HOLO_GOLD))
	body.add_child(UI.label("Choose your approach:", 22, Color("e6ecff")))
	body.add_child(UI.holo_btn("All-out push (high risk, high reward)", _play.bind("allout"), Color("e9406c"), 76))
	body.add_child(UI.holo_btn("Steady pace (reliable)", _play.bind("steady"), UI.HOLO_BLUE, 76))
	body.add_child(UI.holo_btn("Use your head (Intelligence %d)" % Game.get_stat("intelligence"), _play.bind("smart"), UI.HOLO_PURPLE, 76))
	var card_id := _best_card()
	if card_id != "":
		body.add_child(UI.holo_btn("Use card: " + str(Data.card(card_id).get("name", "")), _play.bind("card"), UI.HOLO_GOLD, 76))
	log_v = UI.vbox(6)
	body.add_child(log_v)
	_show_standings()


func _best_card() -> String:
	var best := ""
	var best_r := -1
	for id in Cards.owned().keys():
		var d := Data.card(id)
		if comp.get("stats", {}).keys().any(func(st): return d.get("passive", {}).has(st)) or str(d.get("category", "")) in comp.get("card_categories", []):
			var r := Data.rarity_index(str(d.get("rarity", "")))
			if r > best_r:
				best_r = r
				best = id
	return best


func _play(strategy: String) -> void:
	var base := _base_score()
	var mult := 1.0
	var note := ""
	match strategy:
		"allout":
			if randf() < 0.3:
				mult = 0.6
				note = "You pushed too hard and stumbled!"
			else:
				mult = 1.3
				note = "An explosive effort!"
		"steady":
			mult = randf_range(0.97, 1.05)
			note = "Consistent and controlled."
		"smart":
			base += Game.get_stat("intelligence") * 0.5
			mult = randf_range(0.92, 1.05)
			note = "You read the course and the rivals carefully."
		"card":
			var cid := _best_card()
			mult = 1.15 + Cards.level(cid) * 0.04 + Data.rarity_index(str(Data.card(cid).get("rarity", ""))) * 0.05
			note = "%s activates!" % Data.card(cid).get("name", "")
			Cards.add_card_exp(cid, 10)
	var my := base * mult * randf_range(0.92, 1.08)
	my_total += my
	for r in comp.get("rivals", []):
		var key := str(r.get("id", r.get("name", "?")))
		rival_totals[key] = float(rival_totals.get(key, 0.0)) + float(r.get("score", 20)) * randf_range(0.9, 1.1)
	round_i += 1
	Game.notify(note, "event")
	if round_i >= int(comp.get("rounds", 3)):
		_results()
	else:
		_round()


func _standings() -> Array:
	var rows: Array = [["You", my_total]]
	for r in comp.get("rivals", []):
		var key := str(r.get("id", r.get("name", "?")))
		rows.append([_rival_name(r), float(rival_totals.get(key, 0.0))])
	rows.sort_custom(func(a, b): return float(a[1]) > float(b[1]))
	return rows


func _show_standings() -> void:
	if round_i == 0:
		return
	var p := UI.holo_panel(UI.HOLO_BLUE)
	body.add_child(p)
	var v := UI.vbox(4)
	p.add_child(v)
	v.add_child(UI.label("Current standings", 20, UI.HOLO_BLUE))
	var i := 1
	for row in _standings():
		v.add_child(UI.label("%d. %s — %d" % [i, row[0], int(row[1])], 19, UI.HOLO_GOLD if row[0] == "You" else Color("e6ecff")))
		i += 1


func _results() -> void:
	UI.clear(body)
	var rows := _standings()
	var place := 1
	for i in rows.size():
		if rows[i][0] == "You":
			place = i + 1
	Game.s.stats_counters.competitions = int(Game.s.stats_counters.competitions) + 1
	Audio.play_sfx("win" if place <= 3 else "lose")
	body.add_child(UI.label("RESULTS", 38, UI.HOLO_GOLD))
	var i := 1
	for row in rows:
		body.add_child(UI.label("%d. %s — %d pts" % [i, row[0], int(row[1])], 24, UI.HOLO_GOLD if row[0] == "You" else Color("e6ecff")))
		i += 1
	body.add_child(UI.label("You placed #%d of %d." % [place, rows.size()], 26, Color.WHITE))
	var rewards: Dictionary = comp.get("rewards_by_place", {}).get(str(place), comp.get("participation", {}))
	if not rewards.is_empty():
		Game.grant_rewards(rewards, str(comp.get("name", "competition")))
		body.add_child(UI.label("Rewards: " + Quests.reward_text(rewards), 20, UI.HOLO_GOLD))
	Game.add_rep("school", max(0, 4 - place))
	Events.fire("competition_done")
	Events.fire("competition:" + comp_id)
	if place == 1:
		Events.fire("competition_win")
		Game.add_news(str(comp.get("news_win", "")))
	if not story:
		Game.advance_slot()
	body.add_child(UI.holo_btn("Continue", _done.bind(place), UI.HOLO_GOLD, 80))


func _done(place: int) -> void:
	main.pop()
	if on_done.is_valid():
		on_done.call(place)


func on_back() -> bool:
	return round_i > 0   # can't leave mid-competition
