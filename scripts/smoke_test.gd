extends Node
## Automated smoke test, only runs with:  godot --headless -- --smoke
## Opens every screen and plays through key systems, printing SMOKE lines.

var main


func _wait(frames: int = 20) -> void:
	for i in frames:
		await get_tree().process_frame


func run() -> void:
	print("SMOKE start")
	main.go("creator")
	await _wait()
	Game.new_game({"hair_style": 1, "hair_color": 2, "eye_color": 1, "skin": 2, "beard": 0, "outfit": 1, "shoes": 0, "accessory": 1})
	# play the first story scenes (auto-advance by calling _advance repeatedly)
	main.go("story", {"scene": "c0_intro"})
	for n in 400:
		await _wait(3)
		var top: Control = main.stack.back()
		var nm: String = main.top_name()
		if nm == "story":
			if top.system_popup != null:
				top._system_pick(0, top.lines[top.idx - 1])
			elif top.waiting_choice and top.choice_box.get_child_count() > 0:
				top.choice_box.get_child(0).pressed.emit()
			else:
				top.typing = false
				top._advance()
		elif nm == "competition":
			if top.round_i < 3:
				top._play("steady")
			else:
				top._done(5)
		elif nm == "combat":
			if top.over:
				top._done(false)
			else:
				top._attack()
		elif nm == "hub":
			break
		for r in main.overlay_layer.get_children():
			if r.has_method("play") and r.can_close:
				r._gui_input(_click())
	print("SMOKE story reached: ", main.top_name(), " next=", Story.next_id())
	main.go("hub")
	await _wait()
	# give the System + some content
	Game.set_flag("system_active")
	Game.grant_rewards({"exp": 500, "coins": 50000, "cards": ["boxing_mastery", "ultra_instinct", "arise", "white_lantern"], "items": {"potion_small": 2, "sofa": 1, "shadow_blade": 1}}, "smoke")
	await _wait(5)
	for r in main.overlay_layer.get_children():
		if r.has_method("play"):
			r.queue_free()
	main.reveal_queue.clear()
	main.reveal_busy = false
	Game.s.ring.unlocked = true
	Game.add_shadow("kael")
	Quests.offer("daily_train")
	Quests.generate_dailies()
	for tab in ["status", "quests", "cards", "skills", "inventory", "achievements", "titles", "shop", "notifications", "history", "shadows", "lantern"]:
		main.push("system", {"tab": tab})
		await _wait()
		print("SMOKE system tab ok: ", tab)
		main.pop()
	var sm: Control = main.push("system", {"tab": "cards"})
	await _wait()
	sm._card_detail("boxing_mastery")
	await _wait()
	main.pop()
	for app in ["", "messages", "contacts", "calls", "social", "news", "bank", "calendar", "jobs", "gallery", "notifications"]:
		main.push("phone", {"app": app})
		await _wait()
		print("SMOKE phone app ok: ", app)
		main.pop()
	for scr in [["map", {}], ["shop", {"shop": "pet_shop"}], ["shop", {"shop": "realty"}], ["shop", {"shop": "costume_shop"}], ["housing", {}],
			["job", {"job": "shop_assistant"}], ["job", {"job": "class", "class_subject": "mathematics"}], ["gallery", {"tab": "characters"}],
			["gallery", {"tab": "cards"}], ["gallery", {"tab": "scenes"}], ["settings", {}], ["saves", {"mode": "save"}], ["credits", {}]]:
		main.push(scr[0], scr[1])
		await _wait()
		print("SMOKE screen ok: ", scr[0])
		main.pop()
	var j: Control = main.push("job", {"job": "class", "class_subject": "science"})
	await _wait()
	for k in 3:
		j._answer(0)
		await _wait(3)
	main.pop()
	var c: Control = main.push("combat", {"enemy": "training_dummy", "story": false})
	for k in 30:
		await _wait(40)
		if c.over:
			break
		c._attack()
	print("SMOKE combat over: ", c.over)
	c._done(true)
	var cp: Control = main.push("competition", {"id": "school_speed"})
	await _wait()
	cp._begin()
	for k in 3:
		cp._play("smart")
		await _wait(3)
	cp._done(1)
	await _wait()
	var h: Control = main.stack.back()
	for loc_id in Data.locations.keys():
		Game.s.location = loc_id
		h.refresh()
		await _wait(2)
	print("SMOKE all locations ok")
	Game.sleep()
	await _wait()
	print("SMOKE save: ", SaveManager.save(5))
	print("SMOKE load: ", SaveManager.load_slot(5))
	SaveManager.delete_slot(5)
	main.go("story", {"scene": "c8_ring", "replay": true})
	await _wait(30)
	main.go("hub")
	await _wait()
	print("SMOKE DONE")
	get_tree().quit()


func _click() -> InputEventMouseButton:
	var e := InputEventMouseButton.new()
	e.pressed = true
	e.button_index = MOUSE_BUTTON_LEFT
	return e
