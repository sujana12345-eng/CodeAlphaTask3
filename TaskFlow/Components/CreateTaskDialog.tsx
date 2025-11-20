import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { createTask, notifyTaskCreated, getProjects } from 'zite-endpoints-sdk';
import { toast } from 'sonner';

interface CreateTaskDialogProps {
  projectId: string;
  onTaskCreated: () => void;
}

export default function CreateTaskDialog({ projectId, onTaskCreated }: CreateTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    taskName: '',
    description: '',
    dueDate: '',
    status: 'To-Do' as 'To-Do' | 'In Progress' | 'Completed'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await createTask({
        taskName: formData.taskName,
        description: formData.description || undefined,
        projectId,
        dueDate: formData.dueDate || undefined,
        status: formData.status
      });
      
      // Send Slack notification
      try {
        const projectsResult = await getProjects({});
        const project = projectsResult.projects.find(p => p.id === projectId);
        if (project) {
          await notifyTaskCreated({
            taskName: formData.taskName,
            projectName: project.projectName || 'Unknown Project'
          });
        }
      } catch (notifyError) {
        console.error('Failed to send notification');
      }
      
      toast.success('Task created successfully!');
      setOpen(false);
      setFormData({ taskName: '', description: '', dueDate: '', status: 'To-Do' });
      onTaskCreated();
    } catch (error) {
      toast.error('Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="taskName">Task Name *</Label>
            <Input
              id="taskName"
              value={formData.taskName}
              onChange={(e) => setFormData({ ...formData, taskName: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as any })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="To-Do">To-Do</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating...' : 'Create Task'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
