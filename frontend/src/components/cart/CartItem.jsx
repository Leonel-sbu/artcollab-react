import { formatCurrency } from "../../utils/helpers";

export default function CartItem({ item, onRemove }) {
  if (!item) return null;

  const title = item?.title || item?.artwork?.title || item?.course?.title || "Item";
  const price = item?.price || item?.artwork?.price || item?.course?.price || 0;
  const qty = item?.quantity || 1;

  return (
    <div className="flex items-start justify-between rounded-2xl border bg-white p-4">
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <div className="mt-1 text-xs text-gray-600">
          {formatCurrency(price)}  Qty: {qty}
        </div>
      </div>

      <button
        onClick={onRemove}
        className="rounded-xl border px-3 py-1.5 text-sm hover:bg-gray-50"
      >
        Remove
      </button>
    </div>
  );
}
