"use client";

import ToDo from "@/app/components/todo";
import { useTasks } from "@/app/providers/UserTasksProvider";
import { useCallback, useEffect } from "react";
import { toast } from "react-toastify";

const UserTasks = () => {
  const { tasks, setTasks } = useTasks();

  const fetchData = useCallback(async () => {
    try {
      await fetch("/api/user/tasks", {
        method: "GET",
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            toast.error(
              "Uh-oh! We couldn't fetch your tasks. Please try again later!"
            );
            location.reload();
            return;
          }
          if (data.tasks) {
            setTasks(data.tasks);
          }
        });
    } catch (error) {
      console.error("Error fetching user tasks:", error);
    }
  }, [setTasks]);

  useEffect(() => {
    fetchData();
  }, [fetchData, setTasks]);

  return (
    <>
      <div className="header">
        <h2>My Tasks</h2>
        <p>View and manage all your assigned tasks</p>
      </div>

      <ToDo isAdmin={false} tasks={tasks} showProject={true} />
    </>
  );
};
export default UserTasks;
