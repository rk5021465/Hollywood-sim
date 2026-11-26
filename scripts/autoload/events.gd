extends Node
## Global signal bus. Systems talk to each other through these signals
## so no manager needs a hard reference to UI code.

signal stats_changed
signal coins_changed
signal time_changed
signal quest_updated
signal quest_completed(quest_id: String)
signal card_granted(card_id: String, is_new: bool)
signal notify(text: String, kind: String)
signal level_up(level: int)
signal relationship_changed(npc_id: String)
signal message_received(npc_id: String)
signal game_event(event_name: String, data: Dictionary)
signal settings_changed
signal achievement_unlocked(ach_id: String)


## Fire a gameplay event (e.g. "attend_class", "visit:library").
## Quests, achievements, news and NPC messages listen to this.
func fire(event_name: String, data: Dictionary = {}) -> void:
	game_event.emit(event_name, data)
