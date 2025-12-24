var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s)
                if (Object.prototype.hasOwnProperty.call(s, p))
                    t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
import { Box, Stepper, Step, StepLabel, Button, TextField, Typography, Card, CardContent, LinearProgress, Stack, Alert, Select, MenuItem, FormControl, InputLabel, } from "@mui/material";
import { useCreateApplication, useUpdateApplicationStep } from "@/hooks/use-field-operations";
var steps = ["Select Loan Type", "Enter Amount", "Verification", "Collateral", "Review & Submit"];
export var MobileLoanWizard = function (_a) {
    var memberId = _a.memberId, onSuccess = _a.onSuccess;
    var _b = useState(0), activeStep = _b[0], setActiveStep = _b[1];
    var _c = useState({}), formData = _c[0], setFormData = _c[1];
    var _d = useState(null), appId = _d[0], setAppId = _d[1];
    var _e = useState(null), error = _e[0], setError = _e[1];
    var createAppMutation = useCreateApplication();
    var updateStepMutation = useUpdateApplicationStep();
    var handleNext = function () {
        return __awaiter(void 0, void 0, void 0, function () {
            var result, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        if (!(activeStep === 0))
                            return [3 /*break*/, 2];
                        return [4 /*yield*/, createAppMutation.mutateAsync({
                                memberId: memberId,
                                loanTypeId: parseInt(formData.loanTypeId || "0"),
                                amount: parseFloat(formData.amount || "0"),
                            })];
                    case 1:
                        result = _a.sent();
                        setAppId(result.id);
                        return [3 /*break*/, 4];
                    case 2:
                        if (!appId)
                            return [3 /*break*/, 4];
                        return [4 /*yield*/, updateStepMutation.mutateAsync({
                                appId: appId,
                                step: activeStep + 1,
                                formData: formData,
                            })];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        setActiveStep(function (prev) { return Math.min(prev + 1, steps.length - 1); });
                        return [3 /*break*/, 6];
                    case 5:
                        err_1 = _a.sent();
                        setError(err_1.message || "Failed to proceed");
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    var handleBack = function () {
        setActiveStep(function (prev) { return Math.max(prev - 1, 0); });
    };
    var handleChange = function (field, value) {
        setFormData(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[field] = value, _a)));
        });
    };
    var progress = ((activeStep + 1) / steps.length) * 100;
    return (<Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Loan Application Wizard
        </Typography>

        <LinearProgress variant="determinate" value={progress} sx={{ mb: 3 }}/>

        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map(function (label) {
            return (<Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>);
        })}
        </Stepper>

        {error && (<Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>)}

        <Box sx={{ mb: 3 }}>
          {activeStep === 0 && (<FormControl fullWidth>
              <InputLabel>Loan Type</InputLabel>
              <Select value={formData.loanTypeId || ""} onChange={function (e) { return handleChange("loanTypeId", e.target.value); }} label="Loan Type">
                <MenuItem value="1">Personal Loan</MenuItem>
                <MenuItem value="2">Business Loan</MenuItem>
                <MenuItem value="3">Agriculture Loan</MenuItem>
                <MenuItem value="4">Emergency Loan</MenuItem>
              </Select>
            </FormControl>)}

          {activeStep === 1 && (<Stack spacing={2}>
              <TextField label="Loan Amount" type="number" value={formData.amount || ""} onChange={function (e) { return handleChange("amount", e.target.value); }} fullWidth inputProps={{ step: "100" }}/>
              <TextField label="Purpose" multiline rows={3} value={formData.purpose || ""} onChange={function (e) { return handleChange("purpose", e.target.value); }} fullWidth/>
            </Stack>)}

          {activeStep === 2 && (<Stack spacing={2}>
              <TextField label="Identification Number" value={formData.idNumber || ""} onChange={function (e) { return handleChange("idNumber", e.target.value); }} fullWidth/>
              <TextField label="Phone Number" value={formData.phone || ""} onChange={function (e) { return handleChange("phone", e.target.value); }} fullWidth/>
              <Typography variant="caption" color="textSecondary">
                Photo ID will be captured in next step
              </Typography>
            </Stack>)}

          {activeStep === 3 && (<Stack spacing={2}>
              <TextField label="Collateral Description" multiline rows={3} value={formData.collateral || ""} onChange={function (e) { return handleChange("collateral", e.target.value); }} fullWidth/>
              <TextField label="Estimated Value (KES)" type="number" value={formData.collateralValue || ""} onChange={function (e) { return handleChange("collateralValue", e.target.value); }} fullWidth/>
            </Stack>)}

          {activeStep === 4 && (<Box>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                Review Your Application:
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2">
                  <strong>Loan Type:</strong> {formData.loanTypeId}
                </Typography>
                <Typography variant="body2">
                  <strong>Amount:</strong> KES {parseFloat(formData.amount || "0").toLocaleString()}
                </Typography>
                <Typography variant="body2">
                  <strong>Purpose:</strong> {formData.purpose}
                </Typography>
                <Typography variant="body2">
                  <strong>Collateral:</strong> {formData.collateral}
                </Typography>
              </Stack>
            </Box>)}
        </Box>

        <Stack direction="row" spacing={2} sx={{ justifyContent: "space-between" }}>
          <Button onClick={handleBack} disabled={activeStep === 0} variant="outlined">
            Back
          </Button>
          <Button onClick={handleNext} variant="contained" disabled={createAppMutation.isPending || updateStepMutation.isPending}>
            {activeStep === steps.length - 1 ? "Submit" : "Next"}
          </Button>
        </Stack>
      </CardContent>
    </Card>);
};
