import ProjectBrief from './ProjectBrief';
import ProjectAssets from './ProjectAssets';

export default function DocumentsTab({
  projectId,
  projectBrief,
  setProjectBrief,
  isEditingBrief,
  setIsEditingBrief,
  onSaveBrief,
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <ProjectBrief
        projectBrief={projectBrief}
        setProjectBrief={setProjectBrief}
        isEditingBrief={isEditingBrief}
        setIsEditingBrief={setIsEditingBrief}
        onSave={onSaveBrief}
      />
      
      <ProjectAssets projectId={projectId}/>
    
    </div>
  );
}
