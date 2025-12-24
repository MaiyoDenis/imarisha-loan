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
import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGPSTracking } from '@/hooks/use-gps-tracking';
import { MapPin, Play, Square, Navigation } from 'lucide-react';
export function GPSTracker(_a) {
    var _this = this;
    var _b = _a.autoStart, autoStart = _b === void 0 ? false : _b, _c = _a.showControls, showControls = _c === void 0 ? false : _c, _d = _a.className, className = _d === void 0 ? '' : _d;
    var _e = useGPSTracking(), position = _e.position, isTracking = _e.isTracking, error = _e.error, accuracy = _e.accuracy, startTracking = _e.startTracking, stopTracking = _e.stopTracking, getCurrentPosition = _e.getCurrentPosition;
    useEffect(function () {
        if (autoStart && !isTracking) {
            startTracking();
        }
    }, [autoStart, isTracking, startTracking]);
    var handleGetCurrentPosition = function () {
        return __awaiter(_this, void 0, void 0, function () {
            var err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, getCurrentPosition()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        err_1 = _a.sent();
                        console.error('Failed to get current position:', err_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return (<Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5"/>
          GPS Location Tracking
        </CardTitle>
        <CardDescription>
          Real-time GPS tracking for field operations with accuracy monitoring
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Display */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Tracking Status</div>
            <Badge variant={isTracking ? "default" : "secondary"}>
              {isTracking ? "Active" : "Inactive"}
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">Accuracy</div>
            <Badge variant={accuracy === 'high' ? 'default' :
            accuracy === 'medium' ? 'secondary' : 'destructive'}>
              {accuracy.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Position Display */}
        {position && (<div className="space-y-2">
            <div className="text-sm font-medium">Current Position</div>
            <div className="bg-muted p-3 rounded text-sm font-mono">
              <div>Lat: {position.latitude.toFixed(6)}</div>
              <div>Lng: {position.longitude.toFixed(6)}</div>
              <div>Accuracy: ±{position.accuracy.toFixed(1)}m</div>
              {position.altitude && (<div>Altitude: {position.altitude.toFixed(1)}m</div>)}
              {position.speed && (<div>Speed: {(position.speed * 3.6).toFixed(1)} km/h</div>)}
            </div>
          </div>)}

        {/* Error Display */}
        {error && (<div className="text-sm text-red-500 p-2 bg-destructive/10 rounded">
            {error}
          </div>)}

        {/* Controls */}
        {showControls && (<div className="flex gap-2">
            <Button onClick={function () { return (isTracking ? stopTracking() : startTracking()); }} variant={isTracking ? "destructive" : "default"} className="flex-1">
              {isTracking ? (<>
                  <Square className="w-4 h-4 mr-2"/>
                  Stop Tracking
                </>) : (<>
                  <Play className="w-4 h-4 mr-2"/>
                  Start Tracking
                </>)}
            </Button>
            <Button onClick={handleGetCurrentPosition} variant="outline">
              <Navigation className="w-4 h-4 mr-2"/>
              Get Position
            </Button>
          </div>)}

        {/* Info */}
        <div className="text-xs text-muted-foreground">
          GPS tracking requires location permissions. Ensure GPS is enabled on your device for best accuracy.
        </div>
      </CardContent>
    </Card>);
}
