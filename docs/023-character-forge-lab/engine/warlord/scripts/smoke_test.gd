extends SceneTree

var checks: Array[Dictionary] = []
var failures := 0
var arena
var hero

func _initialize() -> void:
	run_checks.call_deferred()

func verify(condition: bool, title: String, detail = null) -> void:
	checks.append({"check": title, "passed": condition, "detail": detail.duplicate(true) if detail is Dictionary or detail is Array else detail})
	if condition:
		print("PASS: " + title)
	else:
		failures += 1
		push_error("CHECK FAILED: " + title)

func ticks(count: int) -> void:
	for i in range(count):
		await physics_frame

func reset_combat() -> void:
	arena.reset_trial()
	hero.test_mode = true
	hero.test_movement = Vector3.ZERO
	hero.test_running = false
	hero.position = Vector3(0, 0.025, 2)
	hero.aim_point = Vector3(0, 0, -4)
	for i in range(arena.enemies.size()):
		arena.enemies[i].ai_enabled = false
		arena.enemies[i].position = Vector3(-6 + i * 6, 0.025, -7)

func run_checks() -> void:
	arena = load("res://main.tscn").instantiate()
	root.add_child(arena)
	current_scene = arena
	await ticks(12)
	hero = arena.hero
	verify(hero.animator != null, "Final heavy-warrior GLB imports with AnimationPlayer")
	if not hero.animator:
		write_report()
		quit(1)
		return
	var skeletons = hero.find_children("*", "Skeleton3D", true, false)
	verify(skeletons.size() > 0 and skeletons[0].get_bone_count() >= 30, "Animated humanoid skeleton survives engine import", skeletons[0].get_bone_count() if skeletons.size() else 0)
	var metadata = JSON.parse_string(FileAccess.get_file_as_string("res://assets/metadata.json"))
	verify(metadata != null and is_equal_approx(float(metadata.bodyHeight), 2.05) and metadata.forward == "+Z" and metadata.up == "+Y", "Asset meter and axis contract is preserved in native handoff")
	var attachment_ok := false
	if skeletons.size() > 0:
		attachment_ok = skeletons[0].find_bone("HalberdGrip") >= 0 and skeletons[0].find_bone("HalberdTip") >= 0
	verify(attachment_ok, "Halberd grip and tip attachment bones import")
	var required := ["Idle", "Walk", "Run", "Attack1", "Attack2", "Attack3", "Cleave", "GuardCast", "Leap", "Hit", "Death"]
	var clips_ok := true
	for key in required:
		clips_ok = clips_ok and hero.animator.has_animation(hero.resolve_clip(key))
	verify(clips_ok, "Locomotion, three attacks and three skill animations resolve", str(hero.animator.get_animation_list()))
	verify(arena.enemies.size() == 3 and arena.enemies.all(func(unit): return unit.animator != null), "Three enemies instantiate with real animated assets")
	verify(arena.camera.projection == Camera3D.PROJECTION_ORTHOGONAL and arena.camera.position.y >= 15, "MOBA camera is fixed, elevated and orthographic")
	reset_combat()
	await ticks(4)
	verify(hero.is_on_floor(), "Hero capsule lands on collision floor")
	var start: Vector3 = hero.position
	hero.test_movement = Vector3.RIGHT
	await ticks(60)
	var walked: float = hero.position.distance_to(start)
	verify(walked > 2.7 and walked < 3.3, "Walking uses 3.1 m/s physics movement", walked)
	start = hero.position
	hero.test_running = true
	await ticks(40)
	verify(hero.position.distance_to(start) > 2.7 and hero.stamina < 100, "Sprint moves faster and consumes stamina", {"distance": hero.position.distance_to(start), "stamina": hero.stamina})
	reset_combat()
	var enemy = arena.enemies[0]
	enemy.position = Vector3(0, 0.025, -0.2)
	var behind = arena.enemies[1]
	behind.position = Vector3(0, 0.025, 4)
	verify(hero.request_attack(), "First basic attack accepts aimed input")
	await ticks(12)
	verify(enemy.health == 140, "Attack1 does not damage before its windup window")
	await ticks(7)
	verify(enemy.health == 118 and behind.health == 140, "Attack1 hits forward cone once for 22 damage", {"front": enemy.health, "back": behind.health})
	hero.request_attack()
	await ticks(48)
	verify(hero.combo == 2 and enemy.health == 92, "Buffered Attack2 applies 26 damage", enemy.health)
	hero.request_attack()
	await ticks(54)
	verify(hero.combo == 3 and enemy.health == 54, "Buffered Attack3 applies 38 damage and moves enemy back", enemy.health)
	verify(hero.position.distance_to(Vector3(0, 0.025, 2)) > 0.7, "Three heavy attacks create deliberate forward steps", hero.position)
	reset_combat()
	enemy = arena.enemies[0]
	enemy.position = Vector3(2.4, 0.025, 0.7)
	behind = arena.enemies[1]
	behind.position = Vector3(0, 0.025, 4)
	hero.aim_point = Vector3(0, 0, -4)
	verify(hero.request_skill("Q"), "Q wide sweep starts")
	await ticks(20)
	verify(enemy.health == 140, "Q preserves its 0.42-second hit delay")
	await ticks(10)
	verify(enemy.health == 82 and behind.health == 140 and hero.empowered_left > 5, "Q wide arc hits side-front, excludes rear and empowers basics", {"side": enemy.health, "rear": behind.health})
	verify(not hero.request_skill("Q") and hero.cooldowns.Q > 3, "Q cooldown rejects repeated casts")
	reset_combat()
	enemy = arena.enemies[0]
	hero.request_skill("Q")
	await ticks(27)
	enemy.position = hero.position + Vector3(0, 0, -2)
	await ticks(5)
	verify(enemy.health == 82, "Q active interval catches an enemy entering after first hit frame", enemy.health)
	await ticks(12)
	verify(enemy.health == 82, "Q records victims and never damages a target twice in one cast")
	reset_combat()
	verify(hero.request_skill("E"), "E shield activates without locking movement")
	verify(hero.shield == 90 and hero.shield_left > 3.9, "Base shield is 90 for four seconds")
	hero.test_movement = Vector3.RIGHT
	start = hero.position
	await ticks(20)
	verify(hero.position.distance_to(start) > 0.6, "Hero can keep moving while shielded")
	hero.receive_damage(40, arena.enemies[0])
	verify(hero.health == 240 and hero.shield == 50, "Shield absorbs damage before health")
	await ticks(15)
	hero.receive_damage(70, arena.enemies[0])
	verify(hero.health == 220 and hero.shield == 0, "Damage exceeding shield spills to health")
	reset_combat()
	for i in range(3):
		arena.enemies[i].position = hero.position + Vector3(-1.2 + i * 1.2, 0, -2)
	hero.request_skill("E")
	verify(hero.shield == 130 and arena.enemies.all(func(unit): return unit.slow_left > 1), "E rewards nearby enemies with extra shield and slows pursuers")
	reset_combat()
	enemy = arena.enemies[0]
	enemy.position = Vector3(0, 0.025, -2)
	hero.aim_point = Vector3(0, 0, -7)
	verify(hero.request_skill("R", Vector3(0, 0, -7)), "R snapshots an aimed landing point")
	verify(hero.action_target.distance_to(hero.action_origin) <= 5.501, "R landing is clamped to 5.5-meter range")
	await ticks(31)
	verify(hero.position.y > 2 and enemy.health == 140, "R lifts the hero before landing and delays AOE")
	verify(not hero.receive_damage(50, enemy) and hero.health == 240, "Airborne R rejects incoming damage")
	await ticks(29)
	verify(enemy.health == 64 and enemy.air_left > 0 and arena.zone_left > 3.7, "R landing applies 76 AOE damage, knock-up and persistent zone", {"enemy_health": enemy.health, "airtime": enemy.air_left})
	await ticks(12)
	verify(enemy.position.y > 0.2, "Knock-up physically raises the enemy capsule", enemy.position.y)
	reset_combat()
	enemy = arena.enemies[0]
	enemy.position = hero.position + Vector3(0, 0, -3.5)
	enemy.ai_enabled = true
	var initial_distance: float = enemy.position.distance_to(hero.position)
	await ticks(65)
	verify(enemy.position.distance_to(hero.position) < initial_distance - 1.2, "Enemy AI chases the hero")
	enemy.position = hero.position + Vector3(0, 0, -1.5)
	enemy.ai_state = "chase"
	await ticks(3)
	verify(enemy.ai_state == "telegraph" and enemy.warning.visible, "Enemy telegraphs a committed attack direction")
	var health_before: float = hero.health
	await ticks(15)
	verify(hero.health == health_before, "Enemy windup does not apply early damage")
	await ticks(23)
	verify(hero.health == health_before - 14, "Enemy attack applies damage after 0.58-second warning", hero.health)
	enemy.ai_enabled = false
	enemy.receive_damage(10, hero, 0, 3)
	start = enemy.position
	verify(enemy.stagger_left > 0 and not enemy.warning.visible, "Hit interrupts enemy warning into stagger")
	await ticks(10)
	verify(enemy.position.distance_to(start) > 0.08, "Stagger applies physical knockback")
	reset_combat()
	for guard in arena.enemies:
		guard.receive_damage(200, hero)
	verify(arena.won and arena.defeated == 3 and arena.enemies.all(func(unit): return unit.dead and unit.played == "Death"), "All enemies die with Death clips and trigger victory")
	reset_combat()
	verify(not arena.ended and hero.health == 240 and hero.stamina == 100 and arena.enemies.all(func(unit): return unit.health == 140 and not unit.dead), "Reset restores hero, cooldowns, enemy state and health")
	hero.receive_damage(400, arena.enemies[0])
	verify(hero.dead and arena.ended and not arena.won, "Hero death produces defeat")
	write_report()
	quit(0 if failures == 0 else 1)

func write_report() -> void:
	var report := {"status": "passed" if failures == 0 else "failed", "passed": checks.size() - failures, "failed": failures, "engine": Engine.get_version_info().string, "asset_sha256": FileAccess.get_sha256("res://assets/warlord.glb"), "mode": "CLI/headless only; no visual window or computer-use interaction", "checks": checks}
	report["source_sha256"] = {}
	for script in ["arena.gd", "combatant.gd", "secondary_constraints.gd", "smoke_test.gd"]:
		report.source_sha256[script] = FileAccess.get_sha256("res://scripts/" + script)
	var import_settings := ConfigFile.new()
	var import_read := import_settings.load("res://assets/warlord.glb.import")
	report["godot_import_settings"] = {"meshes/generate_lods": import_read == OK and import_settings.get_value("params", "meshes/generate_lods", false) == true}
	var file := FileAccess.open("res://validation/gameplay-report.json", FileAccess.WRITE)
	file.store_string(JSON.stringify(report, "  "))
	file.close()
	print("WARLORD_SMOKE_RESULT " + JSON.stringify(report))
