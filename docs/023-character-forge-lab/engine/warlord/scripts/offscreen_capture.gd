extends SceneTree

# A capability probe, not a substitute for native GPU visual acceptance.
# Run with --headless. The official Windows build advertises only the dummy
# renderer for its headless display driver, even if gl_compatibility is requested.
func _initialize() -> void:
	probe.call_deferred()

func probe() -> void:
	var adapter := RenderingServer.get_video_adapter_name()
	var display := DisplayServer.get_name()
	var driver := RenderingServer.get_current_rendering_driver_name()
	var report := {
		"status": "unavailable",
		"engine": Engine.get_version_info().string,
		"os": OS.get_name(),
		"displayDriver": display,
		"renderingDriver": driver,
		"renderingMethod": RenderingServer.get_current_rendering_method(),
		"videoAdapter": adapter,
		"arguments": OS.get_cmdline_args(),
		"nativeGpuFrameCaptured": false,
		"scope": "Capability probe only. Never treats a dummy-renderer frame or headless gameplay checks as GPU visual acceptance.",
		"reason": "The Windows headless display driver only supports dummy rendering; a native GPU viewport image is unavailable without a window-capable display driver.",
		"references": [
			"https://docs.godotengine.org/en/4.5/tutorials/editor/command_line_tutorial.html",
			"https://docs.godotengine.org/en/4.5/classes/class_renderingserver.html#class-renderingserver-method-get-video-adapter-name"
		]
	}
	if display != "headless" and driver != "dummy" and not adapter.is_empty():
		# This path is available only when a caller has separately authorized a
		# real display. The automated workflow never launches this path.
		var arena = load("res://main.tscn").instantiate()
		root.add_child(arena)
		current_scene = arena
		for i in range(8):
			await process_frame
		await RenderingServer.frame_post_draw
		var image: Image = root.get_texture().get_image()
		if image != null and not image.is_empty():
			var destination := "res://validation/native-gpu-frame.png"
			var code := image.save_png(destination)
			report.status = "captured" if code == OK else "capture-failed"
			report.nativeGpuFrameCaptured = code == OK
			report["imagePath"] = "validation/native-gpu-frame.png"
			report["imageSize"] = {"width": image.get_width(), "height": image.get_height()}
			report.reason = "Captured an actual rendered native viewport." if code == OK else "The viewport image could not be saved."
	var output := FileAccess.open("res://validation/offscreen-probe.json", FileAccess.WRITE)
	if output == null:
		push_error("Could not save native capability probe report")
		quit(1)
		return
	output.store_string(JSON.stringify(report, "\t"))
	output.close()
	print("NATIVE_GPU_PROBE " + JSON.stringify(report))
	quit(0)
