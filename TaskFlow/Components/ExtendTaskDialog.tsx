import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GetTasksOutputType, updateTask } from 'zite-endpoints-sdk';
import { toast } from 'sonner';

type TaskType = GetTasksOutputType['tasks'][0];

interface ExtendTaskDialogProps {
  task: TaskType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskUpdated: () => void;
}

export default function ExtendTaskDialog({ task, open, onOpenChange, onTaskUpdated }: ExtendTaskDialogProps) {
  const [loading, setLoading] = useState(false);
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (task && open) {
      setDueDate(task.dueDate || '');
    }
  }, [task, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;
    setLoading(true);
    
    try {
      await updateTask({
        taskId: task.id,
        dueDate: dueDate
      });
      
      toast.success('Due date extended successfully!');
      onOpenChange(false);
      onTaskUpdated();
    } catch (error) {
      toast.error('Failed to extend due date');
    } finally {
      setLoading(false);
    }
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Extend Due Date</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="dueDate">New Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Extending...' : 'Extend Date'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
