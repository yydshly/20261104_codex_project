extends SkeletonModifier3D

# Post-AnimationMixer constraints. SkeletonModifier3D's owner automatically
# saves/restores the authored poses around the modifier stack every frame.
# Capsule checks guard blended poses; they do not replace offline triangle QA.
var actor_root: Node3D
var state_provider: Callable
var feet: Array[Dictionary] = []
var cloth: Array[Dictionary] = []
var first := true
var previous_root := Vector3.ZERO
var stats := {"feet": {"l": null, "r": null}, "maximumFootError": 0.0, "clothCorrections": 0, "minimumCapsuleClearance": 0.0, "colliderCount": 0, "applications": 0}

static func canonical(name_in: String) -> String:
	return {"Cleave": "Sweep", "GuardCast": "Guard", "Leap": "LeapSlam", "Stagger": "Hit"}.get(name_in, name_in)

static func foot_contact_weight(action_name: String, time := 0.0, side := "l") -> float:
	var name_in := canonical(action_name)
	if name_in in ["Idle", "Guard", "Hit", "Attack1", "Attack2", "Attack3", "Sweep", "Victory"]:
		return 1.0
	if name_in == "LeapSlam":
		return 1.0 if time < 0.18 else 0.0 if time < 0.92 else smoothstep(0.0, 0.08, time - 0.92)
	if name_in in ["Walk", "Run"]:
		var seconds := 1.1 if name_in == "Walk" else 0.8
		var phase := fposmod(time / seconds + (0.5 if side == "r" else 0.0), 1.0)
		return smoothstep(0.0, 0.06, phase) if phase < 0.06 else 1.0 if phase < 0.42 else 1.0 - smoothstep(0.42, 0.5, phase) if phase < 0.5 else 0.0
	return 0.0

static func project_out_of_capsule(point: Vector3, start: Vector3, finish: Vector3, radius: float, fallback := Vector3.BACK) -> Dictionary:
	var axis := finish - start
	var length2 := axis.length_squared()
	var phase := clampf((point - start).dot(axis) / length2, 0, 1) if length2 > 1e-12 else 0.0
	var nearest := start + axis * phase
	var radial := point - nearest
	var length := radial.length()
	var distance := length - radius
	if distance >= 0:
		return {"point": point, "distance": distance, "corrected": false}
	if length < 1e-8:
		radial = fallback.normalized() if fallback.length_squared() > 1e-12 else Vector3.BACK
	else:
		radial /= length
	return {"point": nearest + radial * radius, "distance": distance, "corrected": true}

func configure(root_in: Node3D, provider: Callable) -> void:
	actor_root = root_in
	state_provider = provider

func _ready() -> void:
	cache_bones()

func cache_bones() -> void:
	var skeleton := get_skeleton()
	if skeleton == null:
		return
	feet.clear()
	cloth.clear()
	if actor_root == null:
		actor_root = skeleton
	for side in ["l", "r"]:
		var foot := {"side": side, "upper": skeleton.find_bone("thigh_" + side), "lower": skeleton.find_bone("calf_" + side), "foot": skeleton.find_bone("foot_" + side), "target": null, "rotation": Quaternion.IDENTITY, "weight": 0.0, "ankleHeight": 0.12}
		if foot.foot >= 0:
			foot.ankleHeight = clampf(world_position(foot.foot).y - actor_root.global_position.y, 0.07, 0.20)
		feet.append(foot)
	for index in range(skeleton.get_bone_count()):
		var bone_name := skeleton.get_bone_name(index)
		if bone_name.begins_with("Mantle_") or bone_name.begins_with("SilkCrest_"):
			cloth.append({"index": index, "name": bone_name, "offset": Vector3.ZERO})
	reset_constraints()

func world_pose(index: int) -> Transform3D:
	var skeleton := get_skeleton()
	return skeleton.global_transform * skeleton.get_bone_global_pose(index)

func world_position(index: int) -> Vector3:
	return world_pose(index).origin

func world_rotation(index: int) -> Quaternion:
	return world_pose(index).basis.orthonormalized().get_rotation_quaternion()

func set_world_rotation(index: int, desired: Quaternion, weight := 1.0) -> void:
	var skeleton := get_skeleton()
	var pose := world_pose(index)
	var rotation := pose.basis.orthonormalized().get_rotation_quaternion().slerp(desired, weight)
	pose.basis = Basis(rotation).scaled(pose.basis.get_scale())
	skeleton.set_bone_global_pose(index, skeleton.global_transform.affine_inverse() * pose)

func solve_leg(foot: Dictionary, target: Vector3, weight: float) -> bool:
	var a := world_position(foot.upper)
	var b := world_position(foot.lower)
	var c := world_position(foot.foot)
	var length_a := a.distance_to(b)
	var length_b := b.distance_to(c)
	var direction := target - a
	var distance := direction.length()
	if length_a < 0.01 or length_b < 0.01 or distance < 0.001 or distance > length_a + length_b + 0.001:
		return false
	direction /= distance
	var pole := b - a - direction * (b - a).dot(direction)
	if pole.length_squared() < 1e-8:
		pole = -actor_root.global_basis.z
		pole -= direction * pole.dot(direction)
	if pole.length_squared() < 1e-8:
		pole = direction.cross(Vector3.RIGHT)
		if pole.length_squared() < 1e-8:
			pole = direction.cross(Vector3.FORWARD)
	pole = pole.normalized()
	var d := clampf(distance, absf(length_a - length_b) + 0.001, length_a + length_b - 0.001)
	var along := clampf((length_a * length_a + d * d - length_b * length_b) / (2 * d), -length_a, length_a)
	var knee := a + direction * along + pole * sqrt(maxf(0, length_a * length_a - along * along))
	set_world_rotation(foot.upper, Quaternion((b - a).normalized(), (knee - a).normalized()) * world_rotation(foot.upper), weight)
	var new_b := world_position(foot.lower)
	var new_c := world_position(foot.foot)
	set_world_rotation(foot.lower, Quaternion((new_c - new_b).normalized(), (target - new_b).normalized()) * world_rotation(foot.lower), weight)
	set_world_rotation(foot.foot, foot.rotation, weight)
	return true

func reachable_ground_target(foot: Dictionary, current: Vector3) -> Variant:
	var hip := world_position(foot.upper)
	var knee := world_position(foot.lower)
	var ankle := world_position(foot.foot)
	var reach := hip.distance_to(knee) + knee.distance_to(ankle) - 0.003
	var target := Vector3(current.x, foot.ankleHeight, current.z)
	var vertical := absf(hip.y - target.y)
	if vertical >= reach:
		return null
	var horizontal := Vector3(target.x - hip.x, 0, target.z - hip.z)
	var maximum_horizontal := sqrt(maxf(0, reach * reach - vertical * vertical))
	if horizontal.length() > maximum_horizontal:
		horizontal = horizontal.limit_length(maximum_horizontal)
		target.x = hip.x + horizontal.x
		target.z = hip.z + horizontal.z
	return target

func release_unreachable_foot(foot: Dictionary, current: Vector3) -> void:
	foot.target = null
	foot.weight = 0.0
	stats.feet[foot.side] = {"weight": 0.0, "releasedReason": "ground-outside-anatomical-reach", "position": current}

func body_capsules() -> Array[Dictionary]:
	var skeleton := get_skeleton()
	var result: Array[Dictionary] = []
	var append_bone_capsule := func(first_name: String, last_name: String, radius: float, label: String) -> void:
		var a := skeleton.find_bone(first_name)
		var b := skeleton.find_bone(last_name)
		if a >= 0 and b >= 0:
			result.append({"a": world_position(a), "b": world_position(b), "radius": radius, "name": label})
	append_bone_capsule.call("pelvis", "spine_03", 0.235, "torso")
	append_bone_capsule.call("spine_02", "Head", 0.195, "upper-body")
	for side in ["l", "r"]:
		var upper := skeleton.find_bone("upperarm_" + side)
		var lower := skeleton.find_bone("lowerarm_" + side)
		if upper >= 0 and lower >= 0:
			result.append({"a": world_position(upper), "b": world_position(upper).lerp(world_position(lower), 0.45), "radius": 0.185, "name": "shoulder-" + side})
		append_bone_capsule.call("thigh_" + side, "calf_" + side, 0.145, "thigh-" + side)
		append_bone_capsule.call("calf_" + side, "foot_" + side, 0.112, "calf-" + side)
	var grip_index := skeleton.find_bone("HalberdGrip")
	var tip_index := skeleton.find_bone("HalberdTip")
	if grip_index >= 0 and tip_index >= 0:
		var grip := world_position(grip_index)
		var tip := world_position(tip_index)
		var axis := (tip - grip).normalized()
		result.append({"a": grip - axis * 1.26, "b": tip, "radius": 0.042, "name": "halberd-shaft"})
		result.append({"a": tip - axis * 0.45, "b": tip - axis * 0.08, "radius": 0.20, "name": "halberd-head"})
	return result

func apply_capsules(point: Vector3, colliders: Array[Dictionary], joint_name: String) -> Vector3:
	var target := point
	for iteration in range(3):
		for collider in colliders:
			if joint_name.begins_with("SilkCrest_") and joint_name.ends_with("_0") and ("body" in collider.name or "shoulder" in collider.name):
				continue
			var projected := project_out_of_capsule(target, collider.a, collider.b, collider.radius + 0.014, actor_root.global_basis.z)
			if projected.corrected:
				target = projected.point
				stats.clothCorrections += 1
	return target

func apply_constraints(delta: float, state: Dictionary) -> Dictionary:
	if delta <= 0 or get_skeleton() == null:
		return stats
	if feet.is_empty():
		cache_bones()
	var root_position := actor_root.global_position
	if first or root_position.distance_to(previous_root) > 1.5:
		for foot in feet:
			foot.target = null
			foot.weight = 0.0
		for joint in cloth:
			joint.offset = Vector3.ZERO
		first = false
	previous_root = root_position
	var action_name := canonical(state.get("action", "Idle"))
	var time := float(state.get("actionTime", 0.0))
	for foot in feet:
		if foot.upper < 0 or foot.lower < 0 or foot.foot < 0:
			continue
		var weight := foot_contact_weight(action_name, time, foot.side) if state.get("grounded", true) else 0.0
		var current := world_position(foot.foot)
		if weight < 0.02:
			foot.target = null
			foot.weight = weight
			stats.feet[foot.side] = null
			continue
		var lead := "r" if action_name == "Attack2" else "l"
		var step: Vector2 = {"Attack1": Vector2(0.12, 0.30), "Attack2": Vector2(0.14, 0.33), "Attack3": Vector2(0.22, 0.42), "Sweep": Vector2(0.21, 0.44)}.get(action_name, Vector2.ZERO)
		if step.y > step.x and foot.side == lead and time >= step.x and time < step.y:
			var lift := sin(clampf((time - step.x) / (step.y - step.x), 0, 1) * PI) * 0.085
			var target := Vector3(current.x, float(foot.ankleHeight) + lift, current.z)
			foot.target = null
			foot.weight = 0.0
			solve_leg(foot, target, 1.0)
			stats.feet[foot.side] = {"weight": 0.0, "stepping": true, "lift": lift, "position": world_position(foot.foot)}
			continue
		if foot.target == null or foot.weight < 0.02 or current.distance_to(foot.target) > 0.48:
			foot.target = reachable_ground_target(foot, current)
			if foot.target == null:
				release_unreachable_foot(foot, current)
				continue
			foot.rotation = world_rotation(foot.foot)
		var replanted := false
		if not solve_leg(foot, foot.target, weight):
			foot.target = reachable_ground_target(foot, current)
			if foot.target == null:
				release_unreachable_foot(foot, current)
				continue
			foot.rotation = world_rotation(foot.foot)
			if not solve_leg(foot, foot.target, weight):
				release_unreachable_foot(foot, current)
				continue
			replanted = true
		var error := world_position(foot.foot).distance_to(foot.target)
		stats.maximumFootError = maxf(stats.maximumFootError, error)
		stats.feet[foot.side] = {"weight": weight, "error": error, "target": foot.target, "position": world_position(foot.foot), "replanted": replanted}
		foot.weight = weight
	var colliders := body_capsules()
	var authored: Array[Vector3] = []
	for joint in cloth:
		authored.append(world_position(joint.index))
	stats.clothCorrections = 0
	stats.minimumCapsuleClearance = INF
	stats.colliderCount = colliders.size()
	for index in range(cloth.size()):
		var joint := cloth[index]
		var desired := apply_capsules(authored[index], colliders, joint.name)
		joint.offset = (joint.offset as Vector3).lerp(desired - authored[index], 1.0 - exp(-delta * 25.0))
		var target := apply_capsules(authored[index] + joint.offset, colliders, joint.name)
		if target.distance_to(authored[index]) > 0.24:
			target = authored[index] + (target - authored[index]).limit_length(0.24)
		var pose := world_pose(joint.index)
		pose.origin = target
		var skeleton := get_skeleton()
		skeleton.set_bone_global_pose(joint.index, skeleton.global_transform.affine_inverse() * pose)
		for collider in colliders:
			stats.minimumCapsuleClearance = minf(stats.minimumCapsuleClearance, float(project_out_of_capsule(target, collider.a, collider.b, collider.radius).distance))
	if colliders.is_empty() or cloth.is_empty():
		stats.minimumCapsuleClearance = 0.0
	stats.applications += 1
	return stats

func _process_modification_with_delta(delta: float) -> void:
	if not state_provider.is_valid():
		return
	apply_constraints(delta, state_provider.call())

func reset_constraints() -> void:
	first = true
	stats.maximumFootError = 0.0
	stats.feet = {"l": null, "r": null}
	for foot in feet:
		foot.target = null
		foot.weight = 0.0
	for joint in cloth:
		joint.offset = Vector3.ZERO
