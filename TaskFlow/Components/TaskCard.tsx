import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { GetTasksOutputType } from 'zite-endpoints-sdk';

type TaskType = GetTasksOutputType['tasks'][0];

interface TaskCardProps {
  task: TaskType;
  onSelect: (task: TaskType) => void;
}

const statusColors = {
  'To-Do': 'bg-slate-500',
  'In Progress': 'bg-blue-500',
  'Completed': 'bg-green-500'
};

export default function TaskCard({ task, onSelect }: TaskCardProps) {
  return (
    <Card className="hover:border-primary transition-colors cursor-pointer" onClick={() => onSelect(task)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{task.taskName}</CardTitle>
          <Badge className={statusColors[task.status as keyof typeof statusColors] || 'bg-slate-500'}>
            {task.status}
          </Badge>
        </div>
        {task.description && (
          <CardDescription className="line-clamp-2 text-sm">{task.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          {task.dueDate && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(task.dueDate).toLocaleDateString()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
