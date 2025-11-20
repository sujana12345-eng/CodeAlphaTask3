import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { GetProjectsOutputType, updateProject } from 'zite-endpoints-sdk';
import { toast } from 'sonner';

type ProjectType = GetProjectsOutputType['projects'][0];

interface EditProjectDialogProps {
  project: ProjectType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectUpdated: () => void;
}

export default function EditProjectDialog({ project, open, onOpenChange, onProjectUpdated }: EditProjectDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    projectName: '',
    description: ''
  });

  useEffect(() => {
    if (project && open) {
      setFormData({
        projectName: project.projectName || '',
        description: project.description || ''
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
        projectName: formData.projectName,
        description: formData.description
      });
      
      toast.success('Project updated successfully!');
      onOpenChange(false);
      onProjectUpdated();
    } catch (error) {
      toast.error('Failed to update project');
    } finally {
      setLoading(false);
    }
  };

  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="projectName">Project Name *</Label>
            <Input
              id="projectName"
              value={formData.projectName}
              onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
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
