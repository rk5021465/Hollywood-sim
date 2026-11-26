extends Control
## Part-time jobs (Part 16) and school classes (Part 31) as short interactive
## tasks. Each shift / lesson has 3 tasks generated for the job type:
## math (change & bills), route (delivery), logic (computer work), quiz (class).
## Peter's Intelligence matters: high Intelligence removes wrong answers.
## args: {"job": job id or "class", "class_subject": subject}

var main
var job_id := ""
var job: Dictionary = {}
var is_class := false
var subject := "general"
var tasks: Array = []
var ti := 0
var correct := 0
var body: VBoxContainer


func setup(args: Dictionary) -> void:
	job_id = str(args.get("job", ""))
	is_class = job_id == "class"
	subject = str(args.get("class_subject", "general"))
	job = Data.jobs.get(job_id, {}) if not is_class else {"name": "Class: " + subject.capitalize(), "task": "quiz", "bg": "school_classroom"}
	var bgv := BackgroundView.new()
	UI.full(bgv)
	bgv.set_bg(str(job.get("bg", "city_street")))
	add_child(bgv)
	var shade := ColorRect.new()
	shade.color = Color(0, 0, 0, 0.5)
	UI.full(shade)
	add_child(shade)
	var root := UI.vbox(12)
	add_child(UI.margin(root, 18))
	root.add_child(UI.header(str(job.get("name", "Job")), func(): main.pop(), Color.WHITE))
	body = UI.vbox(12)
	root.add_child(UI.scroll(body))
	Audio.play_music("school" if is_class else "city")
	if is_class:
		_start()
	else:
		_intro()


func _jstate() -> Dictionary:
	if not Game.s.jobs.has(job_id):
		Game.s.jobs[job_id] = {"level": 1, "shifts": 0}
	return Game.s.jobs[job_id]


func _intro() -> void:
	UI.clear(body)
	var js := _jstate()
	var p := UI.holo_panel(UI.HOLO_BLUE)
	body.add_child(p)
	var v := UI.vbox(6)
	p.add_child(v)
	v.add_child(UI.label(str(job.get("desc", "")), 21, Color("e6ecff")))
	v.add_child(UI.label("Location: %s" % Data.locations.get(str(job.get("location", "")), {}).get("name", "—"), 19, Color("b8c6e6")))
	var slots: Array = job.get("slots", [1, 2])
	v.add_child(UI.label("Working hours: " + ", ".join(slots.map(func(x): return Game.SLOTS[int(x)])), 19, Color("b8c6e6")))
	v.add_child(UI.label("Base pay: ◈%d per shift  •  Job level %d (%d shifts)" % [int(job.get("pay", 30)), int(js.level), int(js.shifts)], 19, Color("ffd36a")))
	var ok: bool = int(Game.s.time_slot) in slots.map(func(x): return int(x))
	if not ok:
		body.add_child(UI.label("This job isn't hiring right now. Come back during working hours.", 20, Color("ff8fa3")))
		return
	if not Game.check_cond(job.get("if", {})):
		body.add_child(UI.label(str(job.get("locked_text", "You can't take this job yet.")), 20, Color("ff8fa3")))
		return
	body.add_child(UI.holo_btn("Start shift (−%d EN)" % int(job.get("energy", 20)), _start, UI.HOLO_GOLD, 80))


func _start() -> void:
	if not is_class:
		if not Game.use_energy(int(job.get("energy", 20))):
			Game.notify("Too tired to work. Rest first.", "warn")
			return
	tasks.clear()
	for i in 3:
		tasks.append(_make_task(str(job.get("task", "math"))))
	ti = 0
	correct = 0
	_show_task()


func _make_task(kind: String) -> Dictionary:
	var lvl := int(_jstate().level) if not is_class else 1
	match kind:
		"route":
			var routes: Array = []
			for r in 3:
				routes.append([randi_range(1, 6 + lvl), randi_range(1, 6 + lvl), randi_range(1, 6 + lvl)])
			var sums := routes.map(func(r): return int(r[0]) + int(r[1]) + int(r[2]))
			var best := sums.find(sums.min())
			var q := "Deliver the order fast! Which route is shortest?\n"
			var opts: Array = []
			for r in 3:
				q += "Route %s: %d + %d + %d km\n" % [["A", "B", "C"][r], routes[r][0], routes[r][1], routes[r][2]]
				opts.append("Route " + ["A", "B", "C"][r])
			return {"q": q, "options": opts, "answer": best}
		"logic":
			var nums: Array = []
			for i in 4:
				nums.append(randi_range(1, 50 + lvl * 10))
			var sorted := nums.duplicate()
			sorted.sort()
			var wrong1 := sorted.duplicate()
			wrong1.reverse()
			var wrong2 := sorted.duplicate()
			var tmp = wrong2[1]
			wrong2[1] = wrong2[2]
			wrong2[2] = tmp
			var options := [str(sorted), str(wrong1), str(wrong2)]
			if options[2] == options[0]:
				wrong2.shuffle()
				options[2] = str(wrong2) + " "
			var order := [0, 1, 2]
			order.shuffle()
			return {"q": "The client's database must be sorted ascending.\nNumbers: %s\nPick the correct output:" % str(nums), "options": order.map(func(i): return options[i]), "answer": order.find(0)}
		"quiz":
			var bank: Array = Data.jobs.get("_questions", {}).get(subject, Data.jobs.get("_questions", {}).get("general", []))
			if bank.size() > 0:
				var qd: Dictionary = bank.pick_random()
				return {"q": str(qd.q), "options": qd.options, "answer": int(qd.answer)}
			return _make_task("math")
		_:
			var a := randi_range(5, 40 + lvl * 10)
			var b := randi_range(5, 40 + lvl * 10)
			var paid := (int((a + b) / 50) + 1) * 50
			var ans := paid - a - b
			var opts := [ans, ans + randi_range(1, 9), max(0, ans - randi_range(1, 9)), ans + 10]
			var uniq: Array = []
			for o in opts:
				if not (o in uniq):
					uniq.append(o)
			while uniq.size() < 3:
				uniq.append(int(uniq.back()) + 3)
			uniq.shuffle()
			return {"q": "A customer buys items costing ◈%d and ◈%d and pays ◈%d.\nHow much change?" % [a, b, paid], "options": uniq.map(func(x): return "◈%d" % int(x)), "answer": uniq.find(ans)}


func _show_task() -> void:
	UI.clear(body)
	var t: Dictionary = tasks[ti]
	body.add_child(UI.label("Task %d / 3" % (ti + 1), 26, UI.HOLO_GOLD))
	var p := UI.holo_panel(UI.HOLO_BLUE)
	body.add_child(p)
	p.add_child(UI.label(str(t.q), 23, Color("e6ecff")))
	var intel := Game.get_stat("intelligence")
	var hide_n := 0
	if intel >= 40:
		hide_n = 2
	elif intel >= 18:
		hide_n = 1
	var opts: Array = t.options
	var wrong: Array = []
	for i in opts.size():
		if i != int(t.answer):
			wrong.append(i)
	wrong.shuffle()
	var hidden_opts := wrong.slice(0, min(hide_n, max(0, opts.size() - 2)))
	if hidden_opts.size() > 0:
		body.add_child(UI.label("Your Intelligence (%d) rules out %d wrong answer(s)." % [intel, hidden_opts.size()], 18, UI.HOLO_PURPLE))
	for i in opts.size():
		var b := UI.holo_btn(str(opts[i]), _answer.bind(i), UI.HOLO_BLUE, 72)
		if i in hidden_opts:
			b.disabled = true
			b.modulate.a = 0.35
		body.add_child(b)


func _answer(i: int) -> void:
	var t: Dictionary = tasks[ti]
	if i == int(t.answer):
		correct += 1
		Audio.play_sfx("quest")
		Game.notify("Correct!", "info")
	else:
		Audio.play_sfx("lose")
		Game.notify("Wrong — the answer was: %s" % str(t.options[int(t.answer)]), "warn")
	ti += 1
	if ti >= tasks.size():
		_results()
	else:
		_show_task()


func _results() -> void:
	UI.clear(body)
	body.add_child(UI.label("Shift complete!" if not is_class else "Lesson complete!", 32, UI.HOLO_GOLD))
	body.add_child(UI.label("Correct: %d / 3" % correct, 24, Color.WHITE))
	if is_class:
		if correct > 0:
			Game.add_stat("intelligence", 1 if correct < 3 else 2, "class: " + subject)
		Game.add_rep("school", correct)
		Events.fire("attend_class")
		Events.fire("class:" + subject)
		if correct == 3:
			Events.fire("class_perfect")
		if Game.has_flag("system_active"):
			Game.add_exp(5 + correct * 4, "class")
		body.add_child(UI.label("Teachers noticed your effort. (+School reputation)", 20, Color("c5d0ee")))
	else:
		var js := _jstate()
		var pay := int(float(job.get("pay", 30)) * (0.5 + 0.5 * correct / 3.0) * (1.0 + (int(js.level) - 1) * 0.15))
		Game.add_coins(pay, "salary: " + str(job.get("name", job_id)))
		js.shifts = int(js.shifts) + 1
		if int(js.shifts) % 5 == 0:
			js.level = int(js.level) + 1
			Game.notify("Promotion! %s level %d" % [job.get("name", ""), int(js.level)], "event")
		for st in job.get("stats", {}).keys():
			Game.add_stat(st, int(job.stats[st]), "work: " + str(job.get("name", "")))
		if Game.has_flag("system_active"):
			Game.add_exp(int(job.get("exp", 8)), "work")
		Events.fire("work_job")
		Events.fire("job:" + job_id)
		body.add_child(UI.label("Salary: ◈%d" % pay, 24, Color("ffd36a")))
	Game.advance_slot()
	body.add_child(UI.holo_btn("Done", func(): main.pop(), UI.HOLO_GOLD, 76))


func on_back() -> bool:
	return ti > 0 and ti < tasks.size()
