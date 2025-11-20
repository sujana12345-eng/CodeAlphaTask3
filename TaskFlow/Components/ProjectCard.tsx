import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Calendar, FolderKanban, MoreVertical, Edit, Clock, Trash2 } from 'lucide-react';
import { GetProjectsOutputType } from 'zite-endpoints-sdk';

type ProjectType = GetProjectsOutputType['projects'][0];

interface ProjectCardProps {
  project: ProjectType;
  onSelect: (project: ProjectType) => void;
  onEdit: (project: ProjectType) => void;
  onExtend: (project: ProjectType) => void;
  onDelete: (project: ProjectType) => void;
}

export default function ProjectCard({ project, onSelect, onEdit, onExtend, onDelete }: ProjectCardProps) {
  const handleMenuAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <Card className="hover:border-primary transition-colors cursor-pointer" onClick={() => onSelect(project)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-1">
            <FolderKanban className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{project.projectName}</CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => handleMenuAction(e, () => onEdit(project))}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => handleMenuAction(e, () => onExtend(project))}>
                <Clock className="h-4 w-4 mr-2" />
                Extend
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => handleMenuAction(e, () => onDelete(project))}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {project.description && (
          <CardDescription className="line-clamp-2">{project.description}</CardDescription>
        )}
      </CardHeader>
      {(project.startDate || project.endDate) && (
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {project.startDate && new Date(project.startDate).toLocaleDateString()}
            {project.startDate && project.endDate && ' - '}
            {project.endDate && new Date(project.endDate).toLocaleDateString()}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
