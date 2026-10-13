import importlib.util
from pathlib import Path
import unittest

SCRIPT = Path(__file__).resolve().parents[1] / 'extract-structured.py'
spec = importlib.util.spec_from_file_location('extract_structured', SCRIPT)
extract = importlib.util.module_from_spec(spec)
spec.loader.exec_module(extract)


def line(text, y=40, x=43, font='ArialMT', size=10, flags=0, block=0):
    spans = [{'text': text, 'font': font, 'size': size, 'flags': flags}]
    raw = {'spans': spans}
    return {'kind': 'line', 'bbox': (x, y, x+200, y+11), 'runs': extract.line_runs(raw),
            'level': extract.heading_level(raw), 'size': size, 'block': block}


class ExtractionTests(unittest.TestCase):
    def test_font_flags_preserve_inline_emphasis_and_punctuation(self):
        runs = extract.line_runs({'spans': [
            {'text': 'Your ', 'font': 'ArialMT', 'flags': 0},
            {'text': 'Reserve Deck', 'font': 'Arial-ItalicMT', 'flags': 2},
            {'text': ', Force Pile.', 'font': 'Arial-BoldMT', 'flags': 16},
        ]})
        self.assertEqual(extract.text_of(runs), 'Your Reserve Deck, Force Pile.')
        self.assertTrue(runs[1]['italic'])
        self.assertTrue(runs[2]['bold'])

    def test_bold_sentence_is_not_misclassified_as_a_heading(self):
        item = line('The steps of the Power Segment are always carried', font='Arial-BoldMT', flags=16)
        self.assertEqual(item['level'], 0)
        self.assertEqual(line('Life Force', font='Arial-BoldMT', flags=16)['level'], 3)

    def test_wrapped_heading_keeps_separator_spacing(self):
        blocks = extract.blocks_from_items([
            line('Revealing Cards - ', font='Arial-BoldMT', flags=16),
            line('Example 2', y=51.5, font='Arial-BoldMT', flags=16),
        ], 10)
        self.assertEqual(blocks[0]['text'], 'Revealing Cards - Example 2')

    def test_list_continuation_keeps_each_bullet_separate(self):
        blocks = extract.blocks_from_items([
            line('• initiate an action that deploys,'),
            line('takes or exchanges a card;', y=51.5, x=49, block=1),
            line('• initiate an action that draws;', y=63, block=2),
            line('A new paragraph.', y=80, block=3),
        ], 10)
        self.assertEqual([b['text'] for b in blocks], [
            '• initiate an action that deploys, takes or exchanges a card;',
            '• initiate an action that draws;', 'A new paragraph.',
        ])
        self.assertTrue(blocks[0]['listItem'])

    def test_known_icons_are_normalized_and_unknown_glyphs_fail_loudly(self):
        self.assertEqual(extract.text_of(extract.line_runs({'spans': [{'text': '\uf0b8Forest', 'font': 'Wingdings2'}]})), '◇Forest')
        with self.assertRaisesRegex(ValueError, 'Unmapped PDF glyphs'):
            extract.line_runs({'spans': [{'text': '\uf099', 'font': 'Wingdings'}]})

    def test_columns_do_not_join_unrelated_paragraphs(self):
        blocks = extract.blocks_from_items([line('Left column.'), line('Right column.', x=320)], 9)
        self.assertEqual(len(blocks), 2)

    def test_word_split_at_a_style_boundary_is_not_given_a_space(self):
        runs = extract.line_runs({'spans': [
            {'text': 're', 'font': 'ArialMT', 'flags': 0},
            {'text': 'circulate', 'font': 'Arial-BoldMT', 'flags': 16},
        ]})
        self.assertEqual(extract.text_of(runs), 'recirculate')


if __name__ == '__main__':
    unittest.main()
