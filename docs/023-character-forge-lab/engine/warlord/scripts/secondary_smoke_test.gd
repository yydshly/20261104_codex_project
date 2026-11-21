extends SceneTree

const Secondary = preload("res://scripts/secondary_constraints.gd")
var checks: Array[Dictionary] = []
var failures := 0

func _initialize() -> void:
	run.call_deferred()

func verify(condition: bool, label: String, detail = null) -> void:
	checks.append({"check": label, "passed": condition, "detail": detail.duplicate(true) if detail is Dictionary or detail is Array else detail})
	if condition:
		print("PASS: " + label)
	else:
		failures += 1
		push_error("FAILED: " + label)

func create_fixture() -> Dictionary:
	var actor := Node3D.new()
	root.add_child(actor)
	var skeleton := Skeleton3D.new()
	skeleton.name = "Skeleton3D"
	actor.add_child(skeleton)
	skeleton.modifier_callback_mode_process = Skeleton3D.MODIFIER_CALLBACK_MODE_PROCESS_MANUAL
	var add := func(bone_name: String, parent_name: String, position: Vector3) -> void:
		skeleton.add_bone(bone_name)
		var index := skeleton.find_bone(bone_name)
		if not parent_name.is_empty():
			skeleton.set_bone_parent(index, skeleton.find_bone(parent_name))
		skeleton.set_bone_rest(index, Transform3D(Basis.IDENTITY, position))
	add.call("root", "", Vector3.ZERO)
	add.call("pelvis", "root", Vector3(0, 1.1, 0))
	add.call("spine_02", "pelvis", Vector3(0, 0.25, 0))
	add.call("spine_03", "spine_02", Vector3(0, 0.25, 0))
	add.call("Head", "spine_03", Vector3(0, 0.3, 0))
	for side in ["l", "r"]:
		var sign_in := -1.0 if side == "l" else 1.0
		add.call("thigh_" + side, "pelvis", Vector3(0.16 * sign_in, 0, 0))
		add.call("calf_" + side, "thigh_" + side, Vector3(0, -0.43, 0.25))
		add.call("foot_" + side, "calf_" + side, Vector3(0, -0.55, -0.25))
		add.call("upperarm_" + side, "spine_03", Vector3(0.3 * sign_in, 0, 0))
		add.call("lowerarm_" + side, "upperarm_" + side, Vector3(0.25 * sign_in, -0.1, 0))
	add.call("Mantle_0_0", "spine_03", Vector3(0, 0, 0.1))
	skeleton.reset_bone_poses()
	var authored: Array[Transform3D] = []
	for index in range(skeleton.get_bone_count()):
		authored.append(skeleton.get_bone_pose(index))
	var modifier := Secondary.new()
	modifier.configure(actor, func(): return {"action": "Idle", "actionTime": 0.0, "grounded": true})
	modifier.active = false
	skeleton.add_child(modifier)
	return {"actor": actor, "skeleton": skeleton, "modifier": modifier, "authored": authored}

func restore(fixture: Dictionary) -> void:
	for index in range(fixture.authored.size()):
		fixture.skeleton.set_bone_pose(index, fixture.authored[index])

func apply(fixture: Dictionary, state := {}) -> Dictionary:
	restore(fixture)
	var controls := {"action": "Idle", "actionTime": 0.0, "grounded": true}
	controls.merge(state, true)
	return fixture.modifier.apply_constraints(1.0 / 60.0, controls)

func run() -> void:
	var a := Vector3.ZERO
	var b := Vector3(0, 2, 0)
	var inside := Secondary.project_out_of_capsule(Vector3(0.05, 1, 0), a, b, 0.25)
	verify(inside.corrected and (inside.point as Vector3).distance_to(Vector3(0.25, 1, 0)) < 0.00001, "Capsule interior is projected to its real radial boundary")
	var surface := Secondary.project_out_of_capsule(Vector3(0.25, 1, 0), a, b, 0.25)
	verify(not surface.corrected and absf(surface.distance) < 0.00001, "Capsule surface remains unchanged")
	var zero_axis := Secondary.project_out_of_capsule(a, a, a, 0.3, Vector3.ZERO)
	verify(zero_axis.corrected and absf((zero_axis.point as Vector3).length() - 0.3) < 0.00001, "Zero capsule axis and fallback produce a finite sphere projection")
	verify(Secondary.foot_contact_weight("Run", 0.16, "l") == 1 and Secondary.foot_contact_weight("Run", 0.16, "r") == 0 and Secondary.foot_contact_weight("Run", 0.56, "r") == 1, "Locomotion foot phase follows authored clip seconds")
	var flight_ok := true
	for time in [0.18, 0.3, 0.6, 0.84, 0.919, 0.92]:
		flight_ok = flight_ok and is_zero_approx(Secondary.foot_contact_weight("Leap", time))
	verify(flight_ok and Secondary.foot_contact_weight("Leap", 0.179) == 1 and Secondary.foot_contact_weight("Leap", 1.0) == 1, "R feet release at takeoff and stay free through the 0.92-second landing boundary")
	var fixture := create_fixture()
	var initial := apply(fixture)
	var anchors := {"l": initial.feet.l.target, "r": initial.feet.r.target}
	var locked := true
	for index in range(1, 9):
		fixture.actor.position = Vector3(index * 0.01, 0, -index * 0.008)
		fixture.actor.rotation.y = index * 0.015
		var result := apply(fixture)
		for side in ["l", "r"]:
			locked = locked and result.feet[side].target.distance_to(anchors[side]) < 0.00001 and result.feet[side].position.distance_to(anchors[side]) < 0.003
	verify(locked, "Actual Skeleton3D ankles remain world-locked through controller motion and turns")
	fixture.actor.position = Vector3.ZERO
	fixture.actor.rotation = Vector3.ZERO
	fixture.modifier.reset_constraints()
	initial = apply(fixture)
	var initial_z: float = initial.feet.l.target.z
	fixture.actor.position.z = -0.42
	var stepping := apply(fixture, {"action": "Attack3", "actionTime": 0.32})
	verify(stepping.feet.l.stepping and stepping.feet.l.lift > 0.04 and stepping.feet.l.position.y > 0.16, "Heavy 42cm advance physically raises the leading ankle")
	var planted := apply(fixture, {"action": "Attack3", "actionTime": 0.46})
	verify(absf(planted.feet.l.target.z - initial_z + 0.42) < 0.005 and planted.feet.l.error < 0.003, "Leading ankle replants at the advanced world location")
	fixture.actor.position.y = 1.4
	var released := apply(fixture, {"action": "Idle", "grounded": false})
	verify(released.feet.l == null and released.feet.r == null and fixture.modifier.world_position(fixture.skeleton.find_bone("foot_l")).y > 1.4, "grounded:false never pulls an airborne actor back to the floor")
	released = apply(fixture, {"action": "Airborne", "grounded": true})
	verify(released.feet.l == null and released.feet.r == null, "Airborne action releases both anchors")
	fixture.actor.position = Vector3.ZERO
	fixture.modifier.reset_constraints()
	var collision := apply(fixture)
	verify(collision.clothCorrections > 0 and collision.colliderCount >= 6 and collision.minimumCapsuleClearance > -0.001, "Actual cloth bone is moved outside body capsules")
	var resets_ok := true
	for index in range(50):
		fixture.modifier.reset_constraints()
		var result := apply(fixture)
		resets_ok = resets_ok and result.feet.l.error < 0.003 and result.feet.r.error < 0.003
	verify(resets_ok and fixture.skeleton.get_bone_count() == fixture.authored.size(), "Repeated reset does not grow the rig or accumulate foot error")
	# Run the actual engine modifier stack. Unlike a manual call, Skeleton3D
	# restores its input poses after submitting modified bones to skin bindings.
	restore(fixture)
	fixture.modifier.reset_constraints()
	fixture.modifier.active = true
	var callback_count := [0]
	fixture.modifier.modification_processed.connect(func(): callback_count[0] += 1)
	for index in range(30):
		fixture.skeleton.advance(1.0 / 60.0)
		await process_frame
		await process_frame
	var restored := true
	for index in range(fixture.authored.size()):
		restored = restored and fixture.skeleton.get_bone_pose(index).is_equal_approx(fixture.authored[index])
	verify(callback_count[0] >= 25 and restored, "SkeletonModifier3D executes post-animation and restores authored poses without drift", callback_count[0])
	fixture.actor.queue_free()
	var arena = load("res://main.tscn").instantiate()
	root.add_child(arena)
	for index in range(12):
		await physics_frame
	var hero = arena.hero
	verify(hero.secondary != null and hero.secondary.stats.applications > 0 and hero.secondary.cloth.size() == 30, "Playable native hero actually runs the post-mixer modifier with all thirty cloth bones")
	var real_feet: Dictionary = hero.secondary.stats.feet
	verify(real_feet.l != null and real_feet.r != null and real_feet.l.error < 0.01 and real_feet.r.error < 0.01, "Imported character's actual ankles reach their world anchors", real_feet)
	hero.play_clip("Walk", true, 0.55)
	hero.animator.advance(0.125)
	var clip_state: Dictionary = hero.secondary_state()
	var double_rate_ok := absf(float(clip_state.actionTime) - 0.25) < 0.001
	hero.test_mode = true
	hero.test_movement = Vector3.RIGHT
	for index in range(20):
		await physics_frame
	var matched_rate: float = hero.animator.get_playing_speed()
	var moving_error := 0.0
	var stance_samples := 0
	for index in range(30):
		await physics_frame
		for foot in hero.secondary.stats.feet.values():
			if foot != null and foot.get("weight", 0.0) > 0.99 and foot.has("error"):
				stance_samples += 1
				moving_error = maxf(moving_error, foot.error)
	verify(double_rate_ok and hero.played == "Run" and absf(matched_rate - 3.1 / 3.28921) < 0.015 and stance_samples > 10 and moving_error < 0.01, "Native gait clock, travel rate and actual moving stance anchors agree", {"doubleSpeedSample": clip_state.actionTime, "travelMatchedRate": matched_rate, "clip": hero.played, "stanceSamples": stance_samples, "movingFootError": moving_error})
	var report := {"status": "passed" if failures == 0 else "failed", "passed": checks.size() - failures, "failed": failures, "engine": Engine.get_version_info().string, "asset_sha256": FileAccess.get_sha256("res://assets/warlord.glb"), "scope": "Actual Godot Skeleton3D/Modifier stack and runtime hook; no GPU image or native visual acceptance implied.", "checks": checks}
	report["source_sha256"] = {}
	for script in ["combatant.gd", "secondary_constraints.gd", "secondary_smoke_test.gd"]:
		report.source_sha256[script] = FileAccess.get_sha256("res://scripts/" + script)
	var output := FileAccess.open("res://validation/secondary-report.json", FileAccess.WRITE)
	output.store_string(JSON.stringify(report, "\t"))
	output.close()
	print("SECONDARY_SMOKE_RESULT " + JSON.stringify(report))
	quit(0 if failures == 0 else 1)
