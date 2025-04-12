import { VariantProps, cva } from "class-variance-authority";
import { FaArrowTrendUp, FaArrowTrendDown } from "react-icons/fa6";

import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatPercentage } from "@/lib/utils";
import { CountUp } from "@/components/count-up";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const boxVariant = cva("shrink-0 rounded-md p-3", {
  variants: {
    variant: {
      default: "bg-blue-500/20 dark:bg-blue-500/10",
      success: "bg-emerald-500/20 dark:bg-emerald-500/10",
      danger: "bg-rose-500/20 dark:bg-rose-500/10",
      warning: "bg-yellow-500/20 dark:bg-yellow-500/10",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const iconVariant = cva("size-5", {
  variants: {
    variant: {
      default: "fill-blue-500",
      success: "fill-emerald-500",
      danger: "fill-rose-500",
      warning: "fill-yellow-500",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

type BoxVariants = VariantProps<typeof boxVariant>;
type IconVariants = VariantProps<typeof iconVariant>;

interface DataCardProps extends BoxVariants, IconVariants {
  title: string;
  value?: number;
  dateRange: string;
  percentageChange?: number;
  decimals?: number;
}

export const DataCard = ({
  title,
  value = 0,
  dateRange,
  percentageChange = 0,
  decimals = 0,
}: DataCardProps) => {
  const isImprovement =
    percentageChange === 0 ||
    title === "Direct Hours" ||
    title === "Working Time"
      ? percentageChange <= 0
      : percentageChange > 0;
  const TrendIcon =
    percentageChange === 0 ||
    title === "Man Hour" ||
    title === "Direct Hours" ||
    title === "Working Time"
      ? percentageChange <= 0
        ? FaArrowTrendUp
        : FaArrowTrendDown
      : isImprovement
        ? FaArrowTrendDown
        : FaArrowTrendUp;
  const cardVariant = isImprovement ? "success" : "danger";

  return (
    <Card className="rounded-lg bg-card dark:bg-card w-full shadow-md dark:shadow-white/10">
      <CardHeader className="flex flex-row items-center justify-between gap-x-4">
        <div className="space-y-1">
          <CardTitle className="text-base font-medium line-clamp-1">
            {title}
          </CardTitle>
          <CardDescription className="text-xs line-clamp-1">
            {dateRange}
          </CardDescription>
        </div>
        <div className={cn(boxVariant({ variant: cardVariant }))}>
          <TrendIcon className={cn(iconVariant({ variant: cardVariant }))} />
        </div>
      </CardHeader>
      <CardContent>
        <h1 className="font-semibold text-xl mb-1 line-clamp-1 break-all">
          <CountUp
            preserveValue
            start={0}
            end={value}
            decimals={decimals}
            decimalPlaces={0}
          />
        </h1>
        <p
          className={cn(
            "text-muted-foreground text-xs line-clamp-1",
            percentageChange === 0 ||
              title === "Man Hour" ||
              title === "Direct Hours" ||
              title === "Working Time"
              ? percentageChange <= 0
                ? "text-emerald-500"
                : "text-rose-500"
              : percentageChange > 0
                ? "text-emerald-500"
                : "text-rose-500"
          )}
        >
          YoY: {formatPercentage(Math.abs(percentageChange))} from last period
        </p>
      </CardContent>
    </Card>
  );
};

export const DataCardLoading = () => {
  return (
    <Card className="rounded-sm bg-card dark:bg-card h-[160px]">
      <CardHeader className="flex flex-row items-center jsutify-between gap-x-4">
        <div className="space-y-1">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="size-10" />
      </CardHeader>
      <CardContent>
        <Skeleton className="shrink-0 h-8 w-20 mb-1" />
        <Skeleton className="shrink-0 h-3 w-32" />
      </CardContent>
    </Card>
  );
};
