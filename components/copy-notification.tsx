'use client';

import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';

interface CopyNotificationProps {
  text: string;
  isVisible: boolean;
  onClose: () => void;
}

import React from 'react';

export default function CopyNotification({
  text,
  isVisible,
  onClose,
}: CopyNotificationProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-8 inset-x-0 flex justify-center z-50 animate-scale-in">
      <div className="bg-gray-900/90 text-white px-4 py-2 rounded-full backdrop-blur-md flex items-center space-x-2">
        <Check size={16} className="text-green-400" />
        <span>{text}</span>
      </div>
    </div>
  );
}
