"""Package the case 10 course, stylesheet, runtime and narration as one HTML file."""

from base64 import b64encode
from pathlib import Path
import re


LABS = Path(__file__).resolve().parent
MEDIA = LABS / 'lesson-media'


def replace_section(markup, pattern, replacement, name, count=1):
    result, replacements = re.subn(pattern, lambda _: replacement, markup, flags=re.DOTALL | re.MULTILINE)
    if replacements != count:
        raise ValueError(f'Expected {count} {name} section(s), found {replacements}')
    return result


def main():
    markup = (LABS / 'lesson.html').read_text(encoding='utf8')
    css = (LABS / 'lesson.css').read_text(encoding='utf8')
    script = (LABS / 'lesson.js').read_text(encoding='utf8')
    audio = b64encode((MEDIA / 'rgb-narration.mp3').read_bytes()).decode('ascii')
    if '</style' in css.lower() or '</script' in script.lower():
        raise ValueError('The stylesheet or runtime contains an HTML closing tag')
    markup = replace_section(markup, r'^[ \t]*<!-- ONLINE-ONLY:BEGIN -->.*?<!-- ONLINE-ONLY:END -->\n', '',
                             'online-only', count=2)
    markup = replace_section(markup, r'<link id="lesson-styles"[^>]*>', f'<style>\n{css}</style>', 'stylesheet')
    markup = replace_section(markup, r'<script id="lesson-runtime"[^>]*></script>\n', '', 'runtime reference')
    markup = replace_section(markup, r'src="lesson-media/rgb-narration\.mp3"',
                             f'src="data:audio/mpeg;base64,{audio}"', 'narration')
    markup = replace_section(markup, r'</body>', f'  <script>\n{script}</script>\n</body>', 'runtime position')
    (MEDIA / 'rgb-micro-lesson.html').write_text(markup, encoding='utf8', newline='\n')


if __name__ == '__main__':
    main()
