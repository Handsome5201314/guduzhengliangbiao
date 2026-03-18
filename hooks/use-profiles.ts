'use client';

import { useState, useEffect } from 'react';

export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  basicInfo: string;
  createdAt: number;
}

export interface AssessmentResult {
  id: string;
  profileId: string;
  scaleId?: string;
  date: number;
  answers: Record<number, number>;
  score: number;
}

export function useProfiles() {
  const [profiles, setProfiles] = useState<ChildProfile[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('child_profiles');
      if (stored) {
        try { return JSON.parse(stored); } catch (e) { return []; }
      }
    }
    return [];
  });
  
  const [results, setResults] = useState<AssessmentResult[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('assessment_results');
      if (stored) {
        try { return JSON.parse(stored); } catch (e) { return []; }
      }
    }
    return [];
  });
  
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Small timeout to avoid synchronous setState in effect warning
    const timer = setTimeout(() => setIsLoaded(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const saveProfile = (profile: ChildProfile) => {
    const newProfiles = profiles.find(p => p.id === profile.id)
      ? profiles.map(p => p.id === profile.id ? profile : p)
      : [...profiles, profile];
    setProfiles(newProfiles);
    localStorage.setItem('child_profiles', JSON.stringify(newProfiles));
  };

  const deleteProfile = (id: string) => {
    const newProfiles = profiles.filter(p => p.id !== id);
    setProfiles(newProfiles);
    localStorage.setItem('child_profiles', JSON.stringify(newProfiles));
  };

  const saveResult = (result: AssessmentResult) => {
    const newResults = [...results, result];
    setResults(newResults);
    localStorage.setItem('assessment_results', JSON.stringify(newResults));
  };

  return { profiles, results, saveProfile, deleteProfile, saveResult, isLoaded };
}
