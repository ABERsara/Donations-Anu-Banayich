import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripePromise } from '../../services/stripe-web';

type PaymentResult = 'success' | 'canceled' | 'failed';

interface WebPaymentFormProps {
  clientSecret: string;
  onResult: (result: PaymentResult, paymentIntentId?: string) => void;
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
  onResult: (result: PaymentResult, paymentIntentId?: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      setErrorMessage(error.message ?? 'אירעה שגיאה בתהליך התשלום');
      onResult('failed');
      return;
    }

    if (paymentIntent && paymentIntent.status === 'succeeded') {
      onResult('success', paymentIntent.id);
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

      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

      <Pressable
        style={[styles.payButton, isProcessing && styles.disabledButton]}
        onPress={handleSubmit}
        disabled={!stripe || isProcessing}
      >
        <Text style={styles.payButtonText}>{isProcessing ? 'מעבד תשלום...' : 'שלם'}</Text>
      </Pressable>

      <Pressable style={styles.cancelButton} onPress={handleCancel} disabled={isProcessing}>
        <Text style={styles.cancelButtonText}>ביטול</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  errorText: {
    color: '#d32f2f',
    marginTop: 8,
    fontSize: 14,
  },
  payButton: {
    backgroundColor: '#635bff',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
  payButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 14,
  },
});
