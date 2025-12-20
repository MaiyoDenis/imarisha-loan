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
import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
var PermissionsManager = function () {
    var _a = useState([]), roles = _a[0], setRoles = _a[1];
    var _b = useState([]), permissions = _b[0], setPermissions = _b[1];
    var _c = useState(true), loading = _c[0], setLoading = _c[1];
    var _d = useState(null), error = _d[0], setError = _d[1];
    useEffect(function () {
        var fetchData = function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a, rolesRes, permissionsRes, err_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, 3, 4]);
                        return [4 /*yield*/, Promise.all([
                                api.get('/permissions/roles'),
                                api.get('/permissions')
                            ])];
                    case 1:
                        _a = _b.sent(), rolesRes = _a[0], permissionsRes = _a[1];
                        setRoles(rolesRes);
                        setPermissions(permissionsRes);
                        return [3 /*break*/, 4];
                    case 2:
                        err_1 = _b.sent();
                        setError('Failed to fetch data');
                        return [3 /*break*/, 4];
                    case 3:
                        setLoading(false);
                        return [7 /*endfinally*/];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        fetchData();
    }, []);
    var handleAssignPermission = function (roleId, permissionId) { return __awaiter(void 0, void 0, void 0, function () {
        var err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, api.post("/permissions/roles/".concat(roleId, "/permissions"), { permission_id: permissionId })];
                case 1:
                    _a.sent();
                    alert('Permission assigned successfully');
                    return [3 /*break*/, 3];
                case 2:
                    err_2 = _a.sent();
                    alert('Failed to assign permission');
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    if (loading)
        return <div>Loading...</div>;
    if (error)
        return <div>{error}</div>;
    return (<div>
            <h1>Permissions Management</h1>
            <div>
                <h2>Roles</h2>
                <ul>
                    {roles.map(function (role) { return (<li key={role.id}>
                            {role.name}
                            <ul>
                                {role.permissions.map(function (p) { return <li key={p}>{p}</li>; })}
                            </ul>
                        </li>); })}
                </ul>
            </div>
            <div>
                <h2>Permissions</h2>
                <ul>
                    {permissions.map(function (permission) { return (<li key={permission.id}>{permission.name}</li>); })}
                </ul>
            </div>
        </div>);
};
export default PermissionsManager;
