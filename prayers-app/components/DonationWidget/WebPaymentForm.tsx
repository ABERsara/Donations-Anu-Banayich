import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

import { stripePromise } from '../../services/stripe-web';
import { COLORS } from '../../constants/theme';

type PaymentResult = 'success' | 'canceled' | 'failed';

interface WebPaymentFormProps {
  clientSecret: string;
  onResult: (result: PaymentResult, paymentIntentId?: string, saveCard?: boolean) => void;
}

export default function WebPaymentForm({ clientSecret, onResult }: WebPaymentFormProps) {
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm onResult={onResult} />
    </Elements>
  );
}

function CheckoutForm({
  onResult,
}: {
  onResult: (result: PaymentResult, paymentIntentId?: string, saveCard?: boolean) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const { t } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saveCard, setSaveCard] = useState(false);

  const handleSubmit = async () => {
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    setIsProcessing(false);

    if (error) {
      setErrorMessage(error.message ?? t('common.error'));
      onResult('failed');
      return;
    }

    if (paymentIntent && paymentIntent.status === 'succeeded') {
      onResult('success', paymentIntent.id, saveCard);
    } else {
      onResult('failed');
    }
  };

  const handleCancel = () => {
    onResult('canceled');
  };

  return (
    <View style={styles.container}>
      <PaymentElement />

      <Pressable
        style={styles.checkboxRow}
        onPress={() => setSaveCard((prev) => !prev)}
        disabled={isProcessing}
      >
        <View style={[styles.checkboxBox, saveCard && styles.checkboxBoxChecked]}>
          {saveCard && <Text style={styles.checkboxMark}>✓</Text>}
        </View>
        <Text style={styles.checkboxLabel}>{t('donation.save_card')}</Text>
      </Pressable>

      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

      <Pressable
        style={[styles.payButton, isProcessing && styles.disabledButton]}
        onPress={handleSubmit}
        disabled={!stripe || isProcessing}
      >
        <Text style={styles.payButtonText}>
          {isProcessing ? t('donation.processing') : t('donation.pay')}
        </Text>
      </Pressable>

      <Pressable style={styles.cancelButton} onPress={handleCancel} disabled={isProcessing}>
        <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.ink.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxBoxChecked: {
    backgroundColor: COLORS.primary.DEFAULT,
    borderColor: COLORS.primary.DEFAULT,
  },
  checkboxMark: {
    color: COLORS.surface.card,
    fontSize: 13,
    fontWeight: '700',
  },
  checkboxLabel: {
    color: COLORS.ink.DEFAULT,
    fontSize: 14,
  },
  errorText: {
    color: COLORS.flame.DEFAULT,
    marginTop: 8,
    fontSize: 14,
  },
  payButton: {
    backgroundColor: COLORS.primary.DEFAULT,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
  payButtonText: {
    color: COLORS.surface.card,
    fontWeight: '600',
    fontSize: 16,
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelButtonText: {
    color: COLORS.ink.muted,
    fontSize: 14,
  },
});
