import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChartNoAxesCombined, ShieldCheck, Sparkles, Star, Zap } from "lucide-react";

type AuthMode = "login" | "register";

interface AuthShellProps {
  mode: AuthMode;
  title: string;
  subtitle: string;
  footerText: string;
  footerLinkLabel: string;
  footerLinkTo: string;
  children: ReactNode;
}

const shellContent: Record<
  AuthMode,
  {
    badge: string;
    panelTitle: string;
    panelCopy: string;
    highlights: { label: string; value: string }[];
    statLabel: string;
    statValue: string;
    metric: string;
    metricLabel: string;
  }
> = {
  login: {
    badge: "Elite Access",
    panelTitle: "Operate your storefront from one refined control room.",
    panelCopy:
      "Review performance, manage inventory, and keep your commerce workflows moving with a secure, polished admin experience.",
    highlights: [
      { label: "Live GMV", value: "$248k" },
      { label: "Fulfillment", value: "94.8%" },
      { label: "Conversion", value: "+18%" },
    ],
    statLabel: "Session Mode",
    statValue: "Bearer protected",
    metric: "3.2x",
    metricLabel: "Faster admin flow",
  },
  register: {
    badge: "Launch Ready",
    panelTitle: "Create an account built for premium commerce teams.",
    panelCopy:
      "Start with a clean, secure onboarding flow and enter a workspace shaped for modern retail operations.",
    highlights: [
      { label: "Onboarding", value: "2 min" },
      { label: "Team Access", value: "JWT ready" },
      { label: "Dash Entry", value: "Instant" },
    ],
    statLabel: "Onboarding",
    statValue: "Instant dashboard access",
    metric: "98%",
    metricLabel: "Form completion rate",
  },
};

const AuthShell = ({
  mode,
  title,
  subtitle,
  footerText,
  footerLinkLabel,
  footerLinkTo,
  children,
}: AuthShellProps) => {
  const content = shellContent[mode];

  return (
    <div>

    </div>
  );
};

export default AuthShell;
