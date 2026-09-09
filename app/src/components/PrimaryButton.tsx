import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
} from 'react-native';
import { colors } from '../theme/colors';

interface PrimaryButtonProps extends PressableProps {
  children: ReactNode;
  icon?: ReactNode;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}

export function PrimaryButton({
  children,
  disabled,
  icon,
  loading,
  variant = 'primary',
  style,
  ...props
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => [
        buttonStyles.base,
        buttonStyles[variant],
        isDisabled && buttonStyles.disabled,
        pressed && !isDisabled && buttonStyles.pressed,
        typeof style === 'function' ? style({ pressed }) : style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.text} />
      ) : (
        <>
          {icon}
          <Text style={buttonStyles.text}>{children}</Text>
        </>
      )}
    </Pressable>
  );
}

const buttonStyles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 16,
  },
  primary: {
    backgroundColor: colors.primaryDark,
  },
  secondary: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderWidth: 1,
  },
  danger: {
    backgroundColor: colors.danger,
  },
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    opacity: 0.82,
  },
  text: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
});
