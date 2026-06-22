/**
 * EXAMPLE COMPONENT — דוגמא מלאה לשאר הקומפוננטות
 * ─────────────────────────────────────────────────
 * כפתור ראשי עם צבעי "אנו בנייך" — מ-THEME (theme/colors.json), ללא hex ידני.
 */
import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  type TouchableOpacityProps,
} from 'react-native';
import { THEME } from '@/constants/theme';

type Variant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: Variant;
  isLoading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  label,
  variant = 'primary',
  isLoading = false,
  fullWidth = false,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
      disabled={isDisabled}
      activeOpacity={0.8}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'primary' ? THEME.white : THEME.primary} />
      ) : (
        <Text style={[styles.label, styles[`${variant}Label`]]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.5 },

  // ─── variants ───────────────────────────────────
  primary: { backgroundColor: THEME.primary },
  secondary: { backgroundColor: THEME.gold },
  ghost: { backgroundColor: 'transparent', borderWidth: 2, borderColor: THEME.primary },

  // ─── labels ─────────────────────────────────────
  label: { fontSize: 16, fontWeight: '700' },
  primaryLabel: { color: THEME.white },
  secondaryLabel: { color: THEME.primary },
  ghostLabel: { color: THEME.primary },
});
