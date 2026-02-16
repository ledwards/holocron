import {StyleSheet} from 'react-native';
import {rulesFontFamilies} from './rulesTypography';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topGlassContainer: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  topGlassBlur: {
    ...StyleSheet.absoluteFillObject,
  },
  topGlassTint: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.36,
  },
  topGlassContent: {
    paddingBottom: 6,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 14,
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 17,
  },
  tocButton: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  tocButtonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: rulesFontFamilies.bold,
  },
  clearButton: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginLeft: 8,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: rulesFontFamilies.bold,
  },
  statusRow: {
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    fontFamily: rulesFontFamilies.bold,
  },
  contentContainer: {
    flex: 1,
  },
  bottomGlassContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  bottomGlassBlur: {
    ...StyleSheet.absoluteFillObject,
  },
  bottomGlassTint: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.34,
  },
  tocPanel: {
    maxHeight: 300,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  tocDrawerOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 30,
    flexDirection: 'row',
  },
  tocDrawerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  tocDrawer: {
    width: '86%',
    maxWidth: 380,
    borderLeftWidth: 1,
    paddingTop: 16,
    paddingHorizontal: 12,
    paddingBottom: 110,
  },
  tocSearchInput: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 10,
  },
  tocTreeScroll: {
    flex: 1,
  },
  tocTreeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tocExpandButton: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tocExpandSpacer: {
    width: 22,
  },
  tocItem: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    flex: 1,
  },
  tocText: {
    fontSize: 15,
    fontFamily: rulesFontFamilies.regular,
  },
  docContent: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 230,
  },
  pageCard: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 6,
    marginBottom: 14,
  },
  pageHeadingBlock: {
    marginBottom: 6,
  },
  pageParagraphBlock: {
    marginBottom: 10,
  },
  pageFooter: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
    marginTop: 4,
    alignItems: 'center',
  },
  pageFooterText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    opacity: 0.9,
    fontFamily: rulesFontFamilies.bold,
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 10,
    marginBottom: 14,
  },
  headingRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  pageBadge: {
    fontSize: 11,
    fontWeight: '700',
    opacity: 0.85,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    fontFamily: rulesFontFamilies.bold,
  },
  headingText: {
    fontSize: 29,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 6,
    lineHeight: 34,
    fontFamily: rulesFontFamilies.bold,
  },
  paragraphCard: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  paragraphText: {
    fontSize: 19,
    lineHeight: 29,
    fontFamily: rulesFontFamilies.regular,
  },
  bulletText: {
    fontSize: 19,
    lineHeight: 29,
    paddingLeft: 14,
    fontFamily: rulesFontFamilies.regular,
  },
  linkText: {
    textDecorationLine: 'underline',
  },
  highlightText: {
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  imageBlock: {
    marginBottom: 14,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
  },
  imageCaption: {
    fontSize: 13,
    marginTop: 8,
    marginBottom: 10,
    marginHorizontal: 4,
    fontFamily: rulesFontFamilies.regular,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    fontFamily: rulesFontFamilies.regular,
  },
  cardModalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 28,
    backgroundColor: 'transparent',
  },
  cardModalContent: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 16,
    borderWidth: 0,
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
    backgroundColor: 'transparent',
  },
  cardModalImage: {
    width: '100%',
    height: 520,
  },
});

export default styles;
