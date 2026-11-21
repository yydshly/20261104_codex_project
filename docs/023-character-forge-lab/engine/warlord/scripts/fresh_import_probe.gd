extends SceneTree

# Run only after extracting the lean sourcekit into a new workspace folder and
# importing it. This checks real imported resources, not a reused editor cache.
func _initialize() -> void:
	probe.call_deferred()

func probe() -> void:
	var packed = load("res://assets/warlord.glb") as PackedScene
	if packed == null:
		push_error("Fresh GLB import did not produce a PackedScene")
		quit(1)
		return
	var model := packed.instantiate()
	root.add_child(model)
	await process_frame
	var skeletons := model.find_children("*", "Skeleton3D", true, false)
	var animators := model.find_children("*", "AnimationPlayer", true, false)
	var required := ["ArmorDark", "ArmorGold", "Blade", "ClothRed", "HeroSkin"]
	var evidence := {}
	var mesh_count := 0
	for part in model.find_children("*", "MeshInstance3D", true, false):
		if part.mesh == null:
			continue
		mesh_count += 1
		for index in range(part.mesh.get_surface_count()):
			var material = part.mesh.surface_get_material(index) as StandardMaterial3D
			if material == null or material.resource_name not in required:
				continue
			var maps := {"baseColor": material.albedo_texture, "normal": material.normal_texture, "roughness": material.roughness_texture}
			var sizes := {}
			for key in maps:
				var texture: Texture2D = maps[key]
				sizes[key] = [texture.get_width(), texture.get_height()] if texture != null else [0, 0]
			evidence[material.resource_name] = {"maps": sizes, "normalEnabled": material.normal_enabled, "roughnessChannel": material.roughness_texture_channel}
	var materials_ok := true
	for material_name in required:
		materials_ok = materials_ok and evidence.has(material_name)
		if evidence.has(material_name):
			materials_ok = materials_ok and evidence[material_name].normalEnabled
			for dimensions in evidence[material_name].maps.values():
				materials_ok = materials_ok and dimensions[0] >= 64 and dimensions[1] >= 64
	var bone_count: int = skeletons[0].get_bone_count() if not skeletons.is_empty() else 0
	var clip_count: int = animators[0].get_animation_list().size() if not animators.is_empty() else 0
	var settings := ConfigFile.new()
	var read_ok := settings.load("res://assets/warlord.glb.import") == OK
	var lod_enabled: bool = read_ok and settings.get_value("params", "meshes/generate_lods", false) == true
	var passed := bone_count >= 100 and clip_count == 13 and mesh_count > 0 and materials_ok and lod_enabled
	var report := {"status": "passed" if passed else "failed", "asset_sha256": FileAccess.get_sha256("res://assets/warlord.glb"), "bones": bone_count, "clips": clip_count, "meshInstances": mesh_count, "materials": evidence, "meshes/generate_lods": lod_enabled, "scope": "Fresh sourcekit import and real texture/skeleton/animation resources only. Not GPU pixel or performance acceptance."}
	var output := FileAccess.open("res://validation/fresh-import-probe.json", FileAccess.WRITE)
	output.store_string(JSON.stringify(report, "\t"))
	output.close()
	print("FRESH_IMPORT_PROBE " + JSON.stringify(report))
	quit(0 if passed else 1)
