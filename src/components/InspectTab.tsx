import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Image as ImageIcon,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  SwitchCamera,
  ShieldAlert,
  Award,
  ChevronDown,
  Info,
  Maximize2,
  FolderOpen,
} from 'lucide-react';
import { InspectionRecord, QualityGrade, BatchRecord } from '../types';
import { DemoSample } from '../../server/src/services/demo/DemoDataService';

interface Props {
  activeBatch: BatchRecord | null;
  onInspectionCompleted: (record: InspectionRecord) => void;
  onRequestHumanReview: (record: InspectionRecord) => void;
}

const VEGGIE_COMMODITIES = [
  {
    id: 'tomato',
    name: 'Tomato',
    emoji: '🍅',
    outline: 'w-3/5 h-3/5 rounded-full',
  },
  {
    id: 'bell_pepper',
    name: 'Pepper',
    emoji: '🫑',
    outline: 'w-1/2 h-3/5 rounded-3xl',
  },
  {
    id: 'carrot',
    name: 'Carrot',
    emoji: '🥕',
    outline: 'w-2/5 h-4/5 rounded-t-xl rounded-b-full',
  },
  {
    id: 'onion',
    name: 'Onion',
    emoji: '🧅',
    outline: 'w-3/5 h-3/5 rounded-[40%_40%_55%_55%/50%_50%_45%_45%]',
  },
  {
    id: 'cucumber',
    name: 'Cucumber',
    emoji: '🥒',
    outline: 'w-1/3 h-4/5 rounded-full',
  },
  {
    id: 'potato',
    name: 'Potato',
    emoji: '🥔',
    outline: 'w-3/5 h-3/5 rounded-[45%_55%_50%_50%/50%_45%_55%_50%]',
  },
];

export const InspectTab: React.FC<Props> = ({
  activeBatch,
  onInspectionCompleted,
  onRequestHumanReview,
}) => {
  // Active vegetable commodity selection
  const [selectedVeggieId, setSelectedVeggieId] = useState<string>(
    activeBatch?.product || 'tomato'
  );

  const activeVeggie =
    VEGGIE_COMMODITIES.find((v) => v.id === selectedVeggieId) || VEGGIE_COMMODITIES[0];

  // Input Modes: 'camera' | 'gallery'
  const [inputMode, setInputMode] = useState<'camera' | 'gallery'>('camera');

  // Camera State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  // Selected or captured image
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('image/jpeg');

  // Pre-check & processing states
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [qualityWarning, setQualityWarning] = useState<string | null>(null);

  // Results
  const [currentResult, setCurrentResult] = useState<InspectionRecord | null>(null);

  // Demo samples from backend
  const [demoSamples, setDemoSamples] = useState<DemoSample[]>([]);
  const [selectedDemoId, setSelectedDemoId] = useState<string>('');

  // Fetch demo samples on mount
  useEffect(() => {
    fetch('/api/demo/samples')
      .then((res) => res.json())
      .then((data) => {
        if (data.samples) setDemoSamples(data.samples);
      })
      .catch((err) => console.log('Demo samples fetch failed:', err));
  }, []);

  // Update selected veggie when activeBatch changes
  useEffect(() => {
    if (activeBatch?.product) {
      setSelectedVeggieId(activeBatch.product);
    }
  }, [activeBatch]);

  // Camera initialization
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 960 },
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setIsCameraActive(false);
      setCameraError(
        'Camera is unavailable or permission was not granted. You can pick an image from your device Gallery or use Demo Targets.'
      );
    }
  };

  useEffect(() => {
    if (inputMode === 'camera' && !capturedImage) {
      startCamera();
    }
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [inputMode, facingMode]);

  // Frame Capture from CameraX
  const handleCaptureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(dataUrl);
    setImageMimeType('image/jpeg');
    setCurrentResult(null);
    setAnalysisError(null);

    // Run local heuristic check
    evaluateImageQualityLocally(canvas, ctx);

    // Stop camera track to save battery
    if (video.srcObject) {
      const stream = video.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      setIsCameraActive(false);
    }
  };

  // Local client image quality heuristic
  const evaluateImageQualityLocally = (
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
  ) => {
    setQualityWarning(null);
    try {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      let totalBrightness = 0;
      const step = 8;
      let sampleCount = 0;

      for (let i = 0; i < data.length; i += 4 * step) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
        totalBrightness += brightness;
        sampleCount++;
      }

      const avgBrightness = totalBrightness / sampleCount;

      if (avgBrightness < 35) {
        setQualityWarning(
          `Image lighting is very dark. Surface defects on the ${activeVeggie.name.toLowerCase()} may not be clearly visible. Consider increasing ambient light.`
        );
      } else if (avgBrightness > 225) {
        setQualityWarning(
          'Image appears overexposed with excessive glare. Please reduce intense direct lighting.'
        );
      }
    } catch (e) {
      // Ignore
    }
  };

  // Gallery File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageMimeType(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setCapturedImage(dataUrl);
      setCurrentResult(null);
      setAnalysisError(null);
      setQualityWarning(null);
    };
    reader.readAsDataURL(file);
  };

  // Select Demo Sample
  const handleSelectDemoSample = (sample: DemoSample) => {
    setSelectedDemoId(sample.id);
    setCapturedImage(sample.dataUrl);
    setImageMimeType(sample.mimeType);
    setCurrentResult(null);
    setAnalysisError(null);
    setQualityWarning(null);
  };

  // Trigger Backend AI Analysis & Grading
  const handleAnalyze = async () => {
    if (!capturedImage) return;

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const isDemoSample = Boolean(selectedDemoId);
      const res = await fetch('/api/inspect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: capturedImage,
          mimeType: imageMimeType,
          batchId: activeBatch?.id,
          vegetableType: activeVeggie.id,
          isDemo: isDemoSample,
          demoSampleId: selectedDemoId || undefined,
          operatorName: activeBatch?.operatorName || 'Field Inspector',
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || `${activeVeggie.name} inspection failed.`);
      }

      setCurrentResult(data.inspection);
      onInspectionCompleted(data.inspection);
    } catch (err: any) {
      console.error('Inspection failed:', err);
      setAnalysisError(err.message || 'Vision analysis could not be completed.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setCapturedImage(null);
    setCurrentResult(null);
    setAnalysisError(null);
    setQualityWarning(null);
    setSelectedDemoId('');
    if (inputMode === 'camera') {
      startCamera();
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3.5 pb-24 text-xs">
      {/* Target Vegetable Commodity Selector Bar */}
      <div>
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5 px-0.5">
          <span className="font-semibold text-slate-300">Target Vegetable Commodity:</span>
          <span className="text-emerald-400 font-mono text-[10px]">
            {activeBatch ? `Batch: ${activeBatch.name.split('-')[0]}` : 'General Inspection'}
          </span>
        </div>
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
          {VEGGIE_COMMODITIES.map((veg) => {
            const isSelected = selectedVeggieId === veg.id;
            return (
              <button
                key={veg.id}
                onClick={() => {
                  setSelectedVeggieId(veg.id);
                  if (currentResult) handleReset();
                }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/60 scale-[1.02]'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                <span>{veg.emoji}</span>
                <span>{veg.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Input Mode Selector Bar */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-1 rounded-xl">
        <button
          onClick={() => {
            setInputMode('camera');
            if (capturedImage) handleReset();
          }}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
            inputMode === 'camera'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>CameraX</span>
        </button>

        <label
          onClick={() => {
            setInputMode('gallery');
          }}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
            inputMode === 'gallery'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FolderOpen className="w-3.5 h-3.5" />
          <span>Gallery Upload</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>

      {/* Demo Target Quick Presets (For fast testing) */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-2.5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
            Quick Sample Test Targets
          </span>
          <span className="text-[9px] text-slate-500 font-mono">1-tap demo</span>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {demoSamples.map((sample) => (
            <button
              key={sample.id}
              onClick={() => handleSelectDemoSample(sample)}
              className={`p-1.5 rounded-xl border text-[10px] text-left transition-all cursor-pointer ${
                selectedDemoId === sample.id
                  ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold'
                  : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <div className="font-bold truncate text-[10px]">{sample.name.split(' ')[0]}</div>
              <div
                className={`text-[9px] font-mono mt-0.5 truncate ${
                  sample.category.includes('Grade A')
                    ? 'text-emerald-400'
                    : sample.category.includes('Grade B')
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {sample.category.includes('Grade A')
                  ? 'Grade A'
                  : sample.category.includes('Grade B')
                  ? 'Grade B'
                  : 'Reject'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Viewfinder / Image Preview Canvas */}
      <div className="relative w-full aspect-[4/3] bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-inner flex items-center justify-center">
        {capturedImage ? (
          // Captured Image Preview
          <div className="relative w-full h-full">
            <img
              src={capturedImage}
              alt={`${activeVeggie.name} Preview`}
              className="w-full h-full object-contain bg-slate-950"
            />

            {/* Clear / Retake button */}
            <button
              onClick={handleReset}
              className="absolute top-3 right-3 p-2 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700 text-slate-200 hover:bg-slate-800 text-xs flex items-center space-x-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake</span>
            </button>

            {selectedDemoId && (
              <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-slate-900/85 backdrop-blur-md border border-slate-700 text-[10px] font-mono text-emerald-400">
                Loaded Sample: {selectedDemoId}
              </div>
            )}
          </div>
        ) : inputMode === 'camera' ? (
          // Live Camera Stream
          <div className="relative w-full h-full flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Framing Guide Silhouette Overlay for Selected Vegetable */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div
                className={`border-2 border-dashed border-emerald-400/50 flex items-center justify-center transition-all duration-300 ${activeVeggie.outline}`}
              >
                {/* Center crosshair */}
                <div className="w-3 h-3 border-t border-l border-emerald-400/80 -translate-x-1.5 -translate-y-1.5" />
              </div>
            </div>

            {/* Camera Controls Overlay */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-auto">
              <span className="text-[11px] px-2 py-1 rounded-lg bg-slate-950/70 backdrop-blur-md text-slate-300 font-mono flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>CameraX • {activeVeggie.name}</span>
              </span>

              <button
                onClick={() =>
                  setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))
                }
                className="p-2 rounded-xl bg-slate-950/70 backdrop-blur-md border border-slate-800 text-slate-200 hover:bg-slate-800 cursor-pointer"
                title="Switch Camera"
              >
                <SwitchCamera className="w-4 h-4" />
              </button>
            </div>

            {/* Capture Button Bar */}
            <div className="absolute bottom-3 inset-x-0 flex items-center justify-center pointer-events-auto">
              <button
                onClick={handleCaptureFrame}
                className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border-4 border-white flex items-center justify-center active:scale-95 transition-transform shadow-xl cursor-pointer"
                title={`Capture ${activeVeggie.name} Photo`}
              >
                <div className="w-12 h-12 rounded-full bg-emerald-500 shadow-md flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </button>
            </div>

            {cameraError && (
              <div className="absolute inset-0 bg-slate-950/90 p-6 flex flex-col items-center justify-center text-center space-y-3">
                <AlertTriangle className="w-10 h-10 text-amber-400" />
                <p className="text-xs text-slate-300 max-w-xs">{cameraError}</p>
                <label className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs cursor-pointer">
                  Pick from Gallery Instead
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
        ) : (
          // Gallery Empty State
          <label className="w-full h-full flex flex-col items-center justify-center space-y-2 cursor-pointer p-4 text-center">
            <div className="p-3 rounded-2xl bg-slate-900 text-emerald-400 border border-slate-800">
              <ImageIcon className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200">
                Tap to Select {activeVeggie.name} Photo
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Supports JPG, PNG, WEBP from your device
              </p>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Image Quality Warning Banner */}
      {qualityWarning && (
        <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-3 flex items-start space-x-2 text-xs text-amber-300">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
          <span>{qualityWarning}</span>
        </div>
      )}

      {/* Primary Action Button */}
      {capturedImage && !currentResult && (
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm flex items-center justify-center space-x-2 shadow-lg transition-all ${
            isAnalyzing
              ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 active:scale-[0.99] text-white shadow-emerald-950/50 cursor-pointer'
          }`}
        >
          {isAnalyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              <span>Analyzing {activeVeggie.name} via AgriGrade AI...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Analyze {activeVeggie.name} Quality</span>
            </>
          )}
        </button>
      )}

      {/* Analysis Error Message */}
      {analysisError && (
        <div className="bg-rose-950/60 border border-rose-500/50 rounded-2xl p-4 space-y-2.5 text-xs text-rose-300 shadow-md">
          <div className="flex items-center space-x-2">
            <XCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <strong className="font-bold text-sm text-rose-200">Vision Analysis Notice</strong>
          </div>
          <p className="leading-relaxed">{analysisError}</p>
          <button
            onClick={handleAnalyze}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry Analysis</span>
          </button>
        </div>
      )}

      {/* Inspection Results Section */}
      {currentResult && (
        <div className="space-y-4 pt-2">
          {/* Gate 1: Produce Detection Result */}
          {!currentResult.aiAnalysis.detected ? (
            <div className="bg-rose-950/60 border border-rose-600/50 rounded-2xl p-4 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-rose-900/60 text-rose-400 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-rose-200">
                {activeVeggie.name} Not Detected
              </h3>
              <p className="text-xs text-rose-300/90 max-w-sm mx-auto">
                {currentResult.aiAnalysis.detectionMessage ||
                  `The computer-vision model did not detect a clear ${activeVeggie.name.toLowerCase()} in the frame. No commercial quality grade was assigned.`}
              </p>
              <div className="pt-2">
                <span className="text-[11px] font-mono text-slate-400">
                  Detection Confidence: {(currentResult.aiAnalysis.detectionConfidence * 100).toFixed(0)}%
                </span>
              </div>
              <button
                onClick={handleReset}
                className="mt-2 px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
              >
                Scan Another Item
              </button>
            </div>
          ) : (
            // Produce Confirmed -> Render Full Assessment
            <div className="space-y-3">
              {/* Quality Grade Card */}
              <div
                className={`rounded-2xl border p-4 shadow-sm ${
                  currentResult.gradingResult.grade === 'GRADE_A'
                    ? 'bg-emerald-950/40 border-emerald-500/60'
                    : currentResult.gradingResult.grade === 'GRADE_B'
                    ? 'bg-amber-950/40 border-amber-500/60'
                    : 'bg-rose-950/40 border-rose-500/60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                        Deterministic Grading Verdict
                      </span>
                    </div>
                    <div className="flex items-baseline space-x-2 mt-1">
                      <h2
                        className={`text-2xl font-black font-mono ${
                          currentResult.gradingResult.grade === 'GRADE_A'
                            ? 'text-emerald-400'
                            : currentResult.gradingResult.grade === 'GRADE_B'
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {currentResult.gradingResult.grade.replace('_', ' ')}
                      </h2>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1">
                      Standard: {activeVeggie.name} ({currentResult.gradingResult.appliedRuleConfigName})
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                      Confidence
                    </span>
                    <p className="text-xl font-mono font-extrabold text-slate-100">
                      {(currentResult.aiAnalysis.overallConfidence * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>

                {/* Human Review Flag Banner */}
                {currentResult.gradingResult.needsHumanReview && (
                  <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-amber-300 text-xs">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>Flagged for Human Review</span>
                    </div>
                    <button
                      onClick={() => onRequestHumanReview(currentResult)}
                      className="px-3 py-1 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors cursor-pointer"
                    >
                      Review
                    </button>
                  </div>
                )}
              </div>

              {/* Physical Characteristic Badges (Size, Shape, Surface) */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    Shape
                  </span>
                  <p className="font-bold text-slate-100 capitalize mt-0.5 truncate">
                    {currentResult.aiAnalysis.shape.category.replace('_', ' ')}
                  </p>
                  <span className="text-[9px] font-mono text-slate-400">
                    {(currentResult.aiAnalysis.shape.confidence * 100).toFixed(0)}% conf
                  </span>
                </div>

                <div className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    Size
                  </span>
                  <p className="font-bold text-slate-100 capitalize mt-0.5">
                    {currentResult.aiAnalysis.size.category}
                  </p>
                  <span className="text-[9px] font-mono text-slate-400">
                    Qualitative
                  </span>
                </div>

                <div className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    Surface
                  </span>
                  <p className="font-bold text-slate-100 capitalize mt-0.5 truncate">
                    {currentResult.aiAnalysis.surface.condition.replace('_', ' ')}
                  </p>
                  <span className="text-[9px] font-mono text-slate-400">
                    {(currentResult.aiAnalysis.surface.confidence * 100).toFixed(0)}% conf
                  </span>
                </div>
              </div>

              {/* Defects Observation List */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-200">
                    Observed Surface Defects ({currentResult.aiAnalysis.defects.length})
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">Visible Evidence</span>
                </div>

                {currentResult.aiAnalysis.defects.length === 0 ? (
                  <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Clean specimen. Zero disqualifying surface defects observed.</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {currentResult.aiAnalysis.defects.map((defect) => (
                      <div
                        key={defect.id}
                        className="p-2.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-200 capitalize">
                            {defect.label}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                              defect.severity === 'severe'
                                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                : defect.severity === 'moderate'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}
                          >
                            {defect.severity}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">{defect.visibleEvidence}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 pt-1">
                <button
                  onClick={handleReset}
                  className="flex-1 py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Inspect Next {activeVeggie.name}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
