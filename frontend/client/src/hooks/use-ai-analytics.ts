import { useQuery } from '@tanstack/react-query';

import { api } from '../lib/api';

interface ArrearsForcast {
  status: string;
  forecast_type: string;
  predictions: Array<{
    date: string;
    forecasted_rate: number;
    lower_bound: number;
    upper_bound: number;
    trend: string;
  }>;
  current_rate: number;
  average_rate: number;
  confidence_level: number;
}

interface MemberBehavior {
  status: string;
  total_members: number;
  segments: Record<string, {
    count: number;
    percentage: number;
    member_ids: number[];
  }>;
}

interface CLVPrediction {
  status: string;
  member_id: number;
  clv_estimate: number;
  historical_revenue: number;
  projected_revenue: number;
  lifetime_value_category: string;
  confidence_score: number;
  insights: {
    completed_loans: number;
    repayment_reliability: number;
    average_loan_size: number;
    recommended_action: string;
  };
}

interface SeasonalDemand {
  status: string;
  forecast_type: string;
  product_id: number | null;
  predictions: Array<{
    date: string;
    forecasted_demand: number;
    lower_bound: number;
    upper_bound: number;
    seasonality_factor: number;
  }>;
  current_demand: number;
  average_demand: number;
  confidence_level: number;
}

interface AtRiskMember {
  member_id: number;
  member_name: string;
  risk_score: number;
  risk_factors: string[];
  recommended_action: string;
  outstanding_balance: number;
}

interface AtRiskResponse {
  status: string;
  total_members_scanned: number;
  at_risk_count: number;
  members: AtRiskMember[];
}

interface Cohort {
  cohort_month: string;
  total_joined: number;
  active_rate: number;
  completion_rate: number;
  default_rate: number;
  inactive_rate: number;
}

interface CohortResponse {
  status: string;
  total_cohorts: number;
  cohorts: Cohort[];
  insights: {
    best_performing_cohort: string | null;
    average_active_rate: number;
    average_default_rate: number;
  };
}

export const useArrearsForcast = (branchId?: number, monthsAhead = 12) => {
  return useQuery<ArrearsForcast>({
    queryKey: ['arrears-forecast', branchId, monthsAhead],
    queryFn: async () => {
      const params = new URLSearchParams({
        months_ahead: monthsAhead.toString(),
        ...(branchId && { branch_id: branchId.toString() }),
      });

      return api.get(`/ai-analytics/arrears-forecast?${params}`);
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
    gcTime: 10 * 60 * 1000,
  });
};

export const useMemberBehavior = (branchId?: number) => {
  return useQuery<MemberBehavior>({
    queryKey: ['member-behavior', branchId],
    queryFn: async () => {
      const params = new URLSearchParams(
        branchId ? { branch_id: branchId.toString() } : {}
      );

      return api.get(`/ai-analytics/member-behavior?${params}`);
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
    gcTime: 10 * 60 * 1000,
  });
};

export const useClvPrediction = (memberId: number) => {
  return useQuery<CLVPrediction>({
    queryKey: ['clv-prediction', memberId],

    queryFn: () => api.get(`/ai-analytics/clv-prediction/${memberId}`),
    enabled: !!memberId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    gcTime: 10 * 60 * 1000,
  });
};

export const useSeasonalDemand = (productId?: number, monthsAhead = 12, branchId?: number) => {
  return useQuery<SeasonalDemand>({
    queryKey: ['seasonal-demand', productId, monthsAhead, branchId],
    queryFn: async () => {
      const params = new URLSearchParams({
        months_ahead: monthsAhead.toString(),
        ...(productId && { product_id: productId.toString() }),
        ...(branchId && { branch_id: branchId.toString() }),
      });

      return api.get(`/ai-analytics/seasonal-demand?${params}`);
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
    gcTime: 10 * 60 * 1000,
  });
};

export const useAtRiskMembers = (branchId?: number, threshold = 0.6) => {
  return useQuery<AtRiskResponse>({
    queryKey: ['at-risk-members', branchId, threshold],
    queryFn: async () => {
      const params = new URLSearchParams({
        threshold: threshold.toString(),
        ...(branchId && { branch_id: branchId.toString() }),
      });

      return api.get(`/ai-analytics/at-risk-members?${params}`);
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
    gcTime: 10 * 60 * 1000,
  });
};

export const useCohortAnalysis = (branchId?: number) => {
  return useQuery<CohortResponse>({
    queryKey: ['cohort-analysis', branchId],
    queryFn: async () => {
      const params = new URLSearchParams(
        branchId ? { branch_id: branchId.toString() } : {}
      );

      return api.get(`/ai-analytics/cohort-analysis?${params}`);
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
    gcTime: 10 * 60 * 1000,
  });
};

export const useAISummary = (branchId?: number) => {
  return useQuery({
    queryKey: ['ai-summary', branchId],
    queryFn: async () => {
      const params = new URLSearchParams(
        branchId ? { branch_id: branchId.toString() } : {}
      );

      return api.get(`/ai-analytics/summary?${params}`);
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
    gcTime: 10 * 60 * 1000,
  });
};
