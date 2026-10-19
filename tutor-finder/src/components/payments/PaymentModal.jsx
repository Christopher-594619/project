// Simulated mobile-money payment for a confirmed booking. The backend
// works out the amount itself (rate × duration); the figure shown here is
// just for the student's information.
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { formatters } from '../../utils/formatters';
import ReceiptDetails from './ReceiptDetails';

const API_URL = import.meta.env.VITE_ENDPOINT_URL;

const PROVIDERS = [
  { value: 'mtn', label: 'MTN Mobile Money' },
  { value: 'airtel', label: 'Airtel Money' },
  { value: 'zamtel', label: 'Zamtel Kwacha' },
];

const PaymentModal = ({ booking, onClose, onSuccess }) => {
  const { getValidAccessToken } = useAuth();
  const [provider, setProvider] = useState('mtn');
  const [msisdn, setMsisdn] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const callApi = async (path, body) => {
    const token = await getValidAccessToken();
    if (!token) throw new Error('Your session expired. Please log in again.');

    const res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    // 402 means the simulated provider declined — still a valid result.
    if (!res.ok && res.status !== 402) {
      throw new Error(data.message || 'Request failed.');
    }
    return data;
  };

  const handleResult = (transaction) => {
    setResult(transaction);
    if (transaction.status === 'completed') {
      toast.success('Payment successful!');
      onSuccess?.(transaction);
    } else {
      toast.error(`Payment failed: ${transaction.failure_reason}`);
    }
  };

  const handlePay = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // A failed attempt is retried against the same booking; otherwise
      // start a new payment.
      const data = result?.status === 'failed'
        ? await callApi(`/api/payments/${result.id}/retry`, { provider, msisdn })
        : await callApi('/api/payments/initiate', { booking_id: booking.id, provider, msisdn });
      handleResult(data.transaction);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-hard p-6 w-full max-w-sm">
        {result?.status === 'completed' ? (
          <>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment successful</h3>
            <ReceiptDetails txn={result} />
          </>
        ) : (
          <>
            <h3 className="text-lg font-semibold text-gray-900">Pay for your session</h3>
            <p className="text-sm text-gray-500 mt-1 mb-4">
              {booking.subject} with {booking.tutorName}
              <br />
              {formatters.currency(booking.price)}/hour × {booking.duration} min ={' '}
              <span className="font-semibold text-gray-900">
                {formatters.currency(booking.totalAmount)}
              </span>
            </p>

            <form onSubmit={handlePay} className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Provider
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {PROVIDERS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-medium text-gray-700">
                Mobile money number
                <input
                  type="tel"
                  placeholder="09XXXXXXXX"
                  value={msisdn}
                  onChange={(e) => setMsisdn(e.target.value.trim())}
                  required
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </label>

              {result?.status === 'failed' && (
                <p className="text-sm text-red-600">{result.failure_reason}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-primary py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting
                  ? 'Processing...'
                  : result?.status === 'failed'
                  ? 'Retry payment'
                  : `Pay ${formatters.currency(booking.totalAmount)}`}
              </button>
            </form>
          </>
        )}

        <button
          onClick={onClose}
          className="mt-3 w-full text-sm text-gray-500 hover:text-gray-700"
        >
          {result?.status === 'completed' ? 'Close' : 'Cancel'}
        </button>
      </div>
    </div>
  );
};

export default PaymentModal;
