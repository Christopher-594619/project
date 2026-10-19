// Fetches and shows a past receipt by transaction id, so students and
// tutors can view, print or download it any time after payment.
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import ReceiptDetails from './ReceiptDetails';

const API_URL = import.meta.env.VITE_ENDPOINT_URL;

const ReceiptModal = ({ transactionId, onClose }) => {
  const { getValidAccessToken } = useAuth();
  const [txn, setTxn] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const token = await getValidAccessToken();
        const res = await fetch(`${API_URL}/api/payments/${transactionId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.success) setTxn(data.transaction);
      } catch (err) {
        console.error('Error loading receipt:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-hard p-6 w-full max-w-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Receipt</h3>

        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : txn ? (
          <ReceiptDetails txn={txn} />
        ) : (
          <p className="text-sm text-red-500">Could not load this receipt.</p>
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full btn-primary py-2.5"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ReceiptModal;
