export const rulesFontFamilies = {
  regular: 'LiberationSans',
  bold: 'LiberationSans-Bold',
  italic: 'LiberationSans-Italic',
  boldItalic: 'LiberationSans-BoldItalic',
};

export function rulesFontFamilyForTraits(options: {bold?: boolean; italic?: boolean}): string {
  const {bold, italic} = options;
  if (bold && italic) {
    return rulesFontFamilies.boldItalic;
  }
  if (bold) {
    return rulesFontFamilies.bold;
  }
  if (italic) {
    return rulesFontFamilies.italic;
  }
  return rulesFontFamilies.regular;
}
