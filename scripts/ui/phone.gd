extends Control
## In-game smartphone (Part 13): Messages, Contacts, Calls, PulseNet social,
## Daily News, Maps, Banking, Calendar, Jobs, Gallery, Settings, Notifications.
## Everything reads from and writes to the live game state.
## args: {"app": optional app id to open directly}

var main
var app := ""
var screen: VBoxContainer
var title_l: Label
var thread_npc := ""

const APPS := [
	["messages", "Messages", "3ddc97"], ["contacts", "Contacts", "3fa9ff"], ["calls", "Calls", "2fbf71"],
	["social", "PulseNet", "e9406c"], ["news", "Daily News", "ffb21f"], ["maps", "Maps", "4cc3ff"],
	["bank", "Banking", "f5c542"], ["calendar", "Calendar", "ff7ab8"], ["jobs", "Jobs", "8a7aff"],
	["gallery", "Gallery", "c08040"], ["settings", "Settings", "8899aa"], ["notifications", "Alerts", "9b5cff"],
]


func setup(args: Dictionary) -> void:
	Audio.ui("click")
	var shade := ColorRect.new()
	shade.color = Color(0, 0, 0, 0.7)
	UI.full(shade)
	add_child(shade)
	var frame := PanelContainer.new()
	frame.anchor_left = 0.04
	frame.anchor_right = 0.96
	frame.anchor_top = 0.02
	frame.anchor_bottom = 0.98
	frame.add_theme_stylebox_override("panel", UI.box(Color("0c0f1c"), 48, Color("2a3150"), 6, 22))
	add_child(frame)
	var v := UI.vbox(10)
	frame.add_child(v)
	var status := UI.hbox()
	v.add_child(status)
	status.add_child(UI.label("%s • %s" % [Game.slot_name(), Game.date_string()], 17, Color("aab6d6")))
	var bat := UI.label("▮▮▮ 92%", 17, Color("aab6d6"))
	bat.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	status.add_child(bat)
	var top := UI.hbox()
	v.add_child(top)
	var back := UI.btn("‹", _back_btn, 60, 30)
	back.custom_minimum_size = Vector2(80, 60)
	back.size_flags_horizontal = Control.SIZE_SHRINK_BEGIN
	top.add_child(back)
	title_l = UI.label("Phone", 30, Color.WHITE)
	title_l.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	top.add_child(title_l)
	var close := UI.btn("✕", func(): main.pop(), 60, 26)
	close.custom_minimum_size = Vector2(80, 60)
	close.size_flags_horizontal = Control.SIZE_SHRINK_END
	top.add_child(close)
	screen = UI.vbox(10)
	v.add_child(UI.scroll(screen))
	open_app(str(args.get("app", "")))


func refresh() -> void:
	open_app(app)


func _back_btn() -> void:
	if not on_back():
		main.pop()


func on_back() -> bool:
	if app == "thread":
		open_app("messages")
		return true
	if app != "":
		open_app("")
		return true
	return false


func open_app(a: String) -> void:
	app = a
	UI.clear(screen)
	match a:
		"": _home()
		"messages": _messages()
		"thread": _thread()
		"contacts": _contacts()
		"calls": _calls()
		"social": _social()
		"news": _news()
		"maps":
			main.pop()
			main.push("map")
		"bank": _bank()
		"calendar": _calendar()
		"jobs": _jobs()
		"gallery": _gallery()
		"settings":
			main.push("settings")
			app = ""
			_home()
		"notifications": _notifs()


func _t(t: String, size: int = 21, c: Color = Color("e6ecff")) -> Label:
	return UI.label(t, size, c)


func _card(c: Color = Color("161b30")) -> VBoxContainer:
	var p := UI.panel(c, 16, Color(1, 1, 1, 0.08), 1, 14)
	screen.add_child(p)
	var v := UI.vbox(6)
	p.add_child(v)
	return v


# ---------------------------------------------------------------- home
func _home() -> void:
	title_l.text = "Phone"
	var g := UI.grid(3)
	screen.add_child(g)
	for a in APPS:
		var col := Color(str(a[2]))
		var label_t := str(a[1])
		var badge := _badge(str(a[0]))
		if badge > 0:
			label_t += " (%d)" % badge
		var b := UI.btn(label_t, open_app.bind(str(a[0])), 130, 19)
		b.add_theme_stylebox_override("normal", UI.box(col.darkened(0.45), 26, col, 2, 8))
		b.add_theme_stylebox_override("hover", UI.box(col.darkened(0.3), 26, col, 2, 8))
		b.add_theme_stylebox_override("pressed", UI.box(col.darkened(0.1), 26, col, 2, 8))
		b.add_theme_color_override("font_color", Color.WHITE)
		g.add_child(b)


func _badge(a: String) -> int:
	match a:
		"messages":
			var n := 0
			for k in Game.s.unread.keys():
				n += int(Game.s.unread[k])
			return n
		"calls":
			return Game.s.pending_calls.size()
	return 0


# ---------------------------------------------------------------- messages
func _messages() -> void:
	title_l.text = "Messages"
	if Game.s.messages.is_empty():
		screen.add_child(_t("No messages yet.", 20, Color("8fa0c8")))
	for npc in Game.s.messages.keys():
		var msgs: Array = Game.s.messages[npc]
		if msgs.is_empty():
			continue
		var last: Dictionary = msgs.back()
		var unread := int(Game.s.unread.get(npc, 0))
		var b := UI.btn("%s%s\n%s" % [Data.char_name(npc), ("  ●%d" % unread) if unread > 0 else "", str(last.t).left(60)], _open_thread.bind(str(npc)), 96, 19)
		b.alignment = HORIZONTAL_ALIGNMENT_LEFT
		screen.add_child(b)


func _open_thread(npc: String) -> void:
	thread_npc = npc
	Game.s.unread.erase(npc)
	open_app("thread")


func _thread() -> void:
	title_l.text = Data.char_name(thread_npc)
	var msgs: Array = Game.s.messages.get(thread_npc, [])
	for m in msgs.slice(max(0, msgs.size() - 30)):
		var mine := str(m.from) == "me"
		var row := UI.hbox()
		var bubble := UI.panel(Color("2f6fd6") if mine else Color("252b45"), 18, Color(0, 0, 0, 0), 0, 12)
		bubble.size_flags_horizontal = Control.SIZE_SHRINK_END if mine else Control.SIZE_SHRINK_BEGIN
		bubble.custom_minimum_size = Vector2(120, 0)
		var l := _t(str(m.t), 20, Color.WHITE)
		l.custom_minimum_size = Vector2(min(480, 22 * str(m.t).length()), 0)
		bubble.add_child(l)
		if mine:
			var sp := Control.new()
			sp.size_flags_horizontal = Control.SIZE_EXPAND_FILL
			row.add_child(sp)
		row.add_child(bubble)
		screen.add_child(row)
	var can_reply := msgs.size() > 0 and str(msgs.back().from) != "me"
	if not can_reply:
		screen.add_child(_t("Waiting for a reply…", 17, Color("8fa0c8")))
		return
	screen.add_child(_t("Reply:", 18, Color("aab6d6")))
	for r in _reply_options():
		screen.add_child(UI.btn(str(r.t), _reply.bind(r), 64, 19))


func _reply_options() -> Array:
	var opts: Array = []
	for r in Data.talk.get(thread_npc + "_replies", []):
		if Game.check_cond(r.get("if", {})):
			opts.append(r)
	opts.append({"t": "Thanks! Talk soon.", "reply": "", "rel": {"friendship": 1}})
	if Data.character(thread_npc).has("fav_location") and not _has_appointment(thread_npc):
		opts.append({"t": "Want to hang out tomorrow?", "invite": true})
	return opts.slice(0, 4)


func _has_appointment(npc: String) -> bool:
	for a in Game.s.appointments:
		if str(a.npc) == npc:
			return true
	return false


func _reply(r: Dictionary) -> void:
	Game.send_message(thread_npc, str(r.t))
	for k in r.get("rel", {}).keys():
		Game.rel_add(thread_npc, k, int(r.rel[k]))
	if r.has("remember"):
		Game.remember(thread_npc, str(r.remember))
	if bool(r.get("invite", false)):
		var ch := Data.character(thread_npc)
		if Game.rel_get(thread_npc, "friendship") >= int(ch.get("invite_min", 30)):
			var loc_id := str(ch.fav_location)
			Game.s.appointments.append({"day": int(Game.s.date.day_index) + 1, "npc": thread_npc, "location": loc_id, "title": "Hang out with %s" % Data.char_name(thread_npc), "slot": 1})
			_npc_says("Sure! Meet me at %s tomorrow afternoon." % Data.locations.get(loc_id, {}).get("name", "the park"))
		else:
			_npc_says("Maybe another time…")
	elif str(r.get("reply", "")) != "":
		_npc_says(str(r.reply))
	Events.fire("message_sent:" + thread_npc)
	open_app("thread")


func _npc_says(t: String) -> void:
	if not Game.s.messages.has(thread_npc):
		Game.s.messages[thread_npc] = []
	Game.s.messages[thread_npc].append({"from": thread_npc, "t": t, "day": int(Game.s.date.day_index)})


# ---------------------------------------------------------------- contacts & calls
func _contacts() -> void:
	title_l.text = "Contacts"
	for npc in Game.s.contacts:
		var row := UI.hbox(10)
		var pv := PortraitView.new()
		pv.custom_minimum_size = Vector2(90, 90)
		pv.size_flags_horizontal = Control.SIZE_SHRINK_BEGIN
		pv.set_char(str(npc), "normal")
		row.add_child(pv)
		row.add_child(UI.btn(Data.char_name(str(npc)), _profile.bind(str(npc)), 80, 21))
		screen.add_child(row)


func _profile(npc: String) -> void:
	var ch := Data.character(npc)
	var m := UI.modal(self, Data.char_name(npc), 600)
	m.body.add_child(UI.label(str(ch.get("bio", "")), 19))
	for k in Game.REL_KEYS:
		var row := UI.hbox()
		row.add_child(UI.label(k.capitalize(), 18, Color("aab6d6"), false))
		row.add_child(UI.bar(Game.rel_get(npc, k), 100, Color("e9406c") if k == "rivalry" else Settings.accent(), 12))
		row.add_child(UI.label(str(Game.rel_get(npc, k)), 18))
		m.body.add_child(row)
	m.body.add_child(UI.label("Shared memories: %d" % Game.s.memories.get(npc, []).size(), 17, Color("aab6d6")))
	var shade: ColorRect = m.shade
	var row2 := UI.hbox()
	m.body.add_child(row2)
	var _cb1 := func():
		shade.queue_free()
		_open_thread(npc)
	row2.add_child(UI.btn("Message", _cb1, 60))
	var _cb2 := func():
		shade.queue_free()
		_call(npc)
	row2.add_child(UI.btn("Call", _cb2, 60))


func _calls() -> void:
	title_l.text = "Calls"
	for npc in Game.s.pending_calls.keys():
		screen.add_child(UI.holo_btn("📞 Call %s (important)" % Data.char_name(npc), _call.bind(str(npc)), Color("3ddc97"), 80))
	for npc in Game.s.contacts:
		if Game.s.pending_calls.has(npc):
			continue
		screen.add_child(UI.btn("Call " + Data.char_name(str(npc)), _call.bind(str(npc)), 70, 21))


func _call(npc: String) -> void:
	Audio.play_sfx("call")
	var entries: Array = Data.calls.get(npc, [])
	var pick: Dictionary = {}
	var pend := str(Game.s.pending_calls.get(npc, ""))
	for e in entries:
		if pend != "" and str(e.get("id", "")) == pend:
			pick = e
			break
	if pick.is_empty():
		for e in entries:
			if Game.check_cond(e.get("if", {})) and not (bool(e.get("once", false)) and Game.has_flag("call_" + str(e.get("id", "")))):
				pick = e
				break
	var lines: Array = pick.get("lines", [{"s": "narrator", "t": "The call goes to voicemail."}])
	if not pick.is_empty():
		Game.set_flag("call_" + str(pick.get("id", "")))
		Game.s.pending_calls.erase(npc)
		Game.rel_add(npc, "familiarity", 1)
		Events.fire("call:" + npc)
	main.push("story", {"lines": lines, "call": true, "bg": "phone_call"})


# ---------------------------------------------------------------- social
func _social() -> void:
	title_l.text = "PulseNet"
	var me := _card(Color("2a1220"))
	me.add_child(_t("@%s  •  %d followers" % [Game.player_name().to_lower().replace(" ", "_"), int(Game.s.social.followers)], 21, Color("ffb3c1")))
	me.add_child(UI.btn("New post", _new_post, 60, 20))
	if Game.s.social.posts.is_empty():
		screen.add_child(_t("Your feed is empty.", 20, Color("8fa0c8")))
	for post in Game.s.social.posts.slice(0, 30):
		var v := _card()
		v.add_child(_t("@" + str(post.author), 19, Color("ff7ab8")))
		v.add_child(_t(str(post.t), 20))
		var comments: Array = post.get("comments", [])
		for c in comments.slice(0, 3):
			v.add_child(_t("  💬 " + str(c), 17, Color("aab6d6")))
		var row := UI.hbox()
		v.add_child(row)
		row.add_child(UI.btn(("♥ %d" if post.liked else "♡ %d") % int(post.likes), _like.bind(post), 54, 18))
		if not bool(post.get("mine", false)):
			row.add_child(UI.btn("Comment", _comment.bind(post), 54, 18))


func _like(post: Dictionary) -> void:
	post.liked = not bool(post.liked)
	post.likes = int(post.likes) + (1 if post.liked else -1)
	open_app("social")


func _comment(post: Dictionary) -> void:
	var m := UI.modal(self, "Comment", 560)
	var shade: ColorRect = m.shade
	for c in ["Amazing!", "Stay safe out there.", "Interesting…", "Who's ready for the next competition?"]:
		var cb := func():
			post.comments.append("@you: " + c)
			shade.queue_free()
			Events.fire("social_comment")
			open_app("social")
		m.body.add_child(UI.btn(c, cb, 60, 20))


func _new_post() -> void:
	var m := UI.modal(self, "What's on your mind?", 600)
	var shade: ColorRect = m.shade
	var options: Array = Data.news.get("player_posts", []).filter(func(p): return Game.check_cond(p.get("if", {})))
	for p in options.slice(0, 5):
		var cb := func():
			var likes := int(max(1, int(Game.s.social.followers) * randf_range(0.05, 0.2)))
			Game.add_social_post(Game.player_name().to_lower().replace(" ", "_"), str(p.t), likes, true)
			Game.s.social.followers = int(Game.s.social.followers) + randi_range(0, 3) + int(Game.s.reputation.public / 10)
			shade.queue_free()
			Events.fire("social_post")
			open_app("social")
		m.body.add_child(UI.btn(str(p.t), cb, 64, 19))


# ---------------------------------------------------------------- news, bank, calendar, jobs, gallery, alerts
func _news() -> void:
	title_l.text = "Daily News"
	if Game.s.news.is_empty():
		screen.add_child(_t("No news today.", 20, Color("8fa0c8")))
	for n in Game.s.news.slice(0, 30):
		var v := _card(Color("1f1a10"))
		v.add_child(_t("Day %d" % (int(n.day) + 1), 16, Color("ffb21f")))
		v.add_child(_t(str(n.headline), 23, Color.WHITE))
		if str(n.get("body", "")) != "":
			v.add_child(_t(str(n.body), 18, Color("d6d0c0")))


func _bank() -> void:
	title_l.text = "Nexa Bank"
	var v := _card(Color("1c1a0c"))
	v.add_child(_t("Wallet: ◈ %d" % int(Game.s.coins), 26, Color("ffd36a")))
	v.add_child(_t("Savings: ◈ %d  (0.1%% daily interest)" % int(Game.s.savings), 21))
	var row := UI.hbox()
	v.add_child(row)
	row.add_child(UI.btn("Deposit 100", _bank_move.bind(100), 56, 18))
	row.add_child(UI.btn("Deposit all", _bank_move.bind(int(Game.s.coins)), 56, 18))
	var row2 := UI.hbox()
	v.add_child(row2)
	row2.add_child(UI.btn("Withdraw 100", _bank_move.bind(-100), 56, 18))
	row2.add_child(UI.btn("Withdraw all", _bank_move.bind(-int(Game.s.savings)), 56, 18))
	screen.add_child(_t("Recent transactions", 20, Color("aab6d6")))
	for t in Game.s.transactions.slice(0, 25):
		var amt := int(t.amount)
		screen.add_child(_t("Day %d  %s%d  %s" % [int(t.day) + 1, "+" if amt > 0 else "", amt, t.reason], 18, Color("3ddc97") if amt > 0 else Color("ff8fa3")))


func _bank_move(amount: int) -> void:
	if amount > 0:
		amount = min(amount, int(Game.s.coins))
		if amount <= 0:
			return
		Game.s.coins = int(Game.s.coins) - amount
		Game.s.savings = int(Game.s.savings) + amount
	else:
		var w: int = min(-amount, int(Game.s.savings))
		if w <= 0:
			return
		Game.s.savings = int(Game.s.savings) - w
		Game.s.coins = int(Game.s.coins) + w
	Events.coins_changed.emit()
	open_app("bank")


func _calendar() -> void:
	title_l.text = "Calendar"
	screen.add_child(_t("Today: " + Game.date_string(), 22, Color("ff7ab8")))
	var d: Dictionary = Game.s.date
	var day := int(d.day)
	var month := int(d.month)
	for i in 14:
		var items: Array = []
		for e in Data.calendar.get("events", []):
			if int(e.month) == month and int(e.day) == day and Game.check_cond(e.get("if", {})):
				items.append(str(e.title))
		if month == int(Game.s.player.birth_month) and day == int(Game.s.player.birth_day):
			items.append("Your birthday!")
		for a in Game.s.appointments:
			if int(a.day) == int(d.day_index) + i:
				items.append("%s (%s)" % [a.title, Data.locations.get(str(a.location), {}).get("name", "")])
		for q in Quests.active_quests():
			if int(q.deadline) == int(d.day_index) + i:
				items.append("Quest deadline: " + str(q.name))
		var wd: String = Game.WEEKDAYS[(int(d.day_index) + i) % 7]
		var v := _card(Color("201424") if items.size() > 0 else Color("161b30"))
		v.add_child(_t("%s %d %s%s" % [wd.left(3), day, Game.MONTHS[month - 1].left(3), "  (today)" if i == 0 else ""], 19, Color("ffb3d9")))
		for it in items:
			v.add_child(_t("• " + it, 18))
		day += 1
		if day > Game.MONTH_DAYS[month - 1]:
			day = 1
			month = month % 12 + 1


func _jobs() -> void:
	title_l.text = "Jobs"
	for id in Data.jobs.keys():
		if id.begins_with("_"):
			continue
		var j: Dictionary = Data.jobs[id]
		if not Game.check_cond(j.get("visible_if", {})):
			continue
		var js: Dictionary = Game.s.jobs.get(id, {"level": 1, "shifts": 0})
		var v := _card()
		v.add_child(_t(str(j.name), 22, Color("c9b8ff")))
		var slots: Array = j.get("slots", [1, 2])
		v.add_child(_t("%s • %s • ◈%d/shift • Lv.%d" % [Data.locations.get(str(j.location), {}).get("name", ""), ", ".join(slots.map(func(x): return Game.SLOTS[int(x)])), int(j.pay), int(js.level)], 18))
		v.add_child(UI.btn("Go to work", _go_job.bind(str(j.location)), 56, 18))


func _go_job(loc_id: String) -> void:
	Game.s.location = loc_id
	main.pop()
	Events.time_changed.emit()


func _gallery() -> void:
	title_l.text = "Gallery"
	var bgs: Array = Game.s.gallery.backgrounds.keys()
	screen.add_child(_t("%d photos • Replay story scenes in Scene Gallery" % bgs.size(), 18, Color("aab6d6")))
	screen.add_child(UI.btn("Open Scene Gallery", func(): main.push("gallery", {"tab": "scenes"}), 60, 19))
	var g := UI.grid(2)
	screen.add_child(g)
	for id in bgs:
		var b := BackgroundView.new()
		b.custom_minimum_size = Vector2(0, 240)
		b.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		b.drift = false
		b.set_bg(str(id))
		g.add_child(b)


func _notifs() -> void:
	title_l.text = "Alerts"
	for n in Game.s.notifications.slice(0, 50):
		screen.add_child(_t("Day %d • %s" % [int(n.day) + 1, n.t], 18))
