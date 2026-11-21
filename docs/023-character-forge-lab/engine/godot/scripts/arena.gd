extends Node3D

const HeroController = preload("res://scripts/hero_controller.gd")
var player: CharacterBody3D
var camera: Camera3D
var crystals: Array[Dictionary] = []
var waves: Array[Dictionary] = []
var effects: Array[Dictionary] = []
var won := false
var ended := false
var elapsed := 0.0
var destroyed := 0
var camera_yaw := 0.55
var camera_pitch := 0.55
var camera_distance := 7.5
var target_yaw := 0.55
var health_bar: ProgressBar
var stamina_bar: ProgressBar
var objective: Label
var toast: Label
var damage_overlay: ColorRect
var end_panel: PanelContainer
var end_title: Label

func _ready() -> void:
	configure_input()
	build_environment()
	build_floor()
	build_ruins()
	player = HeroController.new()
	player.arena = self
	add_child(player)
	player.position = Vector3(0, 0.05, 4)
	camera = Camera3D.new()
	camera.fov = 52
	camera.current = true
	camera.position = player.position + Vector3(4, 4.5, 6)
	add_child(camera)
	for i in range(3):
		build_crystal([Vector3(-4, 0, -1), Vector3(0, 0, -5), Vector3(4, 0, -1)][i], i)
	build_ui()
	print("EMBERFALL_READY bones_and_animations=%s" % str(player.available))

func configure_input() -> void:
	var bindings := {"move_forward": KEY_W, "move_back": KEY_S, "move_left": KEY_A, "move_right": KEY_D, "run": KEY_SHIFT, "block": KEY_K}
	for action in bindings:
		if not InputMap.has_action(action):
			InputMap.add_action(action)
		var event := InputEventKey.new()
		event.physical_keycode = bindings[action]
		InputMap.action_add_event(action, event)
	var block_mouse := InputEventMouseButton.new()
	block_mouse.button_index = MOUSE_BUTTON_RIGHT
	InputMap.action_add_event("block", block_mouse)

func mat(color: Color, metallic := 0.0, glow := 0.0) -> StandardMaterial3D:
	var material := StandardMaterial3D.new()
	material.albedo_color = color
	material.metallic = metallic
	material.roughness = 0.78 if metallic < 0.1 else 0.35
	if glow > 0:
		material.emission_enabled = true
		material.emission = color
		material.emission_energy_multiplier = glow
	return material

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

func make_ring(color: Color) -> MeshInstance3D:
	var mesh := MeshInstance3D.new()
	var ring := TorusMesh.new()
	ring.inner_radius = 0.97
	ring.outer_radius = 1.0
	ring.rings = 32
	ring.ring_segments = 8
	mesh.mesh = ring
	var material := mat(color, 0, 1)
	material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	mesh.material_override = material
	add_child(mesh)
	return mesh

func crystal_geometry() -> ArrayMesh:
	var v := [Vector3(0, 1.6, 0), Vector3(0, -0.25, 0), Vector3(-0.45, 0.5, 0), Vector3(0.45, 0.5, 0), Vector3(0, 0.5, -0.45), Vector3(0, 0.5, 0.45)]
	var faces := [[0, 2, 4], [0, 4, 3], [0, 3, 5], [0, 5, 2], [1, 4, 2], [1, 3, 4], [1, 5, 3], [1, 2, 5]]
	var vertices := PackedVector3Array()
	var normals := PackedVector3Array()
	for face in faces:
		var normal: Vector3 = (v[face[1]] - v[face[0]]).cross(v[face[2]] - v[face[0]]).normalized()
		for index in face:
			vertices.append(v[index])
			normals.append(normal)
	var arrays := []
	arrays.resize(Mesh.ARRAY_MAX)
	arrays[Mesh.ARRAY_VERTEX] = vertices
	arrays[Mesh.ARRAY_NORMAL] = normals
	var mesh := ArrayMesh.new()
	mesh.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, arrays)
	return mesh

func build_crystal(pos: Vector3, index: int) -> void:
	var pedestal := cylinder_at(pos + Vector3(0, 0.15, 0), 0.8, 0.3, mat(Color("474d49"), 0.15))
	var mesh := MeshInstance3D.new()
	mesh.name = "Crystal%d" % (index + 1)
	mesh.mesh = crystal_geometry()
	mesh.material_override = mat(Color("5ce6c7"), 0.35, 1.2)
	mesh.position = pos + Vector3(0, 0.65, 0)
	add_child(mesh)
	var label := Label3D.new()
	label.text = "水晶 %d · 100" % (index + 1)
	label.position = pos + Vector3(0, 2.7, 0)
	label.font_size = 38
	label.pixel_size = 0.006
	label.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	add_child(label)
	var warning := make_ring(Color("ff7766"))
	warning.position = pos + Vector3(0, 0.12, 0)
	warning.visible = false
	crystals.append({"mesh": mesh, "label": label, "pedestal": pedestal, "warning": warning, "position": pos, "health": 100.0, "cooldown": 2.7 + index * 1.7, "warning_left": 0.0, "index": index, "flash": 0.0})

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed and not event.echo:
		if event.physical_keycode == KEY_R:
			reset_trial()
		elif event.physical_keycode == KEY_SPACE:
			player.request_dodge()
		elif event.physical_keycode == KEY_J:
			player.request_attack()
		elif event.physical_keycode == KEY_ESCAPE:
			Input.mouse_mode = Input.MOUSE_MODE_VISIBLE
	if event is InputEventMouseButton and event.pressed:
		if event.button_index == MOUSE_BUTTON_LEFT:
			player.request_attack()
		elif event.button_index == MOUSE_BUTTON_WHEEL_UP:
			camera_distance = maxf(4.8, camera_distance - 0.5)
		elif event.button_index == MOUSE_BUTTON_WHEEL_DOWN:
			camera_distance = minf(11, camera_distance + 0.5)
	if event is InputEventMouseMotion and event.button_mask & MOUSE_BUTTON_MASK_MIDDLE:
		target_yaw -= event.relative.x * 0.005
		camera_pitch = clampf(camera_pitch + event.relative.y * 0.003, 0.25, 0.95)

func _physics_process(delta: float) -> void:
	elapsed += delta
	if camera and player:
		camera_yaw = lerp_angle(camera_yaw, target_yaw, minf(1, delta * 8))
		var offset := Vector3(sin(camera_yaw) * cos(camera_pitch), sin(camera_pitch), cos(camera_yaw) * cos(camera_pitch)) * camera_distance
		var target := player.position + Vector3(0, 1.0, 0)
		camera.position = camera.position.lerp(target + offset, minf(1, delta * 7))
		camera.look_at(target)
	if not ended:
		update_crystals(delta)
	update_waves(delta)
	update_effects(delta)
	if health_bar:
		health_bar.value = player.health
		stamina_bar.value = player.stamina
		objective.text = "水晶击破  %d / 3     ·     %.1f 秒" % [destroyed, elapsed]
		damage_overlay.color.a = move_toward(damage_overlay.color.a, 0, delta * 1.3)

func update_crystals(delta: float) -> void:
	for crystal in crystals:
		if crystal.health <= 0:
			continue
		crystal.mesh.position.y = 0.65 + sin(elapsed * 1.8 + crystal.index) * 0.08
		crystal.mesh.rotation.y += delta * 0.28
		crystal.flash = maxf(0, crystal.flash - delta)
		crystal.mesh.material_override.albedo_color = Color("fff2ce") if crystal.flash > 0 else Color("5ce6c7")
		if crystal.warning_left > 0:
			crystal.warning_left -= delta
			crystal.warning.scale = Vector3.ONE * (0.9 + (0.9 - crystal.warning_left) * 1.6)
			crystal.warning.scale.y = 0.08
			if crystal.warning_left <= 0:
				crystal.warning.visible = false
				spawn_wave(crystal.position)
				crystal.cooldown = 4.2 + crystal.index * 0.45
		else:
			crystal.cooldown -= delta
			if crystal.cooldown <= 0:
				crystal.warning_left = 0.9
				crystal.warning.visible = true

func spawn_wave(pos: Vector3) -> void:
	var ring := make_ring(Color("ff9b70"))
	ring.position = pos + Vector3(0, 0.14, 0)
	waves.append({"mesh": ring, "position": pos, "radius": 0.6, "hit": false})

func update_waves(delta: float) -> void:
	for index in range(waves.size() - 1, -1, -1):
		var wave := waves[index]
		wave.radius += delta * 4.5
		wave.mesh.scale = Vector3(wave.radius, 0.1, wave.radius)
		var distance := Vector2(player.position.x - wave.position.x, player.position.z - wave.position.z).length()
		if not wave.hit and absf(distance - wave.radius) < 0.4:
			wave.hit = true
			player.take_damage(17.0)
		if wave.radius > 8.5:
			wave.mesh.queue_free()
			waves.remove_at(index)

func apply_melee(attacker: CharacterBody3D, damage: float) -> void:
	var forward := -attacker.global_basis.z
	spawn_arc(attacker.position + Vector3(0, 1.0, 0), attacker.rotation.y)
	for crystal in crystals:
		if crystal.health <= 0:
			continue
		var offset: Vector3 = crystal.position - attacker.position
		offset.y = 0
		if offset.length() <= 2.35 and (offset.length() < 0.5 or forward.dot(offset.normalized()) > 0.25):
			damage_crystal(crystal, damage)

func damage_crystal(crystal: Dictionary, amount: float) -> void:
	crystal.health = maxf(0, crystal.health - amount)
	crystal.flash = 0.15
	crystal.label.text = "水晶 %d · %d" % [crystal.index + 1, int(crystal.health)]
	var text := Label3D.new()
	text.text = "−%d" % int(amount)
	text.position = crystal.position + Vector3(0, 2, 0)
	text.font_size = 72
	text.pixel_size = 0.007
	text.modulate = Color("ffe3a6")
	text.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	add_child(text)
	effects.append({"node": text, "life": 0.8, "max_life": 0.8, "velocity": Vector3(0, 1.0, 0)})
	if crystal.health <= 0:
		crystal.mesh.visible = false
		crystal.label.text = "已净化"
		crystal.warning.visible = false
		crystal.warning_left = 0.0
		destroyed += 1
		for i in range(12):
			var fragment := MeshInstance3D.new()
			var shard := PrismMesh.new()
			shard.size = Vector3(0.12, 0.32, 0.12)
			fragment.mesh = shard
			fragment.material_override = mat(Color("78efd1"), 0.3, 2)
			fragment.position = crystal.position + Vector3(0, 1.2, 0)
			add_child(fragment)
			var angle := i / 12.0 * TAU
			effects.append({"node": fragment, "life": 0.85, "max_life": 0.85, "velocity": Vector3(sin(angle) * 2.5, 1.8 + i % 3 * 0.3, cos(angle) * 2.5)})
		if destroyed == 3:
			finish(true)

func spawn_arc(pos: Vector3, yaw: float) -> void:
	var vertices := PackedVector3Array()
	for i in range(20):
		var a := -1.2 + i / 20.0 * 2.4
		var b := -1.2 + (i + 1) / 20.0 * 2.4
		for p in [Vector3(sin(a) * 1.2, 0, -cos(a) * 1.2), Vector3(sin(a) * 1.75, 0.04, -cos(a) * 1.75), Vector3(sin(b) * 1.75, 0.04, -cos(b) * 1.75), Vector3(sin(a) * 1.2, 0, -cos(a) * 1.2), Vector3(sin(b) * 1.75, 0.04, -cos(b) * 1.75), Vector3(sin(b) * 1.2, 0, -cos(b) * 1.2)]:
			vertices.append(p)
	var arrays := []
	arrays.resize(Mesh.ARRAY_MAX)
	arrays[Mesh.ARRAY_VERTEX] = vertices
	var geometry := ArrayMesh.new()
	geometry.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, arrays)
	var mesh := MeshInstance3D.new()
	mesh.mesh = geometry
	var material := mat(Color(0.7, 1, 0.91, 0.7), 0, 2)
	material.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	material.cull_mode = BaseMaterial3D.CULL_DISABLED
	mesh.material_override = material
	mesh.position = pos
	mesh.rotation.y = yaw
	add_child(mesh)
	effects.append({"node": mesh, "life": 0.16, "max_life": 0.16, "velocity": Vector3.ZERO})

func update_effects(delta: float) -> void:
	for index in range(effects.size() - 1, -1, -1):
		var fx := effects[index]
		fx.life -= delta
		fx.node.position += fx.velocity * delta
		if fx.node is Label3D:
			fx.node.modulate.a = maxf(0, fx.life / fx.max_life)
		else:
			fx.node.scale = Vector3.ONE * maxf(0.01, fx.life / fx.max_life)
		if fx.life <= 0:
			fx.node.queue_free()
			effects.remove_at(index)

func flash_screen() -> void:
	if damage_overlay:
		damage_overlay.color.a = 0.23

func build_ui() -> void:
	var layer := CanvasLayer.new()
	add_child(layer)
	var root := Control.new()
	root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	root.mouse_filter = Control.MOUSE_FILTER_IGNORE
	layer.add_child(root)
	damage_overlay = ColorRect.new()
	damage_overlay.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	damage_overlay.color = Color(0.8, 0.18, 0.12, 0)
	damage_overlay.mouse_filter = Control.MOUSE_FILTER_IGNORE
	root.add_child(damage_overlay)
	var title := Label.new()
	title.position = Vector2(30, 24)
	title.text = "EMBERFALL  /  遗迹试炼"
	title.add_theme_font_size_override("font_size", 26)
	title.modulate = Color("f2e5c7")
	root.add_child(title)
	objective = Label.new()
	objective.position = Vector2(30, 62)
	objective.add_theme_font_size_override("font_size", 17)
	root.add_child(objective)
	health_bar = make_bar(root, Vector2(30, 100), Color("df735c"))
	stamina_bar = make_bar(root, Vector2(30, 124), Color("8dc5aa"))
	var status := Label.new()
	status.position = Vector2(278, 98)
	status.text = "生命\n体力"
	status.add_theme_font_size_override("font_size", 15)
	root.add_child(status)
	toast = Label.new()
	toast.set_anchors_and_offsets_preset(Control.PRESET_BOTTOM_WIDE)
	toast.offset_top = -70
	toast.offset_left = 30
	toast.text = "WASD 移动  ·  Shift 奔跑  ·  左键 / J 三连击  ·  空格闪避  ·  右键 / K 格挡  ·  R 重置\n水晶闪红后会放出冲击波。闪避有无敌帧；用格挡可降低伤害。中键拖动调整视角，滚轮缩放。"
	toast.add_theme_font_size_override("font_size", 16)
	toast.modulate = Color("ebeadb")
	root.add_child(toast)
	end_panel = PanelContainer.new()
	end_panel.set_anchors_and_offsets_preset(Control.PRESET_CENTER)
	end_panel.position -= Vector2(230, 100)
	end_panel.custom_minimum_size = Vector2(460, 200)
	var style := StyleBoxFlat.new()
	style.bg_color = Color(0.06, 0.12, 0.12, 0.96)
	style.border_color = Color("c7ac6b")
	style.set_border_width_all(2)
	style.set_content_margin_all(28)
	end_panel.add_theme_stylebox_override("panel", style)
	root.add_child(end_panel)
	var content := VBoxContainer.new()
	content.add_theme_constant_override("separation", 20)
	end_panel.add_child(content)
	end_title = Label.new()
	end_title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	end_title.add_theme_font_size_override("font_size", 28)
	content.add_child(end_title)
	var restart := Button.new()
	restart.text = "重新试炼  ·  R"
	restart.pressed.connect(reset_trial)
	content.add_child(restart)
	end_panel.visible = false

func make_bar(root: Control, pos: Vector2, color: Color) -> ProgressBar:
	var bar := ProgressBar.new()
	bar.position = pos
	bar.size = Vector2(230, 16)
	bar.show_percentage = false
	bar.value = 100
	var background := StyleBoxFlat.new()
	background.bg_color = Color(0.05, 0.08, 0.1, 0.8)
	background.set_corner_radius_all(4)
	var fill := StyleBoxFlat.new()
	fill.bg_color = color
	fill.set_corner_radius_all(4)
	bar.add_theme_stylebox_override("background", background)
	bar.add_theme_stylebox_override("fill", fill)
	root.add_child(bar)
	return bar

func finish(success: bool) -> void:
	if ended:
		return
	ended = true
	won = success
	if success:
		player.victory()
	if end_title:
		end_title.text = "试炼完成  /  %.1f 秒" % elapsed if success else "试炼结束  /  再试一次"
		end_panel.visible = true

func reset_trial() -> void:
	won = false
	ended = false
	elapsed = 0
	destroyed = 0
	for wave in waves:
		wave.mesh.queue_free()
	waves.clear()
	for fx in effects:
		fx.node.queue_free()
	effects.clear()
	for crystal in crystals:
		crystal.health = 100.0
		crystal.cooldown = 2.7 + crystal.index * 1.7
		crystal.warning_left = 0.0
		crystal.warning.visible = false
		crystal.mesh.visible = true
		crystal.label.text = "水晶 %d · 100" % (crystal.index + 1)
	player.reset_player()
	end_panel.visible = false
	damage_overlay.color.a = 0
