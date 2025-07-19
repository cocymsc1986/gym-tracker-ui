interface Workout {
  id: number;
  name: string;
}

interface DashboardProps {
  workouts: Workout[];
}

export function Dashboard({ workouts }: DashboardProps) {
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => {}}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workouts.map((workout) => (
          <div key={workout.id} className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold">{workout.name}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}
