import React, { useState } from "react";
import { Card, CardContent, CardActions, Grid, Button, LinearProgress, Typography, Box, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Paper, Stack, } from "@mui/material";
import { useChallenges, useUserChallenges, useJoinChallenge, useUpdateChallengeProgress, } from "@/hooks/use-gamification";
export var ChallengesPanel = function (_a) {
    var _b, _c, _d, _e;
    var userId = _a.userId;
    var challengesQuery = useChallenges();
    var userChallengesQuery = useUserChallenges(userId);
    var joinChallengeMutation = useJoinChallenge();
    var updateProgressMutation = useUpdateChallengeProgress();
    var _f = useState(false), openDialog = _f[0], setOpenDialog = _f[1];
    var _g = useState(null), selectedChallenge = _g[0], setSelectedChallenge = _g[1];
    var _h = useState(""), progressAmount = _h[0], setProgressAmount = _h[1];
    var handleJoinChallenge = function (challengeId) {
        joinChallengeMutation.mutate(challengeId, {
            onSuccess: function () {
                alert("Successfully joined challenge!");
            },
        });
    };
    var handleOpenProgressDialog = function (challenge) {
        setSelectedChallenge(challenge);
        setProgressAmount("");
        setOpenDialog(true);
    };
    var handleUpdateProgress = function () {
        if (selectedChallenge && progressAmount) {
            updateProgressMutation.mutate({
                challengeId: selectedChallenge.id,
                progress: parseFloat(progressAmount),
            }, {
                onSuccess: function () {
                    setOpenDialog(false);
                    alert("Progress updated!");
                },
            });
        }
    };
    var userChallengeIds = new Set((_b = userChallengesQuery.data) === null || _b === void 0 ? void 0 : _b.map(function (uc) { return uc.challengeId; }));
    return (<Stack spacing={3}>
      {/* Active Challenges */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Your Challenges
        </Typography>
        {userChallengesQuery.isLoading ? (<LinearProgress />) : ((_c = userChallengesQuery.data) === null || _c === void 0 ? void 0 : _c.length) > 0 ? (<Grid container spacing={2}>
            {(_d = userChallengesQuery.data) === null || _d === void 0 ? void 0 : _d.map(function (uc) {
                return (<Grid size={{ xs: 12, md: 6 }}>
                <Card>
                  <CardContent>
                    <Box sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                    }}>
                      <Typography variant="h6">
                        {uc.challengeId}
                      </Typography>
                      <Chip label={uc.status} color={uc.status === "completed" ? "success" : "primary"} size="small"/>
                    </Box>
                    <Typography color="textSecondary" variant="caption">
                      Progress
                    </Typography>
                    <Box sx={{ my: 1 }}>
                      <LinearProgress variant="determinate" value={Math.min((parseFloat(uc.progress) / 100) * 100, 100)}/>
                      <Typography variant="caption">
                        {uc.progress} / 100
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions>
                    {uc.status === "active" && (<Button size="small" color="primary" onClick={function () { return handleOpenProgressDialog(uc); }}>
                        Update Progress
                      </Button>)}
                  </CardActions>
                </Card>
              </Grid>);
            })}
          </Grid>) : (<Typography color="textSecondary">No active challenges.</Typography>)}
      </Paper>

      {/* Available Challenges */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Available Challenges
        </Typography>
        {challengesQuery.isLoading ? (<LinearProgress />) : (<Grid container spacing={2}>
            {(_e = challengesQuery.data) === null || _e === void 0 ? void 0 : _e.map(function (challenge) {
                var isJoined = userChallengeIds.has(challenge.id);
                return (<Grid size={{ xs: 12, md: 6 }}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        {challenge.name}
                      </Typography>
                      <Typography color="textSecondary" variant="body2" sx={{ mb: 1 }}>
                        {challenge.description}
                      </Typography>
                      <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                        <Chip label={"Target: ".concat(challenge.targetValue)} size="small"/>
                        <Chip label={"Reward: ".concat(challenge.rewardPoints, " pts")} color="success" size="small"/>
                      </Box>
                      <Typography variant="caption" color="textSecondary">
                        Type: {challenge.challengeType}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      {!isJoined && (<Button size="small" variant="contained" onClick={function () { return handleJoinChallenge(challenge.id); }} disabled={joinChallengeMutation.isPending}>
                          Join Challenge
                        </Button>)}
                      {isJoined && (<Chip label="Already Joined" color="primary"/>)}
                    </CardActions>
                  </Card>
                </Grid>);
            })}
          </Grid>)}
      </Paper>

      {/* Progress Dialog */}
      <Dialog open={openDialog} onClose={function () { return setOpenDialog(false); }}>
        <DialogTitle>Update Challenge Progress</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" label="Progress Amount" type="number" fullWidth value={progressAmount} onChange={function (e) { return setProgressAmount(e.target.value); }}/>
        </DialogContent>
        <DialogActions>
          <Button onClick={function () { return setOpenDialog(false); }}>Cancel</Button>
          <Button onClick={handleUpdateProgress} variant="contained" disabled={updateProgressMutation.isPending || !progressAmount}>
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>);
};
