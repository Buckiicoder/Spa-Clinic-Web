import { useState, useMemo, useEffect } from "react";
import { X, Star } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../app/hook";
import { selectPendingRatings, submitRating } from "../features/auth/authSlice";
import Toast from "../components/Toast";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function PendingRatingsModal({ open, onClose }: Props) {
  const dispatch = useAppDispatch();

  const pendingRatings = useAppSelector(selectPendingRatings);

  const [index, setIndex] = useState(0);

  const [rating, setRating] = useState(5);

  const [feedback, setFeedback] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const current = useMemo(() => pendingRatings[index], [pendingRatings, index]);

  useEffect(() => {
    if (open) {
      setIndex(0);
      setRating(5);
      setFeedback("");
    }
  }, [open]);

  useEffect(() => {
    if (index >= pendingRatings.length && pendingRatings.length > 0) {
      setIndex(pendingRatings.length - 1);
    }
  }, [pendingRatings, index]);

  if (!open) return null;

  if (!current) {
  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      const result = await dispatch(
        submitRating({
          sessionId: current.id,
          rating,
          feedback,
        }),
      ).unwrap();

      setToast({
        type: "success",
        message: result?.rewardPoints
          ? `Đánh giá thành công. Bạn nhận được ${result.rewardPoints} điểm tích lũy`
          : "Đánh giá thành công",
      });

      setFeedback("");
      setRating(5);

      const remain = pendingRatings.length - 1;

      if (remain <= 0) {
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (err: any) {
      setToast({
        type: "error",
        message: err?.message || "Không thể gửi đánh giá",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative z-10 w-[650px] rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Đánh giá dịch vụ</h2>

          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <div className="mt-5">
          <div className="rounded-xl bg-amber-50 p-4">
            <p>
              <b>Dịch vụ:</b> {current.service_name}
            </p>

            <p>
              <b>Gói:</b> {current.package_name}
            </p>

            <p>
              <b>Buổi:</b> {current.session_no}
            </p>

            <p>
              <b>Ngày thực hiện:</b>{" "}
              {new Date(current.service_date).toLocaleDateString("vi-VN")}
            </p>
          </div>

          <div className="mt-6 flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((item) => (
              <button key={item} onClick={() => setRating(item)}>
                <Star
                  size={34}
                  className={
                    item <= rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }
                />
              </button>
            ))}
          </div>

          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Hãy chia sẻ cảm nhận của bạn..."
            className="mt-6 h-32 w-full rounded-xl border p-3"
          />
        </div>

        <div className="mt-6 flex justify-between">
          <span className="text-sm text-gray-500">
            {index + 1} / {pendingRatings.length}
          </span>

          <button
            disabled={submitting}
            onClick={handleSubmit}
            className="rounded-xl bg-amber-500 px-6 py-2 text-white"
          >
            {submitting ? "Đang gửi..." : "Gửi đánh giá"}
          </button>
        </div>
      </div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
