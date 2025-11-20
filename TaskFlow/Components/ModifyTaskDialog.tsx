import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { GetTasksOutputType, updateTask } from 'zite-endpoints-sdk';
import { toast } from 'sonner';

type TaskType = GetTasksOutputType['tasks'][0];

interface ModifyTaskDialogProps {
  task: TaskType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskUpdated: () => void;
}

export default function ModifyTaskDialog({ task, open, onOpenChange, onTaskUpdated }: ModifyTaskDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    taskName: '',
    description: ''
  });

  useEffect(() => {
    if (task && open) {
      setFormData({
        taskName: task.taskName || '',
        description: task.description || ''
      });
    }
  }, [task, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;
    setLoading(true);
    
    try {
      await updateTask({
        taskId: task.id,
        taskName: formData.taskName,
        description: formData.description
      });
      
      toast.success('Task updated successfully!');
      onOpenChange(false);
      onTaskUpdated();
    } catch (error) {
      toast.error('Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modify Task</DialogTitle>
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
              rows={4}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
