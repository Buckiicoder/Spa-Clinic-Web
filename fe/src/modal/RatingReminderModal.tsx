import { X, Star } from "lucide-react";

interface Props {
  open: boolean;
  total: number;
  onClose: () => void;
  onConfirm: () => void;
}

export default function RatingReminderModal({
  open,
  total,
  onClose,
  onConfirm,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      <div className="relative z-10 w-[500px] rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Đánh giá dịch vụ
          </h2>

          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="mt-5 flex flex-col items-center">
          <Star
            size={60}
            className="text-yellow-500"
          />

          <p className="mt-4 text-center text-lg">
            Bạn còn{" "}
            <span className="font-bold text-amber-600">
              {total}
            </span>{" "}
            buổi dịch vụ chưa đánh giá.
          </p>

          <p className="mt-2 text-center text-gray-500">
            Hãy đánh giá để giúp chúng tôi cải thiện
            chất lượng dịch vụ và nhận điểm tích lũy.
          </p>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl border px-5 py-2"
          >
            Để sau
          </button>

          <button
            onClick={onConfirm}
            className="rounded-xl bg-amber-500 px-5 py-2 text-white"
          >
            Đánh giá ngay
          </button>
        </div>
      </div>
    </div>
  );
}