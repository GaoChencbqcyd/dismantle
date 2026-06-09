import { FontSize as FS } from '../theme/colors';

export const Typography = {
  caption: {
    fontSize: FS.caption,
    lineHeight: FS.caption * 1.4,
    letterSpacing: 0,
  },
  small: {
    fontSize: FS.small,
    lineHeight: FS.small * 1.5,
    letterSpacing: -0.01,
  },
  body: {
    fontSize: FS.body,
    lineHeight: FS.body * 1.6,
    letterSpacing: -0.01,
  },
  subtitle: {
    fontSize: FS.subtitle,
    lineHeight: FS.subtitle * 1.5,
    letterSpacing: -0.02,
    fontWeight: '600' as const,
  },
  title: {
    fontSize: FS.title,
    lineHeight: FS.title * 1.4,
    letterSpacing: -0.02,
    fontWeight: '700' as const,
  },
  heading: {
    fontSize: FS.heading,
    lineHeight: FS.heading * 1.3,
    letterSpacing: -0.02,
    fontWeight: '700' as const,
  },
  display: {
    fontSize: FS.display,
    lineHeight: FS.display * 1.2,
    letterSpacing: -0.03,
    fontWeight: '700' as const,
  },
  hero: {
    fontSize: FS.hero,
    lineHeight: FS.hero * 1.1,
    letterSpacing: -0.04,
    fontWeight: '700' as const,
  },
} as const;

export type TypographyVariant = keyof typeof Typography;
