import { useMemo, useState, useEffect } from "react";
import { type Workout } from "@/types/Workout";
import { type Exercise, ExerciseType, DistanceUnits } from "@/types/Exercise";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

interface ProgressChartProps {
  workouts: Workout[] | null | undefined;
  exercises: Exercise[] | null | undefined;
}

interface ChartDataPoint {
  date: string;
  [key: string]: string | number;
}

function getUniqueExerciseNames(
  exercises: Exercise[] | null | undefined
): string[] {
  if (!exercises || exercises.length === 0) {
    return [];
  }
  const nameMap = new Map<string, string>();
  exercises.forEach((exercise) => {
    if (exercise && exercise.name) {
      const lowerName = exercise.name.toLowerCase();
      if (!nameMap.has(lowerName)) {
        nameMap.set(lowerName, exercise.name);
      }
    }
  });
  return Array.from(nameMap.values()).sort();
}

// Normalize any distance value to km for consistent charting.
// CALORIES are not a real distance and are returned unchanged.
function normalizeDistanceToKm(
  distance: number,
  unit: DistanceUnits | undefined
): number {
  switch (unit) {
    case DistanceUnits.METERS:
      return Math.round((distance / 1000) * 10000) / 10000;
    case DistanceUnits.MILES:
      return Math.round(distance * 1.60934 * 10000) / 10000;
    default:
      return distance;
  }
}

function transformExerciseData(
  workouts: Workout[] | null | undefined,
  exercises: Exercise[] | null | undefined,
  exerciseName: string
): { data: ChartDataPoint[]; metrics: string[]; exerciseType: ExerciseType } {
  if (!workouts || !exercises || !exerciseName) {
    return { data: [], metrics: [], exerciseType: ExerciseType.OTHER };
  }

  const exerciseMap = new Map<string, Exercise>();
  exercises.forEach((exercise) => {
    if (exercise && exercise.exerciseId) {
      exerciseMap.set(exercise.exerciseId, exercise);
    }
  });

  const sortedWorkouts = [...workouts].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const lowerExerciseName = exerciseName.toLowerCase();
  const exercisesByDate: Array<{ date: string; exercise: Exercise }> = [];

  sortedWorkouts.forEach((workout) => {
    if (workout.exercises && Array.isArray(workout.exercises)) {
      workout.exercises.forEach((exerciseIdOrObject) => {
        let exercise: Exercise | undefined;

        if (typeof exerciseIdOrObject === "string") {
          exercise = exerciseMap.get(exerciseIdOrObject);
        } else if (
          typeof exerciseIdOrObject === "object" &&
          exerciseIdOrObject !== null
        ) {
          exercise = exerciseIdOrObject as Exercise;
        }

        if (
          exercise &&
          exercise.name &&
          exercise.name.toLowerCase() === lowerExerciseName
        ) {
          exercisesByDate.push({ date: workout.date, exercise });
        }
      });
    }
  });

  if (exercisesByDate.length === 0) {
    return { data: [], metrics: [], exerciseType: ExerciseType.OTHER };
  }

  const exerciseType = exercisesByDate[0].exercise.exerciseType;
  const dataByDate = new Map<string, ChartDataPoint>();

  exercisesByDate.forEach(({ date, exercise }) => {
    const dateObj = new Date(date);
    const formattedDate = dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    let dataPoint = dataByDate.get(date);
    if (!dataPoint) {
      dataPoint = { date: formattedDate };
      dataByDate.set(date, dataPoint);
    }

    switch (exerciseType) {
      case ExerciseType.WEIGHTS:
        if (exercise.sets && exercise.sets.length > 0) {
          const maxWeight = Math.max(...exercise.sets.map((s) => s.weight));
          const totalReps = exercise.sets.reduce((sum, s) => sum + s.reps, 0);
          const setsCount = exercise.sets.length;

          dataPoint["Weight"] = Math.max(
            (dataPoint["Weight"] as number) || 0,
            maxWeight
          );
          dataPoint["Reps"] = ((dataPoint["Reps"] as number) || 0) + totalReps;
          dataPoint["Sets"] = ((dataPoint["Sets"] as number) || 0) + setsCount;
        }
        break;

      case ExerciseType.BODY_WEIGHT:
        if (exercise.sets && exercise.sets.length > 0) {
          const totalReps = exercise.sets.reduce((sum, s) => sum + s.reps, 0);
          const setsCount = exercise.sets.length;
          dataPoint["Reps"] = ((dataPoint["Reps"] as number) || 0) + totalReps;
          dataPoint["Sets"] = ((dataPoint["Sets"] as number) || 0) + setsCount;
        }
        break;

      case ExerciseType.CARDIO:
        if (exercise.time) {
          const timeInSeconds =
            typeof exercise.time === "string"
              ? parseInt(exercise.time)
              : exercise.time;
          dataPoint["Time (min)"] =
            ((dataPoint["Time (min)"] as number) || 0) +
            Math.round((timeInSeconds / 60) * 100) / 100;
        }
        if (exercise.distance && exercise.distanceUnit !== DistanceUnits.CALORIES) {
          const normalizedKm = normalizeDistanceToKm(
            exercise.distance,
            exercise.distanceUnit
          );
          dataPoint["Distance (km)"] =
            Math.round(
              (((dataPoint["Distance (km)"] as number) || 0) + normalizedKm) *
                10000
            ) / 10000;
        } else if (exercise.distance && exercise.distanceUnit === DistanceUnits.CALORIES) {
          dataPoint["Calories"] =
            ((dataPoint["Calories"] as number) || 0) + exercise.distance;
        }
        if (exercise.level) {
          dataPoint["Speed"] = Math.max(
            (dataPoint["Speed"] as number) || 0,
            exercise.level
          );
        }
        break;

      case ExerciseType.OTHER:
        if (exercise.time) {
          const timeInSeconds =
            typeof exercise.time === "string"
              ? parseInt(exercise.time)
              : exercise.time;
          dataPoint["Time (s)"] =
            ((dataPoint["Time (s)"] as number) || 0) + timeInSeconds;
        }
        if (exercise.distance && exercise.distanceUnit !== DistanceUnits.CALORIES) {
          const normalizedKm = normalizeDistanceToKm(
            exercise.distance,
            exercise.distanceUnit
          );
          dataPoint["Distance (km)"] =
            Math.round(
              (((dataPoint["Distance (km)"] as number) || 0) + normalizedKm) *
                10000
            ) / 10000;
        } else if (exercise.distance && exercise.distanceUnit === DistanceUnits.CALORIES) {
          dataPoint["Calories"] =
            ((dataPoint["Calories"] as number) || 0) + exercise.distance;
        }
        break;
    }
  });

  const chartData = Array.from(dataByDate.entries())
    .sort(([dateA], [dateB]) => {
      return new Date(dateA).getTime() - new Date(dateB).getTime();
    })
    .map(([_, point]) => point);

  let metrics: string[] = [];
  if (exerciseType === ExerciseType.WEIGHTS) {
    metrics = ["Weight", "Reps", "Sets"];
  } else if (exerciseType === ExerciseType.BODY_WEIGHT) {
    if (chartData.some((d) => d["Reps"])) metrics.push("Reps");
    if (chartData.some((d) => d["Sets"])) metrics.push("Sets");
  } else if (exerciseType === ExerciseType.CARDIO) {
    if (chartData.some((d) => d["Distance (km)"])) metrics.push("Distance (km)");
    if (chartData.some((d) => d["Time (min)"])) metrics.push("Time (min)");
    if (chartData.some((d) => d["Speed"])) metrics.push("Speed");
    if (chartData.some((d) => d["Calories"])) metrics.push("Calories");
  } else {
    if (chartData.some((d) => d["Time (s)"])) metrics.push("Time (s)");
    if (chartData.some((d) => d["Distance (km)"])) metrics.push("Distance (km)");
    if (chartData.some((d) => d["Calories"])) metrics.push("Calories");
  }

  return { data: chartData, metrics, exerciseType };
}

const KINETIC_COLORS = [
  "#586000",
  "#e4f725",
  "#afadac",
  "#f97316",
];

const chartConfig = {
  Weight:          { label: "Weight (kg)",  color: "#586000" },
  Reps:            { label: "Reps",         color: "#e4f725" },
  Sets:            { label: "Sets",         color: "#afadac" },
  "Time (min)":    { label: "Time (min)",   color: "#586000" },
  "Time (s)":      { label: "Time (s)",     color: "#586000" },
  "Distance (km)": { label: "Distance (km)", color: "#e4f725" },
  Speed:           { label: "Speed",        color: "#afadac" },
  Calories:        { label: "Calories",     color: "#f97316" },
};

// Returns the metric that should be visible by default when an exercise is selected
function getDefaultVisibleMetrics(
  exerciseType: ExerciseType,
  metrics: string[]
): Set<string> {
  const visible = new Set<string>();
  if (metrics.length === 0) return visible;

  switch (exerciseType) {
    case ExerciseType.WEIGHTS:
      visible.add("Weight");
      break;
    case ExerciseType.BODY_WEIGHT:
      visible.add("Reps");
      break;
    case ExerciseType.CARDIO:
      // Prefer Distance, then first available metric
      if (metrics.includes("Distance (km)")) {
        visible.add("Distance (km)");
      } else {
        visible.add(metrics[0]);
      }
      break;
    default:
      visible.add(metrics[0]);
  }
  return visible;
}

export function ProgressChart({ workouts, exercises }: ProgressChartProps) {
  const [isLoading, setIsLoading] = useState(true);

  const exerciseNames = useMemo(
    () => getUniqueExerciseNames(exercises),
    [exercises]
  );

  const [selectedExercise, setSelectedExercise] = useState<string>(
    exerciseNames[0] || ""
  );

  const { data, metrics, exerciseType } = useMemo(
    () => transformExerciseData(workouts, exercises, selectedExercise),
    [workouts, exercises, selectedExercise]
  );

  const [visibleMetrics, setVisibleMetrics] = useState<Set<string>>(
    () => getDefaultVisibleMetrics(exerciseType, metrics)
  );

  // Reset visible metrics to defaults whenever the selected exercise changes
  useEffect(() => {
    setVisibleMetrics(getDefaultVisibleMetrics(exerciseType, metrics));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedExercise]);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 150);
    return () => clearTimeout(timer);
  }, [selectedExercise, data]);

  const activeMetrics = metrics.filter((m) => visibleMetrics.has(m));

  const toggleMetric = (metric: string, checked: boolean) => {
    setVisibleMetrics((prev) => {
      const next = new Set(prev);
      if (checked) next.add(metric);
      else next.delete(metric);
      return next;
    });
  };

  if (exerciseNames.length === 0) {
    return (
      <Card className="w-full h-full">
        <CardHeader>
          <span className="font-headline font-bold tracking-widest uppercase text-xs text-primary-dark">
            Exercise Progress
          </span>
          <CardTitle className="font-headline font-bold text-2xl tracking-tight">
            PROGRESS CHART
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No exercise data available. Start adding workouts to see your
            progress!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <span className="font-headline font-bold tracking-widest uppercase text-xs text-primary-dark">
          Exercise Progress
        </span>
        <CardTitle className="font-headline font-bold text-2xl tracking-tight">
          {selectedExercise.toUpperCase()}
        </CardTitle>
        <div className="pt-2">
          <Select value={selectedExercise} onValueChange={setSelectedExercise}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Select an exercise" />
            </SelectTrigger>
            <SelectContent>
              {exerciseNames.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {metrics.length > 0 && (
          <div className="flex flex-wrap gap-x-4 gap-y-2 pt-2">
            {metrics.map((metric, index) => {
              const color = KINETIC_COLORS[index % KINETIC_COLORS.length];
              const checked = visibleMetrics.has(metric);
              return (
                <label
                  key={metric}
                  className="flex items-center gap-1.5 text-sm cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => toggleMetric(metric, e.target.checked)}
                    className="rounded"
                    style={{ accentColor: color }}
                  />
                  <span style={{ color: checked ? color : "#9ca3af" }}>
                    {chartConfig[metric as keyof typeof chartConfig]?.label ?? metric}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="h-[300px] w-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-dark" />
          </div>
        ) : data.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No data available for this exercise.
          </p>
        ) : activeMetrics.length === 0 ? (
          <div className="h-[300px] w-full flex items-center justify-center">
            <p className="text-muted-foreground text-sm">
              Select at least one metric above to display the chart.
            </p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                {activeMetrics.map((metric) => {
                  const color =
                    KINETIC_COLORS[
                      metrics.indexOf(metric) % KINETIC_COLORS.length
                    ];
                  return (
                    <linearGradient
                      key={metric}
                      id={`gradient-${metric}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor={color}
                        stopOpacity={0.2}
                      />
                      <stop
                        offset="100%"
                        stopColor={color}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  );
                })}
              </defs>

              <CartesianGrid
                vertical={false}
                stroke="#eae7e7"
                strokeDasharray="0"
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#5c5b5b", fontSize: 10, fontFamily: "Manrope" }}
                dy={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#5c5b5b", fontSize: 10, fontFamily: "Manrope" }}
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                cursor={{ stroke: "#dfdcdc", strokeWidth: 1 }}
              />

              {activeMetrics.map((metric) => {
                const color =
                  KINETIC_COLORS[
                    metrics.indexOf(metric) % KINETIC_COLORS.length
                  ];
                return (
                  <Area
                    key={metric}
                    type="monotone"
                    dataKey={metric}
                    stroke={color}
                    strokeWidth={3}
                    fill={`url(#gradient-${metric})`}
                    dot={{ fill: color, r: 4, strokeWidth: 0 }}
                    activeDot={{
                      fill: "#e4f725",
                      r: 6,
                      stroke: "#586000",
                      strokeWidth: 2,
                    }}
                    connectNulls
                    isAnimationActive={false}
                  />
                );
              })}
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
