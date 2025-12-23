import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PWAUpdateBanner } from '@/components/ui/PWAUpdateBanner';
import { GPSTracker } from '@/components/mobile/GPSTracker';
import { CameraCapture } from '@/components/mobile/CameraCapture';
import { usePWAInstall } from '@/hooks/use-pwa-install';
import { usePWAUpdates } from '@/hooks/use-pwa-updates';
import { useOfflineQueue } from '@/hooks/use-offline-queue';
import { useGPSTracking } from '@/hooks/use-gps-tracking';
import { useCamera } from '@/hooks/use-camera';
import { useBiometricAuth } from '@/hooks/use-biometric-auth';
import { useVoiceToText } from '@/hooks/use-voice-to-text';
import { useQRScanner } from '@/hooks/use-qr-scanner';
import Layout from "@/components/layout/Layout";
import {
  Smartphone,
  MapPin,
  Camera,
  Shield,
  Wifi,
  WifiOff,
  CheckCircle,
  XCircle,
  Mic,
  MicOff,
  QrCode,
  Play,
  Square
} from 'lucide-react';

export function MobileFeaturesDashboard({ embedded = false }: { embedded?: boolean }) {
  const [activeTab, setActiveTab] = useState('overview');

  // PWA features
  const { canInstall, isInstalled } = usePWAInstall();
  const { updateAvailable, update } = usePWAUpdates();

  // Offline features
  const { isOnline, pendingCount, failedCount, processQueue } = useOfflineQueue();

  // GPS features
  const { position, isTracking, accuracy, startTracking, stopTracking } = useGPSTracking();

  // Camera features
  const {
    isActive: cameraActive,
    error: cameraError,
    startCamera,
    stopCamera,
    takePhoto,
    switchCamera,
    zoom,
    toggleFlash,
    hasFlash,
    zoomLevel,
    facingMode
  } = useCamera();

  // Biometric features
  const { isAvailable: biometricAvailable, isSupported: biometricSupported, isEnrolled } = useBiometricAuth();

  // Voice features
  const {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript
  } = useVoiceToText();

  // QR scanner features
  const {
    isScanning,
    isSupported: qrSupported,
    error: qrError,
    scannedData,
    startScanning,
    stopScanning,
    resetData
  } = useQRScanner();

  const content = (
    <div className={embedded ? "space-y-6" : "container mx-auto p-6 space-y-6"}>
      <PWAUpdateBanner />

      {!embedded && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Mobile Features</h1>
            <p className="text-muted-foreground">
              Advanced mobile capabilities for field operations
            </p>
          </div>
          <Smartphone className="w-8 h-8 text-primary" />
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="media">Camera & Media</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* PWA Status */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">PWA Status</CardTitle>
                <Smartphone className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Installed</span>
                    <Badge variant={isInstalled ? "default" : "secondary"}>
                      {isInstalled ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Update Available</span>
                    <Badge variant={updateAvailable ? "destructive" : "secondary"}>
                      {updateAvailable ? "Yes" : "No"}
                    </Badge>
                  </div>
                  {updateAvailable && (
                    <Button onClick={update} size="sm" className="w-full">
                      Update Now
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Offline Status */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Offline Status</CardTitle>
                {isOnline ? (
                  <Wifi className="w-4 h-4 text-green-500" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-500" />
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Connection</span>
                    <Badge variant={isOnline ? "default" : "destructive"}>
                      {isOnline ? "Online" : "Offline"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Pending</span>
                    <Badge variant="secondary">{pendingCount}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Failed</span>
                    <Badge variant={failedCount > 0 ? "destructive" : "secondary"}>
                      {failedCount}
                    </Badge>
                  </div>
                  {pendingCount > 0 && (
                    <Button onClick={processQueue} size="sm" className="w-full">
                      Process Queue
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* GPS Status */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">GPS Status</CardTitle>
                <MapPin className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active</span>
                    <Badge variant={isTracking ? "default" : "secondary"}>
                      {isTracking ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Accuracy</span>
                    <Badge variant={
                      accuracy === 'high' ? 'default' :
                      accuracy === 'medium' ? 'secondary' : 'destructive'
                    }>
                      {accuracy}
                    </Badge>
                  </div>
                  {position && (
                    <div className="text-xs text-muted-foreground">
                      {position.latitude.toFixed(6)}, {position.longitude.toFixed(6)}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Camera Status */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Camera Status</CardTitle>
                <Camera className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active</span>
                    <Badge variant={cameraActive ? "default" : "secondary"}>
                      {cameraActive ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Facing</span>
                    <Badge variant="secondary">{facingMode}</Badge>
                  </div>
                  {cameraError && (
                    <div className="text-xs text-red-500">{cameraError}</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Biometric Status */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Biometric Auth</CardTitle>
                <Shield className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Supported</span>
                    <Badge variant={biometricSupported ? "default" : "secondary"}>
                      {biometricSupported ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Enrolled</span>
                    <Badge variant={isEnrolled ? "default" : "secondary"}>
                      {isEnrolled ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Voice Status */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Voice Input</CardTitle>
                {isListening ? (
                  <Mic className="w-4 h-4 text-green-500" />
                ) : (
                  <MicOff className="w-4 h-4 text-muted-foreground" />
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Status</span>
                    <Badge variant={isListening ? "default" : "secondary"}>
                      {isListening ? "Listening" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground min-h-[2rem]">
                    {transcript || interimTranscript || "No speech detected"}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* QR Scanner Status */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">QR Scanner</CardTitle>
                <QrCode className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Supported</span>
                    <Badge variant={qrSupported ? "default" : "secondary"}>
                      {qrSupported ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Scanning</span>
                    <Badge variant={isScanning ? "default" : "secondary"}>
                      {isScanning ? "Yes" : "No"}
                    </Badge>
                  </div>
                  {scannedData && (
                    <div className="text-xs text-muted-foreground truncate">
                      {scannedData}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="media" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Camera Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Camera Controls</CardTitle>
                <CardDescription>Advanced camera features for document capture</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    onClick={() => cameraActive ? stopCamera() : startCamera()}
                    variant={cameraActive ? "destructive" : "default"}
                    className="flex-1"
                  >
                    {cameraActive ? "Stop Camera" : "Start Camera"}
                  </Button>
                  <Button
                    onClick={switchCamera}
                    disabled={!cameraActive}
                    variant="outline"
                  >
                    Switch
                  </Button>
                </div>

                {cameraActive && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Zoom: {zoomLevel}x</span>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => zoom(Math.max(1, zoomLevel - 0.5))}>
                          -
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => zoom(Math.min(5, zoomLevel + 0.5))}>
                          +
                        </Button>
                      </div>
                    </div>

                    {hasFlash && (
                      <Button onClick={toggleFlash} variant="outline" className="w-full">
                        Toggle Flash
                      </Button>
                    )}

                    <Button onClick={takePhoto} className="w-full">
                      Take Photo
                    </Button>
                  </div>
                )}

                {cameraError && (
                  <div className="text-sm text-red-500 p-2 bg-destructive/10 rounded">
                    {cameraError}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Voice Input */}
            <Card>
              <CardHeader>
                <CardTitle>Voice Input</CardTitle>
                <CardDescription>Speech recognition for hands-free data entry</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    onClick={isListening ? stopListening : startListening}
                    variant={isListening ? "destructive" : "default"}
                    className="flex-1"
                  >
                    {isListening ? <><Square className="w-4 h-4 mr-2" /> Stop</> : <><Play className="w-4 h-4 mr-2" /> Start</>}
                  </Button>
                  <Button onClick={resetTranscript} variant="outline">
                    Clear
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Transcript:</div>
                  <div className="min-h-[4rem] p-3 bg-muted rounded text-sm">
                    {transcript || interimTranscript || "Start listening to see transcription..."}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* QR Scanner */}
          <Card>
            <CardHeader>
              <CardTitle>QR Code Scanner</CardTitle>
              <CardDescription>Scan QR codes and barcodes for quick data entry</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button
                  onClick={isScanning ? stopScanning : startScanning}
                  disabled={!qrSupported}
                  variant={isScanning ? "destructive" : "default"}
                  className="flex-1"
                >
                  {isScanning ? "Stop Scanning" : "Start Scanning"}
                </Button>
                <Button onClick={resetData} variant="outline">
                  Reset
                </Button>
              </div>

              {!qrSupported && (
                <div className="text-sm text-amber-600 p-2 bg-amber-50 rounded">
                  QR scanning is not supported on this device
                </div>
              )}

              {qrError && (
                <div className="text-sm text-red-500 p-2 bg-destructive/10 rounded">
                  {qrError}
                </div>
              )}

              {scannedData && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Scanned Data:</div>
                  <div className="p-3 bg-green-50 border border-green-200 rounded text-sm font-mono">
                    {scannedData}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="location" className="space-y-6">
          <GPSTracker showControls={true} />
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Biometric Authentication</CardTitle>
              <CardDescription>Secure authentication using device biometrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Device Support</div>
                  <Badge variant={biometricSupported ? "default" : "secondary"}>
                    {biometricSupported ? "Supported" : "Not Supported"}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Biometric Available</div>
                  <Badge variant={biometricAvailable ? "default" : "secondary"}>
                    {biometricAvailable ? "Available" : "Not Available"}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">User Enrolled</div>
                  <Badge variant={isEnrolled ? "default" : "secondary"}>
                    {isEnrolled ? "Enrolled" : "Not Enrolled"}
                  </Badge>
                </div>
              </div>

              {!biometricSupported && (
                <div className="text-sm text-amber-600 p-3 bg-amber-50 rounded">
                  Biometric authentication is not supported on this device or browser.
                </div>
              )}

              {biometricSupported && !biometricAvailable && (
                <div className="text-sm text-amber-600 p-3 bg-amber-50 rounded">
                  Biometric authentication is supported but not available. Please check your device settings.
                </div>
              )}

              {biometricSupported && biometricAvailable && !isEnrolled && (
                <div className="text-sm text-primary p-3 bg-primary/10 rounded">
                  Biometric authentication is available but you haven't enrolled yet. Please set up biometrics in your device settings.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  if (embedded) {
    return content;
  }

  return <Layout>{content}</Layout>;
}
