"use client";

import { useEffect } from "react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
};

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div
        role="presentation"
        onClick={onClose}
        className="absolute inset-0"
      />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        {title ? (
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        ) : null}
        <div className={title ? "mt-2" : undefined}>{children}</div>
      </div>
    </div>
  );
}
