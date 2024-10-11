"use client"

import ToDo from "@/app/components/todo";
import { useTasks } from "@/app/providers/UserTasksProvider";
import { useEffect } from "react";
import { toast } from "react-toastify";

const UserTasks = () => {
    const { tasks, setTasks } = useTasks();

    useEffect(() => {
        const fetchData = async () => {
          try {
            await fetch("/api/user/tasks", {
              method: "GET",
            })
              .then((res) => res.json())
              .then((data) => {
                if (data.error) {
                  toast.error("Uh-oh! We couldn't fetch your tasks. Please try again later!")
                  location.reload()
                  return
                }
                  if (data.tasks) {
                    setTasks(data.tasks);
                    console.log(data.tasks)
                  }
                
              });
          } catch (error) {
            console.error("Error fetching user tasks:", error);
          }
        };
    
        fetchData();
      }, []);

      console.log(`Tasks =`);
      console.log(tasks);
      
    
    return (
        <>
            <div className="header">
                <h1>My Tasks</h1>
                <p>View and manage all your assigned tasks</p>
            </div>

            <ToDo
                isAdmin={false}
                tasks={tasks}
                showProject={true}
              />
        </>
    )
}
export default UserTasks;