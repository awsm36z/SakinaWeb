"use client";

import Modal from "@/app/components/modal/modal";

type AlertModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
};

export default function AlertModal({
  isOpen,
  onClose,
  title = "Alert",
  message,
  confirmLabel = "Confirm",
  onConfirm,
}: AlertModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p className="text-sm text-gray-600">{message}</p>
      <button
        type="button"
        onClick={onConfirm}
        className="brand-button mt-4 w-full rounded-xl px-4 py-3 text-sm"
      >
        {confirmLabel}
      </button>
    </Modal>
  );
}
