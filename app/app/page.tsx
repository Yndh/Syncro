"use client";

import {
  faCheck,
  faFlag,
  faListCheck,
  faPercent,
  faProjectDiagram,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsivePie } from "@nivo/pie";
import { useEffect, useState } from "react";
import { Project, Task, TaskStatus } from "../types/interfaces";

interface TaskData {
  id: "Completed" | "Uncompleted";
  label: string;
  value: number;
}

interface BarData {
  day: string;
  completed: number;
  [key: string]: number | string;
}

const App = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetch("/api/user", {
          method: "GET",
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.error) {
              alert(data.error);
            } else {
              if (data.tasks) {
                setTasks(data.tasks);
              }
              if (data.projects) {
                setProjects(data.projects);
              }
            }
          });
      } catch (error) {
        console.error("Error fetching project:", error);
      }
    };

    fetchData();
  }, []);

  const completedTasks = tasks.filter(
    (task) => task.taskStatus == "DONE"
  ).length;
  const uncompletedTasks = tasks.filter((task) => task.taskStatus != "DONE");
  const uncompletedTasksNum = uncompletedTasks.length;

  const pieData: TaskData[] = [
    { id: "Completed", label: "Completed", value: completedTasks },
    { id: "Uncompleted", label: "Uncompleted", value: uncompletedTasksNum },
  ];
  const colors: { Completed: string; Uncompleted: string } = {
    Completed: "#8BC858",
    Uncompleted: "#E3E3E3",
  };
  const completed = pieData.find((task) => task.id == "Completed")?.value || 0;

  const getBarData = (tasks: Task[]): BarData[] => {
    const completedTasks = tasks.filter(
      (task) => task.taskStatus === TaskStatus.DONE
    );

    const taskByDay: { [key: string]: number } = {
      Sun: 0,
      Mon: 0,
      Tue: 0,
      Wed: 0,
      Thu: 0,
      Fri: 0,
      Sat: 0,
    };

    completedTasks.map((task) => {
      const createdAt = new Date(task.createdAt);

      if (!(createdAt instanceof Date) || isNaN(createdAt.getTime())) {
        return;
      }

      const day = new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(
        createdAt
      );

      console.log(day);

      taskByDay[day] += 1;
    });

    const data: BarData[] = Object.keys(taskByDay).map((day) => ({
      day,
      completed: taskByDay[day],
    }));

    return data;
  };

  const barData: BarData[] = getBarData(tasks);

  const Tooltip = ({ value, label }: { value: number; label: string }) => (
    <div className="tooltip">
      <p>{label}:&nbsp;</p> {value}
    </div>
  );

  return (
    <>
      <div className="header">
        <h1>Dashboard</h1>
        <p>Your Central Hub for Project Success</p>
      </div>

      <div className="row-between">
        <div className="card">
          <p>Number of Projects</p>
          <div className="num">
            <div className="icon">
              <FontAwesomeIcon icon={faProjectDiagram} />
            </div>
            <p>{projects.length}</p>
          </div>
        </div>

        <div className="card">
          <p>Number of Tasks</p>
          <div className="num">
            <div className="icon">
              <FontAwesomeIcon icon={faListCheck} />
            </div>
            <p>{tasks.length}</p>
          </div>
        </div>

        <div className="card">
          <p>Completed Tasks</p>
          <div className="num">
            <div className="icon">
              <FontAwesomeIcon icon={faCheck} />
            </div>
            <p>{completedTasks}</p>
          </div>
        </div>

        <div className="card">
          <p>Tasks Percentage Completed</p>
          <div className="num">
            <div className="icon">
              <FontAwesomeIcon icon={faPercent} />
            </div>
            <p>{((completedTasks / tasks.length) * 100).toFixed(2)}%</p>
          </div>
        </div>
      </div>

      <div className="row-between full">
        <div className="row-col">
          <div className="card">
            <p>My Tasks</p>
            <div className="tasksScroll">
              {uncompletedTasks.map((task) => (
                <div className="uncompletedTask" key={`task${task.id}`}>
                  <div className="icon">
                    <FontAwesomeIcon icon={faFlag} />
                  </div>
                  <div className="details">
                    <div className="detailsHeader">
                      <h2>{task.title}</h2>
                      <p>{task.project?.name}</p>
                    </div>

                    <div className="taskDetails">
                      <div className="col">
                        <p>Status</p>
                        <span>
                          {task.taskStatus.replace("_", " ").toLowerCase()}
                        </span>
                      </div>
                      <div className="col">
                        <p>Priority</p>
                        <span>
                          {task.priority.replace("_", " ").toLowerCase()}
                        </span>
                      </div>
                      <div className="col">
                        <p>Stages Completed</p>
                        {task.stages.length > 0 ? (
                          <span>
                            {
                              task.stages.filter((stage) => stage.isCompleted)
                                .length
                            }
                            /{task.stages.length}
                          </span>
                        ) : (
                          <span>No stages</span>
                        )}
                      </div>
                      <div className="col">
                        <p>Due Date</p>
                        <span>
                          {task.dueTime ? (
                            new Intl.DateTimeFormat("en-US", {
                              day: "numeric",
                              month: "long",
                              hour: "numeric",
                              minute: "numeric",
                            }).format(new Date(task.dueTime))
                          ) : (
                            <span>None</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="row-col">
          <div className="card chart">
            <p>Completed Tasks Chart</p>
            <div className="pieChart">
              <ResponsivePie
                data={pieData}
                innerRadius={0.8}
                padAngle={2}
                cornerRadius={45}
                borderWidth={0}
                colors={({ id }) => colors[id as keyof typeof colors]}
                enableArcLabels={false}
                enableArcLinkLabels={false}
                animate={true}
                tooltip={({ datum }) => (
                  <Tooltip value={datum.value} label={datum.label as string} />
                )}
              />
              <div className="completedChart">
                <p>{completed}</p>
                <span>Tasks completed</span>
              </div>
            </div>
          </div>
          <div className="card chart">
            <p>Graphs and Analysis</p>
            <div className="pieChart">
              <ResponsiveBar
                data={barData}
                keys={["completed"]}
                margin={{ top: 20, right: 0, bottom: 30, left: 0 }}
                padding={0.4}
                indexBy="day"
                enableLabel={false}
                enableGridY={false}
                enableTotals={true}
                borderRadius={10}
                colors={colors.Completed}
                axisBottom={{
                  tickSize: 0,
                  tickPadding: 10,
                  tickRotation: 0,
                  legendPosition: "middle",
                  legendOffset: 0,
                  format: (value) => value,
                }}
                axisLeft={null}
                tooltip={({ data }) => (
                  <Tooltip value={data.completed} label="Completed" />
                )}
                minValue={0}
                theme={{
                  axis: {
                    ticks: {
                      text: {
                        fontSize: 12,
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default App;
