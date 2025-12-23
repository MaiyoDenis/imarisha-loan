import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Trophy, Star, Zap, Award } from 'lucide-react';
export var GamificationDashboard = function () {
    var _a = useState('overview'), activeTab = _a[0], setActiveTab = _a[1];
    var userStats = {
        totalPoints: 2850,
        tier: 'platinum',
        rank: 12,
        achievements: 18,
        badges: 7,
        activeChallenges: 4,
        earnedRewards: 3
    };
    var challenges = [
        { id: 1, title: '10 Loans Approved', progress: 7, total: 10, status: 'active' },
        { id: 2, title: 'Perfect Attendance', progress: 15, total: 20, status: 'active' },
        { id: 3, title: 'High Quality Applications', progress: 45, total: 50, status: 'active' },
        { id: 4, title: 'Member Satisfaction', progress: 88, total: 100, status: 'active' }
    ];
    var achievements = [
        { id: 1, title: 'First Steps', description: 'Complete your first loan application', unlocked: true },
        { id: 2, title: 'Loan Master', description: 'Approve 50 loans', unlocked: true },
        { id: 3, title: 'Speed Demon', description: 'Process 10 loans in one day', unlocked: true },
        { id: 4, title: 'Community Champion', description: 'Help 100 members', unlocked: false },
        { id: 5, title: 'Perfect Score', description: 'Achieve 100% accuracy rate', unlocked: true },
        { id: 6, title: 'Rising Star', description: 'Reach top 20 in leaderboard', unlocked: false }
    ];
    var leaderboard = [
        { rank: 1, name: 'John Mwangi', points: 5200, avatar: '👨' },
        { rank: 2, name: 'Sarah Kipchoge', points: 4850, avatar: '👩' },
        { rank: 3, name: 'David Omondi', points: 4620, avatar: '👨' },
        { rank: 4, name: 'Emily Kariuki', points: 3940, avatar: '👩' },
        { rank: 5, name: 'James Kipketer', points: 3750, avatar: '👨' },
        { rank: 12, name: 'You', points: 2850, avatar: '🎯' }
    ];
    var getTierColor = function (tier) {
        var colors = {
            diamond: 'from-blue-500 to-cyan-500',
            platinum: 'from-gray-400 to-gray-300',
            gold: 'from-yellow-500 to-amber-500',
            silver: 'from-gray-300 to-gray-200',
            bronze: 'from-orange-600 to-orange-500'
        };
        return colors[tier] || colors.bronze;
    };
    var getTierIcon = function (tier) {
        var icons = {
            diamond: '💎',
            platinum: '🏆',
            gold: '⭐',
            silver: '✨',
            bronze: '🥉'
        };
        return icons[tier] || '📊';
    };
    return (<Layout>
      <div className="min-h-screen p-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Gamification Dashboard</h1>
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

          <div className={"mb-8 p-6 rounded-xl bg-gradient-to-r ".concat(getTierColor(userStats.tier), " shadow-lg")}>
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
              {['overview', 'achievements', 'leaderboard', 'rewards'].map(function (tab) { return (<button key={tab} onClick={function () { return setActiveTab(tab); }} className={"px-4 py-3 font-medium capitalize border-b-2 transition ".concat(activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground')}>
                  {tab}
                </button>); })}
            </div>
          </div>

          {activeTab === 'overview' && (<div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-foreground mb-4">Active Challenges</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {challenges.map(function (challenge) { return (<div key={challenge.id} className="p-4 rounded-xl bg-card border border-border">
                      <h4 className="font-semibold text-foreground mb-3">{challenge.title}</h4>
                      <div className="space-y-2">
                        <div className="w-full bg-background rounded-lg h-2.5">
                          <div className="bg-primary h-2.5 rounded-lg transition-all" style={{ width: "".concat((challenge.progress / challenge.total) * 100, "%") }}/>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {challenge.progress} / {challenge.total} completed
                        </p>
                      </div>
                    </div>); })}
                </div>
              </div>
            </div>)}

          {activeTab === 'achievements' && (<div>
              <h3 className="text-xl font-bold text-foreground mb-4">Achievements & Badges</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map(function (achievement) { return (<div key={achievement.id} className={"p-4 rounded-xl border transition ".concat(achievement.unlocked
                    ? 'bg-card border-primary/30'
                    : 'bg-card/50 border-border opacity-60')}>
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">
                        {achievement.unlocked ? '🏆' : '🔒'}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{achievement.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{achievement.description}</p>
                        {achievement.unlocked && (<p className="text-xs text-secondary font-medium mt-2">✓ Unlocked</p>)}
                      </div>
                    </div>
                  </div>); })}
              </div>
            </div>)}

          {activeTab === 'leaderboard' && (<div>
              <h3 className="text-xl font-bold text-foreground mb-4">Top Performers</h3>
              <div className="space-y-2">
                {leaderboard.map(function (entry) { return (<div key={entry.rank} className={"p-4 rounded-xl border-l-4 transition ".concat(entry.rank <= 3
                    ? 'bg-card border-l-primary'
                    : entry.rank === 12
                        ? 'bg-primary/5 border-l-primary'
                        : 'bg-card border-l-border')}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={"text-2xl font-bold w-8 ".concat(entry.rank <= 3 ? 'text-primary' : 'text-muted-foreground')}>
                          #{entry.rank}
                        </div>
                        <div className="text-3xl">{entry.avatar}</div>
                        <div>
                          <h4 className="font-semibold text-foreground">{entry.name}</h4>
                          {entry.rank === 12 && (<p className="text-xs text-secondary font-medium">You</p>)}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{entry.points.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Points</p>
                      </div>
                    </div>
                  </div>); })}
              </div>
            </div>)}

          {activeTab === 'rewards' && (<div>
              <h3 className="text-xl font-bold text-foreground mb-4">Available Rewards</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                { title: 'Bonus Days Off', cost: 500, icon: '🏖️' },
                { title: 'Gift Card (KES 1000)', cost: 800, icon: '🎁' },
                { title: 'Premium Features', cost: 1200, icon: '⭐' },
                { title: 'Team Lunch', cost: 600, icon: '🍽️' },
                { title: 'Training Course', cost: 900, icon: '📚' },
                { title: 'Office Equipment', cost: 1500, icon: '💻' }
            ].map(function (reward, idx) { return (<div key={idx} className="p-4 rounded-xl bg-card border border-border">
                    <div className="text-4xl mb-3">{reward.icon}</div>
                    <h4 className="font-semibold text-foreground mb-2">{reward.title}</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{reward.cost} points</span>
                      <button className="px-3 py-1.5 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/80 transition">
                        Redeem
                      </button>
                    </div>
                  </div>); })}
              </div>
            </div>)}
        </div>
      </div>
    </Layout>);
};
export default GamificationDashboard;
