import { useMemo, useState, useEffect } from "react";
import { type Workout } from "@/types/Workout";
import { type Exercise, ExerciseType } from "@/types/Exercise";
import {
  Card,
  CardContent,
  CardDescription,
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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from "recharts";

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

  // Create exercise lookup map
  const exerciseMap = new Map<string, Exercise>();
  exercises.forEach((exercise) => {
    if (exercise && exercise.exerciseId) {
      exerciseMap.set(exercise.exerciseId, exercise);
    }
  });

  // Sort workouts by date
  const sortedWorkouts = [...workouts].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Find all matching exercises across workouts (case-insensitive)
  const lowerExerciseName = exerciseName.toLowerCase();
  const exercisesByDate: Array<{
    date: string;
    exercise: Exercise;
  }> = [];

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

  // Group by date and aggregate
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

          // Use max weight across all instances on this date
          dataPoint["Weight"] = Math.max(
            (dataPoint["Weight"] as number) || 0,
            maxWeight
          );
          // Sum reps and sets
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

  // Convert to array and sort by date
  const chartData = Array.from(dataByDate.entries())
    .sort(([dateA], [dateB]) => {
      return new Date(dateA).getTime() - new Date(dateB).getTime();
    })
    .map(([_, point]) => point);

  // Determine metrics based on exercise type
  let metrics: string[] = [];
  if (exerciseType === ExerciseType.WEIGHTS) {
    metrics = ["Weight", "Reps", "Sets"];
  } else if (exerciseType === ExerciseType.CARDIO) {
    metrics = [];
    if (chartData.some((d) => d["Time (min)"])) metrics.push("Time (min)");
    if (chartData.some((d) => d["Distance"])) metrics.push("Distance");
    if (chartData.some((d) => d["Speed"])) metrics.push("Speed");
  } else {
    metrics = [];
    if (chartData.some((d) => d["Time (s)"])) metrics.push("Time (s)");
    if (chartData.some((d) => d["Distance"])) metrics.push("Distance");
  }

  return { data: chartData, metrics, exerciseType };
}

// Chart configuration with hex colors
const chartConfig = {
  Weight: {
    label: "Weight (kg)",
    color: "#3b82f6", // blue
  },
  Reps: {
    label: "Reps",
    color: "#10b981", // green
  },
  Sets: {
    label: "Sets",
    color: "#f59e0b", // orange
  },
  "Time (min)": {
    label: "Time (min)",
    color: "#3b82f6", // blue
  },
  "Time (s)": {
    label: "Time (s)",
    color: "#3b82f6", // blue
  },
  Distance: {
    label: "Distance",
    color: "#10b981", // green
  },
  Speed: {
    label: "Speed",
    color: "#f59e0b", // orange
  },
};

const COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // orange
  "#ef4444", // red
  "#8b5cf6", // purple
];

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

  // Handle loading state - show loader briefly when data changes
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 150);
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
          <div className="h-[400px] w-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-muted-foreground text-sm">Loading chart...</p>
            </div>
          </div>
        ) : data.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No data available for this exercise.
          </p>
        ) : (
          <ChartContainer config={chartConfig} className="h-[400px] w-full">
            <LineChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              {metrics.map((metric, index) => {
                const color = COLORS[index % COLORS.length];
                const configColor =
                  chartConfig[metric as keyof typeof chartConfig]?.color ||
                  color;
                return (
                  <Line
                    key={metric}
                    type="monotone"
                    dataKey={metric}
                    stroke={configColor}
                    strokeWidth={3}
                    dot={{
                      fill: configColor,
                      r: 5,
                      strokeWidth: 2,
                      stroke: configColor,
                    }}
                    activeDot={{ r: 7 }}
                    connectNulls={true}
                    isAnimationActive={false}
                  />
                );
              })}
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
