import { useState, useEffect } from 'react';
import { useAuth } from 'zite-auth-sdk';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { LogOut, Loader2 } from 'lucide-react';
import { getProjects, GetProjectsOutputType, deleteProject } from 'zite-endpoints-sdk';
import ProjectCard from './components/ProjectCard';
import CreateProjectDialog from './components/CreateProjectDialog';
import EditProjectDialog from './components/EditProjectDialog';
import ExtendProjectDialog from './components/ExtendProjectDialog';
import ProjectBoard from './components/ProjectBoard';
import { toast } from 'sonner';

type ProjectType = GetProjectsOutputType['projects'][0];

export default function App() {
  const { user, isLoading, loginWithRedirect, logout } = useAuth();
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectType | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [extendDialogOpen, setExtendDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<ProjectType | null>(null);
  const [projectToEdit, setProjectToEdit] = useState<ProjectType | null>(null);
  const [projectToExtend, setProjectToExtend] = useState<ProjectType | null>(null);

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const result = await getProjects({});
      setProjects(result.projects);
    } catch (error) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (project: ProjectType) => {
    setProjectToEdit(project);
    setEditDialogOpen(true);
  };

  const handleExtendClick = (project: ProjectType) => {
    setProjectToExtend(project);
    setExtendDialogOpen(true);
  };

  const handleDeleteClick = (project: ProjectType) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;
    try {
      await deleteProject({ projectId: projectToDelete.id });
      toast.success('Project deleted successfully');
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
      loadProjects();
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    loginWithRedirect({ redirectUrl: window.location.href });
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">TaskFlow</h1>
              <p className="text-sm text-muted-foreground">Collaborative Project Management</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">{user.userName}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => logout()}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {selectedProject ? (
          <ProjectBoard project={selectedProject} onBack={() => setSelectedProject(null)} />
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold">Projects</h2>
                <p className="text-muted-foreground mt-1">
                  Manage your team projects and tasks
                </p>
              </div>
              <CreateProjectDialog onProjectCreated={loadProjects} />
            </div>

            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first project to get started
                </p>
                <CreateProjectDialog onProjectCreated={loadProjects} />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onSelect={setSelectedProject}
                    onEdit={handleEditClick}
                    onExtend={handleExtendClick}
                    onDelete={handleDeleteClick}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <EditProjectDialog
        project={projectToEdit}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onProjectUpdated={loadProjects}
      />

      <ExtendProjectDialog
        project={projectToExtend}
        open={extendDialogOpen}
        onOpenChange={setExtendDialogOpen}
        onProjectUpdated={loadProjects}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{projectToDelete?.projectName}"? This will also delete all tasks associated with this project. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
