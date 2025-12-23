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
import { useState, useEffect, useCallback } from 'react';
export function useBiometricAuth() {
    var _this = this;
    var _a = useState(false), isAvailable = _a[0], setIsAvailable = _a[1];
    var _b = useState(false), isSupported = _b[0], setIsSupported = _b[1];
    var _c = useState(false), isEnrolled = _c[0], setIsEnrolled = _c[1];
    var _d = useState(false), authenticating = _d[0], setAuthenticating = _d[1];
    var _e = useState(null), error = _e[0], setError = _e[1];
    var _f = useState([]), supportedTypes = _f[0], setSupportedTypes = _f[1];
    useEffect(function () {
        checkBiometricSupport();
    }, [checkBiometricSupport]);
    var checkBiometricSupport = useCallback(function () { return __awaiter(_this, void 0, void 0, function () {
        var available, types, credential, err_1, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    // Check if WebAuthn is supported
                    if (!window.PublicKeyCredential) {
                        setIsSupported(false);
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()];
                case 1:
                    available = _a.sent();
                    setIsAvailable(available);
                    setIsSupported(true);
                    types = [];
                    if (!available) return [3 /*break*/, 5];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, navigator.credentials.get({
                            publicKey: {
                                challenge: new Uint8Array(32),
                                rp: { name: 'Imarisha Loans' },
                                user: {
                                    id: new Uint8Array(16),
                                    name: 'test@example.com',
                                    displayName: 'Test User'
                                },
                                authenticatorSelection: {
                                    authenticatorAttachment: 'platform',
                                    userVerification: 'required'
                                },
                                timeout: 60000
                            }
                        })];
                case 3:
                    credential = _a.sent();
                    if (credential) {
                        types.push('biometric');
                    }
                    return [3 /*break*/, 5];
                case 4:
                    err_1 = _a.sent();
                    return [3 /*break*/, 5];
                case 5:
                    setSupportedTypes(types);
                    console.log('[Biometric] Support checked:', { available: available, supported: true, types: types });
                    return [3 /*break*/, 7];
                case 6:
                    err_2 = _a.sent();
                    setIsSupported(false);
                    setIsAvailable(false);
                    console.log('[Biometric] Not supported:', err_2);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); }, []);
    var checkEnrollment = useCallback(function () { return __awaiter(_this, void 0, void 0, function () {
        var challenge, credential, enrolled, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    challenge = new Uint8Array(32);
                    crypto.getRandomValues(challenge);
                    return [4 /*yield*/, navigator.credentials.get({
                            publicKey: {
                                challenge: challenge,
                                timeout: 60000,
                                userVerification: 'required'
                            }
                        })];
                case 1:
                    credential = _a.sent();
                    enrolled = !!credential;
                    setIsEnrolled(enrolled);
                    return [2 /*return*/, enrolled];
                case 2:
                    err_3 = _a.sent();
                    setIsEnrolled(false);
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    }); }, []);
    var enroll = useCallback(function (credentialId) { return __awaiter(_this, void 0, void 0, function () {
        var challenge, userId, credential, err_4, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    setError(null);
                    challenge = new Uint8Array(32);
                    crypto.getRandomValues(challenge);
                    userId = new Uint8Array(16);
                    crypto.getRandomValues(userId);
                    return [4 /*yield*/, navigator.credentials.create({
                            publicKey: {
                                challenge: challenge,
                                rp: {
                                    name: 'Imarisha Loans',
                                    id: window.location.hostname
                                },
                                user: {
                                    id: userId,
                                    name: credentialId,
                                    displayName: "User ".concat(credentialId)
                                },
                                pubKeyCredParams: [
                                    { alg: -7, type: 'public-key' }, // ES256
                                    { alg: -257, type: 'public-key' } // RS256
                                ],
                                authenticatorSelection: {
                                    authenticatorAttachment: 'platform',
                                    userVerification: 'required',
                                    requireResidentKey: false
                                },
                                timeout: 60000,
                                attestation: 'direct'
                            }
                        })];
                case 1:
                    credential = _a.sent();
                    if (credential) {
                        setIsEnrolled(true);
                        console.log('[Biometric] Enrollment successful');
                        return [2 /*return*/, true];
                    }
                    return [2 /*return*/, false];
                case 2:
                    err_4 = _a.sent();
                    errorMessage = err_4 instanceof Error ? err_4.message : 'Enrollment failed';
                    setError(errorMessage);
                    console.error('[Biometric] Enrollment failed:', err_4);
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    }); }, []);
    var authenticate = useCallback(function () { return __awaiter(_this, void 0, void 0, function () {
        var challenge, credential, success, err_5, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setError(null);
                    setAuthenticating(true);
                    challenge = new Uint8Array(32);
                    crypto.getRandomValues(challenge);
                    return [4 /*yield*/, navigator.credentials.get({
                            publicKey: {
                                challenge: challenge,
                                timeout: 60000,
                                userVerification: 'required',
                                allowCredentials: [] // Allow any enrolled credential
                            }
                        })];
                case 1:
                    credential = _a.sent();
                    success = !!credential;
                    if (success) {
                        console.log('[Biometric] Authentication successful');
                    }
                    else {
                        setError('Authentication failed');
                    }
                    return [2 /*return*/, success];
                case 2:
                    err_5 = _a.sent();
                    errorMessage = err_5 instanceof Error ? err_5.message : 'Authentication failed';
                    setError(errorMessage);
                    console.error('[Biometric] Authentication failed:', err_5);
                    return [2 /*return*/, false];
                case 3:
                    setAuthenticating(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); }, []);
    return {
        isAvailable: isAvailable,
        isSupported: isSupported,
        isEnrolled: isEnrolled,
        authenticating: authenticating,
        error: error,
        authenticate: authenticate,
        enroll: enroll,
        checkEnrollment: checkEnrollment,
        supportedTypes: supportedTypes
    };
}
