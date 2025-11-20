import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { GetProjectsOutputType, GetTasksOutputType, getTasks } from 'zite-endpoints-sdk';
import TaskCard from './TaskCard';
import CreateTaskDialog from './CreateTaskDialog';
import TaskDetailDialog from './TaskDetailDialog';
import { toast } from 'sonner';

type ProjectType = GetProjectsOutputType['projects'][0];
type TaskType = GetTasksOutputType['tasks'][0];

interface ProjectBoardProps {
  project: ProjectType;
  onBack: () => void;
}

export default function ProjectBoard({ project, onBack }: ProjectBoardProps) {
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);

  useEffect(() => {
    loadTasks();
  }, [project]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const result = await getTasks({ projectId: project.id });
      setTasks(result.tasks);
    } catch (error) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const todoTasks = tasks.filter(t => t.status === 'To-Do');
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress');
  const completedTasks = tasks.filter(t => t.status === 'Completed');

  const handleTaskClick = (task: TaskType) => {
    setSelectedTask(task);
    setTaskDialogOpen(true);
  };

  const handleTaskDeleted = () => {
    loadTasks();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{project.projectName}</h1>
            {project.description && (
              <p className="text-muted-foreground">{project.description}</p>
            )}
          </div>
        </div>
        <CreateTaskDialog projectId={project.id} onTaskCreated={loadTasks} />
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading tasks...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">To-Do</h3>
              <span className="text-sm text-muted-foreground">{todoTasks.length}</span>
            </div>
            <div className="space-y-2">
              {todoTasks.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onSelect={handleTaskClick}
                />
              ))}
              {todoTasks.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No tasks</p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">In Progress</h3>
              <span className="text-sm text-muted-foreground">{inProgressTasks.length}</span>
            </div>
            <div className="space-y-2">
              {inProgressTasks.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onSelect={handleTaskClick}
                />
              ))}
              {inProgressTasks.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No tasks</p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Completed</h3>
              <span className="text-sm text-muted-foreground">{completedTasks.length}</span>
            </div>
            <div className="space-y-2">
              {completedTasks.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onSelect={handleTaskClick}
                />
              ))}
              {completedTasks.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No tasks</p>
              )}
            </div>
          </div>
        </div>
      )}

      <TaskDetailDialog
        task={selectedTask}
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        onTaskUpdated={loadTasks}
        onTaskDeleted={handleTaskDeleted}
      />
    </div>
  );
}
