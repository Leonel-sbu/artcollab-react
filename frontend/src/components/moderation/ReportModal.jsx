import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { createReport, REPORT_REASONS } from '../../services/reportService';

const ReportModal = ({
    isOpen,
    onClose,
    targetType,
    targetId,
    targetName
}) => {
    const [reason, setReason] = useState('');
    const [details, setDetails] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!reason) {
            toast.error('Please select a reason');
            return;
        }

        setLoading(true);
        try {
            const result = await createReport({
                targetType,
                targetId,
                reason,
                details,
            });

            if (result.success) {
                toast.success('Report submitted successfully');
                onClose();
                setReason('');
                setDetails('');
            } else {
                toast.error(result.message || 'Failed to submit report');
            }
        } catch (error) {
            console.error('Report error:', error);
            toast.error('Failed to submit report');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X size={20} />
                </button>

                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                        <AlertTriangle className="text-red-600" size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Report Content</h2>
                        <p className="text-sm text-gray-500">
                            Reporting: {targetName || targetType}
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    {/* Reason */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Reason for reporting *
                        </label>
                        <select
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            required
                        >
                            <option value="">Select a reason</option>
                            {REPORT_REASONS.map((r) => (
                                <option key={r.value} value={r.value}>
                                    {r.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Details */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Additional details (optional)
                        </label>
                        <textarea
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            placeholder="Provide more context about why you're reporting this content..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                            rows={4}
                            maxLength={1000}
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            {details.length}/1000 characters
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !reason}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Submitting...' : 'Submit Report'}
                        </button>
                    </div>
                </form>

                <p className="text-xs text-gray-400 mt-4 text-center">
                    Your report will be reviewed by our moderation team
                </p>
            </div>
        </div>
    );
};

export default ReportModal;
