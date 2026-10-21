import { t as uiText } from "@storyteller/common";
import { SubscriptionPlanDetails } from "./subscription-plan-details.js";

export const FREE_PLAN: SubscriptionPlanDetails = {
  slug: "free",
  name: "Free",
  isPaidPlan: false,
  monthlyPrice: 0,
  yearlyPrice: 0,
  features: [
    { get text() { return uiText("app.free.daily.generations"); }, included: true },
    { get text() { return uiText("app.limited.access.to.artcraft.tools"); }, included: true },
    { get text() { return uiText("app.10.gpt.image.1.images"); }, included: true },
    { get text() { return uiText("app.1.minute.kling.video"); }, included: true },
  ],
  colorScheme: "dark" as const,
};

export const SUBSCRIPTION_PLANS: SubscriptionPlanDetails[] = [
  FREE_PLAN,
  {
    slug: "artcraft_basic",
    name: "Basic",
    isPaidPlan: true,
    monthlyPrice: 8,
    yearlyPrice: 96,
    originalMonthlyPrice: 10,
    originalYearlyPrice: 120,
    features: [
      { get text() { return uiText("app.1.000.credits.month"); }, included: true },
      { get text() { return uiText("app.250.nano.banana.images"); }, included: true },
      { get text() { return uiText("app.67.nano.banana.pro.images"); }, included: true },
      { get text() { return uiText("app.33.nano.banana.pro.4k.images"); }, included: true },
      { get text() { return uiText("app.200.gpt.image.1.5.images"); }, included: true },
      { get text() { return uiText("app.63.seconds.seedance.2.0.video"); }, included: true, seedanceOnly: true },
      { get text() { return uiText("app.45.seconds.kling.3.0.pro.video"); }, included: true },
      { get text() { return uiText("common.you.own.artcraft.forever"); }, included: true },
    ],
    colorScheme: "green" as const,
  },
  {
    slug: "artcraft_pro",
    name: "Pro",
    isPaidPlan: true,
    monthlyPrice: 28,
    yearlyPrice: 336,
    originalMonthlyPrice: 35,
    originalYearlyPrice: 420,
    features: [
      { get text() { return uiText("app.3.750.credits.month"); }, included: true },
      { get text() { return uiText("app.938.nano.banana.images"); }, included: true },
      { get text() { return uiText("app.250.nano.banana.pro.images"); }, included: true },
      { get text() { return uiText("app.125.nano.banana.pro.4k.images"); }, included: true },
      { get text() { return uiText("app.750.gpt.image.1.5.images"); }, included: true },
      { get text() { return uiText("app.234.seconds.seedance.2.0.video"); }, included: true, seedanceOnly: true },
      { get text() { return uiText("app.167.seconds.kling.3.0.pro.video"); }, included: true },
      { get text() { return uiText("common.you.own.artcraft.forever"); }, included: true },
    ],
    colorScheme: "purple" as const,
  },
  {
    slug: "artcraft_max",
    name: "Max",
    isPaidPlan: true,
    monthlyPrice: 48,
    yearlyPrice: 576,
    originalMonthlyPrice: 60,
    originalYearlyPrice: 720,
    features: [
      { get text() { return uiText("app.6.600.credits.month"); }, included: true },
      { get text() { return uiText("app.1.650.nano.banana.images"); }, included: true },
      { get text() { return uiText("app.440.nano.banana.pro.images"); }, included: true },
      { get text() { return uiText("app.220.nano.banana.pro.4k.images"); }, included: true },
      { get text() { return uiText("app.1.320.gpt.image.1.5.images"); }, included: true },
      { get text() { return uiText("app.413.seconds.seedance.2.0.video"); }, included: true, seedanceOnly: true },
      { get text() { return uiText("app.295.seconds.kling.3.0.pro.video"); }, included: true },
      { get text() { return uiText("common.you.own.artcraft.forever"); }, included: true },
    ],
    colorScheme: "orange" as const,
  },
];

export const SUBSCRIPTION_PLANS_BY_SLUG: Map<string, SubscriptionPlanDetails> =
  new Map(SUBSCRIPTION_PLANS.map((plan) => [plan.slug, plan]));
