extends SceneTree

var checks: Array[Dictionary] = []
var failures := 0

func _initialize() -> void:
	run_checks.call_deferred()

func check_result(condition: bool, title: String, detail = null) -> void:
	checks.append({"check": title, "passed": condition, "detail": detail})
	if not condition:
		failures += 1
		push_error("CHECK FAILED: " + title)
	else:
		print("PASS: " + title)

func ticks(count: int) -> void:
	for i in range(count):
		await physics_frame

func run_checks() -> void:
	var arena = load("res://main.tscn").instantiate()
	root.add_child(arena)
	current_scene = arena
	await ticks(12)
	var hero = arena.player
	hero.test_control = true
	for crystal in arena.crystals:
		crystal.cooldown = 999.0
	var skeletons = hero.find_children("*", "Skeleton3D", true, false)
	check_result(skeletons.size() == 1 and skeletons[0].get_bone_count() == 41, "Professional GLB imports with 41-bone skeleton")
	var required := ["Idle", "Walk", "Run", "Attack1", "Attack2", "Attack3", "Block", "BlockHit", "Hit", "Death", "Dodge", "Victory"]
	if not hero.animator:
		push_error("Smoke test stopped: imported AnimationPlayer is missing.")
		quit(1)
		return
	var all_clips := true
	for clip in required:
		all_clips = all_clips and hero.animator.has_animation(clip)
	check_result(all_clips, "All 12 gameplay animation states import", str(hero.available))
	check_result(hero.is_on_floor(), "Capsule lands on physics floor")
	var start: Vector3 = hero.position
	hero.test_direction = Vector3.RIGHT
	await ticks(60)
	var walk_distance: float = hero.position.distance_to(start)
	check_result(walk_distance > 2.2 and walk_distance < 3.0, "Walking advances capsule at expected speed", walk_distance)
	start = hero.position
	hero.test_running = true
	await ticks(60)
	var run_distance: float = hero.position.distance_to(start)
	check_result(run_distance > 4.4 and run_distance < 5.2 and run_distance > walk_distance * 1.6, "Running is faster and uses Run animation", run_distance)
	hero.test_direction = Vector3.ZERO
	hero.test_running = false
	check_result(hero.played == "Run", "Locomotion selects real Run clip")
	# Attack each target from a valid frontal position, through actual physics-timed hit windows.
	var target = arena.crystals[0]
	hero.position = target.position + Vector3(0, 0.1, 1.5)
	hero.rotation = Vector3.ZERO
	hero.velocity = Vector3.ZERO
	await ticks(3)
	var accepted: bool = hero.request_attack()
	await ticks(24)
	check_result(accepted and target.health == 78, "Attack1 hit window applies 22 damage", target.health)
	hero.request_attack() # queue Attack2 during Attack1 recovery
	await ticks(66)
	check_result(hero.combo == 2 and target.health == 51, "Buffered second combo attack applies 27 damage", {"combo": hero.combo, "health": target.health})
	hero.request_attack() # queue Attack3 before Attack2 recovery ends
	await ticks(68)
	check_result(hero.combo == 3 and target.health == 13, "Buffered third combo attack applies 38 damage", {"combo": hero.combo, "health": target.health})
	# Reset between independent collision/damage checks.
	arena.reset_trial()
	hero.test_control = true
	for crystal in arena.crystals:
		crystal.cooldown = 999.0
	hero.test_direction = Vector3.FORWARD
	var stamina_before: float = hero.stamina
	start = hero.position
	check_result(hero.request_dodge(), "Dodge accepts input with sufficient stamina")
	check_result(not hero.take_damage(17), "Dodge invulnerability rejects incoming damage")
	await ticks(12)
	check_result(hero.position.distance_to(start) > 1.4 and hero.stamina < stamina_before, "Dodge moves capsule and consumes stamina", hero.position.distance_to(start))
	await ticks(20)
	hero.test_direction = Vector3.ZERO
	hero.velocity = Vector3.ZERO
	check_result(hero.take_damage(17) and hero.health == 83, "Damage works after invulnerability ends", hero.health)
	hero.flash_left = 0
	hero.blocked = true
	check_result(hero.take_damage(20) and is_equal_approx(hero.health, 79), "Block reduces incoming damage by 80%", hero.health)
	hero.blocked = false
	hero.flash_left = 0
	hero.position = Vector3(0, 0.1, 0)
	hero.velocity = Vector3.ZERO
	arena.spawn_wave(Vector3(0, 0, -2))
	await ticks(35)
	check_result(hero.health <= 62.1, "Expanding shockwave reaches and damages player", hero.health)
	arena.reset_trial()
	for crystal in arena.crystals:
		arena.damage_crystal(crystal, 100)
	check_result(arena.won and arena.destroyed == 3 and hero.played == "Victory", "Destroying three crystals ends trial with Victory")
	arena.reset_trial()
	check_result(not arena.won and not arena.ended and hero.health == 100 and arena.destroyed == 0, "Reset restores player and all targets")
	hero.take_damage(150)
	check_result(hero.dead and arena.ended and not arena.won and hero.played == "Death", "Lethal damage enters Death and failure state")
	arena.reset_trial()
	check_result(not hero.dead and hero.health == 100, "Reset also recovers from death")
	var report := {"engine": Engine.get_version_info(), "status": "passed" if failures == 0 else "failed", "passed": checks.size() - failures, "failed": failures, "checks": checks, "scope": "Real Godot headless import, physics, animation selection, combo timing, damage, invulnerability, victory, death and reset. Native GPU rendering and manual input were not verified by this script."}
	var file := FileAccess.open("res://validation/gameplay-report.json", FileAccess.WRITE)
	file.store_string(JSON.stringify(report, "  "))
	file.close()
	print("EMBERFALL_SMOKE_RESULT " + JSON.stringify(report))
	quit(0 if failures == 0 else 1)
