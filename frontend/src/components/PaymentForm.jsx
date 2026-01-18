import React, { useState } from 'react';

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
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">Simulate Payment</h3>
      <p className="text-gray-600 mb-4">Course: ₹{coursePrice}</p>
      <p className="text-sm text-gray-500 mb-4">This is a simulated payment flow for demonstration purposes.</p>
      
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
          {loading ? 'Processing...' : `Pay ₹${coursePrice} (Simulated)`}
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

export default SimulatedPaymentForm;