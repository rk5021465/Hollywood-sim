class_name UI
extends RefCounted
## Small helper library that builds touch-friendly Control nodes in code.
## All screens use these so the look stays consistent and theme settings apply.

const HOLO_BG := Color("0a0f24")
const HOLO_BLUE := Color("3fa9ff")
const HOLO_PURPLE := Color("9b5cff")
const HOLO_GOLD := Color("f5c542")


static func bg() -> Color:
	return Color("0d1226") if Settings.is_dark() else Color("eef1f8")


static func panel_col() -> Color:
	return Color("161d38") if Settings.is_dark() else Color("ffffff")


static func ink() -> Color:
	return Settings.text_color()


static func muted() -> Color:
	return Color("97a3c4") if Settings.is_dark() else Color("5b647d")


static func box(color: Color, radius: int = 14, border: Color = Color(0, 0, 0, 0), bw: int = 0, pad: int = 14) -> StyleBoxFlat:
	var sb := StyleBoxFlat.new()
	sb.bg_color = color
	sb.set_corner_radius_all(radius)
	sb.set_content_margin_all(pad)
	if bw > 0:
		sb.border_color = border
		sb.set_border_width_all(bw)
	return sb


static func make_theme() -> Theme:
	var th := Theme.new()
	var f := Settings.custom_font()
	if f:
		th.default_font = f
	th.default_font_size = Settings.font_size(24)
	var acc := Settings.accent()
	var b_normal := box(panel_col().lightened(0.06) if Settings.is_dark() else Color("e3e8f5"), 14, acc.darkened(0.2), 2, 12)
	var b_hover := box(b_normal.bg_color.lightened(0.08), 14, acc, 2, 12)
	var b_press := box(acc.darkened(0.35), 14, acc, 2, 12)
	var b_dis := box(b_normal.bg_color.darkened(0.2), 14, Color(0.4, 0.4, 0.45), 1, 12)
	th.set_stylebox("normal", "Button", b_normal)
	th.set_stylebox("hover", "Button", b_hover)
	th.set_stylebox("pressed", "Button", b_press)
	th.set_stylebox("disabled", "Button", b_dis)
	th.set_stylebox("focus", "Button", box(Color(0, 0, 0, 0), 14, acc, 3, 12))
	th.set_color("font_color", "Button", ink())
	th.set_color("font_hover_color", "Button", ink())
	th.set_color("font_pressed_color", "Button", Color.WHITE)
	th.set_color("font_disabled_color", "Button", muted())
	th.set_color("font_color", "Label", ink())
	th.set_color("default_color", "RichTextLabel", ink())
	th.set_stylebox("panel", "PanelContainer", box(panel_col(), 16))
	th.set_stylebox("normal", "LineEdit", box(panel_col().darkened(0.1), 10, acc, 2, 10))
	th.set_color("font_color", "LineEdit", ink())
	var sb_bg := box(Color(0, 0, 0, 0.35), 8, Color(0, 0, 0, 0), 0, 0)
	th.set_stylebox("background", "ProgressBar", sb_bg)
	th.set_stylebox("fill", "ProgressBar", box(acc, 8, Color(0, 0, 0, 0), 0, 0))
	th.set_stylebox("slider", "HSlider", box(Color(0.5, 0.5, 0.6, 0.4), 6, Color(0, 0, 0, 0), 0, 4))
	th.set_stylebox("grabber_area", "HSlider", box(acc, 6, Color(0, 0, 0, 0), 0, 4))
	th.set_stylebox("grabber_area_highlight", "HSlider", box(acc.lightened(0.2), 6, Color(0, 0, 0, 0), 0, 4))
	th.set_constant("separation", "VBoxContainer", 10)
	th.set_constant("separation", "HBoxContainer", 10)
	th.set_constant("h_separation", "GridContainer", 10)
	th.set_constant("v_separation", "GridContainer", 10)
	th.set_stylebox("tab_selected", "TabBar", box(acc.darkened(0.3), 10, acc, 2, 10))
	th.set_stylebox("tab_unselected", "TabBar", box(panel_col(), 10, Color(0, 0, 0, 0), 0, 10))
	return th


static func full(c: Control) -> Control:
	c.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	return c


static func btn(text: String, cb: Callable = Callable(), min_h: int = 72, font: int = 24) -> Button:
	var b := Button.new()
	b.text = text
	b.custom_minimum_size = Vector2(0, min_h)
	b.add_theme_font_size_override("font_size", Settings.font_size(font))
	b.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	b.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	b.pressed.connect(func(): Audio.ui("click"))
	if cb.is_valid():
		b.pressed.connect(cb)
	return b


static func holo_btn(text: String, cb: Callable = Callable(), color: Color = HOLO_BLUE, min_h: int = 72) -> Button:
	var b := btn(text, cb, min_h)
	b.add_theme_stylebox_override("normal", box(Color(color.r, color.g, color.b, 0.12), 10, color, 2, 10))
	b.add_theme_stylebox_override("hover", box(Color(color.r, color.g, color.b, 0.25), 10, color, 2, 10))
	b.add_theme_stylebox_override("pressed", box(Color(color.r, color.g, color.b, 0.45), 10, color.lightened(0.3), 2, 10))
	b.add_theme_color_override("font_color", Color("e6f2ff"))
	b.add_theme_color_override("font_hover_color", Color.WHITE)
	return b


static func label(text: String, size: int = 24, color: Color = Color(0, 0, 0, 0), wrap_text: bool = true) -> Label:
	var l := Label.new()
	l.text = text
	l.add_theme_font_size_override("font_size", Settings.font_size(size))
	if color.a > 0.0:
		l.add_theme_color_override("font_color", color)
	if wrap_text:
		l.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	l.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	return l


static func title(text: String, size: int = 38, color: Color = Color(0, 0, 0, 0)) -> Label:
	var l := label(text, size, color)
	l.add_theme_constant_override("outline_size", 0)
	return l


static func rich(text: String, size: int = 24) -> RichTextLabel:
	var r := RichTextLabel.new()
	r.bbcode_enabled = true
	r.fit_content = true
	r.scroll_active = false
	r.text = text
	r.add_theme_font_size_override("normal_font_size", Settings.font_size(size))
	r.add_theme_font_size_override("bold_font_size", Settings.font_size(size))
	r.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	return r


static func vbox(sep: int = 10) -> VBoxContainer:
	var v := VBoxContainer.new()
	v.add_theme_constant_override("separation", sep)
	v.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	return v


static func hbox(sep: int = 10) -> HBoxContainer:
	var h := HBoxContainer.new()
	h.add_theme_constant_override("separation", sep)
	h.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	return h


static func grid(cols: int) -> GridContainer:
	var g := GridContainer.new()
	g.columns = cols
	g.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	return g


static func panel(color: Color = Color(0, 0, 0, 0), radius: int = 16, border: Color = Color(0, 0, 0, 0), bw: int = 0, pad: int = 16) -> PanelContainer:
	var p := PanelContainer.new()
	p.add_theme_stylebox_override("panel", box(color if color.a > 0 else panel_col(), radius, border, bw, pad))
	p.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	return p


static func holo_panel(color: Color = HOLO_BLUE) -> PanelContainer:
	return panel(Color(0.04, 0.07, 0.17, 0.92), 12, color, 2, 16)


static func scroll(content: Control) -> ScrollContainer:
	var sc := ScrollContainer.new()
	sc.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	sc.size_flags_vertical = Control.SIZE_EXPAND_FILL
	sc.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	content.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	sc.add_child(content)
	return sc


static func bar(value: float, max_v: float, color: Color, h: int = 18) -> ProgressBar:
	var p := ProgressBar.new()
	p.max_value = max(1.0, max_v)
	p.value = value
	p.show_percentage = false
	p.custom_minimum_size = Vector2(0, h)
	p.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	p.add_theme_stylebox_override("fill", box(color, 8, Color(0, 0, 0, 0), 0, 0))
	p.add_theme_stylebox_override("background", box(Color(0, 0, 0, 0.4), 8, Color(0, 0, 0, 0), 0, 0))
	return p


static func header(title_text: String, back_cb: Callable, color: Color = Color(0, 0, 0, 0)) -> HBoxContainer:
	var h := hbox(12)
	var b := btn("‹ Back", back_cb, 64, 22)
	b.size_flags_horizontal = Control.SIZE_SHRINK_BEGIN
	b.custom_minimum_size = Vector2(130, 64)
	h.add_child(b)
	var t := label(title_text, 32, color)
	t.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	h.add_child(t)
	return h


static func spacer(h: int = 10) -> Control:
	var c := Control.new()
	c.custom_minimum_size = Vector2(0, h)
	return c


static func clear(node: Node) -> void:
	for ch in node.get_children():
		ch.queue_free()


static func screen_bg(parent: Control, color: Color = Color(0, 0, 0, 0)) -> ColorRect:
	var r := ColorRect.new()
	r.color = color if color.a > 0 else bg()
	full(r)
	parent.add_child(r)
	return r


static func margin(child: Control, m: int = 20, top: int = -1) -> MarginContainer:
	var mc := MarginContainer.new()
	for side in ["left", "right", "bottom"]:
		mc.add_theme_constant_override("margin_" + side, m)
	mc.add_theme_constant_override("margin_top", m if top < 0 else top)
	full(mc)
	mc.add_child(child)
	return mc


static func confirm(parent: Control, text: String, on_yes: Callable, yes_text: String = "Yes", no_text: String = "Cancel") -> void:
	var shade := ColorRect.new()
	shade.color = Color(0, 0, 0, 0.6)
	full(shade)
	parent.add_child(shade)
	var cc := CenterContainer.new()
	full(cc)
	shade.add_child(cc)
	var p := panel(Color(0, 0, 0, 0), 18, Settings.accent(), 2, 24)
	p.custom_minimum_size = Vector2(560, 0)
	p.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	cc.add_child(p)
	var v := vbox(16)
	p.add_child(v)
	var l := label(text, 26)
	l.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	v.add_child(l)
	var h := hbox()
	v.add_child(h)
	h.add_child(btn(no_text, func(): shade.queue_free()))
	var _cb1 := func():
		shade.queue_free()
		on_yes.call()
	h.add_child(btn(yes_text, _cb1))


static func modal(parent: Control, title_text: String, width: int = 640) -> Dictionary:
	## Opens a centered modal panel. Returns {"shade": ColorRect, "body": VBoxContainer}.
	## A Close button is added automatically.
	var shade := ColorRect.new()
	shade.color = Color(0, 0, 0, 0.65)
	full(shade)
	parent.add_child(shade)
	var cc := CenterContainer.new()
	full(cc)
	shade.add_child(cc)
	var p := panel(Color(0, 0, 0, 0), 18, Settings.accent(), 2, 22)
	p.custom_minimum_size = Vector2(width, 0)
	p.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	cc.add_child(p)
	var v := vbox(14)
	p.add_child(v)
	var t := label(title_text, 30, Settings.accent())
	v.add_child(t)
	var body := vbox(12)
	v.add_child(body)
	v.add_child(btn("Close", func(): shade.queue_free(), 64))
	return {"shade": shade, "body": body}
