/** TODO: שדה קלט RTL-aware עם label ו-error state */
import React from 'react';
import { TextInput, View, Text, type TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  rtl?: boolean;
}

export function Input({ label, error, rtl = false, ...rest }: InputProps) {
  // TODO: לממש סגנונות, צבעי focus, RTL
  return (
    <View>
      {label && <Text>{label}</Text>}
      <TextInput textAlign={rtl ? 'right' : 'left'} {...rest} />
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
    </View>
  );
}
