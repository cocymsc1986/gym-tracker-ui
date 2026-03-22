import { useMemo, useState, useEffect } from "react";
import { type Workout } from "@/types/Workout";
import { type Exercise, ExerciseType } from "@/types/Exercise";
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

// Get unique exercise names from all exercises
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

// Transform workout data for charting - one data point per date
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
        if (exercise.distance) {
          dataPoint["Distance"] =
            ((dataPoint["Distance"] as number) || 0) + exercise.distance;
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
        if (exercise.distance) {
          dataPoint["Distance"] =
            ((dataPoint["Distance"] as number) || 0) + exercise.distance;
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
  } else if (exerciseType === ExerciseType.CARDIO) {
    if (chartData.some((d) => d["Time (min)"])) metrics.push("Time (min)");
    if (chartData.some((d) => d["Distance"])) metrics.push("Distance");
    if (chartData.some((d) => d["Speed"])) metrics.push("Speed");
  } else {
    if (chartData.some((d) => d["Time (s)"])) metrics.push("Time (s)");
    if (chartData.some((d) => d["Distance"])) metrics.push("Distance");
  }

  return { data: chartData, metrics, exerciseType };
}

// Kinetic palette for chart series
const KINETIC_COLORS = [
  "#586000", // primary-dark (olive) — primary series
  "#e4f725", // primary (yellow)     — secondary series
  "#afadac", // outline-variant      — tertiary series
];

const chartConfig = {
  Weight:       { label: "Weight (kg)", color: "#586000" },
  Reps:         { label: "Reps",        color: "#e4f725" },
  Sets:         { label: "Sets",        color: "#afadac" },
  "Time (min)": { label: "Time (min)",  color: "#586000" },
  "Time (s)":   { label: "Time (s)",    color: "#586000" },
  Distance:     { label: "Distance",    color: "#e4f725" },
  Speed:        { label: "Speed",       color: "#afadac" },
};

export function ProgressChart({ workouts, exercises }: ProgressChartProps) {
  const [isLoading, setIsLoading] = useState(true);

  const exerciseNames = useMemo(
    () => getUniqueExerciseNames(exercises),
    [exercises]
  );

  const [selectedExercise, setSelectedExercise] = useState<string>(
    exerciseNames[0] || ""
  );

  const { data, metrics } = useMemo(
    () => transformExerciseData(workouts, exercises, selectedExercise),
    [workouts, exercises, selectedExercise]
  );

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 150);
    return () => clearTimeout(timer);
  }, [selectedExercise, data]);

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
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                {metrics.map((metric, index) => {
                  const color =
                    KINETIC_COLORS[index % KINETIC_COLORS.length];
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

              {metrics.map((metric, index) => {
                const color =
                  KINETIC_COLORS[index % KINETIC_COLORS.length];
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
