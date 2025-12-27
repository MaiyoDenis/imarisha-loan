import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import { Trophy, Star, Zap, Award, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export const GamificationDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Fetch Gamification Summary
    const { data: summary, isLoading: isSummaryLoading } = useQuery({
        queryKey: ['gamification-summary'],
        queryFn: api.getGamificationSummary,
    });

    // Fetch Leaderboard
    const { data: leaderboard = [], isLoading: isLeaderboardLoading } = useQuery({
        queryKey: ['gamification-leaderboard'],
        queryFn: () => api.getLeaderboard(20),
        enabled: activeTab === 'leaderboard',
    });

    // Fetch Available Rewards
    const { data: availableRewards = [], isLoading: isRewardsLoading } = useQuery({
        queryKey: ['gamification-rewards'],
        queryFn: api.getRewards,
        enabled: activeTab === 'rewards',
    });

    // Fetch All Achievements (to show locked/unlocked state)
    // Note: Summary only has user achievements. We might need a separate endpoint for all achievements 
    // to show what is locked. If not available, we can just show what is in summary or we need an endpoint for all achievements.
    // The previous mock had locked achievements. 
    // Checking api.ts, we have `getAchievements` which maps to `/gamification/achievements`. 
    // In backend `gamification.py`, `get_my_achievements` calls `GamificationService.get_user_achievements`.
    // It seems we don't have an endpoint to get ALL possible achievements to show locked ones easily unless `get_user_achievements` returns them with status.
    // Let's check `GamificationService.get_user_achievements`. It returns `UserAchievement` objects.
    // Ideally we want a list of all system achievements and mark which ones the user has.
    // For now, I will use `summary.achievements` which likely only contains unlocked ones. 
    // If we want to show locked ones, we might need to adjust backend or just show unlocked ones.
    // Wait, the mock data showed "Unlocked: false". 
    // If the backend only returns unlocked achievements, I can only show those.
    // Let's proceed with what we have.

    const redeemMutation = useMutation({
        mutationFn: api.redeemReward,
        onSuccess: () => {
            toast({
                title: 'Reward Redeemed!',
                description: 'You have successfully redeemed this reward.',
            });
            queryClient.invalidateQueries(['gamification-summary']);
            queryClient.invalidateQueries(['gamification-rewards']);
        },
        onError: (error) => {
             toast({
                title: 'Redemption Failed',
                description: error instanceof Error ? error.message : 'Could not redeem reward.',
                variant: 'destructive',
            });
        }
    });

    const handleRedeem = (rewardId) => {
        redeemMutation.mutate(rewardId);
    };

    if (isSummaryLoading) {
        return (
            <Layout>
                <div className="flex h-screen items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </Layout>
        );
    }

    const userStats = {
        totalPoints: summary?.points?.totalPoints || 0,
        tier: summary?.points?.pointsTier || 'bronze',
        rank: summary?.rank?.rank || '-',
        achievements: summary?.totalAchievements || 0,
        badges: summary?.totalBadges || 0,
        activeChallenges: summary?.activeChallenges || 0,
        earnedRewards: summary?.earnedRewards || 0
    };

    const getTierColor = (tier) => {
        const colors = {
            diamond: 'from-blue-500 to-cyan-500',
            platinum: 'from-gray-400 to-gray-300',
            gold: 'from-yellow-500 to-amber-500',
            silver: 'from-gray-300 to-gray-200',
            bronze: 'from-orange-600 to-orange-500'
        };
        return colors[tier] || colors.bronze;
    };

    const getTierIcon = (tier) => {
        const icons = {
            diamond: '💎',
            platinum: '🏆',
            gold: '⭐',
            silver: '✨',
            bronze: '🥉'
        };
        return icons[tier] || '📊';
    };

    return (
        <Layout>
            <div className="min-h-screen p-4 md:p-6 bg-background">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gradient">Gamification Dashboard</h1>
                        <p className="text-muted-foreground mt-2">Earn points, unlock achievements, and compete with others!</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="p-6 rounded-xl bg-card border border-border shadow-sm">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-xs md:text-sm font-medium text-muted-foreground mb-2">Total Points</p>
                                    <h3 className="text-2xl md:text-3xl font-bold text-foreground">{userStats.totalPoints.toLocaleString()}</h3>
                                </div>
                                <div className="p-2 md:p-3 rounded-lg flex-shrink-0">
                                    <Zap className="w-6 h-6 md:w-8 md:h-8 text-primary"/>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 rounded-xl bg-card border border-border shadow-sm">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-xs md:text-sm font-medium text-muted-foreground mb-2">Current Rank</p>
                                    <h3 className="text-2xl md:text-3xl font-bold text-foreground">#{userStats.rank}</h3>
                                </div>
                                <div className="p-2 md:p-3 rounded-lg flex-shrink-0">
                                    <Trophy className="w-6 h-6 md:w-8 md:h-8 text-secondary"/>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 rounded-xl bg-card border border-border shadow-sm">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-xs md:text-sm font-medium text-muted-foreground mb-2">Achievements</p>
                                    <h3 className="text-2xl md:text-3xl font-bold text-foreground">{userStats.achievements}</h3>
                                </div>
                                <div className="p-2 md:p-3 rounded-lg flex-shrink-0">
                                    <Award className="w-6 h-6 md:w-8 md:h-8 text-primary"/>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 rounded-xl bg-card border border-border shadow-sm">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-xs md:text-sm font-medium text-muted-foreground mb-2">Badges</p>
                                    <h3 className="text-2xl md:text-3xl font-bold text-foreground">{userStats.badges}</h3>
                                </div>
                                <div className="p-2 md:p-3 rounded-lg flex-shrink-0">
                                    <Star className="w-6 h-6 md:w-8 md:h-8 text-accent"/>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={`mb-8 p-6 rounded-xl bg-gradient-to-r ${getTierColor(userStats.tier)} shadow-lg`}>
                        <div className="flex items-center gap-4">
                            <div className="text-5xl">{getTierIcon(userStats.tier)}</div>
                            <div>
                                <h2 className="text-white text-2xl font-bold capitalize">{userStats.tier} Tier</h2>
                                <p className="text-white/90 text-sm">Keep earning points to unlock the next tier!</p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6 border-b border-border">
                        <div className="flex gap-8">
                            {['overview', 'achievements', 'leaderboard', 'rewards'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-3 font-medium capitalize border-b-2 transition ${
                                        activeTab === tab
                                            ? 'border-primary text-primary'
                                            : 'border-transparent text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xl font-bold text-foreground mb-4">Active Challenges</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {summary?.challenges?.filter(c => c.status === 'active').length > 0 ? (
                                        summary.challenges.filter(c => c.status === 'active').map((challenge) => (
                                            <div key={challenge.id} className="p-4 rounded-xl bg-card border border-border">
                                                <h4 className="font-semibold text-foreground mb-3">{challenge.challenge?.title || challenge.title}</h4>
                                                <div className="space-y-2">
                                                    <div className="w-full bg-background rounded-lg h-2.5">
                                                        <div
                                                            className="bg-primary h-2.5 rounded-lg transition-all"
                                                            style={{
                                                                width: `${Math.min(((challenge.progress / (challenge.challenge?.target_value || challenge.targetValue || 100)) * 100), 100)}%`
                                                            }}
                                                        />
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        {challenge.progress} / {challenge.challenge?.target_value || challenge.targetValue} completed
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-muted-foreground col-span-2">No active challenges. Join new challenges to earn points!</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'achievements' && (
                        <div>
                            <h3 className="text-xl font-bold text-foreground mb-4">Achievements & Badges</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {summary?.achievements?.length > 0 ? (
                                    summary.achievements.map((achievement) => (
                                        <div key={achievement.id} className="p-4 rounded-xl bg-card border border-primary/30 transition">
                                            <div className="flex items-start gap-3">
                                                <div className="text-2xl">🏆</div>
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-foreground">{achievement.achievement?.name || achievement.name}</h4>
                                                    <p className="text-sm text-muted-foreground mt-1">{achievement.achievement?.description || achievement.description}</p>
                                                    <p className="text-xs text-secondary font-medium mt-2">✓ Unlocked</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-muted-foreground col-span-3">No achievements unlocked yet. Keep up the good work!</p>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'leaderboard' && (
                        <div>
                            <h3 className="text-xl font-bold text-foreground mb-4">Top Performers</h3>
                            {isLeaderboardLoading ? (
                                <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                            ) : (
                                <div className="space-y-2">
                                    {leaderboard.length > 0 ? (
                                        leaderboard.map((entry) => (
                                            <div
                                                key={entry.rank}
                                                className={`p-4 rounded-xl border-l-4 transition ${
                                                    entry.rank <= 3
                                                        ? 'bg-card border-l-primary'
                                                        : entry.user_id === summary?.points?.user_id
                                                        ? 'bg-primary/5 border-l-primary'
                                                        : 'bg-card border-l-border'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`text-2xl font-bold w-8 ${entry.rank <= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
                                                            #{entry.rank}
                                                        </div>
                                                        <div className="text-3xl">
                                                            {entry.user?.avatar || (entry.rank % 2 === 0 ? '👨' : '👩')}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold text-foreground">
                                                                {entry.user?.firstName} {entry.user?.lastName}
                                                            </h4>
                                                            {entry.user_id === summary?.points?.user_id && (
                                                                <p className="text-xs text-secondary font-medium">You</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-2xl font-bold text-primary">{entry.points.toLocaleString()}</p>
                                                        <p className="text-xs text-muted-foreground">Points</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-muted-foreground">No leaderboard data available.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'rewards' && (
                        <div>
                            <h3 className="text-xl font-bold text-foreground mb-4">Available Rewards</h3>
                            {isRewardsLoading ? (
                                <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {availableRewards.length > 0 ? (
                                        availableRewards.map((reward) => (
                                            <div key={reward.id} className="p-4 rounded-xl bg-card border border-border">
                                                <div className="text-4xl mb-3">{reward.icon || '🎁'}</div>
                                                <h4 className="font-semibold text-foreground mb-2">{reward.name}</h4>
                                                <p className="text-sm text-muted-foreground mb-4">{reward.description}</p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-muted-foreground">{reward.points_required} points</span>
                                                    <button 
                                                        onClick={() => handleRedeem(reward.id)}
                                                        disabled={!reward.canRedeem || redeemMutation.isPending}
                                                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition ${
                                                            reward.canRedeem 
                                                            ? 'bg-primary text-white hover:bg-primary/80' 
                                                            : 'bg-muted text-muted-foreground cursor-not-allowed'
                                                        }`}
                                                    >
                                                        {redeemMutation.isPending ? 'Redeeming...' : 'Redeem'}
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-muted-foreground col-span-3">No rewards available at the moment.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default GamificationDashboard;
