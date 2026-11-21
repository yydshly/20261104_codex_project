extends CharacterBody3D

const SecondaryConstraints = preload("res://scripts/secondary_constraints.gd")

const ATTACKS = [
	{"duration": 0.72, "hit": 0.23, "active_end": 0.31, "lunge": 0.22, "step_start": 0.12, "step_end": 0.30, "damage": 22.0, "reach": 2.75, "half_angle": 0.58},
	{"duration": 0.82, "hit": 0.30, "active_end": 0.39, "lunge": 0.32, "step_start": 0.14, "step_end": 0.33, "damage": 26.0, "reach": 2.9, "half_angle": 0.82},
	{"duration": 1.00, "hit": 0.40, "active_end": 0.50, "lunge": 0.42, "step_start": 0.22, "step_end": 0.42, "damage": 38.0, "reach": 3.0, "half_angle": 1.05}
]
var arena: Node3D
var enemy := false
var unit_index := 0
var model: Node3D
var animator: AnimationPlayer
var secondary: SkeletonModifier3D
var played := ""
var health := 240.0
var max_health := 240.0
var shield := 0.0
var shield_left := 0.0
var stamina := 100.0
var last_spent := 0.0
var empowered_left := 0.0
var invincible_left := 0.0
var slow_left := 0.0
var cooldowns := {"Q": 0.0, "E": 0.0, "R": 0.0, "Dodge": 0.0}
var action := ""
var action_elapsed := 0.0
var action_duration := 0.0
var action_hit := false
var action_hits := {}
var action_origin := Vector3.ZERO
var action_forward := Vector3.FORWARD
var action_target := Vector3.ZERO
var attack_buffer := false
var combo := 0
var combo_grace := 0.0
var dead := false
var stagger_left := 0.0
var air_left := 0.0
var knock_velocity := Vector3.ZERO
var aim_point := Vector3(0, 0, -3)
var test_mode := false
var test_movement := Vector3.ZERO
var test_running := false
var ai_state := "chase"
var ai_enabled := true
var ai_left := 0.0
var warning: MeshInstance3D
var health_label: Label3D
var material_flash := 0.0
var grounded_y := 0.025

func _ready() -> void:
	max_health = 140.0 if enemy else 240.0
	health = max_health
	var shape := CollisionShape3D.new()
	var capsule := CapsuleShape3D.new()
	capsule.radius = 0.43 if enemy else 0.4
	capsule.height = 2.0
	shape.shape = capsule
	shape.position.y = 1.0
	add_child(shape)
	var packed := load("res://assets/warlord.glb") as PackedScene
	if not packed:
		push_error("warlord.glb is missing or failed import")
		return
	model = packed.instantiate()
	model.name = "WarlordModel"
	model.rotation.y = PI # asset +Z forward -> Godot gameplay -Z forward
	if enemy:
		model.scale = Vector3.ONE * 0.94
	add_child(model)
	if enemy:
		for part in model.find_children("*", "MeshInstance3D", true, false):
			if part.mesh:
				for surface in range(part.mesh.get_surface_count()):
					var original: StandardMaterial3D = part.mesh.surface_get_material(surface) as StandardMaterial3D
					if original:
						var tinted: StandardMaterial3D = original.duplicate()
						tinted.albedo_color *= Color(0.72, 0.79, 0.91, 1)
						part.set_surface_override_material(surface, tinted)
	animator = find_animator(model)
	if animator:
		for clip in animator.get_animation_list():
			animator.get_animation(clip).loop_mode = Animation.LOOP_LINEAR if String(clip) in ["Idle", "Walk", "Run"] else Animation.LOOP_NONE
	play_clip("Idle")
	var skeletons := model.find_children("*", "Skeleton3D", true, false)
	if not skeletons.is_empty():
		secondary = SecondaryConstraints.new()
		secondary.name = "WarlordPostAnimationConstraints"
		secondary.configure(self, Callable(self, "secondary_state"))
		skeletons[0].add_child(secondary)
	if enemy:
		warning = arena.make_sector(1.65, 0.9, Color(1, 0.2, 0.12, 0.35))
		warning.visible = false
		health_label = Label3D.new()
		health_label.font_size = 40
		health_label.pixel_size = 0.005
		health_label.billboard = BaseMaterial3D.BILLBOARD_ENABLED
		health_label.modulate = Color("ffbd9b")
		add_child(health_label)
		health_label.position.y = 2.45
		var marker: MeshInstance3D = arena.make_ring(Color("bd574a"), 0.55)
		marker.position = position + Vector3(0, 0.025, 0)
		marker.name = "EnemyMarker"
		set_meta("marker", marker)

func find_animator(node: Node) -> AnimationPlayer:
	if node is AnimationPlayer:
		return node
	for child in node.get_children():
		var found := find_animator(child)
		if found:
			return found
	return null

func resolve_clip(name_in: String) -> String:
	var aliases := {"Cleave": "Sweep", "GuardCast": "Guard", "Leap": "LeapSlam", "Victory": "Idle", "Dodge": "Run"}
	if animator and animator.has_animation(name_in):
		return name_in
	return aliases.get(name_in, "Idle")

func play_clip(name_in: String, force := false, duration := 0.0) -> void:
	var clip := resolve_clip(name_in)
	var loop_rate := 1.0
	if name_in in ["Walk", "Run"] and duration <= 0:
		var movement := get_real_velocity()
		movement.y = 0
		var travel_speed := movement.length()
		if travel_speed < 0.01:
			travel_speed = Vector2(velocity.x, velocity.z).length()
		clip = resolve_clip("Run" if travel_speed > 2.0 else "Walk")
		# Same measured authored stride rates as the browser controller.
		loop_rate = clampf(travel_speed / (3.28921 if clip == "Run" else 1.37822), 0.15, 1.8)
	if animator:
		animator.speed_scale = loop_rate
	if animator and animator.has_animation(clip) and (played != clip or force):
		var speed := animator.get_animation(clip).length / duration if duration > 0 else 1.0
		animator.play(clip, 0.08, speed)
		played = clip

func secondary_state() -> Dictionary:
	var current_action := action if not action.is_empty() else played
	var time := action_elapsed if not action.is_empty() else animator.current_animation_position if animator and not animator.current_animation.is_empty() else 0.0
	var in_flight := air_left > 0 or current_action == "Leap" and time >= 0.18 and time < 0.92
	if air_left > 0:
		current_action = "Airborne"
	return {"action": current_action, "actionTime": time, "grounded": is_on_floor() and not in_flight}

func move_direction() -> Vector3:
	if test_mode:
		return test_movement.limit_length(1)
	var input := Input.get_vector("left", "right", "forward", "back")
	return Vector3(input.x, 0, input.y).limit_length(1)

func set_facing(target: Vector3) -> void:
	var delta := target - position
	delta.y = 0
	if delta.length_squared() > 0.0001:
		rotation.y = atan2(-delta.x, -delta.z)

func start_action(kind: String, duration: float) -> void:
	action = kind
	action_duration = duration
	action_elapsed = 0
	action_hit = false
	action_hits.clear()
	action_origin = position
	action_forward = -global_basis.z
	play_clip(kind, true, duration)

func request_attack() -> bool:
	if dead or arena.ended or stagger_left > 0 or air_left > 0:
		return false
	if action.begins_with("Attack"):
		if action_elapsed >= 0.14 and action_elapsed < action_duration - 0.025:
			attack_buffer = true
		return false
	if action == "GuardCast":
		action = ""
	if action != "":
		return false
	if stamina < 3:
		return false
	stamina -= 3
	last_spent = arena.elapsed
	set_facing(aim_point)
	combo = combo % 3 + 1 if combo_grace > 0 else 1
	start_action("Attack%d" % combo, ATTACKS[combo - 1].duration)
	return true

func request_skill(key: String, target: Vector3 = Vector3.ZERO) -> bool:
	if dead or arena.ended or stagger_left > 0 or air_left > 0 or not cooldowns.has(key) or cooldowns[key] > 0:
		return false
	if key == "E":
		shield = 90.0
		var nearby := 0
		for guard in arena.enemies:
			if not guard.dead and Vector2(guard.position.x - position.x, guard.position.z - position.z).length() <= 3.5:
				nearby += 1
				guard.slow_left = 1.4
		shield += mini(2, maxi(0, nearby - 1)) * 20
		shield_left = 4.0
		cooldowns.E = 6.0
		if action == "":
			start_action("GuardCast", 0.32)
		arena.show_shield(self)
		return true
	if action == "GuardCast":
		action = ""
	if action != "":
		return false
	set_facing(aim_point)
	if key == "Q":
		if stamina < 12:
			return false
		stamina -= 12
		last_spent = arena.elapsed
		cooldowns.Q = 4.8
		start_action("Cleave", 1.08)
		return true
	if key == "R":
		if stamina < 20:
			return false
		stamina -= 20
		last_spent = arena.elapsed
		cooldowns.R = 9.0
		var offset := target - position
		offset.y = 0
		action_target = position + offset.limit_length(5.5)
		action_target.x = clampf(action_target.x, -9.5, 9.5)
		action_target.z = clampf(action_target.z, -9.5, 9.5)
		action_target.y = grounded_y
		start_action("Leap", 1.28)
		arena.show_landing_target(action_target)
		return true
	return false

func request_dodge() -> bool:
	if dead or arena.ended or stamina < 20 or cooldowns.Dodge > 0 or action in ["Leap", "Dodge"]:
		return false
	if action != "" and action_elapsed < 0.5:
		return false
	stamina -= 20
	last_spent = arena.elapsed
	cooldowns.Dodge = 0.65
	var direction := move_direction()
	if direction.length_squared() > 0.01:
		set_facing(position + direction)
	start_action("Dodge", 0.4)
	attack_buffer = false
	return true

func _physics_process(delta: float) -> void:
	if not arena:
		return
	for key in cooldowns:
		cooldowns[key] = maxf(0, cooldowns[key] - delta)
	invincible_left = maxf(0, invincible_left - delta)
	empowered_left = maxf(0, empowered_left - delta)
	slow_left = maxf(0, slow_left - delta)
	if arena.elapsed - last_spent > 0.35:
		stamina = minf(100, stamina + 25 * delta)
	shield_left = maxf(0, shield_left - delta)
	if shield_left <= 0:
		shield = 0
	combo_grace = maxf(0, combo_grace - delta)
	material_flash = maxf(0, material_flash - delta)
	if enemy and health_label:
		health_label.text = "%s  %d / 140" % [["铁卫", "戟卫", "禁卫"][unit_index], int(health)] if not dead else "已击倒"
		if has_meta("marker"):
			get_meta("marker").position = position + Vector3(0, 0.04, 0)
	if dead or arena.ended:
		velocity.x = move_toward(velocity.x, 0, 20 * delta)
		velocity.z = move_toward(velocity.z, 0, 20 * delta)
		velocity.y -= 20 * delta
		move_and_slide()
		return
	if air_left > 0:
		air_left -= delta
		velocity.x = knock_velocity.x
		velocity.z = knock_velocity.z
		velocity.y -= 20 * delta
		move_and_slide()
		if air_left <= 0:
			stagger_left = maxf(stagger_left, 0.3)
			ai_state = "stagger" if enemy else ai_state
		return
	if stagger_left > 0:
		stagger_left -= delta
		velocity.x = knock_velocity.x
		velocity.z = knock_velocity.z
		knock_velocity = knock_velocity.move_toward(Vector3.ZERO, 14 * delta)
		velocity.y = -0.1 if is_on_floor() else velocity.y - 20 * delta
		move_and_slide()
		if stagger_left <= 0 and enemy:
			ai_state = "chase"
		return
	if enemy:
		if ai_enabled:
			update_enemy(delta)
		else:
			velocity.x = 0
			velocity.z = 0
			velocity.y = -0.1 if is_on_floor() else velocity.y - 20 * delta
			move_and_slide()
	else:
		update_hero(delta)

func update_hero(delta: float) -> void:
	var direction := move_direction()
	var sprinting: bool = (test_running if test_mode else Input.is_action_pressed("run")) and stamina > 1
	var speed := 4.6 if sprinting else 3.1
	var guard_casting := action == "GuardCast"
	if guard_casting:
		action_elapsed += delta
		if action_elapsed >= 0.32:
			action = ""
	if action != "" and not guard_casting:
		var previous_elapsed := action_elapsed
		action_elapsed += delta
		velocity.x = 0
		velocity.z = 0
		if action == "Leap":
			if action_elapsed >= 0.18 and action_elapsed < 0.92:
				var progress := clampf((action_elapsed - 0.18) / 0.74, 0, 1)
				position = action_origin.lerp(action_target, smoothstep(0.0, 1.0, progress))
				position.y = grounded_y + sin(progress * PI) * 2.9
				velocity = Vector3.ZERO
				return
			if action_elapsed >= 0.92 and not action_hit:
				action_hit = true
				position = action_target
				arena.hero_area_hit(self, 3.2, PI, 76.0, 0.76, 2.95)
				arena.impact(position, 3.2)
		elif action == "Dodge":
			velocity.x = action_forward.x * 2.35 / 0.4
			velocity.z = action_forward.z * 2.35 / 0.4
		elif action == "Cleave":
			step_action(previous_elapsed, action_elapsed, 0.21, 0.44, 0.25, delta)
			if action_elapsed >= 0.42 and action_elapsed <= 0.55:
				var hits: int = arena.hero_area_hit(self, 3.35, 1.35, 58.0, 0, 2.73)
				if hits > 0:
					empowered_left = 6
				if not action_hit:
					action_hit = true
					arena.slash(position, action_forward, 3.35, deg_to_rad(77.5), true)
		elif action.begins_with("Attack"):
			var spec: Dictionary = ATTACKS[combo - 1]
			step_action(previous_elapsed, action_elapsed, spec.step_start, spec.step_end, spec.lunge, delta)
			if action_elapsed >= spec.hit and action_elapsed <= spec.active_end:
				arena.hero_area_hit(self, spec.reach, spec.half_angle, spec.damage, 0, 4.5 if combo == 3 else 1.8)
				if not action_hit:
					action_hit = true
					arena.slash(position, action_forward, spec.reach, spec.half_angle, false)
		if action_elapsed >= action_duration:
			action = ""
			combo_grace = 0.8
			if attack_buffer:
				attack_buffer = false
				request_attack()
	else:
		velocity.x = move_toward(velocity.x, direction.x * speed, 24 * delta)
		velocity.z = move_toward(velocity.z, direction.z * speed, 24 * delta)
		if direction.length_squared() > 0.01:
			set_facing(aim_point)
			if sprinting:
				stamina = maxf(0, stamina - 10 * delta)
				last_spent = arena.elapsed
		else:
			set_facing(aim_point)
		if not guard_casting:
			play_clip(("Run" if speed > 4 else "Walk") if direction.length_squared() > 0.01 else "Idle")
	velocity.y = -0.1 if is_on_floor() else velocity.y - 20 * delta
	move_and_slide()
	position.x = clampf(position.x, -10, 10)
	position.z = clampf(position.z, -10, 10)

func step_action(before: float, after: float, start: float, finish: float, distance: float, delta: float) -> void:
	var previous_progress := clampf((before - start) / (finish - start), 0, 1)
	var next_progress := clampf((after - start) / (finish - start), 0, 1)
	var step_distance := distance * (smoothstep(0.0, 1.0, next_progress) - smoothstep(0.0, 1.0, previous_progress))
	velocity.x = action_forward.x * step_distance / delta
	velocity.z = action_forward.z * step_distance / delta

func update_enemy(delta: float) -> void:
	var target: Vector3 = arena.hero.position
	var offset := target - position
	offset.y = 0
	if ai_state == "chase":
		if offset.length() <= 1.65:
			ai_state = "telegraph"
			ai_left = 0.58
			set_facing(target)
			action_forward = -global_basis.z
			warning.position = position + Vector3(0, 0.08, 0)
			warning.rotation.y = rotation.y
			warning.visible = true
			velocity = Vector3.ZERO
			play_clip("GuardCast", true, 0.58)
		else:
			set_facing(target)
			var slow := 0.6 if slow_left > 0 else 1.0
			if arena.zone_left > 0 and position.distance_to(arena.zone_position) < 3.2:
				slow = minf(slow, 0.7)
			var desired: Vector3 = offset.normalized() * [1.55, 1.65, 1.45][unit_index] * slow
			velocity.x = desired.x
			velocity.z = desired.z
			play_clip("Run")
	else:
		ai_left -= delta
		velocity.x = move_toward(velocity.x, 0, 25 * delta)
		velocity.z = move_toward(velocity.z, 0, 25 * delta)
		if ai_left <= 0:
			if ai_state == "telegraph":
				ai_state = "attack"
				ai_left = 0.16
				warning.visible = false
				play_clip("Attack1", true, 0.55)
				if offset.length() <= 2.05 and (offset.length() < 0.2 or action_forward.dot(offset.normalized()) > cos(0.9)):
					arena.hero.receive_damage(14.0, self)
				arena.slash(position, action_forward, 1.65, 0.9, false, true)
			elif ai_state == "attack":
				ai_state = "recovery"
				ai_left = 0.6
			else:
				ai_state = "chase"
	velocity.y = -0.1 if is_on_floor() else velocity.y - 20 * delta
	move_and_slide()

func receive_damage(amount: float, attacker: Node3D, lift := 0.0, knock := 0.0) -> bool:
	if dead or arena.ended:
		return false
	if not enemy and (invincible_left > 0 or action == "Dodge" and action_elapsed >= 0.04 and action_elapsed < 0.3):
		return false
	if not enemy and action == "Leap" and action_elapsed >= 0.18 and action_elapsed < 0.92:
		return false
	if not enemy and arena.zone_left > 0 and position.distance_to(arena.zone_position) <= 3.2:
		amount = roundf(amount * 0.75)
	var absorbed := minf(shield, amount)
	shield -= absorbed
	health = maxf(0, health - (amount - absorbed))
	material_flash = 0.2
	arena.damage_number(position + Vector3(0, 2, 0), amount - absorbed, absorbed)
	if health <= 0:
		dead = true
		ai_state = "dead" if enemy else ai_state
		action = ""
		if warning:
			warning.visible = false
		collision_layer = 0
		collision_mask = 1
		play_clip("Death", true)
		arena.unit_died(self)
		return true
	if enemy:
		stagger_left = 0.28
		ai_state = "stagger"
		if warning:
			warning.visible = false
		var away := position - attacker.position
		away.y = 0
		knock_velocity = away.normalized() * knock
		if lift > 0:
			air_left = lift
			ai_state = "airborne"
			velocity.y = 6.6
		play_clip("Hit", true)
	else:
		arena.flash_damage()
		invincible_left = 0.22
		if amount > absorbed and not action.begins_with("Attack") and action not in ["Cleave", "Leap"]:
			stagger_left = 0.24
			action = ""
			attack_buffer = false
			play_clip("Hit", true)
	return true

func reset_unit(pos: Vector3) -> void:
	if secondary:
		secondary.reset_constraints()
	position = pos
	velocity = Vector3.ZERO
	rotation = Vector3.ZERO
	health = max_health
	shield = 0
	shield_left = 0
	stamina = 100
	last_spent = 0
	empowered_left = 0
	invincible_left = 0
	slow_left = 0
	dead = false
	action = ""
	action_elapsed = 0
	action_hits.clear()
	combo = 0
	combo_grace = 0
	attack_buffer = false
	air_left = 0
	stagger_left = 0
	knock_velocity = Vector3.ZERO
	ai_state = "chase"
	ai_left = 0
	ai_enabled = true
	collision_layer = 1
	collision_mask = 1
	for key in cooldowns:
		cooldowns[key] = 0
	if warning:
		warning.visible = false
	play_clip("Idle", true)
