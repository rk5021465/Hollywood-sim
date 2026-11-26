extends Control
## Turn-based, menu-driven combat (Part 32). Results depend on real stats,
## equipped card skills, cooldowns, energy, defence, evasion and choices.
## args: {"enemy": id, "story": bool, "allies": [char ids], "on_done": Callable(won)}

var main
var enemy: Dictionary = {}
var enemy_id := ""
var story := false
var allies: Array = []
var on_done: Callable

var p_hp := 0
var p_max := 0
var p_en := 0
var p_en_max := 0
var e_hp := 0
var e_max := 0
var cooldowns: Dictionary = {}
var shadow_cd := 0
var guard := false
var reflect := 0.0
var evade_next := false
var buff_turns := 0
var enemy_stunned := false
var used_cards: Dictionary = {}
var over := false
var turn := 1

var enemy_view: PortraitView
var e_bar: ProgressBar
var e_label: Label
var p_bar: ProgressBar
var en_bar: ProgressBar
var p_label: Label
var log_label: RichTextLabel
var actions: GridContainer
var fx: Control
var log_lines: Array = []


func setup(args: Dictionary) -> void:
	enemy_id = str(args.get("enemy", ""))
	enemy = Data.enemies.get(enemy_id, {"name": "Unknown", "hp": 50, "atk": 8, "def": 2, "spd": 5, "agi": 5})
	story = bool(args.get("story", false))
	allies = args.get("allies", [])
	on_done = args.get("on_done", Callable())
	p_max = Game.max_hp()
	p_hp = max(1, Game.hp())
	if story:
		p_hp = p_max   # story battles start at full strength
	p_en_max = Game.max_energy()
	p_en = Game.energy_now()
	e_max = int(enemy.get("hp", 50))
	e_hp = e_max
	Audio.play_music(str(enemy.get("music", "battle")))
	_build()
	_log("[b]%s[/b] — %s" % [enemy.get("name", ""), enemy.get("desc", "Battle start!")])
	if _p_spd() < int(enemy.get("spd", 5)) and not story:
		_log("%s is faster and strikes first!" % enemy.get("name", ""))
		_enemy_turn()
	_refresh()


func _build() -> void:
	var bgv := BackgroundView.new()
	UI.full(bgv)
	bgv.set_bg(str(enemy.get("bg", "battle_arena")))
	add_child(bgv)
	var shade := ColorRect.new()
	shade.color = Color(0, 0, 0, 0.35)
	UI.full(shade)
	add_child(shade)
	var root := UI.vbox(10)
	add_child(UI.margin(root, 16))
	var ep := UI.panel(Color(0.08, 0.02, 0.06, 0.85), 12, Color("e9406c"), 2, 12)
	root.add_child(ep)
	var ev := UI.vbox(6)
	ep.add_child(ev)
	e_label = UI.label("", 24, Color("ffb3c1"))
	ev.add_child(e_label)
	e_bar = UI.bar(e_hp, e_max, Color("e9406c"), 18)
	ev.add_child(e_bar)
	var stage := Control.new()
	stage.custom_minimum_size = Vector2(0, 380)
	stage.size_flags_vertical = Control.SIZE_EXPAND_FILL
	root.add_child(stage)
	enemy_view = PortraitView.new()
	UI.full(enemy_view)
	var pid := str(enemy.get("portrait", ""))
	if pid != "" and Data.characters.has(pid):
		enemy_view.set_char(pid, "angry")
	else:
		enemy_view.set_custom({"style": str(enemy.get("style", "human")), "color": str(enemy.get("color", "553344")), "outfit": str(enemy.get("color", "553344")), "hair_style": 4, "aura": str(enemy.get("aura", ""))}, "characters/npcs", enemy_id)
		enemy_view.expr = "angry"
	stage.add_child(enemy_view)
	fx = UI.full(Control.new())
	fx.mouse_filter = Control.MOUSE_FILTER_IGNORE
	stage.add_child(fx)
	var lp := UI.panel(Color(0.02, 0.04, 0.12, 0.85), 12, Color(1, 1, 1, 0.15), 1, 10)
	lp.custom_minimum_size = Vector2(0, 150)
	root.add_child(lp)
	log_label = RichTextLabel.new()
	log_label.bbcode_enabled = true
	log_label.scroll_following = true
	log_label.add_theme_font_size_override("normal_font_size", Settings.font_size(19))
	log_label.add_theme_font_size_override("bold_font_size", Settings.font_size(19))
	log_label.add_theme_color_override("default_color", Color("e6ecff"))
	lp.add_child(log_label)
	var pp := UI.panel(Color(0.02, 0.06, 0.16, 0.9), 12, UI.HOLO_BLUE, 2, 12)
	root.add_child(pp)
	var pv := UI.vbox(6)
	pp.add_child(pv)
	p_label = UI.label("", 22, UI.HOLO_GOLD)
	pv.add_child(p_label)
	var r := UI.hbox()
	pv.add_child(r)
	r.add_child(UI.label("HP", 16, Color("ff9aa8"), false))
	p_bar = UI.bar(p_hp, p_max, Color("e9406c"), 14)
	r.add_child(p_bar)
	r.add_child(UI.label("EN", 16, Color("9affd0"), false))
	en_bar = UI.bar(p_en, p_en_max, Color("3ddc97"), 14)
	r.add_child(en_bar)
	actions = UI.grid(2)
	root.add_child(actions)


func _p_atk() -> float:
	var a := 4.0 + Game.get_stat("strength") * 1.5 + int(Game.s.level)
	if buff_turns > 0:
		a *= 1.4
	return a


func _p_def() -> float:
	return Game.get_stat("durability") * 0.6


func _p_spd() -> int:
	return Game.get_stat("speed")


func _refresh() -> void:
	e_label.text = "%s   HP %d / %d%s" % [enemy.get("name", ""), max(0, e_hp), e_max, "  [STUNNED]" if enemy_stunned else ""]
	e_bar.value = max(0, e_hp)
	p_label.text = "%s   HP %d/%d   EN %d/%d   Turn %d" % [Game.player_name(), max(0, p_hp), p_max, p_en, p_en_max, turn]
	p_bar.value = max(0, p_hp)
	en_bar.value = p_en
	UI.clear(actions)
	if over:
		return
	actions.add_child(_abtn("Attack", _attack, Color("ffb21f")))
	actions.add_child(_abtn("Defend (+EN)", _defend, UI.HOLO_BLUE))
	for id in Game.s.loadout:
		var a: Dictionary = Data.card(id).get("active", {})
		var cd := int(cooldowns.get(id, 0))
		var en := int(a.get("energy", 0))
		var t := "%s\nEN %d%s" % [a.get("name", id), en, ("  CD %d" % cd) if cd > 0 else ""]
		var b := _abtn(t, _skill.bind(id), Data.RARITY_COLORS.get(str(Data.card(id).get("rarity", "common")), Color.WHITE))
		b.disabled = cd > 0 or p_en < en
		actions.add_child(b)
	if Game.s.formation.size() > 0 and Cards.owns("arise"):
		var sb := _abtn("Summon Shadows" + (" (CD %d)" % shadow_cd if shadow_cd > 0 else ""), _shadows, UI.HOLO_PURPLE)
		sb.disabled = shadow_cd > 0
		actions.add_child(sb)
	var pots := 0
	for id in Game.s.inventory.keys():
		if str(Data.items.get(id, {}).get("cat", "")) == "consumable" and Data.items[id].get("use", {}).has("hp"):
			pots += int(Game.s.inventory[id])
	if pots > 0:
		actions.add_child(_abtn("Use Potion (%d)" % pots, _potion, Color("3ddc97")))
	if not story:
		actions.add_child(_abtn("Flee", _flee, Color("8899aa")))


func _abtn(t: String, cb: Callable, col: Color) -> Button:
	var b := UI.holo_btn(t, cb, col, 80)
	b.add_theme_font_size_override("font_size", Settings.font_size(19))
	return b


func _log(t: String) -> void:
	log_lines.append(t)
	if log_lines.size() > 40:
		log_lines.pop_front()
	log_label.text = "\n".join(log_lines)


func _float(text: String, col: Color, on_enemy: bool) -> void:
	var l := UI.label(text, 44, col, false)
	l.add_theme_color_override("font_outline_color", Color.BLACK)
	l.add_theme_constant_override("outline_size", 8)
	l.position = Vector2(fx.size.x * (0.45 if on_enemy else 0.2) + randf_range(-40, 40), fx.size.y * (0.3 if on_enemy else 0.75))
	fx.add_child(l)
	var tw := create_tween()
	tw.tween_property(l, "position:y", l.position.y - 90, Settings.anim(0.8))
	tw.parallel().tween_property(l, "modulate:a", 0.0, Settings.anim(0.8))
	tw.tween_callback(l.queue_free)
	if on_enemy and not bool(Settings.get_v("reduce_motion")):
		var t2 := create_tween()
		t2.tween_property(enemy_view, "position:x", 12.0, 0.05)
		t2.tween_property(enemy_view, "position:x", -12.0, 0.05)
		t2.tween_property(enemy_view, "position:x", 0.0, 0.05)


func _damage_enemy(raw: float, pierce: bool = false) -> int:
	var defense := 0.0 if pierce else float(enemy.get("def", 2))
	var evade := clampf((float(enemy.get("agi", 5)) - Game.get_stat("agility")) * 0.01 + 0.04, 0.0, 0.35)
	if randf() < evade:
		_log("%s dodged!" % enemy.get("name", ""))
		_float("MISS", Color.WHITE, true)
		return 0
	var crit := randf() < clampf(0.05 + Game.get_stat("agility") * 0.002, 0.05, 0.35)
	var dmg := int(max(1.0, raw * randf_range(0.9, 1.1) - defense) * (1.6 if crit else 1.0))
	e_hp -= dmg
	Audio.play_sfx("hit")
	_float(("CRIT " if crit else "") + str(dmg), Color("ffd36a") if crit else Color.WHITE, true)
	return dmg


# ---------------------------------------------------------------- player actions
func _attack() -> void:
	var d := _damage_enemy(_p_atk())
	if d > 0:
		_log("You strike for [b]%d[/b] damage." % d)
	_end_player_turn()


func _defend() -> void:
	guard = true
	p_en = min(p_en_max, p_en + 12)
	_log("You brace yourself and recover energy.")
	_end_player_turn()


func _skill(id: String) -> void:
	var a: Dictionary = Data.card(id).get("active", {})
	var en := int(a.get("energy", 0))
	if p_en < en:
		return
	p_en -= en
	cooldowns[id] = int(a.get("cooldown", 0)) + 1
	used_cards[id] = int(used_cards.get(id, 0)) + 1
	var lv := Cards.level(id)
	var power := float(a.get("power", 1.0)) + lv * 0.1
	var eff := str(a.get("effect", "none"))
	var val := float(a.get("value", 0.3))
	var sk_name := str(a.get("name", id))
	match eff:
		"heal":
			var h := int(p_max * (val + lv * 0.02))
			p_hp = min(p_max, p_hp + h)
			_float("+%d" % h, Color("3ddc97"), false)
			_log("%s restores %d HP." % [sk_name, h])
		"buff":
			buff_turns = 3
			_log("%s! Your attacks grow stronger." % sk_name)
		"evade":
			evade_next = true
			var d0 := _damage_enemy(_p_atk() * power)
			_log("%s — you read the flow of battle (%d dmg). You will evade the next attack." % [sk_name, d0])
		"reflect":
			reflect = val + lv * 0.03
			_log("%s — the next hit will be reflected." % sk_name)
		"multi":
			var total := 0
			for i in 3:
				total += _damage_enemy(_p_atk() * power * 0.5)
			_log("%s hits repeatedly for %d total." % [sk_name, total])
		"drain":
			var d1 := _damage_enemy(_p_atk() * power)
			var heal := int(d1 * val)
			p_hp = min(p_max, p_hp + heal)
			p_en = min(p_en_max, p_en + 8)
			_log("%s deals %d and drains %d HP." % [sk_name, d1, heal])
		"stun":
			var d2 := _damage_enemy(_p_atk() * power)
			if d2 > 0 and randf() < val + 0.3:
				enemy_stunned = true
			_log("%s deals %d%s" % [sk_name, d2, " and stuns!" if enemy_stunned else "."])
		"pierce":
			var d3 := _damage_enemy(_p_atk() * power, true)
			_log("%s pierces defences for %d." % [sk_name, d3])
		"summon":
			_shadows()
			return
		_:
			var d4 := _damage_enemy(_p_atk() * power)
			_log("%s deals [b]%d[/b] damage." % [sk_name, d4])
	_end_player_turn()


func _shadows() -> void:
	var total := 0
	for sid in Game.s.formation:
		total += Game.shadow_power(sid)
	shadow_cd = 3
	var d := _damage_enemy(total * 1.2, true)
	_log("[color=#c9a8ff]Your shadows rise and strike for %d![/color]" % d)
	_end_player_turn()


func _potion() -> void:
	for id in Game.s.inventory.keys():
		var it: Dictionary = Data.items.get(id, {})
		if str(it.get("cat", "")) == "consumable" and it.get("use", {}).has("hp"):
			Game.remove_item(id)
			var h := int(it.use.hp)
			p_hp = min(p_max, p_hp + h)
			p_en = min(p_en_max, p_en + int(it.use.get("energy", 0)))
			_log("You used %s (+%d HP)." % [it.get("name", id), h])
			_float("+%d" % h, Color("3ddc97"), false)
			break
	_end_player_turn()


func _flee() -> void:
	if randf() < 0.5 + (_p_spd() - int(enemy.get("spd", 5))) * 0.03:
		_log("You escaped!")
		_finish(false, true)
	else:
		_log("You couldn't get away!")
		_end_player_turn()


# ---------------------------------------------------------------- turn flow
func _end_player_turn() -> void:
	for ally in allies:
		if e_hp > 0:
			var ad := 6 + int(Game.rel_get(str(ally), "friendship") / 10)
			e_hp -= ad
			_log("%s helps out for %d damage!" % [Data.char_name(str(ally)), ad])
	if e_hp <= 0:
		_finish(true)
		return
	_refresh()
	actions.visible = false
	await get_tree().create_timer(Settings.anim(0.6)).timeout
	if not is_inside_tree() or over:
		return
	_enemy_turn()
	actions.visible = true
	turn += 1
	for k in cooldowns.keys():
		cooldowns[k] = max(0, int(cooldowns[k]) - 1)
	shadow_cd = max(0, shadow_cd - 1)
	buff_turns = max(0, buff_turns - 1)
	if p_hp <= 0:
		_finish(false)
		return
	_refresh()


func _enemy_turn() -> void:
	if enemy_stunned:
		enemy_stunned = false
		_log("%s is stunned and can't move!" % enemy.get("name", ""))
		return
	var atk := float(enemy.get("atk", 8))
	var move := "attack"
	var mult := 1.0
	for s in enemy.get("skills", []):
		if randf() < float(s.get("chance", 0.25)):
			move = str(s.get("name", "Special"))
			mult = float(s.get("power", 1.5))
			break
	if evade_next:
		evade_next = false
		_log("You evade %s's %s effortlessly." % [enemy.get("name", ""), move])
		_float("EVADE", Color("a8ecff"), false)
		return
	var evade := clampf((Game.get_stat("agility") - float(enemy.get("agi", 5))) * 0.012 + 0.05, 0.02, 0.45)
	if randf() < evade:
		_log("You dodge %s's %s!" % [enemy.get("name", ""), move])
		_float("DODGE", Color.WHITE, false)
		return
	var dmg := int(max(1.0, atk * mult * randf_range(0.9, 1.1) - _p_def()))
	if guard:
		dmg = int(dmg * 0.45)
		guard = false
	if reflect > 0.0:
		var back := int(dmg * reflect)
		e_hp -= back
		_log("Reflected %d damage!" % back)
		reflect = 0.0
	p_hp -= dmg
	Audio.play_sfx("hit")
	_float("-%d" % dmg, Color("ff6b81"), false)
	_log("%s uses %s: [color=#ff8fa3]%d damage[/color]." % [enemy.get("name", ""), move, dmg])
	if e_hp <= 0:
		_finish(true)


func _finish(won: bool, fled: bool = false) -> void:
	if over:
		return
	over = true
	_refresh()
	Game.s.hp = max(1, p_hp) if not story else -1
	Game.s.energy_now = p_en
	for id in used_cards.keys():
		Cards.add_card_exp(id, 8 * int(used_cards[id]))
	var m := UI.modal(self, "VICTORY" if won else ("ESCAPED" if fled else "DEFEAT"), 600)
	if won:
		Audio.play_sfx("win")
		var exp_r := int(enemy.get("exp", 20))
		var coins := int(enemy.get("coins", 10))
		Game.s.stats_counters.battles_won = int(Game.s.stats_counters.battles_won) + 1
		Game.add_rep("combat", int(enemy.get("rep", 1)))
		if Game.has_flag("system_active"):
			Game.add_exp(exp_r, "defeated " + str(enemy.get("name", "")))
		if coins > 0:
			Game.add_coins(coins, "battle reward")
		if bool(Game.s.ring.get("unlocked", false)):
			Game.s.ring.mastery = min(100, int(Game.s.ring.mastery) + 3)
		m.body.add_child(UI.label("You defeated %s!\n+%d EXP  +%d Coins" % [enemy.get("name", ""), exp_r, coins], 22))
		Events.fire("win:" + enemy_id)
		Events.fire("win_battle")
		var sh := str(enemy.get("shadow", ""))
		if sh != "" and Cards.owns("arise") and not Game.s.shadows.has(sh):
			var shade: ColorRect = m.shade
			var cb := func():
				shade.queue_free()
				Game.add_shadow(sh)
				_done(won)
			m.body.add_child(UI.holo_btn("ARISE — extract shadow", cb, UI.HOLO_PURPLE, 72))
	else:
		Audio.play_sfx("lose")
		if story:
			m.body.add_child(UI.label("You were overwhelmed…", 22))
		elif not fled:
			m.body.add_child(UI.label("You lost. Rest and train before trying again.", 22))
		Events.fire("lose:" + enemy_id)
	m.body.add_child(UI.btn("Continue", func(): _done(won), 70))
	# The modal's own Close button also continues.
	var close_btn: Button = m.body.get_parent().get_child(m.body.get_parent().get_child_count() - 1)
	close_btn.visible = false


func _done(won: bool) -> void:
	main.pop()
	if on_done.is_valid():
		on_done.call(won)


func on_back() -> bool:
	return true   # no backing out of a battle; use Flee
