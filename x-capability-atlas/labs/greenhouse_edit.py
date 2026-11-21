"""Shared frame boundaries for both aspect ratios of the R04 film."""

FPS = 24
FILM_SECONDS = 16
SHOTS = ('fly', 'track', 'zoom', 'bullet', 'time')
NAMES = ('空间建立', '低机位跟拍', '传感器推近', '定格绕拍', '巡检行进')
OFFSETS = (5, 8, 5, 7, 8)


def film_segments():
    total_frames = FPS * FILM_SECONDS
    for index, (shot, title, offset) in enumerate(zip(SHOTS, NAMES, OFFSETS)):
        start = round(index * total_frames / len(SHOTS))
        end = round((index + 1) * total_frames / len(SHOTS))
        yield shot, title, offset, start, end
