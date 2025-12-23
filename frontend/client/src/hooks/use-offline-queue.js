var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { useState, useEffect, useCallback } from 'react';
import { useIndexedDB } from './use-indexed-db';
var OFFLINE_QUEUE_CONFIG = {
    dbName: 'imarisha-offline-queue',
    version: 1,
    stores: [{
            name: 'requests',
            keyPath: 'id',
            indexes: [
                { name: 'timestamp', keyPath: 'timestamp' },
                { name: 'priority', keyPath: 'priority' },
                { name: 'retryCount', keyPath: 'retryCount' }
            ]
        }]
};
export function useOfflineQueue() {
    var _this = this;
    var _a = useState(navigator.onLine), isOnline = _a[0], setIsOnline = _a[1];
    var _b = useState(false), isProcessing = _b[0], setIsProcessing = _b[1];
    var _c = useState([]), queue = _c[0], setQueue = _c[1];
    var _d = useIndexedDB('imarisha-offline-queue', 'requests'), addToDB = _d.add, removeFromDB = _d.remove, clearDB = _d.clear, refreshQueue = _d.getAll;
    // Load queue on mount
    useEffect(function () {
        refreshQueue().then(function (items) {
            setQueue(items || []);
        }).catch(function () {
            setQueue([]);
        });
    }, [refreshQueue]);
    // Monitor online status
    useEffect(function () {
        var handleOnline = function () {
            setIsOnline(true);
            // Auto-process queue when coming back online
            setTimeout(function () { return processQueue(); }, 1000);
        };
        var handleOffline = function () { return setIsOnline(false); };
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return function () {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [processQueue]);
    // Auto-process queue when online and not processing
    useEffect(function () {
        if (isOnline && queue.length > 0 && !isProcessing) {
            var timer_1 = setTimeout(function () { return processQueue(); }, 2000);
            return function () { return clearTimeout(timer_1); };
        }
    }, [isOnline, queue.length, isProcessing, processQueue]);
    var addToQueue = useCallback(function (request) { return __awaiter(_this, void 0, void 0, function () {
        var queuedRequest;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    queuedRequest = __assign(__assign({}, request), { id: "".concat(Date.now(), "-").concat(Math.random().toString(36).substr(2, 9)), timestamp: Date.now(), retryCount: 0 });
                    return [4 /*yield*/, addToDB(queuedRequest)];
                case 1:
                    _a.sent();
                    console.log('[Offline Queue] Request added to queue:', queuedRequest.id);
                    return [2 /*return*/];
            }
        });
    }); }, [addToDB]);
    var processQueue = useCallback(function () { return __awaiter(_this, void 0, void 0, function () {
        var sortedQueue, failedRequests, _i, sortedQueue_1, request, response, error_1, updatedRequest;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!isOnline || isProcessing || queue.length === 0)
                        return [2 /*return*/];
                    setIsProcessing(true);
                    console.log('[Offline Queue] Processing queue...', queue.length, 'requests');
                    sortedQueue = __spreadArray([], queue, true).sort(function (a, b) {
                        var priorityOrder = { high: 3, normal: 2, low: 1 };
                        var priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
                        return priorityDiff !== 0 ? priorityDiff : a.timestamp - b.timestamp;
                    });
                    failedRequests = [];
                    _i = 0, sortedQueue_1 = sortedQueue;
                    _a.label = 1;
                case 1:
                    if (!(_i < sortedQueue_1.length)) return [3 /*break*/, 14];
                    request = sortedQueue_1[_i];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 7, , 13]);
                    console.log('[Offline Queue] Processing request:', request.id, request.method, request.url);
                    return [4 /*yield*/, fetch(request.url, {
                            method: request.method,
                            headers: request.headers,
                            body: request.body
                        })];
                case 3:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 5];
                    return [4 /*yield*/, removeFromDB(request.id)];
                case 4:
                    _a.sent();
                    console.log('[Offline Queue] Request processed successfully:', request.id);
                    return [3 /*break*/, 6];
                case 5: throw new Error("HTTP ".concat(response.status, ": ").concat(response.statusText));
                case 6: return [3 /*break*/, 13];
                case 7:
                    error_1 = _a.sent();
                    console.error('[Offline Queue] Request failed:', request.id, error_1);
                    updatedRequest = __assign(__assign({}, request), { retryCount: request.retryCount + 1 });
                    if (!(updatedRequest.retryCount < request.maxRetries)) return [3 /*break*/, 10];
                    // Update retry count in DB
                    return [4 /*yield*/, removeFromDB(request.id)];
                case 8:
                    // Update retry count in DB
                    _a.sent();
                    return [4 /*yield*/, addToDB(updatedRequest)];
                case 9:
                    _a.sent();
                    failedRequests.push(updatedRequest);
                    return [3 /*break*/, 12];
                case 10: 
                // Max retries reached, remove from queue
                return [4 /*yield*/, removeFromDB(request.id)];
                case 11:
                    // Max retries reached, remove from queue
                    _a.sent();
                    console.log('[Offline Queue] Request removed after max retries:', request.id);
                    _a.label = 12;
                case 12: return [3 /*break*/, 13];
                case 13:
                    _i++;
                    return [3 /*break*/, 1];
                case 14:
                    setIsProcessing(false);
                    if (failedRequests.length > 0) {
                        console.log('[Offline Queue] Processing complete with', failedRequests.length, 'failed requests');
                    }
                    else {
                        console.log('[Offline Queue] All requests processed successfully');
                    }
                    return [2 /*return*/];
            }
        });
    }); }, [isOnline, isProcessing, queue, removeFromDB, addToDB]);
    var clearQueue = useCallback(function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, clearDB()];
                case 1:
                    _a.sent();
                    console.log('[Offline Queue] Queue cleared');
                    return [2 /*return*/];
            }
        });
    }); }, [clearDB]);
    var removeFromQueue = useCallback(function (id) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, removeFromDB(id)];
                case 1:
                    _a.sent();
                    console.log('[Offline Queue] Request removed from queue:', id);
                    return [2 /*return*/];
            }
        });
    }); }, [removeFromDB]);
    var pendingCount = queue.filter(function (req) { return req.retryCount === 0; }).length;
    var failedCount = queue.filter(function (req) { return req.retryCount > 0; }).length;
    return {
        queue: queue,
        isOnline: isOnline,
        isProcessing: isProcessing,
        pendingCount: pendingCount,
        failedCount: failedCount,
        addToQueue: addToQueue,
        processQueue: processQueue,
        clearQueue: clearQueue,
        removeFromQueue: removeFromQueue
    };
}
