import {
  Target,
  Shield,
  Laptop,
  Home,
  Car,
  Plane,
  GraduationCap,
  Heart,
  Sparkles,
  Building,
  Gift,
  Wallet,
  PiggyBank,
  Briefcase,
  Smartphone,
  Gem,
} from "lucide-react";

export const GOAL_ICONS = [
  { name: "Target", icon: Target, label: "General Target" },
  { name: "Shield", icon: Shield, label: "Emergency Fund" },
  { name: "PiggyBank", icon: PiggyBank, label: "Savings" },
  { name: "Laptop", icon: Laptop, label: "Tech / Laptop" },
  { name: "Home", icon: Home, label: "Home / Housing" },
  { name: "Car", icon: Car, label: "Vehicle / Car" },
  { name: "Plane", icon: Plane, label: "Travel / Vacation" },
  { name: "GraduationCap", icon: GraduationCap, label: "Education" },
  { name: "Building", icon: Building, label: "Real Estate" },
  { name: "Heart", icon: Heart, label: "Health / Family" },
  { name: "Gift", icon: Gift, label: "Gift / Celebration" },
  { name: "Wallet", icon: Wallet, label: "Emergency Cash" },
  { name: "Briefcase", icon: Briefcase, label: "Business" },
  { name: "Smartphone", icon: Smartphone, label: "Gadgets" },
  { name: "Gem", icon: Gem, label: "Luxury / Gold" },
  { name: "Sparkles", icon: Sparkles, label: "Dream Goal" },
];

export function getGoalIconComponent(iconName) {
  const found = GOAL_ICONS.find((item) => item.name === iconName);
  return found ? found.icon : Target;
}
