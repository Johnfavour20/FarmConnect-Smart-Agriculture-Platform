
import React, { useState, useCallback, useRef } from 'react';
import { CameraIcon, UploadIcon } from './IconComponents';
import { Spinner } from './Spinner';

interface CropScannerProps {
  onImageSelect: (file: File) => void;
  onDiagnose: () => void;
  isLoading: boolean;
  error: string | null;
  imageFile: File | null;
}

export const CropScanner: React.FC<CropScannerProps> = ({ onImageSelect, onDiagnose, isLoading, error, imageFile }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageSelect(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-slate-200">
      <div className="flex flex-col items-center">
        {!imagePreview ? (
          <div 
            className="w-full h-64 border-2 border-dashed border-slate-300 rounded-xl flex flex-col justify-center items-center text-center p-4 cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors"
            onClick={openFileDialog}
          >
            <CameraIcon className="h-16 w-16 text-slate-400 mb-4" />
            <h3 className="text-lg font-semibold text-slate-700">Tap here to upload a photo</h3>
            <p className="text-sm text-slate-500">For best results, use a clear photo of the affected area.</p>
          </div>
        ) : (
          <div className="w-full max-w-md mb-4 relative">
            <img src={imagePreview} alt="Crop preview" className="rounded-xl w-full h-auto object-contain max-h-[400px]" />
            <button 
              onClick={openFileDialog}
              className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm text-slate-700 hover:bg-white rounded-full p-2 shadow-md transition-transform hover:scale-105"
            >
              <UploadIcon className="h-5 w-5" />
            </button>
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
        />

        {error && <p className="text-red-600 bg-red-100 p-3 rounded-lg mt-4 text-sm">{error}</p>}

        <button
          onClick={onDiagnose}
          disabled={!imageFile || isLoading}
          className="mt-6 w-full max-w-xs flex items-center justify-center bg-green-600 text-white font-bold py-3 px-6 rounded-full text-lg shadow-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:scale-100"
        >
          {isLoading ? (
            <>
              <Spinner />
              Diagnosing...
            </>
          ) : (
            'Diagnose Crop'
          )}
        </button>
      </div>
    </div>
  );
};
