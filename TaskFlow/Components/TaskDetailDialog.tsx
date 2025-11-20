import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Calendar, Send, Edit, Clock, X, Trash2, MoreVertical } from 'lucide-react';
import { GetTasksOutputType, getComments, createComment, updateTask, notifyCommentAdded, notifyTaskUpdated, deleteTask } from 'zite-endpoints-sdk';
import { toast } from 'sonner';
import { useAuth } from 'zite-auth-sdk';

type TaskType = GetTasksOutputType['tasks'][0];

interface TaskDetailDialogProps {
  task: TaskType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskUpdated: () => void;
  onTaskDeleted: () => void;
}

export default function TaskDetailDialog({ task, open, onOpenChange, onTaskUpdated, onTaskDeleted }: TaskDetailDialogProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [status, setStatus] = useState(task?.status || 'To-Do');
  const [isModifying, setIsModifying] = useState(false);
  const [isExtending, setIsExtending] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [modifyData, setModifyData] = useState({ taskName: '', description: '' });
  const [extendDate, setExtendDate] = useState('');

  useEffect(() => {
    if (task && open) {
      setStatus(task.status || 'To-Do');
      setModifyData({ taskName: task.taskName || '', description: task.description || '' });
      setExtendDate(task.dueDate || '');
      setIsModifying(false);
      setIsExtending(false);
      loadComments();
    }
  }, [task, open]);

  const loadComments = async () => {
    if (!task) return;
    try {
      const result = await getComments({ taskId: task.id });
      setComments(result.comments);
    } catch (error) {
      console.error('Failed to load comments');
    }
  };

  const handleAddComment = async () => {
    if (!task || !newComment.trim()) return;
    setLoading(true);
    
    try {
      await createComment({ taskId: task.id, comment: newComment });
      
      try {
        await notifyCommentAdded({
          taskName: task.taskName || 'Unknown Task',
          comment: newComment
        });
      } catch (notifyError) {
        console.error('Failed to send notification');
      }
      
      setNewComment('');
      toast.success('Comment added!');
      loadComments();
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!task) return;
    const oldStatus = status;
    setUpdating(true);
    
    try {
      await updateTask({ taskId: task.id, status: newStatus as any });
      
      try {
        await notifyTaskUpdated({
          taskName: task.taskName || 'Unknown Task',
          oldStatus: oldStatus,
          newStatus: newStatus
        });
      } catch (notifyError) {
        console.error('Failed to send notification');
      }
      
      setStatus(newStatus);
      toast.success('Task updated!');
      onTaskUpdated();
    } catch (error) {
      toast.error('Failed to update task');
    } finally {
      setUpdating(false);
    }
  };

  const handleModifySave = async () => {
    if (!task) return;
    setUpdating(true);
    try {
      await updateTask({
        taskId: task.id,
        taskName: modifyData.taskName,
        description: modifyData.description
      });
      toast.success('Task updated!');
      setIsModifying(false);
      onTaskUpdated();
    } catch (error) {
      toast.error('Failed to update task');
    } finally {
      setUpdating(false);
    }
  };

  const handleExtendSave = async () => {
    if (!task) return;
    setUpdating(true);
    try {
      await updateTask({
        taskId: task.id,
        dueDate: extendDate
      });
      toast.success('Due date extended!');
      setIsExtending(false);
      onTaskUpdated();
    } catch (error) {
      toast.error('Failed to extend date');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = async () => {
    if (!task) return;
    setUpdating(true);
    try {
      await updateTask({ taskId: task.id, status: 'To-Do' });
      toast.success('Task cancelled (moved to To-Do)');
      setStatus('To-Do');
      onTaskUpdated();
    } catch (error) {
      toast.error('Failed to cancel task');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    try {
      await deleteTask({ taskId: task.id });
      toast.success('Task deleted successfully');
      setDeleteDialogOpen(false);
      onOpenChange(false);
      onTaskDeleted();
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  if (!task) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <DialogTitle className="text-xl flex-1">{task.taskName}</DialogTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsModifying(!isModifying)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Modify
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsExtending(!isExtending)}>
                    <Clock className="h-4 w-4 mr-2" />
                    Extend
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCancel} disabled={updating}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setDeleteDialogOpen(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Modify Section */}
            {isModifying && (
              <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
                <h3 className="font-semibold">Modify Task</h3>
                <div>
                  <Label htmlFor="modifyName">Task Name</Label>
                  <Input
                    id="modifyName"
                    value={modifyData.taskName}
                    onChange={(e) => setModifyData({ ...modifyData, taskName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="modifyDesc">Description</Label>
                  <Textarea
                    id="modifyDesc"
                    value={modifyData.description}
                    onChange={(e) => setModifyData({ ...modifyData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleModifySave} disabled={updating}>
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setIsModifying(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Extend Section */}
            {isExtending && (
              <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
                <h3 className="font-semibold">Extend Due Date</h3>
                <div>
                  <Label htmlFor="extendDate">New Due Date</Label>
                  <Input
                    id="extendDate"
                    type="date"
                    value={extendDate}
                    onChange={(e) => setExtendDate(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleExtendSave} disabled={updating}>
                    Save Date
                  </Button>
                  <Button variant="outline" onClick={() => setIsExtending(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={handleUpdateStatus} disabled={updating}>
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

            {task.description && !isModifying && (
              <div>
                <Label>Description</Label>
                <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
              </div>
            )}

            {task.dueDate && !isExtending && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Due: {new Date(task.dueDate).toLocaleDateString()}
              </div>
            )}

            <Separator />

            <div>
              <Label className="text-base">Comments ({comments.length})</Label>
              <div className="mt-3 space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-card border rounded-lg p-3">
                    <p className="text-sm">{comment.comment}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {comment.timestamp && new Date(comment.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
                
                {comments.length === 0 && (
                  <p className="text-sm text-muted-foreground">No comments yet</p>
                )}
              </div>

              <div className="flex gap-2 mt-3">
                <Input
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                />
                <Button onClick={handleAddComment} disabled={loading || !newComment.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{task.taskName}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
