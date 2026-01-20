import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../utils/api';

// Stripe Payment Form Component
const CheckoutForm = ({ courseId, coursePrice, onPaymentSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      // Stripe.js has not loaded yet
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create payment intent on the backend
      const response = await api.post('/api/payments/create-payment-intent', {
        courseId,
        amount: coursePrice * 100, // Convert to cents/paise
        currency: 'inr'
      });

      const { clientSecret } = response.data;

      // Confirm the payment
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            // You can collect and add customer details here
          },
        },
      });

      if (result.error) {
        // Show error to customer
        throw new Error(result.error.message);
      } else {
        // The payment has been processed
        if (result.paymentIntent.status === 'succeeded') {
          // Complete enrollment on backend
          const enrollResponse = await api.post('/api/enrollments', { courseId });
          
          onPaymentSuccess();
        }
      }
    } catch (err) {
      setError(err.message);
      console.error('Payment error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
      <h3 className="text-xl font-bold mb-4 text-center">Secure Payment</h3>
      <div className="mb-4 p-4 bg-green-50 rounded-lg">
        <p className="text-gray-700 mb-2"><strong>Course:</strong> ₹{coursePrice}</p>
        <p className="text-sm text-gray-600">Powered by Stripe - Secure payment processing</p>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Card Details</label>
        <div className="border p-3 rounded-md bg-gray-50">
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
      </div>
      
      {error && <div className="text-red-500 text-sm mb-4 text-center">{error}</div>}
      
      <div className="flex flex-col space-y-3">
        <button
          type="submit"
          disabled={!stripe || loading}
          className={`bg-green-600 text-white py-3 px-4 rounded-md font-medium transition ${
            !stripe || loading
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-green-700'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing...
            </div>
          ) : (
            `Pay ₹${coursePrice}`
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-500 text-white py-3 px-4 rounded-md font-medium hover:bg-gray-600 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

// Main PaymentForm component that can use either Stripe or simulated payment
const PaymentForm = ({ courseId, coursePrice, onPaymentSuccess, onCancel, useSimulated = false, stripePublicKey = null }) => {
  const [stripeInstance, setStripeInstance] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const initializeStripe = async () => {
      if (typeof window !== 'undefined') {
        // Try to get key from props first, then from environment
        let publishableKey = stripePublicKey || import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

        
        if (publishableKey && typeof publishableKey === 'string' && publishableKey.trim() !== '') {

          try {
            const stripe = await loadStripe(publishableKey.trim());

            if (stripe) {
              setStripeInstance(stripe);
            }
          } catch (error) {
            console.error('Error initializing Stripe:', error);
          }
        }
      }
      setLoading(false);
    };
    
    initializeStripe();
  }, [stripePublicKey]);
  
  // Wait for Stripe to be initialized before deciding
  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto text-center">
        <div className="flex justify-center mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
        <p>Loading payment system...</p>
      </div>
    );
  }
  
  // Temporary fix: if useSimulated is not explicitly true, try to use Stripe
  // This will bypass the environment variable check when Stripe is initialized
  const useSimulatedPayment = useSimulated || (!stripeInstance);
  
  if (useSimulatedPayment) {
    // Fallback to simulated payment if explicitly requested or Stripe is not available
    return <SimulatedPaymentForm courseId={courseId} coursePrice={coursePrice} onPaymentSuccess={onPaymentSuccess} onCancel={onCancel} />;
  }

  return (
    <Elements stripe={stripeInstance}>
      <CheckoutForm 
        courseId={courseId} 
        coursePrice={coursePrice} 
        onPaymentSuccess={onPaymentSuccess} 
        onCancel={onCancel} 
      />
    </Elements>
  );
};

// Simulated payment form (fallback)
const SimulatedPaymentForm = ({ courseId, coursePrice, onPaymentSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // Create order on the backend
      const response = await api.post('/api/payments/create-order', { courseId });
      const orderData = response.data;

      // Simulate payment processing
      const paymentResponse = await api.post('/api/payments/simulate-payment', {
        orderId: orderData.orderId,
        courseId: courseId
      });

      const paymentResult = paymentResponse.data;

      if (paymentResult.success) {
        onPaymentSuccess();
      } else {
        setError(paymentResult.message || 'Payment simulation failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
      <h3 className="text-xl font-bold mb-4 text-center">Simulate Payment</h3>
      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-gray-700 mb-2"><strong>Course:</strong> ₹{coursePrice}</p>
        <p className="text-sm text-gray-600">This is a simulated payment flow for demonstration purposes.</p>
        <p className="text-xs text-gray-500 mt-2">No real money will be charged.</p>
      </div>
      
      {error && <div className="text-red-500 text-sm mb-4 text-center">{error}</div>}
      
      <div className="flex flex-col space-y-3">
        <button
          type="button"
          onClick={handlePayment}
          disabled={loading}
          className={`bg-green-600 text-white py-3 px-4 rounded-md font-medium transition ${
            loading
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-green-700'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing...
            </div>
          ) : (
            `Pay ₹${coursePrice} (Simulated)`
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-500 text-white py-3 px-4 rounded-md font-medium hover:bg-gray-600 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default PaymentForm;