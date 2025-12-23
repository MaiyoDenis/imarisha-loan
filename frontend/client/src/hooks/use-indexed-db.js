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
import { useState, useCallback } from 'react';
export function useIndexedDB(dbName, storeName) {
    var _this = this;
    var _a = useState(null), db = _a[0], setDb = _a[1];
    var _b = useState(false), isReady = _b[0], setIsReady = _b[1];
    var initDB = useCallback(function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    var request = indexedDB.open(dbName, 1);
                    request.onerror = function () { return reject(request.error); };
                    request.onsuccess = function () {
                        var database = request.result;
                        setDb(database);
                        setIsReady(true);
                        resolve(database);
                    };
                    request.onupgradeneeded = function (event) {
                        var database = event.target.result;
                        if (!database.objectStoreNames.contains(storeName)) {
                            database.createObjectStore(storeName, { keyPath: 'id' });
                        }
                    };
                })];
        });
    }); }, [dbName, storeName]);
    var add = useCallback(function (data) { return __awaiter(_this, void 0, void 0, function () {
        var database, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = db;
                    if (_a) return [3 /*break*/, 2];
                    return [4 /*yield*/, initDB()];
                case 1:
                    _a = (_b.sent());
                    _b.label = 2;
                case 2:
                    database = _a;
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            var transaction = database.transaction([storeName], 'readwrite');
                            var store = transaction.objectStore(storeName);
                            var request = store.add(data);
                            request.onerror = function () { return reject(request.error); };
                            request.onsuccess = function () { return resolve(request.result); };
                        })];
            }
        });
    }); }, [db, storeName, initDB]);
    var get = useCallback(function (id) { return __awaiter(_this, void 0, void 0, function () {
        var database, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = db;
                    if (_a) return [3 /*break*/, 2];
                    return [4 /*yield*/, initDB()];
                case 1:
                    _a = (_b.sent());
                    _b.label = 2;
                case 2:
                    database = _a;
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            var transaction = database.transaction([storeName], 'readonly');
                            var store = transaction.objectStore(storeName);
                            var request = store.get(id);
                            request.onerror = function () { return reject(request.error); };
                            request.onsuccess = function () { return resolve(request.result); };
                        })];
            }
        });
    }); }, [db, storeName, initDB]);
    var getAll = useCallback(function () { return __awaiter(_this, void 0, void 0, function () {
        var database, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = db;
                    if (_a) return [3 /*break*/, 2];
                    return [4 /*yield*/, initDB()];
                case 1:
                    _a = (_b.sent());
                    _b.label = 2;
                case 2:
                    database = _a;
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            var transaction = database.transaction([storeName], 'readonly');
                            var store = transaction.objectStore(storeName);
                            var request = store.getAll();
                            request.onerror = function () { return reject(request.error); };
                            request.onsuccess = function () { return resolve(request.result); };
                        })];
            }
        });
    }); }, [db, storeName, initDB]);
    var update = useCallback(function (data) { return __awaiter(_this, void 0, void 0, function () {
        var database, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = db;
                    if (_a) return [3 /*break*/, 2];
                    return [4 /*yield*/, initDB()];
                case 1:
                    _a = (_b.sent());
                    _b.label = 2;
                case 2:
                    database = _a;
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            var transaction = database.transaction([storeName], 'readwrite');
                            var store = transaction.objectStore(storeName);
                            var request = store.put(data);
                            request.onerror = function () { return reject(request.error); };
                            request.onsuccess = function () { return resolve(request.result); };
                        })];
            }
        });
    }); }, [db, storeName, initDB]);
    var remove = useCallback(function (id) { return __awaiter(_this, void 0, void 0, function () {
        var database, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = db;
                    if (_a) return [3 /*break*/, 2];
                    return [4 /*yield*/, initDB()];
                case 1:
                    _a = (_b.sent());
                    _b.label = 2;
                case 2:
                    database = _a;
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            var transaction = database.transaction([storeName], 'readwrite');
                            var store = transaction.objectStore(storeName);
                            var request = store.delete(id);
                            request.onerror = function () { return reject(request.error); };
                            request.onsuccess = function () { return resolve(request.result); };
                        })];
            }
        });
    }); }, [db, storeName, initDB]);
    var clear = useCallback(function () { return __awaiter(_this, void 0, void 0, function () {
        var database, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = db;
                    if (_a) return [3 /*break*/, 2];
                    return [4 /*yield*/, initDB()];
                case 1:
                    _a = (_b.sent());
                    _b.label = 2;
                case 2:
                    database = _a;
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            var transaction = database.transaction([storeName], 'readwrite');
                            var store = transaction.objectStore(storeName);
                            var request = store.clear();
                            request.onerror = function () { return reject(request.error); };
                            request.onsuccess = function () { return resolve(request.result); };
                        })];
            }
        });
    }); }, [db, storeName, initDB]);
    return {
        db: db,
        isReady: isReady,
        initDB: initDB,
        add: add,
        get: get,
        getAll: getAll,
        update: update,
        remove: remove,
        clear: clear,
    };
}
