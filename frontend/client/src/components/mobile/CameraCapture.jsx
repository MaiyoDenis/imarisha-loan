var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try {
            step(generator.next(value));
        }
        catch (e) {
            reject(e);
        } }
        function rejected(value) { try {
            step(generator["throw"](value));
        }
        catch (e) {
            reject(e);
        } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function () { if (t[0] & 1)
            throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f)
            throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _)
            try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
                    return t;
                if (y = 0, t)
                    op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0:
                    case 1:
                        t = op;
                        break;
                    case 4:
                        _.label++;
                        return { value: op[1], done: false };
                    case 5:
                        _.label++;
                        y = op[1];
                        op = [0];
                        continue;
                    case 7:
                        op = _.ops.pop();
                        _.trys.pop();
                        continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                            _ = 0;
                            continue;
                        }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                            _.label = op[1];
                            break;
                        }
                        if (op[0] === 6 && _.label < t[1]) {
                            _.label = t[1];
                            t = op;
                            break;
                        }
                        if (t && _.label < t[2]) {
                            _.label = t[2];
                            _.ops.push(op);
                            break;
                        }
                        if (t[2])
                            _.ops.pop();
                        _.trys.pop();
                        continue;
                }
                op = body.call(thisArg, _);
            }
            catch (e) {
                op = [6, e];
                y = 0;
            }
            finally {
                f = t = 0;
            }
        if (op[0] & 5)
            throw op[1];
        return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import React, { useRef, useState } from 'react';
export var CameraCapture = function (_a) {
    var onCapture = _a.onCapture, onError = _a.onError;
    var videoRef = useRef(null);
    var canvasRef = useRef(null);
    var _b = useState(false), isActive = _b[0], setIsActive = _b[1];
    var startCamera = function () {
        return __awaiter(void 0, void 0, void 0, function () {
            var stream, error_1, message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, navigator.mediaDevices.getUserMedia({ video: true })];
                    case 1:
                        stream = _a.sent();
                        if (videoRef.current) {
                            videoRef.current.srcObject = stream;
                            setIsActive(true);
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        message = error_1 instanceof Error ? error_1.message : 'Failed to access camera';
                        onError === null || onError === void 0 ? void 0 : onError(message);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    var stopCamera = function () {
        var _a;
        if ((_a = videoRef.current) === null || _a === void 0 ? void 0 : _a.srcObject) {
            var tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(function (track) { return track.stop(); });
            setIsActive(false);
        }
    };
    var takePhoto = function () {
        if (videoRef.current && canvasRef.current) {
            var context = canvasRef.current.getContext('2d');
            if (context) {
                context.drawImage(videoRef.current, 0, 0);
                canvasRef.current.toBlob(function (blob) {
                    if (blob)
                        onCapture === null || onCapture === void 0 ? void 0 : onCapture(blob);
                });
            }
        }
    };
    return (<div className="space-y-4">
      {isActive ? (<>
          <video ref={videoRef} autoPlay playsInline className="w-full rounded"/>
          <canvas ref={canvasRef} className="hidden"/>
          <button onClick={stopCamera} className="btn btn-destructive w-full">
            Stop Camera
          </button>
          <button onClick={takePhoto} className="btn btn-primary w-full">
            Take Photo
          </button>
        </>) : (<button onClick={startCamera} className="btn btn-primary w-full">
          Start Camera
        </button>)}
    </div>);
};
