export interface PlanConfig {
  readonly name: string;
  readonly maxMonitors: number;
  readonly checkInterval: string;
  readonly historyDays: number;
  readonly webhookAlerts: boolean;
  readonly emailAlerts: boolean;
  readonly apiAccess: boolean;
}

export const PLANS: Record<string, PlanConfig> = {
  free: {
    name: "Free",
    maxMonitors: 3,
    checkInterval: "daily",
    historyDays: 7,
    webhookAlerts: false,
    emailAlerts: false,
    apiAccess: false,
  },
  starter: {
    name: "Starter",
    maxMonitors: 5,
    checkInterval: "daily",
    historyDays: 7,
    webhookAlerts: false,
    emailAlerts: true,
    apiAccess: false,
  },
  pro: {
    name: "Pro",
    maxMonitors: 25,
    checkInterval: "hourly",
    historyDays: 90,
    webhookAlerts: true,
    emailAlerts: true,
    apiAccess: false,
  },
  team: {
    name: "Team",
    maxMonitors: 100,
    checkInterval: "realtime",
    historyDays: -1,
    webhookAlerts: true,
    emailAlerts: true,
    apiAccess: true,
  },
};

export function getPlanConfig(plan: string): PlanConfig {
  return PLANS[plan] ?? PLANS.free;
}
