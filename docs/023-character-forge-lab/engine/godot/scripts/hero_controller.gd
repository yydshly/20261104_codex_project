extends CharacterBody3D

const WALK_SPEED := 2.7
const RUN_SPEED := 5.0
const DODGE_SPEED := 8.5
const ACCELERATION := 20.0
var arena: Node3D
var model: Node3D
var animator: AnimationPlayer
var available: Array[StringName] = []
var played := ""
var health := 100.0
var stamina := 100.0
var dead := false
var blocked := false
var attack_elapsed := -1.0
var attack_duration := 0.65
var attack_fired := false
var attack_queued := false
var combo := 0
var combo_grace := 0.0
var dodge_left := 0.0
var dodge_direction := Vector3.FORWARD
var flash_left := 0.0
var test_control := false
var test_direction := Vector3.ZERO
var test_running := false

func _ready() -> void:
	name = "Player"
	var collider := CollisionShape3D.new()
	var capsule := CapsuleShape3D.new()
	capsule.radius = 0.26
	capsule.height = 1.75
	collider.shape = capsule
	collider.position.y = 0.875
	add_child(collider)
	var packed := load("res://assets/hero.glb") as PackedScene
	if packed:
		model = packed.instantiate()
		model.name = "HeroModel"
		add_child(model)
		model.rotation.y = PI # KayKit mesh faces +Z; gameplay forward is Godot -Z.
		animator = _find_animator(model)
		if animator:
			for clip in animator.get_animation_list():
				available.append(clip)
				var anim := animator.get_animation(clip)
				anim.loop_mode = Animation.LOOP_LINEAR if String(clip) in ["Idle", "Walk", "Run", "Block"] else Animation.LOOP_NONE
			_play("Idle")
	else:
		push_error("Professional hero.glb is missing or failed to import.")
		var placeholder := MeshInstance3D.new()
		placeholder.mesh = CapsuleMesh.new()
		placeholder.position.y = 0.9
		add_child(placeholder)

func _find_animator(node: Node) -> AnimationPlayer:
	if node is AnimationPlayer:
		return node as AnimationPlayer
	for child in node.get_children():
		var found := _find_animator(child)
		if found:
			return found
	return null

func _play(clip: String, force := false) -> void:
	if animator and available.has(StringName(clip)) and (played != clip or force):
		animator.play(clip, 0.12)
		played = clip

func _physics_process(delta: float) -> void:
	if not arena:
		return
	stamina = minf(100.0, stamina + delta * (12.0 if blocked else 23.0))
	combo_grace = maxf(0.0, combo_grace - delta)
	if flash_left > 0.0:
		flash_left -= delta
	if dead or arena.won:
		velocity.x = move_toward(velocity.x, 0.0, ACCELERATION * delta)
		velocity.z = move_toward(velocity.z, 0.0, ACCELERATION * delta)
		velocity.y -= 18.0 * delta
		move_and_slide()
		return
	var direction := test_direction if test_control else _movement()
	var running := test_running if test_control else Input.is_action_pressed("run")
	if not test_control:
		blocked = Input.is_action_pressed("block") and attack_elapsed < 0 and dodge_left <= 0 and stamina > 2
	if dodge_left > 0:
		dodge_left -= delta
		velocity.x = dodge_direction.x * DODGE_SPEED
		velocity.z = dodge_direction.z * DODGE_SPEED
	elif attack_elapsed >= 0:
		attack_elapsed += delta
		velocity.x = move_toward(velocity.x, 0.0, 25.0 * delta)
		velocity.z = move_toward(velocity.z, 0.0, 25.0 * delta)
		if not attack_fired and attack_elapsed >= attack_duration * 0.34:
			attack_fired = true
			arena.apply_melee(self, [22.0, 27.0, 38.0][combo - 1])
		if attack_elapsed >= attack_duration:
			attack_elapsed = -1.0
			combo_grace = 0.65
			if attack_queued:
				attack_queued = false
				request_attack()
	else:
		var speed := (RUN_SPEED if running else WALK_SPEED) * (0.42 if blocked else 1.0)
		velocity.x = move_toward(velocity.x, direction.x * speed, ACCELERATION * delta)
		velocity.z = move_toward(velocity.z, direction.z * speed, ACCELERATION * delta)
		if direction.length_squared() > 0.01:
			rotation.y = lerp_angle(rotation.y, atan2(-direction.x, -direction.z), minf(1.0, delta * 13))
		var movement_clip := "Idle"
		if blocked:
			movement_clip = "Block"
		elif direction.length_squared() > 0.01:
			movement_clip = "Run" if running else "Walk"
		_play(movement_clip)
	if not is_on_floor():
		velocity.y -= 18.0 * delta
	else:
		velocity.y = -0.1
	move_and_slide()
	position.x = clampf(position.x, -10.5, 10.5)
	position.z = clampf(position.z, -10.5, 10.5)

func _movement() -> Vector3:
	var axis := Input.get_vector("move_left", "move_right", "move_forward", "move_back")
	var right: Vector3 = arena.camera.global_basis.x
	var backward: Vector3 = arena.camera.global_basis.z
	right.y = 0
	backward.y = 0
	return (right.normalized() * axis.x + backward.normalized() * axis.y).normalized() * minf(1.0, axis.length())

func request_attack() -> bool:
	if dead or arena.won or dodge_left > 0:
		return false
	if attack_elapsed >= 0:
		attack_queued = true
		return true
	if stamina < 8.0:
		return false
	stamina -= 8.0
	blocked = false
	combo = combo % 3 + 1 if combo_grace > 0 else 1
	attack_elapsed = 0.0
	attack_fired = false
	var clip := "Attack%d" % combo
	attack_duration = clampf(animator.get_animation(clip).length, 0.4, 1.2) if animator and animator.has_animation(clip) else 0.65
	_play(clip, true)
	return true

func request_dodge() -> bool:
	if dead or arena.won or dodge_left > 0 or stamina < 27.0:
		return false
	stamina -= 27.0
	attack_elapsed = -1.0
	attack_queued = false
	blocked = false
	dodge_left = 0.32
	var desired := test_direction if test_control else _movement()
	dodge_direction = desired.normalized() if desired.length_squared() > 0.01 else -global_basis.z
	_play("Dodge", true)
	return true

func take_damage(amount: float) -> bool:
	if dead or arena.won or dodge_left > 0 or flash_left > 0:
		return false
	if blocked and stamina >= 12:
		stamina -= 12
		amount *= 0.2
		_play("BlockHit", true)
	else:
		attack_elapsed = -1.0
		attack_queued = false
		_play("Hit", true)
	health = maxf(0.0, health - amount)
	flash_left = 0.35
	arena.flash_screen()
	if health <= 0:
		dead = true
		_play("Death", true)
		arena.finish(false)
	return true

func reset_player() -> void:
	health = 100
	stamina = 100
	dead = false
	blocked = false
	attack_elapsed = -1
	attack_queued = false
	combo = 0
	combo_grace = 0
	dodge_left = 0
	flash_left = 0
	velocity = Vector3.ZERO
	position = Vector3(0, 0.05, 4)
	rotation = Vector3.ZERO
	_play("Idle", true)

func victory() -> void:
	attack_elapsed = -1
	_play("Victory", true)
