import React from "react";
import { Card, CardContent, CardActions, Grid, Button, LinearProgress, Typography, Box, Chip, Paper, Stack, } from "@mui/material";
import { useRewards, useUserRewards, useRedeemReward, } from "@/hooks/use-gamification";
export var RewardsPanel = function (_a) {
    var _b, _c, _d, _e;
    var userId = _a.userId;
    var rewardsQuery = useRewards(userId);
    var userRewardsQuery = useUserRewards(userId);
    var redeemRewardMutation = useRedeemReward();
    var handleRedeemReward = function (rewardId) {
        redeemRewardMutation.mutate(rewardId, {
            onSuccess: function () {
                alert("Reward redeemed successfully!");
            },
            onError: function () {
                alert("Failed to redeem reward.");
            },
        });
    };
    return (<Stack spacing={3}>
      {/* Available Rewards */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Available Rewards
        </Typography>
        {rewardsQuery.isLoading ? (<LinearProgress />) : ((_b = rewardsQuery.data) === null || _b === void 0 ? void 0 : _b.length) > 0 ? (<Grid container spacing={2}>
            {(_c = rewardsQuery.data) === null || _c === void 0 ? void 0 : _c.map(function (reward) {
                return (<Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{
                        background: reward.canRedeem
                            ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                            : "linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)",
                        color: reward.canRedeem ? "card" : "#666",
                    }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      {reward.name}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {reward.description}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, mb: 1, flexWrap: "wrap" }}>
                      <Chip label={"".concat(reward.pointsRequired, " Points")} size="small" sx={{
                        backgroundColor: reward.canRedeem
                            ? "rgba(255,255,255,0.3)"
                            : "rgba(0,0,0,0.1)",
                    }}/>
                      <Chip label={"".concat(reward.discountPercentage, "% Off")} size="small" sx={{
                        backgroundColor: reward.canRedeem
                            ? "rgba(255,255,255,0.3)"
                            : "rgba(0,0,0,0.1)",
                    }}/>
                      {reward.maxRedemptions && (<Chip label={"".concat(reward.availableRedemptions, " Left")} size="small" sx={{
                            backgroundColor: reward.canRedeem
                                ? "rgba(255,255,255,0.3)"
                                : "rgba(0,0,0,0.1)",
                        }}/>)}
                    </Box>
                  </CardContent>
                  <CardActions>
                    {reward.canRedeem ? (<Button size="small" variant="contained" sx={{
                            backgroundColor: "card",
                            color: "#667eea",
                            "&:hover": {
                                backgroundColor: "#f5f5f5",
                            },
                        }} onClick={function () { return handleRedeemReward(reward.id); }} disabled={redeemRewardMutation.isPending}>
                        Redeem Now
                      </Button>) : (<Typography variant="caption">
                        Insufficient points
                      </Typography>)}
                  </CardActions>
                </Card>
              </Grid>);
            })}
          </Grid>) : (<Typography color="textSecondary">No rewards available.</Typography>)}
      </Paper>

      {/* Earned Rewards */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Your Earned Rewards
        </Typography>
        {userRewardsQuery.isLoading ? (<LinearProgress />) : ((_d = userRewardsQuery.data) === null || _d === void 0 ? void 0 : _d.length) > 0 ? (<Grid container spacing={2}>
            {(_e = userRewardsQuery.data) === null || _e === void 0 ? void 0 : _e.map(function (userReward) {
                var _a, _b;
                return (<Grid size={{ xs: 12, md: 6 }}>
                <Card>
                  <CardContent>
                    <Box sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1,
                    }}>
                      <Typography variant="h6">
                        {(_a = userReward.reward) === null || _a === void 0 ? void 0 : _a.name}
                      </Typography>
                      <Chip label={userReward.status} color={userReward.status === "redeemed"
                        ? "success"
                        : "warning"} size="small"/>
                    </Box>
                    <Typography variant="body2" color="textSecondary">
                      {(_b = userReward.reward) === null || _b === void 0 ? void 0 : _b.description}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" color="textSecondary">
                        {userReward.status === "redeemed"
                        ? "Redeemed: ".concat(new Date(userReward.redeemedAt).toLocaleDateString())
                        : "Earned: ".concat(new Date(userReward.earnedAt).toLocaleDateString())}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>);
            })}
          </Grid>) : (<Typography color="textSecondary">No rewards earned yet.</Typography>)}
      </Paper>
    </Stack>);
};
