// Receipt body shared by PaymentModal (right after paying) and ReceiptModal
// (viewing a past receipt), with print and download buttons.
import { formatters } from '../../utils/formatters';

const issuedAt = (txn) =>
  txn.receipt?.issued_at ? new Date(txn.receipt.issued_at).toLocaleString() : 'N/A';

// Plain-text receipt used for both print and download.
function buildReceiptText(txn) {
  return [
    'TUTOR FINDER — PAYMENT RECEIPT',
    '================================',
    `Receipt No:     ${txn.receipt?.receipt_number || 'N/A'}`,
    `Reference:      ${txn.momo_reference || 'N/A'}`,
    `Date Issued:    ${issuedAt(txn)}`,
    '',
    `Student:        ${txn.student_name || txn.student_email || ''}`,
    `Tutor:          ${txn.tutor_name || txn.tutor_email || ''}`,
    `Subject:        ${txn.subject || 'N/A'}`,
    `Session:        ${txn.date ? formatters.date(txn.date) : ''} ${txn.time || ''} (${txn.duration} min)`,
    '',
    `Provider:       ${(txn.provider || '').toUpperCase()}`,
    `Payer Number:   ${txn.payer_msisdn || ''}`,
    '',
    `Amount Paid:    ${formatters.currency(txn.amount)}`,
    `Platform Fee:   ${formatters.currency(txn.platform_fee)} (10%)`,
    `Tutor Payout:   ${formatters.currency(txn.tutor_payout)}`,
    '================================',
    'Thank you for using Tutor Finder.',
  ].join('\n');
}

const ReceiptDetails = ({ txn }) => {
  const handlePrint = () => {
    const win = window.open('', '_blank', 'width=420,height=600');
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>Receipt ${txn.receipt?.receipt_number || ''}</title>
          <style>body { font-family: monospace; white-space: pre-wrap; padding: 24px; font-size: 13px; }</style>
        </head>
        <body>${buildReceiptText(txn)}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
  };

  const handleDownload = () => {
    const blob = new Blob([buildReceiptText(txn)], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${txn.receipt?.receipt_number || txn.id}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="text-sm space-y-1 border border-gray-200 rounded-xl p-4 bg-gray-50">
        <p><strong>Receipt No:</strong> {txn.receipt?.receipt_number}</p>
        <p><strong>Reference:</strong> {txn.momo_reference}</p>
        <p><strong>Subject:</strong> {txn.subject}</p>
        <p><strong>Amount Paid:</strong> {formatters.currency(txn.amount)}</p>
        <p><strong>Platform Fee (10%):</strong> {formatters.currency(txn.platform_fee)}</p>
        <p><strong>Tutor Payout:</strong> {formatters.currency(txn.tutor_payout)}</p>
        <p><strong>Issued:</strong> {issuedAt(txn)}</p>
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={handlePrint}
          className="flex-1 border border-gray-300 rounded-xl py-2 text-sm hover:bg-gray-50"
        >
          Print
        </button>
        <button
          onClick={handleDownload}
          className="flex-1 border border-gray-300 rounded-xl py-2 text-sm hover:bg-gray-50"
        >
          Download
        </button>
      </div>
    </div>
  );
};

export default ReceiptDetails;
