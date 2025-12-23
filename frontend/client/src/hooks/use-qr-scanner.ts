import { useState, useEffect, useRef, useCallback } from 'react';

interface QRScannerState {
  isScanning: boolean;
  isSupported: boolean;
  error: string | null;
  scannedData: string | null;
  startScanning: () => Promise<void>;
  stopScanning: () => void;
  resetData: () => void;
}

export function useQRScanner(): QRScannerState {
  const [isScanning, setIsScanning] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scannedData, setScannedData] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // Check if getUserMedia is supported
    setIsSupported(!!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia));

    return () => {
      stopScanning();
    };
  }, [stopScanning]);

  const startScanning = useCallback(async () => {
    if (!isSupported) {
      setError('Camera not supported on this device');
      return;
    }

    try {
      setError(null);
      setScannedData(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsScanning(true);

        // Start scanning loop
        scanQRCode();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to access camera';
      setError(errorMessage);
      console.error('[QR Scanner] Start failed:', err);
    }
  }, [isSupported, scanQRCode]);

  const stopScanning = useCallback(() => {
    setIsScanning(false);

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    console.log('[QR Scanner] Stopped scanning');
  }, []);

  const scanQRCode = useCallback(() => {
    if (!isScanning || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context || video.videoWidth === 0 || video.videoHeight === 0) {
      animationFrameRef.current = requestAnimationFrame(scanQRCode);
      return;
    }

    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data for QR code detection
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    // Simple QR code detection (this is a basic implementation)
    // In a real app, you'd use a library like jsQR
    const qrCode = detectQRCode(imageData);

    if (qrCode) {
      setScannedData(qrCode);
      setIsScanning(false);
      stopScanning();
      console.log('[QR Scanner] QR code detected:', qrCode);
      return;
    }

    // Continue scanning
    animationFrameRef.current = requestAnimationFrame(scanQRCode);
  }, [isScanning, stopScanning, detectQRCode]);

  const detectQRCode = useCallback((imageData: ImageData): string | null => {
    // This is a placeholder for QR code detection
    // In a real implementation, you'd use a library like jsQR
    // For now, we'll simulate detection with a simple pattern

    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    // Simple pattern detection (this is not a real QR code detector)
    // Look for high contrast patterns that might indicate a QR code
    let darkPixels = 0;
    let totalPixels = 0;

    for (let y = 0; y < height; y += 10) {
      for (let x = 0; x < width; x += 10) {
        const index = (y * width + x) * 4;
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        const brightness = (r + g + b) / 3;

        if (brightness < 128) darkPixels++;
        totalPixels++;
      }
    }

    const darkRatio = darkPixels / totalPixels;

    // If we detect a pattern that looks like a QR code (this is just a simulation)
    if (darkRatio > 0.3 && darkRatio < 0.7) {
      // Simulate finding QR code data
      return `QR-${Date.now()}`;
    }

    return null;
  }, []);

  const resetData = useCallback(() => {
    setScannedData(null);
    setError(null);
  }, []);

  return {
    isScanning,
    isSupported,
    error,
    scannedData,
    startScanning,
    stopScanning,
    resetData
  };
}
