import React from "react";
import { Table, TableBody, TableCell, TableHead, TableRow, Paper, Box, Typography, Chip, LinearProgress, } from "@mui/material";
import { useLeaderboard, useBranchLeaderboard } from "@/hooks/use-gamification";
export var LeaderboardChart = function (_a) {
    var branchId = _a.branchId, _b = _a.limit, limit = _b === void 0 ? 20 : _b;
    var globalQuery = useLeaderboard(limit);
    var branchQuery = useBranchLeaderboard(branchId || 0, limit);
    var data = branchId ? branchQuery.data : globalQuery.data;
    var isLoading = branchId ? branchQuery.isLoading : globalQuery.isLoading;
    var medalColors = {
        1: "#FFD700",
        2: "#C0C0C0",
        3: "#CD7F32",
    };
    var getMedalEmoji = function (rank) {
        if (rank === 1)
            return "🥇";
        if (rank === 2)
            return "🥈";
        if (rank === 3)
            return "🥉";
        return "".concat(rank);
    };
    return (<Paper sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {branchId ? "Branch" : "Global"} Leaderboard
      </Typography>

      {isLoading ? (<LinearProgress />) : (<Box sx={{ overflowX: "auto" }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell sx={{ fontWeight: "bold" }}>Rank</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Member</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Branch</TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold" }}>
                  Points
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data === null || data === void 0 ? void 0 : data.map(function (entry) {
                return (<TableRow key={entry.id} hover>
                  <TableCell>
                    <Box sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        backgroundColor: medalColors[entry.rank] || "#e0e0e0",
                        fontWeight: "bold",
                        color: entry.rank <= 3
                            ? entry.rank === 1
                                ? "black"
                                : "card"
                            : "black",
                    }}>
                      {getMedalEmoji(entry.rank)}
                    </Box>
                  </TableCell>
                  <TableCell>{entry.userName}</TableCell>
                  <TableCell>{entry.userBranch}</TableCell>
                  <TableCell align="right">
                    <Chip label={"".concat(entry.points, " pts")} color="primary" variant="outlined"/>
                  </TableCell>
                </TableRow>);
            })}
            </TableBody>
          </Table>
        </Box>)}
    </Paper>);
};
