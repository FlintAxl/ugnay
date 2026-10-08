import React from "react";

interface ImageModalProps {
  isOpen: boolean;
  imageUrl: string | null;
  title: string;
  onClose: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  imageUrl,
  title,
  onClose,
}) => {
  if (!isOpen || !imageUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
      <div className="relative max-w-lg w-full bg-white rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center cursor-pointer transition"
          >
            ✕
          </button>
        </div>
        <div className="p-4 flex items-center justify-center bg-gray-950">
          <img
            src={imageUrl}
            alt={title}
            className="max-h-[70vh] w-auto object-contain rounded-lg"
          />
        </div>
        <div className="p-3 bg-gray-50 text-center">
          <span className="text-xs text-gray-500 font-medium">
            Facial identity profile image stored in secure Cloudinary cloud
          </span>
        </div>
      </div>
    </div>
  );
};

