import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.VITE_STRIPE_PUBLISHABLE_KEY);

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
      const response = await fetch('/api/payments/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
          amount: coursePrice * 100, // Convert to cents/paise
          currency: 'inr'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create payment intent');
      }

      const { clientSecret } = await response.json();

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
          const enrollResponse = await fetch('/api/enrollments', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ courseId })
          });
          
          if (!enrollResponse.ok) {
            const errorData = await enrollResponse.json();
            throw new Error(errorData.message || 'Failed to create enrollment');
          }
          
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
const PaymentForm = ({ courseId, coursePrice, onPaymentSuccess, onCancel, useSimulated = false }) => {
  // Use simulated payment if explicitly requested or if Stripe keys aren't configured
  const useSimulatedPayment = useSimulated || 
    !process.env.VITE_STRIPE_PUBLISHABLE_KEY || 
    process.env.VITE_STRIPE_PUBLISHABLE_KEY.trim() === '';
  
  if (useSimulatedPayment) {
    // Fallback to simulated payment if Stripe key is not configured
    return <SimulatedPaymentForm courseId={courseId} coursePrice={coursePrice} onPaymentSuccess={onPaymentSuccess} onCancel={onCancel} />;
  }

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

// Simulated payment form (fallback)
const SimulatedPaymentForm = ({ courseId, coursePrice, onPaymentSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // Create order on the backend
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'credentials': 'include'
        },
        body: JSON.stringify({ courseId })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create order');
      }

      const orderData = await response.json();

      // Simulate payment processing
      const paymentResponse = await fetch('/api/payments/simulate-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'credentials': 'include'
        },
        body: JSON.stringify({
          orderId: orderData.orderId,
          courseId: courseId
        })
      });

      const paymentResult = await paymentResponse.json();

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