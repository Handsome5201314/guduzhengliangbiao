'use client';

import { useState } from 'react';
import { useProfiles, ChildProfile, AssessmentResult } from '@/hooks/use-profiles';
import ProfileList from '@/components/ProfileList';
import ProfileForm from '@/components/ProfileForm';
import Questionnaire from '@/components/Questionnaire';
import AssessmentReport from '@/components/AssessmentReport';
import TimelineView from '@/components/TimelineView';
import Settings from '@/components/Settings';
import { Loader2, Settings as SettingsIcon } from 'lucide-react';

export default function Home() {
  const { profiles, results, saveProfile, deleteProfile, saveResult, isLoaded } = useProfiles();
  const [currentView, setCurrentView] = useState<'list' | 'form' | 'assessment' | 'report' | 'timeline' | 'settings'>('list');
  const [editingProfile, setEditingProfile] = useState<ChildProfile | null>(null);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [activeScaleId, setActiveScaleId] = useState<string | null>(null);
  const [currentResult, setCurrentResult] = useState<AssessmentResult | null>(null);

  if (!isLoaded) {
    return (
      <div className="min-h-[100dvh] bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  const handleAddProfile = () => {
    setEditingProfile(null);
    setCurrentView('form');
  };

  const handleEditProfile = (profile: ChildProfile) => {
    setEditingProfile(profile);
    setCurrentView('form');
  };

  const handleSaveProfile = (profile: ChildProfile) => {
    saveProfile(profile);
    setCurrentView('list');
  };

  const handleSelectProfile = (profileId: string, scaleId: string) => {
    setActiveProfileId(profileId);
    setActiveScaleId(scaleId);
    setCurrentView('assessment');
  };

  const handleViewReport = (id: string) => {
    setActiveProfileId(id);
    const profileResults = results.filter(r => r.profileId === id);
    if (profileResults.length > 0) {
      // Get the most recent result
      const latestResult = profileResults.reduce((latest, current) =>
        current.date > latest.date ? current : latest
      );
      setCurrentResult(latestResult);
      setCurrentView('report');
    }
  };

  const handleViewTimeline = (profileId: string) => {
    setActiveProfileId(profileId);
    setCurrentView('timeline');
  };

  const handleViewResultFromTimeline = (result: AssessmentResult) => {
    const profile = profiles.find(p => p.id === result.profileId);
    if (profile) {
      setActiveProfileId(profile.id);
      setCurrentResult(result);
      setCurrentView('report');
    }
  };

  const handleAssessmentComplete = (answers: Record<number, number>, score: number) => {
    if (activeProfileId && activeScaleId) {
      const newResult = {
        id: Date.now().toString(),
        profileId: activeProfileId,
        scaleId: activeScaleId,
        date: Date.now(),
        answers,
        score
      };
      saveResult(newResult);
      setCurrentResult(newResult);
      setCurrentView('report');
    }
  };

  const activeProfile = profiles.find(p => p.id === activeProfileId);

  return (
    <main className="min-h-[100dvh] bg-slate-50">
      {currentView === 'list' && (
        <ProfileList
          profiles={profiles}
          results={results}
          onAdd={handleAddProfile}
          onEdit={handleEditProfile}
          onDelete={deleteProfile}
          onSelect={handleSelectProfile}
          onViewReport={handleViewReport}
          onViewTimeline={handleViewTimeline}
          onOpenSettings={() => setCurrentView('settings')}
        />
      )}
      
      {currentView === 'form' && (
        <ProfileForm 
          initialData={editingProfile}
          onSave={handleSaveProfile}
          onCancel={() => setCurrentView('list')}
        />
      )}

      {currentView === 'assessment' && activeProfile && activeScaleId && (
        <Questionnaire 
          profile={activeProfile}
          scaleId={activeScaleId}
          onComplete={handleAssessmentComplete}
          onCancel={() => setCurrentView('list')}
        />
      )}

      {currentView === 'report' && activeProfile && currentResult && (
        <AssessmentReport
          profile={activeProfile}
          result={currentResult}
          allResults={results.filter(r => r.profileId === activeProfile.id)}
          onClose={() => setCurrentView('list')}
          onViewTimeline={() => setCurrentView('timeline')}
        />
      )}

      {currentView === 'timeline' && activeProfile && (
        <TimelineView
          profile={activeProfile}
          results={results.filter(r => r.profileId === activeProfile.id)}
          onViewResult={handleViewResultFromTimeline}
          onBack={() => setCurrentView('list')}
        />
      )}

      {currentView === 'settings' && (
        <Settings onBack={() => setCurrentView('list')} />
      )}
    </main>
  );
}
