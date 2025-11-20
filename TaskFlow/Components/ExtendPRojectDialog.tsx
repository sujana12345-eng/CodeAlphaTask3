import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GetProjectsOutputType, updateProject } from 'zite-endpoints-sdk';
import { toast } from 'sonner';

type ProjectType = GetProjectsOutputType['projects'][0];

interface ExtendProjectDialogProps {
  project: ProjectType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectUpdated: () => void;
}

export default function ExtendProjectDialog({ project, open, onOpenChange, onProjectUpdated }: ExtendProjectDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    if (project && open) {
      setFormData({
        startDate: project.startDate || '',
        endDate: project.endDate || ''
      });
    }
  }, [project, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    setLoading(true);
    
    try {
      await updateProject({
        projectId: project.id,
        startDate: formData.startDate,
        endDate: formData.endDate
      });
      
      toast.success('Project dates updated successfully!');
      onOpenChange(false);
      onProjectUpdated();
    } catch (error) {
      toast.error('Failed to update project dates');
    } finally {
      setLoading(false);
    }
  };

  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Extend Project Dates</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Dates'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
