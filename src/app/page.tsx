"use client";

import React, { useState, useEffect, ChangeEvent } from "react";

interface Task {
  id: number;
  title: string;
  parentId: number | null;
  children: Task[];
}

interface MoveSubtaskProps {
  taskId: number;
  tasks: Task[];
  onMoveSubtask: (subtaskId: number, newParentId: number) => void;
}

const MoveSubtaskComponent: React.FC<MoveSubtaskProps> = ({
  taskId,
  tasks,
  onMoveSubtask,
}) => {
  const [newParentId, setNewParentId] = useState<number | null>(null);

  const handleMoveSubtask = () => {
    if (newParentId !== null) {
      onMoveSubtask(taskId, newParentId);
      setNewParentId(null);
    }
  };

  return (
    <div className="mt-2">
      <select
        value={newParentId ?? ""}
        onChange={(e: ChangeEvent<HTMLSelectElement>) =>
          setNewParentId(Number(e.target.value))
        }
        className="p-1 border"
      >
        <option value="">Выберите новую родительскую задачу</option>
        {tasks
          .filter((task) => task.id !== taskId)
          .map((task) => (
            <option key={task.id} value={task.id}>
              {task.title}
            </option>
          ))}
      </select>
      <button
        onClick={handleMoveSubtask}
        className="ml-2 p-1 bg-yellow-500 text-white"
      >
        Переместить подзадачу
      </button>
    </div>
  );
};

interface TaskComponentProps {
  task: Task;
  tasks: Task[];
  onAddSubtask: (parentId: number, title: string) => void;
  onDeleteTask: (id: number) => void;
  onChangeTask: (id: number, title: string) => void;
  onMoveSubtask: (subtaskId: number, newParentId: number) => void;
}

const TaskComponent: React.FC<TaskComponentProps> = ({
  task,
  tasks,
  onAddSubtask,
  onDeleteTask,
  onChangeTask,
  onMoveSubtask,
}) => {
  const [subtaskTitle, setSubtaskTitle] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [newTitle, setNewTitle] = useState(task.title);

  const handleAddSubtask = () => {
    onAddSubtask(task.id, subtaskTitle);
    setSubtaskTitle("");
  };

  const handleEditTask = () => {
    setIsEditing(true);
  };

  const handleSaveTask = () => {
    onChangeTask(task.id, newTitle);
    setIsEditing(false);
  };

  const handleMoveClick = () => {
    setIsMoving(!isMoving);
  };

  return (
    <li>
      <div>
        {isEditing ? (
          <input
            type="text"
            value={newTitle}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setNewTitle(e.target.value)
            }
            className="mt-2 p-1 border"
          />
        ) : (
          <span>{task.title}</span>
        )}
        <button
          onClick={() => onDeleteTask(task.id)}
          className="ml-2 p-1 bg-red-500 text-white"
        >
          Удалить
        </button>
        <button
          onClick={isEditing ? handleSaveTask : handleEditTask}
          className="ml-2 p-1 bg-blue-500 text-white"
        >
          {isEditing ? "Сохранить" : "Изменить"}
        </button>
        <button
          onClick={handleMoveClick}
          className="ml-2 p-1 bg-yellow-500 text-white"
        >
          {isMoving ? "Отменить" : "Переместить"}
        </button>
      </div>
      {isMoving && (
        <MoveSubtaskComponent
          taskId={task.id}
          tasks={tasks}
          onMoveSubtask={onMoveSubtask}
        />
      )}
      <input
        type="text"
        value={subtaskTitle}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setSubtaskTitle(e.target.value)
        }
        placeholder="Название подзадачи"
        className="mt-2 p-1 border"
      />
      <button
        onClick={handleAddSubtask}
        className="ml-2 p-1 bg-green-500 text-white"
      >
        Добавить подзадачу
      </button>
      {task.children && task.children.length > 0 && (
        <ul className="ml-4 mt-2">
          {task.children.map((subTask) => (
            <TaskComponent
              key={subTask.id}
              task={subTask}
              tasks={tasks}
              onAddSubtask={onAddSubtask}
              onDeleteTask={onDeleteTask}
              onChangeTask={onChangeTask}
              onMoveSubtask={onMoveSubtask}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

const Page: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch("/api/tasks");
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        console.error("Ошибка при загрузке задач:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();

    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleAddTask = async () => {
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: taskTitle }),
      });

      if (!response.ok) {
        throw new Error("Ошибка при добавлении задачи");
      }

      const newTask = await response.json();
      setTasks([...tasks, newTask]);
      setTaskTitle("");
    } catch (error) {
      console.error("Ошибка при добавлении задачи:", error);
    }
  };

  const handleAddSubtask = async (parentId: number, title: string) => {
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, parentId }),
      });

      if (!response.ok) {
        throw new Error("Ошибка при добавлении подзадачи");
      }

      const newSubtask = await response.json();

      const addSubtaskToParent = (
        tasks: Task[],
        parentId: number,
        subtask: Task
      ): Task[] => {
        return tasks.map((task) => {
          if (task.id === parentId) {
            return {
              ...task,
              children: [...(task.children || []), subtask],
            };
          } else {
            return {
              ...task,
              children: addSubtaskToParent(
                task.children || [],
                parentId,
                subtask
              ),
            };
          }
        });
      };

      setTasks(addSubtaskToParent(tasks, parentId, newSubtask));
    } catch (error) {
      console.error("Ошибка при добавлении подзадачи:", error);
    }
  };

  const handleDeleteTask = async (id: number) => {
    try {
      await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
      });

      const removeTaskById = (tasks: Task[], id: number): Task[] => {
        return tasks
          .filter((task) => task.id !== id)
          .map((task) => ({
            ...task,
            children: removeTaskById(task.children || [], id),
          }));
      };

      setTasks(removeTaskById(tasks, id));
    } catch (error) {
      console.error("Ошибка при удалении задачи:", error);
    }
  };

  const handleChangeTask = async (id: number, title: string) => {
    try {
      await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }),
      });

      const updateTaskTitle = (
        tasks: Task[],
        id: number,
        title: string
      ): Task[] => {
        return tasks.map((task) => {
          if (task.id === id) {
            return { ...task, title };
          } else {
            return {
              ...task,
              children: updateTaskTitle(task.children || [], id, title),
            };
          }
        });
      };

      setTasks(updateTaskTitle(tasks, id, title));
    } catch (error) {
      console.error("Ошибка при изменении задачи:", error);
    }
  };

  const handleMoveSubtask = async (subtaskId: number, newParentId: number) => {
    try {
      const response = await fetch(`/api/tasks/${subtaskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ parentId: newParentId }),
      });

      if (!response.ok) {
        throw new Error("Ошибка при перемещении подзадачи");
      }

      const updateSubtaskParent = (
        tasks: Task[],
        subtaskId: number,
        newParentId: number
      ): Task[] => {
        let subtaskToMove: Task | null = null;

        const removeSubtaskById = (tasks: Task[], id: number): Task[] => {
          return tasks
            .filter((task) => {
              if (task.id === id) {
                subtaskToMove = task;
                return false;
              }
              return true;
            })
            .map((task) => ({
              ...task,
              children: removeSubtaskById(task.children || [], id),
            }));
        };

        const addSubtaskToParent = (
          tasks: Task[],
          parentId: number,
          subtask: Task
        ): Task[] => {
          return tasks.map((task) => {
            if (task.id === parentId) {
              return {
                ...task,
                children: [...(task.children || []), subtask],
              };
            } else {
              return {
                ...task,
                children: addSubtaskToParent(
                  task.children || [],
                  parentId,
                  subtask
                ),
              };
            }
          });
        };

        const newTasks = removeSubtaskById(tasks, subtaskId);

        if (subtaskToMove) {
          return addSubtaskToParent(newTasks, newParentId, subtaskToMove);
        }

        return tasks;
      };

      setTasks(updateSubtaskParent(tasks, subtaskId, newParentId));
    } catch (error) {
      console.error("Ошибка при перемещении подзадачи:", error);
    }
  };

  return (
    <div className="container">
      {loading && (
        <div className="boxes">
          <div className="box">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
          <div className="box">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
          <div className="box">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
          <div className="box">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      )}
      {!loading && (
        <>
          <input
            type="text"
            value={taskTitle}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setTaskTitle(e.target.value)
            }
            placeholder="Название задачи"
            className="mt-2 p-1 border"
          />
          <button
            onClick={handleAddTask}
            className="ml-2 p-1 bg-blue-500 text-white"
          >
            Добавить задачу
          </button>
          <ul className="mt-4">
            {tasks.map((task) => (
              <TaskComponent
                key={task.id}
                task={task}
                tasks={tasks}
                onAddSubtask={handleAddSubtask}
                onDeleteTask={handleDeleteTask}
                onChangeTask={handleChangeTask}
                onMoveSubtask={handleMoveSubtask}
              />
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default Page;
