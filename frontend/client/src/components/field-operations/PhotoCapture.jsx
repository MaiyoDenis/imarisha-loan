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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2)
        for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
                if (!ar)
                    ar = Array.prototype.slice.call(from, 0, i);
                ar[i] = from[i];
            }
        }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import React, { useRef, useState } from "react";
import { Box, Button, Card, CardContent, CardMedia, ImageList, ImageListItem, LinearProgress, Stack, TextField, Typography, Chip, Dialog, DialogTitle, DialogContent, DialogActions, } from "@mui/material";
import { CameraAlt } from "@mui/icons-material";
import { usePhotoCapture, usePhotos, useGeolocation } from "@/hooks/use-field-operations";
export var PhotoCapture = function (_a) {
    var entityType = _a.entityType, entityId = _a.entityId;
    var videoRef = useRef(null);
    var canvasRef = useRef(null);
    var fileInputRef = useRef(null);
    var _b = useState(false), cameraActive = _b[0], setCameraActive = _b[1];
    var _c = useState(null), capturedPhoto = _c[0], setCapturedPhoto = _c[1];
    var _d = useState(""), description = _d[0], setDescription = _d[1];
    var _e = useState([]), tags = _e[0], setTags = _e[1];
    var _f = useState(""), currentTag = _f[0], setCurrentTag = _f[1];
    var _g = useState(false), openPreview = _g[0], setOpenPreview = _g[1];
    var uploadMutation = usePhotoCapture();
    var photos = usePhotos(entityType, entityId).data;
    var location = useGeolocation().location;
    var startCamera = function () {
        return __awaiter(void 0, void 0, void 0, function () {
            var stream, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, navigator.mediaDevices.getUserMedia({
                                video: { facingMode: "environment" },
                                audio: false,
                            })];
                    case 1:
                        stream = _a.sent();
                        if (videoRef.current) {
                            videoRef.current.srcObject = stream;
                            setCameraActive(true);
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        err_1 = _a.sent();
                        console.error("Camera access denied:", err_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    var stopCamera = function () {
        if (videoRef.current && videoRef.current.srcObject) {
            var tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(function (track) { return track.stop(); });
            setCameraActive(false);
        }
    };
    var takePhoto = function () {
        if (canvasRef.current && videoRef.current) {
            var ctx = canvasRef.current.getContext("2d");
            if (ctx) {
                canvasRef.current.width = videoRef.current.videoWidth;
                canvasRef.current.height = videoRef.current.videoHeight;
                ctx.drawImage(videoRef.current, 0, 0);
                setCapturedPhoto(canvasRef.current.toDataURL("image/jpeg"));
                setOpenPreview(true);
            }
        }
    };
    var uploadPhoto = function () {
        return __awaiter(void 0, void 0, void 0, function () {
            var blob, file;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!capturedPhoto)
                            return [3 /*break*/, 3];
                        return [4 /*yield*/, fetch(capturedPhoto).then(function (r) { return r.blob(); })];
                    case 1:
                        blob = _a.sent();
                        file = new File([blob], "photo_".concat(Date.now(), ".jpg"), {
                            type: "image/jpeg",
                        });
                        return [4 /*yield*/, uploadMutation.mutateAsync({
                                entityType: entityType,
                                entityId: entityId,
                                file: file,
                                description: description,
                                gpsLatitude: location === null || location === void 0 ? void 0 : location.latitude,
                                gpsLongitude: location === null || location === void 0 ? void 0 : location.longitude,
                                tags: tags,
                            })];
                    case 2:
                        _a.sent();
                        setCapturedPhoto(null);
                        setDescription("");
                        setTags([]);
                        setOpenPreview(false);
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    var handleAddTag = function () {
        if (currentTag && !tags.includes(currentTag)) {
            setTags(__spreadArray(__spreadArray([], tags, true), [currentTag], false));
            setCurrentTag("");
        }
    };
    return (<Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Photo Documentation
        </Typography>

        {!cameraActive ? (<Button variant="contained" startIcon={<CameraAlt />} onClick={startCamera} fullWidth sx={{ mb: 2 }}>
            Open Camera
          </Button>) : (<Stack spacing={2}>
            <Box sx={{
                position: "relative",
                width: "100%",
                paddingBottom: "75%",
                overflow: "hidden",
            }}>
              <video ref={videoRef} autoPlay playsInline style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
            }}/>
            </Box>
            <canvas ref={canvasRef} style={{ display: "none" }}/>
            <Stack direction="row" spacing={1}>
              <Button variant="contained" onClick={takePhoto} fullWidth>
                Capture Photo
              </Button>
              <Button variant="outlined" onClick={stopCamera} fullWidth>
                Close Camera
              </Button>
            </Stack>
          </Stack>)}

        {capturedPhoto && (<Dialog open={openPreview} onClose={function () { return setOpenPreview(false); }}>
            <DialogTitle>Photo Preview</DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 2 }}>
                <CardMedia component="img" height="300" image={capturedPhoto} alt="Preview"/>
              </Box>
              <TextField label="Description" multiline rows={2} value={description} onChange={function (e) { return setDescription(e.target.value); }} fullWidth sx={{ mb: 2 }}/>
              <TextField label="Add Tag" value={currentTag} onChange={function (e) { return setCurrentTag(e.target.value); }} onKeyPress={function (e) { return e.key === "Enter" && handleAddTag(); }} fullWidth sx={{ mb: 2 }}/>
              <Box sx={{ mb: 2 }}>
                {tags.map(function (tag) { return (<Chip key={tag} label={tag} onDelete={function () { return setTags(tags.filter(function (t) { return t !== tag; })); }} sx={{ mr: 1 }}/>); })}
              </Box>
              {location && (<Typography variant="caption" color="textSecondary">
                  GPS: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                </Typography>)}
            </DialogContent>
            <DialogActions>
              <Button onClick={function () { return setOpenPreview(false); }}>Cancel</Button>
              <Button onClick={uploadPhoto} variant="contained" disabled={uploadMutation.isPending}>
                {uploadMutation.isPending ? "Uploading..." : "Upload"}
              </Button>
            </DialogActions>
          </Dialog>)}

        {uploadMutation.isPending && <LinearProgress />}

        <Typography variant="subtitle2" sx={{ mt: 3, mb: 2 }}>
          Recent Photos ({(photos === null || photos === void 0 ? void 0 : photos.length) || 0})
        </Typography>

        {photos && photos.length > 0 ? (<ImageList cols={2} gap={8}>
            {photos.map(function (photo) {
                return (<ImageListItem key={photo.id}>
                <CardMedia component="img" height="150" image={photo.photoUrl} alt={photo.description} sx={{ objectFit: "cover" }}/>
              </ImageListItem>);
            })}
          </ImageList>) : (<Typography color="textSecondary" variant="body2">
            No photos yet
          </Typography>)}
      </CardContent>
    </Card>);
};
