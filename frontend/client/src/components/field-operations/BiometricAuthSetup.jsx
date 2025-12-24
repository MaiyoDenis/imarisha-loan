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
import React, { useState } from "react";
import { Box, Button, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemIcon, ListItemText, Stack, Switch, Typography, Alert, TextField, FormControl, InputLabel, Select, MenuItem, } from "@mui/material";
import { Fingerprint, Info, Lock } from "@mui/icons-material";
import { useBiometricAuth, useEnrollBiometric, useUserBiometrics, } from "@/hooks/use-field-operations";
export var BiometricAuthSetup = function (_a) {
    var userId = _a.userId;
    var _b = useState(false), openEnroll = _b[0], setOpenEnroll = _b[1];
    var _c = useState("fingerprint"), authType = _c[0], setAuthType = _c[1];
    var _d = useState(""), deviceId = _d[0], setDeviceId = _d[1];
    var _e = useState(""), pinFallback = _e[0], setPinFallback = _e[1];
    var supported = useBiometricAuth().supported;
    var enrollMutation = useEnrollBiometric();
    var userBiometrics = useUserBiometrics(userId).data;
    var handleEnroll = function () {
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(authType && deviceId))
                            return [3 /*break*/, 2];
                        return [4 /*yield*/, enrollMutation.mutateAsync({ authType: authType, deviceId: deviceId })];
                    case 1:
                        _a.sent();
                        setAuthType("fingerprint");
                        setDeviceId("");
                        setPinFallback("");
                        setOpenEnroll(false);
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    var authTypeIcons = {
        fingerprint: <Fingerprint />,
        face: <Fingerprint />,
        iris: <Fingerprint />,
    };
    return (<>
      <Card>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Lock color="primary"/>
            <Box>
              <Typography variant="h6">Biometric Authentication</Typography>
              <Typography variant="caption" color="textSecondary">
                {supported ? "Available on this device" : "Not available"}
              </Typography>
            </Box>
          </Stack>

          {!supported && (<Alert severity="info" sx={{ mb: 2 }}>
              Biometric authentication is not available on this device. Please use PIN as fallback.
            </Alert>)}

          {userBiometrics && userBiometrics.length > 0 ? (<Stack spacing={2}>
              <Typography variant="subtitle2">Enrolled Methods:</Typography>
              <List>
                {userBiometrics.map(function (bio) {
                return (<ListItem key={bio.id}>
                    <ListItemIcon>
                      {authTypeIcons[bio.authType] || <Fingerprint />}
                    </ListItemIcon>
                    <ListItemText primary={bio.authType.charAt(0).toUpperCase() + bio.authType.slice(1)} secondary={"Device: ".concat(bio.deviceId)}/>
                    <Switch defaultChecked={bio.enabled}/>
                  </ListItem>);
            })}
              </List>

              <Button variant="outlined" onClick={function () { return setOpenEnroll(true); }} fullWidth>
                Add Another Method
              </Button>
            </Stack>) : (<Stack spacing={2}>
              <Typography variant="body2" color="textSecondary">
                No biometric methods enrolled yet.
              </Typography>
              <Button variant="contained" onClick={function () { return setOpenEnroll(true); }} disabled={!supported} fullWidth>
                Enroll Biometric
              </Button>
            </Stack>)}
        </CardContent>
      </Card>

      <Dialog open={openEnroll} onClose={function () { return setOpenEnroll(false); }} maxWidth="sm" fullWidth>
        <DialogTitle>Enroll Biometric Authentication</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 2 }}>
            <Alert severity="info">
              <Typography variant="caption">
                <Info sx={{ mr: 1, fontSize: 16 }}/>
                Follow the on-screen prompts to register your biometric. You'll need to repeat the action 3-5 times for best accuracy.
              </Typography>
            </Alert>

            <FormControl fullWidth>
              <InputLabel>Authentication Type</InputLabel>
              <Select value={authType} onChange={function (e) { return setAuthType(e.target.value); }} label="Authentication Type">
                <MenuItem value="fingerprint">Fingerprint</MenuItem>
                <MenuItem value="face">Face Recognition</MenuItem>
                <MenuItem value="iris">Iris Scan</MenuItem>
              </Select>
            </FormControl>

            <TextField label="Device Identifier" placeholder="e.g., iPhone 13, Galaxy A12" value={deviceId} onChange={function (e) { return setDeviceId(e.target.value); }} fullWidth helperText="Helps identify the device this was enrolled on"/>

            <Box sx={{ p: 1.5, bgcolor: "#f5f5f5", borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Backup PIN (optional)
              </Typography>
              <TextField label="Set a PIN for backup" type="password" value={pinFallback} onChange={function (e) { return setPinFallback(e.target.value); }} fullWidth helperText="Use if biometric fails"/>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={function () { return setOpenEnroll(false); }}>Cancel</Button>
          <Button variant="contained" onClick={handleEnroll} disabled={!authType || !deviceId || enrollMutation.isPending}>
            {enrollMutation.isPending ? "Enrolling..." : "Enroll"}
          </Button>
        </DialogActions>
      </Dialog>
    </>);
};
