import React, { useState, useEffect } from 'react';

const RazorpayPaymentForm = ({ courseId, coursePrice, onPaymentSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load Razorpay script dynamically
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

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

      // Configure Razorpay options
      const options = {
        key: process.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'E-Learning Platform',
        description: `Payment for course: ${orderData.courseTitle}`,
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            // Verify payment on the backend
            const verifyResponse = await fetch('/api/payments/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'credentials': 'include'
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                courseId: courseId
              })
            });

            const verifyResult = await verifyResponse.json();

            if (verifyResult.success) {
              onPaymentSuccess();
            } else {
              setError(verifyResult.message || 'Payment verification failed');
            }
          } catch (err) {
            setError(err.message);
          }
        },
        prefill: {
          name: '', // Would come from user context in real app
          email: '', // Would come from user context in real app
          contact: '', // Would come from user context in real app
        },
        theme: {
          color: '#3b82f6',
        },
      };

      // Open Razorpay payment modal
      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">Pay ₹{coursePrice}</h3>
      
      {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
      
      <div className="flex space-x-3">
        <button
          type="button"
          onClick={handlePayment}
          disabled={loading}
          className={`flex-1 bg-green-600 text-white py-3 px-4 rounded-md ${
            loading
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-green-700'
          }`}
        >
          {loading ? 'Processing...' : `Pay ₹${coursePrice}`}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-md hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default RazorpayPaymentForm;