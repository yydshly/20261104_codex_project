extends Node3D

const Combatant = preload("res://scripts/combatant.gd")
var hero: CharacterBody3D
var enemies: Array[CharacterBody3D] = []
var camera: Camera3D
var ended := false
var won := false
var elapsed := 0.0
var defeated := 0
var effects: Array[Dictionary] = []
var landing: MeshInstance3D
var shield_bubble: MeshInstance3D
var health_bar: ProgressBar
var health_label: Label
var shield_label: Label
var objective: Label
var damage_overlay: ColorRect
var end_panel: PanelContainer
var end_label: Label
var skill_buttons := {}
var zone_left := 0.0
var zone_position := Vector3.ZERO
var zone_ring: MeshInstance3D
var hero_marker: MeshInstance3D
var spawn_points := [Vector3(-4, 0.025, -2), Vector3(0, 0.025, -5.4), Vector3(4, 0.025, -2)]

func _ready() -> void:
	configure_input()
	build_environment()
	build_floor()
	build_ruins()
	camera = Camera3D.new()
	camera.name = "FixedMobaCamera"
	camera.projection = Camera3D.PROJECTION_ORTHOGONAL
	camera.size = 22
	camera.current = true
	add_child(camera)
	camera.position = Vector3(0, 18, 13)
	camera.look_at(Vector3(0, 0, -0.8))
	hero = Combatant.new()
	hero.name = "Warlord"
	hero.arena = self
	add_child(hero)
	hero.position = Vector3(0, 0.025, 4)
	hero_marker = make_ring(Color("b9d79a"), 0.6)
	for i in range(3):
		var guard = Combatant.new()
		guard.name = "Enemy%d" % (i + 1)
		guard.arena = self
		guard.enemy = true
		guard.unit_index = i
		add_child(guard)
		guard.position = spawn_points[i]
		enemies.append(guard)
	landing = make_ring(Color("c7b4ff"), 3.2)
	landing.visible = false
	zone_ring = make_ring(Color("8d64bb"), 3.2)
	zone_ring.visible = false
	shield_bubble = MeshInstance3D.new()
	var bubble := SphereMesh.new()
	bubble.radius = 0.86
	bubble.height = 1.95
	shield_bubble.mesh = bubble
	var bubble_material := mat(Color(0.6, 0.45, 1.0, 0.22), 0, 0.6)
	bubble_material.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	bubble_material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	shield_bubble.material_override = bubble_material
	add_child(shield_bubble)
	shield_bubble.visible = false
	build_ui()
	print("WARLORD_READY native fixed-camera MOBA; animations=" + str(hero.animator.get_animation_list() if hero.animator else []))

func configure_input() -> void:
	for pair in [["forward", KEY_W], ["back", KEY_S], ["left", KEY_A], ["right", KEY_D], ["run", KEY_SHIFT]]:
		if not InputMap.has_action(pair[0]):
			InputMap.add_action(pair[0])
		var key := InputEventKey.new()
		key.physical_keycode = pair[1]
		InputMap.action_add_event(pair[0], key)

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		hero.request_attack()
	if event is InputEventKey and event.pressed and not event.echo:
		match event.physical_keycode:
			KEY_J: hero.request_attack()
			KEY_Q: hero.request_skill("Q")
			KEY_E: hero.request_skill("E")
			KEY_R: hero.request_skill("R", hero.aim_point)
			KEY_SPACE: hero.request_dodge()
			KEY_T, KEY_F5: reset_trial()

func _physics_process(delta: float) -> void:
	if not ended:
		elapsed += delta
	zone_left = maxf(0, zone_left - delta)
	if zone_ring:
		zone_ring.visible = zone_left > 0
	if hero and not hero.test_mode:
		var pointer := get_viewport().get_mouse_position()
		var origin := camera.project_ray_origin(pointer)
		var direction := camera.project_ray_normal(pointer)
		var point = Plane(Vector3.UP, 0).intersects_ray(origin, direction)
		if point != null:
			hero.aim_point = point
	if shield_bubble:
		shield_bubble.position = hero.position + Vector3(0, 1.0, 0)
		shield_bubble.visible = hero.shield > 0 and not hero.dead
	if hero_marker:
		hero_marker.position = Vector3(hero.position.x, 0.08, hero.position.z)
		hero_marker.visible = not hero.dead
	update_effects(delta)
	if health_bar:
		health_bar.value = hero.health
		health_label.text = "%d / 240" % int(hero.health)
		shield_label.text = "护盾 %d · 体力 %d / 100%s" % [int(hero.shield), int(hero.stamina), " · 戟刃强化 %.1fs" % hero.empowered_left if hero.empowered_left > 0 else ""]
		objective.text = "击倒禁卫  %d / 3     ·     %.1f 秒" % [defeated, elapsed]
		damage_overlay.color.a = move_toward(damage_overlay.color.a, 0, delta)
		for key in skill_buttons:
			var button: Button = skill_buttons[key]
			var names := {"Q": "横扫", "E": "护盾", "R": "跳劈"}
			var cost := 12.0 if key == "Q" else 20.0 if key == "R" else 0.0
			var label := "%.1f 秒" % hero.cooldowns[key] if hero.cooldowns[key] > 0 else "体力不足" if hero.stamina < cost else "就绪"
			button.text = "%s  %s\n%s" % [key, names[key], label]
			button.disabled = hero.cooldowns[key] > 0 or ended or hero.stamina < cost

func hero_area_hit(attacker: CharacterBody3D, reach: float, half_angle: float, damage: float, lift: float, knock: float) -> int:
	var hits := 0
	var forward: Vector3 = attacker.action_forward
	for guard in enemies:
		if guard.dead or attacker.action_hits.has(guard.get_instance_id()):
			continue
		var offset: Vector3 = guard.position - attacker.position
		offset.y = 0
		if offset.length() <= reach + 0.1075 and (offset.length() < 0.1 or forward.dot(offset.normalized()) >= cos(half_angle)):
			var applied_damage := damage
			if attacker.action.begins_with("Attack") and attacker.empowered_left > 0:
				applied_damage = roundf(damage * 1.2)
				attacker.health = minf(attacker.max_health, attacker.health + 3)
			if guard.receive_damage(applied_damage, attacker, lift, knock):
				attacker.action_hits[guard.get_instance_id()] = true
				hits += 1
	return hits

func unit_died(unit: CharacterBody3D) -> void:
	if unit.enemy:
		defeated += 1
		if defeated == 3:
			finish_trial(true)
	else:
		finish_trial(false)

func finish_trial(success: bool) -> void:
	ended = true
	won = success
	landing.visible = false
	if success:
		hero.action = ""
		hero.play_clip("Victory", true)
	for guard in enemies:
		if guard.warning:
			guard.warning.visible = false
	if end_panel:
		end_label.text = "试炼完成\n三名禁卫已全部击倒" if success else "战败\n重整旗鼓，再战一次"
		end_panel.visible = true

func reset_trial() -> void:
	ended = false
	won = false
	elapsed = 0
	defeated = 0
	zone_left = 0
	hero.reset_unit(Vector3(0, 0.025, 4))
	for i in range(enemies.size()):
		enemies[i].reset_unit(spawn_points[i])
	for fx in effects:
		fx.node.queue_free()
	effects.clear()
	landing.visible = false
	end_panel.visible = false
	damage_overlay.color.a = 0

func mat(color: Color, metallic := 0.0, glow := 0.0) -> StandardMaterial3D:
	var material := StandardMaterial3D.new()
	material.albedo_color = color
	material.metallic = metallic
	material.roughness = 0.82 if metallic < 0.1 else 0.35
	if glow > 0:
		material.emission_enabled = true
		material.emission = color
		material.emission_energy_multiplier = glow
	return material

func make_ring(color: Color, radius := 1.0) -> MeshInstance3D:
	var mesh := MeshInstance3D.new()
	var torus := TorusMesh.new()
	torus.inner_radius = 0.97 * radius
	torus.outer_radius = radius
	torus.rings = 48
	torus.ring_segments = 6
	mesh.mesh = torus
	var material := mat(color, 0, 0.7)
	material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	mesh.material_override = material
	add_child(mesh)
	mesh.scale.y = 0.12
	return mesh

func make_sector(radius: float, half_angle: float, color: Color) -> MeshInstance3D:
	var vertices := PackedVector3Array()
	for i in range(28):
		var a := -half_angle + i / 28.0 * half_angle * 2
		var b := -half_angle + (i + 1) / 28.0 * half_angle * 2
		vertices.append_array([Vector3.ZERO, Vector3(sin(a) * radius, 0, -cos(a) * radius), Vector3(sin(b) * radius, 0, -cos(b) * radius)])
	var arrays := []
	arrays.resize(Mesh.ARRAY_MAX)
	arrays[Mesh.ARRAY_VERTEX] = vertices
	var geometry := ArrayMesh.new()
	geometry.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, arrays)
	var mesh := MeshInstance3D.new()
	mesh.mesh = geometry
	var material := mat(color, 0, 0.5)
	material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	material.cull_mode = BaseMaterial3D.CULL_DISABLED
	material.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	mesh.material_override = material
	add_child(mesh)
	return mesh

func show_shield(unit: CharacterBody3D) -> void:
	var ring := make_ring(Color("ad8bff"), 0.8)
	ring.position = unit.position + Vector3(0, 0.15, 0)
	effects.append({"node": ring, "life": 0.5, "duration": 0.5, "grow": 1.8, "velocity": Vector3.ZERO})

func show_landing_target(point: Vector3) -> void:
	landing.position = point + Vector3(0, 0.1, 0)
	landing.visible = true

func impact(point: Vector3, radius: float) -> void:
	landing.visible = false
	zone_position = point
	zone_left = 4
	zone_ring.position = point + Vector3(0, 0.11, 0)
	var circle := make_ring(Color("e4b7ff"), radius)
	circle.position = point + Vector3(0, 0.12, 0)
	effects.append({"node": circle, "life": 0.45, "duration": 0.45, "grow": 0.6, "velocity": Vector3.ZERO})
	for i in range(16):
		var angle := i / 16.0 * TAU
		var shard := MeshInstance3D.new()
		var geometry := PrismMesh.new()
		geometry.size = Vector3(0.1, 0.5, 0.1)
		shard.mesh = geometry
		shard.material_override = mat(Color("d58bff"), 0, 1)
		shard.position = point + Vector3(0, 0.15, 0)
		add_child(shard)
		effects.append({"node": shard, "life": 0.6, "duration": 0.6, "grow": -0.7, "velocity": Vector3(sin(angle) * 4, 2.5, cos(angle) * 4)})

func slash(point: Vector3, forward: Vector3, reach: float, half_angle: float, skill: bool, hostile := false) -> void:
	var color := Color(0.8, 0.35, 1.0, 0.6) if skill else Color(1.0, 0.79, 0.45, 0.5)
	if hostile:
		color = Color(1, 0.22, 0.12, 0.5)
	var mesh := make_sector(reach, half_angle, color)
	mesh.position = point + Vector3(0, 0.8, 0)
	mesh.rotation.y = atan2(-forward.x, -forward.z)
	effects.append({"node": mesh, "life": 0.18, "duration": 0.18, "grow": 0.4, "velocity": Vector3.ZERO})

func damage_number(point: Vector3, amount: float, absorbed: float) -> void:
	var label := Label3D.new()
	label.text = "−%d" % int(amount) if amount > 0 else "吸收 %d" % int(absorbed)
	label.position = point
	label.font_size = 72
	label.pixel_size = 0.005
	label.modulate = Color("f6cf80") if amount > 0 else Color("bfa5ff")
	label.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	add_child(label)
	effects.append({"node": label, "life": 0.7, "duration": 0.7, "grow": 0.0, "velocity": Vector3(0, 1.4, 0)})

func flash_damage() -> void:
	if damage_overlay:
		damage_overlay.color.a = 0.18

func update_effects(delta: float) -> void:
	for i in range(effects.size() - 1, -1, -1):
		var fx := effects[i]
		fx.life -= delta
		fx.node.position += fx.velocity * delta
		if fx.node is Label3D:
			fx.node.modulate.a = maxf(0, fx.life / fx.duration)
		else:
			fx.node.scale = Vector3.ONE * maxf(0.01, 1 + fx.grow * (1 - fx.life / fx.duration))
		if fx.life <= 0:
			fx.node.queue_free()
			effects.remove_at(i)

func build_ui() -> void:
	var layer := CanvasLayer.new()
	add_child(layer)
	var ui := Control.new()
	ui.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	ui.mouse_filter = Control.MOUSE_FILTER_IGNORE
	layer.add_child(ui)
	damage_overlay = ColorRect.new()
	damage_overlay.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	damage_overlay.color = Color(0.8, 0.1, 0.1, 0)
	damage_overlay.mouse_filter = Control.MOUSE_FILTER_IGNORE
	ui.add_child(damage_overlay)
	var title := Label.new()
	title.position = Vector2(28, 20)
	title.text = "CHIXIAO  /  赤霄 · 重戟战将"
	title.add_theme_font_size_override("font_size", 26)
	title.modulate = Color("eed9ad")
	ui.add_child(title)
	health_bar = ProgressBar.new()
	health_bar.position = Vector2(30, 62)
	health_bar.size = Vector2(255, 18)
	health_bar.max_value = 240
	health_bar.value = 240
	health_bar.show_percentage = false
	var fill := StyleBoxFlat.new()
	fill.bg_color = Color("b83e42")
	fill.set_corner_radius_all(4)
	health_bar.add_theme_stylebox_override("fill", fill)
	ui.add_child(health_bar)
	health_label = Label.new()
	health_label.position = Vector2(300, 57)
	ui.add_child(health_label)
	shield_label = Label.new()
	shield_label.position = Vector2(30, 85)
	shield_label.modulate = Color("bba0ef")
	ui.add_child(shield_label)
	objective = Label.new()
	objective.position = Vector2(30, 114)
	ui.add_child(objective)
	var skills := HBoxContainer.new()
	skills.set_anchors_and_offsets_preset(Control.PRESET_BOTTOM_RIGHT)
	skills.position = Vector2(-385, -108)
	skills.add_theme_constant_override("separation", 12)
	ui.add_child(skills)
	for key in ["Q", "E", "R"]:
		var button := Button.new()
		button.custom_minimum_size = Vector2(105, 76)
		button.pressed.connect(func(): hero.request_skill(key, hero.aim_point))
		skills.add_child(button)
		skill_buttons[key] = button
	var controls := Label.new()
	controls.set_anchors_and_offsets_preset(Control.PRESET_BOTTOM_LEFT)
	controls.position = Vector2(30, -70)
	controls.text = "WASD 移动 · Shift 奔跑 · 鼠标瞄准\n左键 / J 三普攻 · Q 横扫 · E 护盾 · R 指针跳劈 · T 重置"
	controls.add_theme_font_size_override("font_size", 16)
	controls.modulate = Color("d4cbb9")
	ui.add_child(controls)
	var restart := Button.new()
	restart.text = "重置试炼 · T"
	restart.position = Vector2(1080, 24)
	restart.pressed.connect(reset_trial)
	ui.add_child(restart)
	end_panel = PanelContainer.new()
	end_panel.set_anchors_and_offsets_preset(Control.PRESET_CENTER)
	end_panel.position -= Vector2(210, 90)
	end_panel.custom_minimum_size = Vector2(420, 180)
	var panel := StyleBoxFlat.new()
	panel.bg_color = Color(0.07, 0.055, 0.08, 0.95)
	panel.border_color = Color("bca36d")
	panel.set_border_width_all(2)
	panel.set_content_margin_all(24)
	end_panel.add_theme_stylebox_override("panel", panel)
	ui.add_child(end_panel)
	var column := VBoxContainer.new()
	column.add_theme_constant_override("separation", 20)
	end_panel.add_child(column)
	end_label = Label.new()
	end_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	end_label.add_theme_font_size_override("font_size", 26)
	column.add_child(end_label)
	var again := Button.new()
	again.text = "再次挑战"
	again.pressed.connect(reset_trial)
	column.add_child(again)
	end_panel.visible = false

func box_at(pos: Vector3, size: Vector3, material: Material, collision := false) -> MeshInstance3D:
	var mesh := MeshInstance3D.new()
	var geometry := BoxMesh.new()
	geometry.size = size
	mesh.mesh = geometry
	mesh.material_override = material
	mesh.position = pos
	add_child(mesh)
	if collision:
		var body := StaticBody3D.new()
		var shape := CollisionShape3D.new()
		var box := BoxShape3D.new()
		box.size = size
		shape.shape = box
		body.add_child(shape)
		mesh.add_child(body)
	return mesh

func cylinder_at(pos: Vector3, radius: float, height: float, material: Material) -> MeshInstance3D:
	var mesh := MeshInstance3D.new()
	var geometry := CylinderMesh.new()
	geometry.top_radius = radius
	geometry.bottom_radius = radius
	geometry.height = height
	geometry.radial_segments = 32
	mesh.mesh = geometry
	mesh.material_override = material
	mesh.position = pos
	add_child(mesh)
	return mesh

func build_environment() -> void:
	var world := WorldEnvironment.new()
	var environment := Environment.new()
	var sky := Sky.new()
	var sky_material := ProceduralSkyMaterial.new()
	sky_material.sky_top_color = Color("192b42")
	sky_material.sky_horizon_color = Color("b88a66")
	sky_material.ground_bottom_color = Color("192422")
	sky_material.ground_horizon_color = Color("645d51")
	sky.sky_material = sky_material
	environment.background_mode = Environment.BG_SKY
	environment.sky = sky
	environment.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	environment.ambient_light_color = Color("a3b8ce")
	environment.ambient_light_energy = 0.65
	environment.tonemap_mode = Environment.TONE_MAPPER_FILMIC
	environment.fog_enabled = true
	environment.fog_light_color = Color("67716a")
	environment.fog_density = 0.008
	world.environment = environment
	add_child(world)
	var sun := DirectionalLight3D.new()
	sun.rotation_degrees = Vector3(-36, -32, 0)
	sun.light_color = Color("ffdab0")
	sun.light_energy = 1.5
	sun.shadow_enabled = true
	sun.directional_shadow_max_distance = 45
	add_child(sun)

func build_floor() -> void:
	box_at(Vector3(0, -0.35, 0), Vector3(25, 0.7, 25), mat(Color("424a43")), true)
	var stone := [mat(Color("7a7a65")), mat(Color("72745f")), mat(Color("81806a")), mat(Color("686f5e"))]
	for x in range(-4, 5):
		for z in range(-4, 5):
			box_at(Vector3(x * 2.1, -0.035, z * 2.1), Vector3(2.03, 0.1, 2.03), stone[posmod(x * 3 + z, 4)])
	cylinder_at(Vector3(0, 0.035, 0), 3.1, 0.06, mat(Color("8e8b70")))
	for r in [2.8, 6.8, 9.8]:
		var ring := make_ring(Color("bca974"))
		ring.position.y = 0.08
		ring.scale = Vector3(r, 0.1, r)

func build_ruins() -> void:
	var limestone := mat(Color("8c8870"))
	var shade := mat(Color("5b6554"))
	var trim := mat(Color("bfa574"), 0.4)
	for i in range(10):
		var angle := i / 10.0 * TAU
		var pos := Vector3(sin(angle) * 10, 0, cos(angle) * 10)
		var height := 2.0 + (i % 3) * 0.7
		box_at(pos + Vector3(0, height / 2, 0), Vector3(0.9, height, 0.9), limestone, true)
		box_at(pos + Vector3(0, 0.15, 0), Vector3(1.3, 0.3, 1.3), shade)
		box_at(pos + Vector3(0, height, 0), Vector3(1.15, 0.18, 1.15), trim)
		if i % 2 == 0:
			box_at(pos + Vector3(0.7, 0.22, 0.8), Vector3(0.65, 0.44, 0.8), shade)
	for i in range(32):
		var angle := i * 2.399963
		var radius := 7.5 + (i % 4) * 0.8
		var pos := Vector3(sin(angle) * radius, 0.18, cos(angle) * radius)
		var rock := box_at(pos, Vector3(0.25 + i % 3 * 0.16, 0.3, 0.4), shade)
		rock.rotation_degrees.y = i * 37
