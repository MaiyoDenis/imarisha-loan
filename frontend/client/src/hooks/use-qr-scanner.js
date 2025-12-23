var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { useState, useEffect, useRef, useCallback } from 'react';
export function useQRScanner() {
    var _this = this;
    var _a = useState(false), isScanning = _a[0], setIsScanning = _a[1];
    var _b = useState(false), isSupported = _b[0], setIsSupported = _b[1];
    var _c = useState(null), error = _c[0], setError = _c[1];
    var _d = useState(null), scannedData = _d[0], setScannedData = _d[1];
    var videoRef = useRef(null);
    var canvasRef = useRef(null);
    var streamRef = useRef(null);
    var animationFrameRef = useRef(null);
    useEffect(function () {
        // Check if getUserMedia is supported
        setIsSupported(!!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia));
        return function () {
            stopScanning();
        };
    }, [stopScanning]);
    var startScanning = useCallback(function () { return __awaiter(_this, void 0, void 0, function () {
        var stream, err_1, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!isSupported) {
                        setError('Camera not supported on this device');
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    setError(null);
                    setScannedData(null);
                    return [4 /*yield*/, navigator.mediaDevices.getUserMedia({
                            video: {
                                facingMode: 'environment',
                                width: { ideal: 640 },
                                height: { ideal: 480 }
                            }
                        })];
                case 2:
                    stream = _a.sent();
                    streamRef.current = stream;
                    if (!videoRef.current) return [3 /*break*/, 4];
                    videoRef.current.srcObject = stream;
                    return [4 /*yield*/, videoRef.current.play()];
                case 3:
                    _a.sent();
                    setIsScanning(true);
                    // Start scanning loop
                    scanQRCode();
                    _a.label = 4;
                case 4: return [3 /*break*/, 6];
                case 5:
                    err_1 = _a.sent();
                    errorMessage = err_1 instanceof Error ? err_1.message : 'Failed to access camera';
                    setError(errorMessage);
                    console.error('[QR Scanner] Start failed:', err_1);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); }, [isSupported, scanQRCode]);
    var stopScanning = useCallback(function () {
        setIsScanning(false);
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(function (track) { return track.stop(); });
            streamRef.current = null;
        }
        console.log('[QR Scanner] Stopped scanning');
    }, []);
    var scanQRCode = useCallback(function () {
        if (!isScanning || !videoRef.current || !canvasRef.current)
            return;
        var video = videoRef.current;
        var canvas = canvasRef.current;
        var context = canvas.getContext('2d');
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
        var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        // Simple QR code detection (this is a basic implementation)
        // In a real app, you'd use a library like jsQR
        var qrCode = detectQRCode(imageData);
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
    var detectQRCode = useCallback(function (imageData) {
        // This is a placeholder for QR code detection
        // In a real implementation, you'd use a library like jsQR
        // For now, we'll simulate detection with a simple pattern
        var data = imageData.data;
        var width = imageData.width;
        var height = imageData.height;
        // Simple pattern detection (this is not a real QR code detector)
        // Look for high contrast patterns that might indicate a QR code
        var darkPixels = 0;
        var totalPixels = 0;
        for (var y = 0; y < height; y += 10) {
            for (var x = 0; x < width; x += 10) {
                var index = (y * width + x) * 4;
                var r = data[index];
                var g = data[index + 1];
                var b = data[index + 2];
                var brightness = (r + g + b) / 3;
                if (brightness < 128)
                    darkPixels++;
                totalPixels++;
            }
        }
        var darkRatio = darkPixels / totalPixels;
        // If we detect a pattern that looks like a QR code (this is just a simulation)
        if (darkRatio > 0.3 && darkRatio < 0.7) {
            // Simulate finding QR code data
            return "QR-".concat(Date.now());
        }
        return null;
    }, []);
    var resetData = useCallback(function () {
        setScannedData(null);
        setError(null);
    }, []);
    return {
        isScanning: isScanning,
        isSupported: isSupported,
        error: error,
        scannedData: scannedData,
        startScanning: startScanning,
        stopScanning: stopScanning,
        resetData: resetData
    };
}
