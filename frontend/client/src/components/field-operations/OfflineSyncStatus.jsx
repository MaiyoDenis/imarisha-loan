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
import { Box, Button, Card, CardContent, Chip, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, Stack, Typography, Alert, } from "@mui/material";
import { CloudSync, CloudOff, Refresh, } from "@mui/icons-material";
import { useOfflineSync, useSyncQueue, useProcessSync, useResolveConflict, } from "@/hooks/use-field-operations";
export var OfflineSyncStatus = function (_a) {
    var userId = _a.userId;
    var _b = useState(false), openDetails = _b[0], setOpenDetails = _b[1];
    var _c = useState(navigator.onLine), isOnline = _c[0], setIsOnline = _c[1];
    var syncStatus = useOfflineSync(userId).data;
    var queue = useSyncQueue(userId).data;
    var processMutation = useProcessSync();
    var resolveMutation = useResolveConflict();
    React.useEffect(function () {
        var handleOnline = function () { return setIsOnline(true); };
        var handleOffline = function () { return setIsOnline(false); };
        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);
        return function () {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);
    var handleSync = function () {
        return __awaiter(void 0, void 0, void 0, function () {
            var pendingItems;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(queue && queue.length > 0))
                            return [3 /*break*/, 2];
                        pendingItems = queue.filter(function (item) { return item.status === "pending"; });
                        return [4 /*yield*/, processMutation.mutateAsync(pendingItems.map(function (item) { return ({ id: item.id }); }))];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    var handleResolveConflict = function (syncId) {
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, resolveMutation.mutateAsync({
                            conflictId: syncId,
                            resolution: "server",
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    var pendingCount = (syncStatus === null || syncStatus === void 0 ? void 0 : syncStatus.pendingItems) || 0;
    var failedCount = (syncStatus === null || syncStatus === void 0 ? void 0 : syncStatus.failedItems) || 0;
    var totalItems = pendingCount + failedCount;
    return (<>
      <Card>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {isOnline ? (<>
                  <CloudSync color="success"/>
                  <Typography variant="subtitle2">Online</Typography>
                </>) : (<>
                  <CloudOff color="warning"/>
                  <Typography variant="subtitle2">Offline</Typography>
                </>)}
            </Box>

            {totalItems > 0 && (<Chip icon={<Refresh />} label={"".concat(totalItems, " pending")} color={failedCount > 0 ? "error" : "warning"} variant="outlined"/>)}
          </Stack>

          {!isOnline && (<Alert severity="info" sx={{ mb: 2 }}>
              You are offline. Changes are being saved locally and will sync when you're back online.
            </Alert>)}

          {failedCount > 0 && (<Alert severity="error" sx={{ mb: 2 }}>
              {failedCount} items failed to sync. Click "Retry" to try again.
            </Alert>)}

          <Stack spacing={2}>
            <Box>
              <Typography variant="caption" color="textSecondary" display="block">
                Last Sync: {(syncStatus === null || syncStatus === void 0 ? void 0 : syncStatus.lastSync) ? new Date(syncStatus.lastSync).toLocaleTimeString() : "Never"}
              </Typography>
            </Box>

            {pendingCount > 0 && (<Button variant="contained" startIcon={<Refresh />} onClick={handleSync} disabled={processMutation.isPending || !isOnline} fullWidth>
                {processMutation.isPending ? "Syncing..." : "Sync Now"}
              </Button>)}

            {totalItems > 0 && (<Button variant="outlined" onClick={function () { return setOpenDetails(true); }} fullWidth>
                View Queue Details
              </Button>)}
          </Stack>
        </CardContent>
      </Card>

      <Dialog open={openDetails} onClose={function () { return setOpenDetails(false); }} maxWidth="sm" fullWidth>
        <DialogTitle>Sync Queue Details</DialogTitle>
        <DialogContent>
          {queue && queue.length > 0 ? (<List>
              {queue.map(function (item) {
                return (<ListItem key={item.id} secondaryAction={item.status === "failed" && (<Button size="small" onClick={function () { return handleResolveConflict(item.id); }}>
                        Retry
                      </Button>)}>
                  <ListItemText primary={<Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="subtitle2">
                          {item.entityType}: {item.operation}
                        </Typography>
                        <Chip label={item.status} size="small" color={item.status === "synced"
                            ? "success"
                            : item.status === "failed"
                                ? "error"
                                : "warning"}/>
                      </Stack>} secondary={<Typography variant="caption">
                        Attempts: {item.retryCount}
                      </Typography>}/>
                </ListItem>);
            })}
            </List>) : (<Typography color="textSecondary">Queue is empty</Typography>)}
        </DialogContent>
        <DialogActions>
          <Button onClick={function () { return setOpenDetails(false); }}>Close</Button>
        </DialogActions>
      </Dialog>
    </>);
};
