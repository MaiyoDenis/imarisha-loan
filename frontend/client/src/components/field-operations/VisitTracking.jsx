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
import { Box, Button, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions, Grid, List, ListItemButton, ListItemText, Stack, TextField, Typography, Chip, LinearProgress, FormControl, InputLabel, Select, MenuItem, } from "@mui/material";
import { LocationOn, Timer, Notes as NotesIcon } from "@mui/icons-material";
import { useFieldVisits, useCreateVisit, useCompleteVisit, useGeolocation, } from "@/hooks/use-field-operations";
export var VisitTracking = function (_a) {
    var userId = _a.userId, memberId = _a.memberId;
    var _b = useState(false), openCreate = _b[0], setOpenCreate = _b[1];
    var _c = useState(false), openComplete = _c[0], setOpenComplete = _c[1];
    var _d = useState(null), selectedVisit = _d[0], setSelectedVisit = _d[1];
    var _e = useState({
        purpose: "",
        notes: "",
        duration: "",
    }), formData = _e[0], setFormData = _e[1];
    var _f = useFieldVisits(userId), visits = _f.data, isLoading = _f.isLoading;
    var createMutation = useCreateVisit();
    var completeMutation = useCompleteVisit();
    var _g = useGeolocation(), location = _g.location, getLocation = _g.getLocation, locationLoading = _g.loading;
    var handleCreateVisit = function () {
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!location) {
                            getLocation();
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, createMutation.mutateAsync({
                                memberId: memberId || 0,
                                purpose: formData.purpose,
                                latitude: location.latitude,
                                longitude: location.longitude,
                                notes: formData.notes,
                            })];
                    case 1:
                        _a.sent();
                        setFormData({ purpose: "", notes: "", duration: "" });
                        setOpenCreate(false);
                        return [2 /*return*/];
                }
            });
        });
    };
    var handleCompleteVisit = function () {
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!selectedVisit)
                            return [3 /*break*/, 2];
                        return [4 /*yield*/, completeMutation.mutateAsync({
                                visitId: selectedVisit.id,
                                notes: formData.notes,
                                duration: parseInt(formData.duration || "0"),
                            })];
                    case 1:
                        _a.sent();
                        setOpenComplete(false);
                        setSelectedVisit(null);
                        setFormData({ purpose: "", notes: "", duration: "" });
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    var purposeOptions = [
        "Loan Application",
        "Loan Disbursement",
        "Repayment Collection",
        "Follow-up",
        "Problem Solving",
    ];
    return (<Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6">Field Visits</Typography>
              <Button variant="contained" onClick={function () { return setOpenCreate(true); }}>
                New Visit
              </Button>
            </Stack>

            {isLoading ? (<LinearProgress />) : visits && visits.length > 0 ? (<List>
                {visits.map(function (visit) {
                return (<ListItemButton key={visit.id} onClick={function () {
                        setSelectedVisit(visit);
                        if (!visit.completed) {
                            setOpenComplete(true);
                        }
                    }} sx={{
                        border: "1px solid #e0e0e0",
                        borderRadius: 1,
                        mb: 1,
                    }}>
                    <ListItemText primary={<Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="subtitle2">
                            {visit.visitPurpose}
                          </Typography>
                          <Chip label={visit.completed ? "Completed" : "Active"} color={visit.completed ? "success" : "warning"} size="small"/>
                        </Stack>} secondary={<Stack spacing={0.5} sx={{ mt: 1 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <LocationOn fontSize="small"/>
                            <Typography variant="caption">
                              {visit.latitude}, {visit.longitude}
                            </Typography>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Timer fontSize="small"/>
                            <Typography variant="caption">
                              {visit.durationMinutes || "In progress"} minutes
                            </Typography>
                          </Box>
                          {visit.notes && (<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <NotesIcon fontSize="small"/>
                              <Typography variant="caption">
                                {visit.notes.substring(0, 50)}...
                              </Typography>
                            </Box>)}
                        </Stack>}/>
                  </ListItemButton>);
            })}
              </List>) : (<Typography color="textSecondary">No visits yet</Typography>)}
          </CardContent>
        </Card>
      </Grid>

      <Dialog open={openCreate} onClose={function () { return setOpenCreate(false); }} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Visit</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Visit Purpose</InputLabel>
              <Select value={formData.purpose} onChange={function (e) {
            return setFormData(__assign(__assign({}, formData), { purpose: e.target.value }));
        }} label="Visit Purpose">
                {purposeOptions.map(function (option) {
            return (<MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>);
        })}
              </Select>
            </FormControl>

            <TextField label="Notes" multiline rows={3} value={formData.notes} onChange={function (e) {
            return setFormData(__assign(__assign({}, formData), { notes: e.target.value }));
        }} fullWidth/>

            {location ? (<Box sx={{ p: 1.5, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                <Typography variant="caption" display="block">
                  Current Location:
                </Typography>
                <Typography variant="body2" color="primary">
                  {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Accuracy: ±{Math.round(location.accuracy)} meters
                </Typography>
              </Box>) : (<Button variant="outlined" onClick={getLocation} disabled={locationLoading}>
                {locationLoading ? "Getting Location..." : "Get Current Location"}
              </Button>)}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={function () { return setOpenCreate(false); }}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateVisit} disabled={!formData.purpose || createMutation.isPending}>
            Create Visit
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openComplete} onClose={function () { return setOpenComplete(false); }} maxWidth="sm" fullWidth>
        <DialogTitle>Complete Visit</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 2 }}>
            <TextField label="Duration (minutes)" type="number" value={formData.duration} onChange={function (e) {
            return setFormData(__assign(__assign({}, formData), { duration: e.target.value }));
        }} fullWidth/>

            <TextField label="Final Notes" multiline rows={3} value={formData.notes} onChange={function (e) {
            return setFormData(__assign(__assign({}, formData), { notes: e.target.value }));
        }} fullWidth/>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={function () { return setOpenComplete(false); }}>Cancel</Button>
          <Button variant="contained" onClick={handleCompleteVisit} disabled={!formData.duration || completeMutation.isPending}>
            Complete Visit
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>);
};
