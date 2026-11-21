"""Build the offline classroom from the existing projection artwork."""

from copy import deepcopy
from pathlib import Path
import xml.etree.ElementTree as ET


LABS = Path(__file__).resolve().parent
SVG = 'http://www.w3.org/2000/svg'
NS = {'s': SVG}
STATES = ('closed', 'middle', 'open')


def svg_element(name, **attributes):
    return ET.Element(f'{{{SVG}}}{name}', attributes)


def main():
    ET.register_namespace('', SVG)
    source = ET.parse(LABS / 'leaf-lesson-sheet.svg').getroot()
    defs = deepcopy(source.find('s:defs', NS))
    glass = defs.find("s:clipPath[@id='glass']/s:rect", NS)
    width, height = (float(glass.attrib[axis]) for axis in ('width', 'height'))
    view = f'0 0 {width:g} {height:g}'

    for state in STATES:
        panels = source.findall(".//s:g[@clip-path='url(#glass)']", NS)
        panel = next(panel for panel in panels if panel.find(f".//s:use[@href='#{state}-pore']", NS) is not None)
        measure_start = next(index for index, item in enumerate(panel) if item.get('href') == '#dot-ruler')
        for suffix, items in [('field', panel[:measure_start]), ('measure', panel[measure_start:measure_start + 2])]:
            symbol = svg_element('symbol', id=f'leaf-{state}-{suffix}', viewBox=view)
            group = svg_element('g', **{'clip-path': panel.attrib['clip-path']})
            group.extend(deepcopy(items))
            symbol.append(group)
            defs.append(symbol)

    labels = panel[measure_start + 2:]
    pins = [item for item in labels if item.tag == f'{{{SVG}}}circle']
    if len(pins) != 2:
        raise ValueError('Expected a cell and pore marker in the open panel')
    annotations = svg_element('symbol', id='leaf-open-annotations', viewBox=view)
    annotations.extend(deepcopy(labels))
    defs.append(annotations)
    shared = svg_element('svg', width='0', height='0', **{'aria-hidden': 'true', 'class': 'leaf-definitions'})
    shared.append(defs)

    template = (LABS / 'leaf-classroom.template.html').read_text(encoding='utf-8')
    tokens = {'@@ARTWORK@@': ET.tostring(shared, encoding='unicode'), '@@VIEWBOX@@': view}
    for letter, pin in zip(('A', 'B'), pins):
        x = 100 * float(pin.attrib['cx']) / width
        y = 100 * float(pin.attrib['cy']) / height
        tokens[f'@@PIN_{letter}@@'] = f'--x:{x:.4f}%;--y:{y:.4f}%'
    for token, value in tokens.items():
        if token not in template:
            raise ValueError(f'Missing classroom template token: {token}')
        template = template.replace(token, value)
    (LABS / 'leaf-classroom.html').write_text(template, encoding='utf-8', newline='\n')


if __name__ == '__main__':
    main()
