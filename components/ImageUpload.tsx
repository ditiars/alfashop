"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Camera, Upload, X, Focus } from "lucide-react"; 

interface ImageUploadProps {
  onUploadSuccess?: (url: string) => void;
  defaultImage?: string;
}

export default function ImageUpload({ onUploadSuccess, defaultImage }: ImageUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(defaultImage || null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(defaultImage || null);

  // State untuk Live Camera
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Bersihkan stream kamera saat komponen di-unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
    }
  };

  // Mulai Live Camera
  const startCamera = async () => {
    // Jika tidak ada akses mediaDevices (karena HTTP bukan HTTPS)
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn("navigator.mediaDevices tidak tersedia. Fallback ke input native.");
      if (cameraInputRef.current) {
        cameraInputRef.current.click();
      }
      return;
    }

    setIsCameraOpen(true);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } // Prioritaskan kamera belakang jika ada
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Gagal mengakses kamera:", err);
      alert("Tidak dapat mengakses kamera WebRTC. Menggunakan mode alternatif...");
      setIsCameraOpen(false);
      // Fallback ke input native
      if (cameraInputRef.current) {
        cameraInputRef.current.click();
      }
    }
  };

  // Hentikan Kamera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
  };

  // Jepret Foto dari Video ke Canvas
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context) {
        // Set ukuran canvas sama dengan video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas ke blob -> File
        canvas.toBlob((blob) => {
          if (blob) {
            const capturedFile = new File([blob], `photo_${Date.now()}.jpg`, { type: "image/jpeg" });
            setFile(capturedFile);
            
            // Buat preview URL dari canvas (base64 lebih cepat untuk preview)
            const imgDataUrl = canvas.toDataURL("image/jpeg");
            setPreviewUrl(imgDataUrl);
            
            stopCamera();
          }
        }, "image/jpeg", 0.9);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("Pilih atau jepret gambar terlebih dahulu!");

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setUploadedUrl(data.imageUrl);
        setPreviewUrl(data.imageUrl);
        if (onUploadSuccess) {
          onUploadSuccess(data.imageUrl);
        }
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat upload.");
    } finally {
      setUploading(false);
    }
  };

  const clearSelection = () => {
    setFile(null);
    setPreviewUrl(uploadedUrl || null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-2 w-full h-full relative">
      <label className="text-sm font-medium text-admin-on-surface">Foto Produk</label>
      
      {/* Container Kamera / Preview */}
      <div className={`flex-1 border-2 border-dashed ${previewUrl || isCameraOpen ? 'border-transparent p-0' : 'border-admin-outline-variant/50 p-6'} rounded-xl bg-admin-surface-container-low flex flex-col items-center justify-center hover:border-admin-primary transition-colors relative overflow-hidden min-h-[200px] w-full aspect-square`}>
        
        {/* State 1: Live Camera Aktif */}
        {isCameraOpen ? (
          <div className="absolute inset-0 bg-black flex flex-col">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
            {/* Tombol Overlay Kamera */}
            <div className="absolute bottom-4 inset-x-0 flex justify-center gap-4 px-4">
              <button 
                onClick={(e) => { e.preventDefault(); stopCamera(); }}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-4 py-2 rounded-full font-medium transition-colors text-sm"
              >
                Batal
              </button>
              <button 
                onClick={(e) => { e.preventDefault(); capturePhoto(); }}
                className="bg-admin-primary hover:bg-admin-primary-container text-admin-on-primary hover:text-admin-on-primary-container px-6 py-2 rounded-full font-bold flex items-center gap-2 shadow-lg transition-colors border-2 border-white/20"
              >
                <Focus size={20} /> Jepret
              </button>
            </div>
            {/* Canvas tersembunyi untuk proses gambar */}
            <canvas ref={canvasRef} className="hidden" />
          </div>
        ) : previewUrl ? (
          /* State 2: Preview Gambar (Setelah Jepret / Upload) */
          <>
            <Image 
              src={previewUrl} 
              alt="Preview" 
              fill 
              className="object-cover rounded-xl" 
            />
            {file && (
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-xl">
                 <button 
                  onClick={(e) => { e.preventDefault(); clearSelection(); }}
                  className="bg-admin-error/90 hover:bg-admin-error text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2"
                 >
                   <X size={18} /> Hapus
                 </button>
              </div>
            )}
          </>
        ) : (
          /* State 3: Kosong (Belum ada gambar & kamera mati) */
          <div className="text-admin-on-surface-variant flex flex-col items-center gap-2">
            <Upload size={32} className="text-admin-outline-variant mb-1" />
            <span className="text-sm font-medium">Belum ada gambar</span>
          </div>
        )}
      </div>

      {/* Input Hidden untuk Galeri & Kamera Native (Fallback) */}
      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef}
        onChange={handleFileChange} 
        className="hidden"
      />
      <input 
        type="file" 
        accept="image/*" 
        capture="environment" 
        ref={cameraInputRef}
        onChange={handleFileChange} 
        className="hidden"
      />
      
      {/* Tombol Aksi (Hanya tampil saat tidak buka kamera & belum ada file) */}
      {!file && !uploadedUrl && !isCameraOpen && (
        <div className="flex gap-2 w-full mt-2">
          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 bg-admin-surface-container hover:bg-admin-surface-container-high text-admin-on-surface font-medium py-2 px-3 rounded-lg border border-admin-outline-variant/30 transition-colors text-sm shadow-sm"
          >
            <Upload size={16} /> Galeri
          </button>
          
          <button 
            type="button" 
            onClick={startCamera}
            className="flex-1 flex items-center justify-center gap-2 bg-admin-primary text-admin-on-primary hover:bg-admin-primary-container hover:text-admin-on-primary-container font-medium py-2 px-3 rounded-lg transition-colors text-sm shadow-sm"
          >
            <Camera size={16} /> Kamera
          </button>
        </div>
      )}

      {/* Tombol Simpan ke Cloudinary */}
      {file && !uploadedUrl && !isCameraOpen && (
        <button 
          type="button" 
          onClick={handleUpload}
          disabled={uploading}
          className="w-full mt-2 bg-admin-primary hover:bg-admin-primary-container text-admin-on-primary hover:text-admin-on-primary-container font-semibold py-2.5 px-4 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 transition-colors shadow-md"
        >
          {uploading ? (
            <span className="animate-pulse flex items-center gap-2">
              <Upload size={18} className="animate-bounce" /> Mengupload...
            </span>
          ) : (
            <>Simpan Gambar</>
          )}
        </button>
      )}

      {uploadedUrl && (
        <div className="mt-2 flex flex-col items-center">
           <button 
            type="button"
            onClick={(e) => { e.preventDefault(); setUploadedUrl(null); setFile(null); if(onUploadSuccess) onUploadSuccess(''); }} 
            className="text-xs font-medium text-admin-error hover:underline text-center w-full mt-1"
           >
            Hapus Foto
           </button>
        </div>
      )}
    </div>
  );
}
