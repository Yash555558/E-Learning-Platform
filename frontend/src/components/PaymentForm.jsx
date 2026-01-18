import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ courseId, coursePrice, onPaymentSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [disabled, setDisabled] = useState(true);

  useEffect(() => {
    const cardElement = elements?.getElement(CardElement);
    if (!cardElement) return;

    const handleChange = (event) => {
      setDisabled(event.empty);
      setError(event.error ? event.error.message : '');
    };

    cardElement.on('change', handleChange);

    return () => {
      cardElement.off('change', handleChange);
    };
  }, [elements]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    try {
      // Create payment intent on the backend
      const response = await fetch('/api/payments/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'credentials': 'include'
        },
        body: JSON.stringify({ courseId })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create payment intent');
      }

      const { clientSecret } = await response.json();

      // Confirm payment with Stripe
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: 'Customer', // Would come from user context in real app
          },
        },
      });

      if (result.error) {
        setError(result.error.message);
      } else if (result.paymentIntent.status === 'succeeded') {
        onPaymentSuccess();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">Pay ₹{coursePrice}</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Card Details</label>
        <div className="border border-gray-300 rounded-md p-3">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      </div>

      <div className="flex space-x-3">
        <button
          type="submit"
          disabled={processing || disabled || !stripe}
          className={`flex-1 bg-green-600 text-white py-3 px-4 rounded-md ${
            processing || disabled || !stripe
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-green-700'
          }`}
        >
          {processing ? 'Processing...' : `Pay ₹${coursePrice}`}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-md hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

const PaymentForm = ({ courseId, coursePrice, onPaymentSuccess, onCancel }) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm 
        courseId={courseId} 
        coursePrice={coursePrice} 
        onPaymentSuccess={onPaymentSuccess}
        onCancel={onCancel}
      />
    </Elements>
  );
};

export default PaymentForm;