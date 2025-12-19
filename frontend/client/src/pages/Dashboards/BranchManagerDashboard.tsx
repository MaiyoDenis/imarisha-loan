import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BranchManagerDashboard: React.FC = () => {
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await axios.get('/api/dashboards/branch-manager');
                setDashboardData(response.data);
            } catch (err) {
                setError('Failed to fetch dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div>
            <h1>Branch Manager Dashboard</h1>
            {dashboardData && (
                <div>
                    <h2>Portfolio Health</h2>
                    <pre>{JSON.stringify(dashboardData.portfolio_health, null, 2)}</pre>
                    <h2>Revenue Metrics</h2>
                    <pre>{JSON.stringify(dashboardData.revenue_metrics, null, 2)}</pre>
                    <h2>Growth Metrics</h2>
                    <pre>{JSON.stringify(dashboardData.growth_metrics, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};

export default BranchManagerDashboard;
