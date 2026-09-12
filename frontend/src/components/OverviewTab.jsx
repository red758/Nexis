import AiCopilot from './AiCopilot';
import ProjectHealth from './ProjectHealth';
import ActivityFeed from './ActivityFeed';

export default function OverviewTab({
  aiPrompt,
  setAiPrompt,
  isAiLoading,
  onAiSubmit,
  queryType,
  queryResults,
  onQueryChange,
  notifications,
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <AiCopilot
          aiPrompt={aiPrompt}
          setAiPrompt={setAiPrompt}
          isAiLoading={isAiLoading}
          onSubmit={onAiSubmit}
        />
        <ProjectHealth
          queryType={queryType}
          queryResults={queryResults}
          onQueryChange={onQueryChange}
        />
      </div>
      <div className="lg:col-span-1">
        <ActivityFeed notifications={notifications} />
      </div>
    </div>
  );
}
