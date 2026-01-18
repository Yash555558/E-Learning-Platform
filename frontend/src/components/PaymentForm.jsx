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

export default SimulatedPaymentForm;