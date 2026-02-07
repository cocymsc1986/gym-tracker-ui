import { Router, Route, Switch } from "wouter";
import { AuthProvider } from "./lib/authContext";
import { Header } from "./components/Header";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Pages
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { AddWorkout } from "./pages/AddWorkout";

import { DashboardWithData, WorkoutWithData } from "./components/RouteWrappers";

import "./app.css";

console.log("[DEBUG] App.tsx loading");

function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <Switch>
          {/* Public routes */}
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />

          {/* Protected routes */}
          <Route path="/">
            <ProtectedRoute>
              <DashboardWithData />
            </ProtectedRoute>
          </Route>

          <Route path="/workout">
            <ProtectedRoute>
              <AddWorkout />
            </ProtectedRoute>
          </Route>

          <Route path="/workout/:id">
            {(params) => (
              <ProtectedRoute>
                <WorkoutWithData workoutId={params.id} />
              </ProtectedRoute>
            )}
          </Route>

          {/* 404 fallback */}
          <Route>
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">404</h1>
                <p>Page not found</p>
              </div>
            </div>
          </Route>
        </Switch>
      </Router>
    </AuthProvider>
  );
}

export default App;
