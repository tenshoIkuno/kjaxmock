import React from 'react';
import type { Tour, TourStep } from './tourTypes';

type TourContextValue = {
  activeTour: Tour | null;
  currentIndex: number;
  isActive: boolean;
  startTour: (tour: Tour) => void;
  next: () => void;
  prev: () => void;
  skip: () => void;
  complete: () => void;
  setCurrentIndex: (i: number) => void;
};

const TourContext = React.createContext<TourContextValue | undefined>(
  undefined,
);

export const useTour = () => {
  const ctx = React.useContext(TourContext);
  if (!ctx) throw new Error('useTour must be used within TourProvider');
  return ctx;
};

export const TourProvider: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const [activeTour, setActiveTour] = React.useState<Tour | null>(null);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isActive, setIsActive] = React.useState(false);

  const startTour = (tour: Tour) => {
    setActiveTour(tour);
    setCurrentIndex(0);
    setIsActive(true);
  };

  const next = () => {
    if (!activeTour) return;
    setCurrentIndex((i) => Math.min(i + 1, activeTour.steps.length - 1));
  };

  const prev = () => setCurrentIndex((i) => Math.max(0, i - 1));

  const skip = () => {
    setIsActive(false);
    setActiveTour(null);
    setCurrentIndex(0);
  };

  const complete = () => {
    // mark completed (could persist to user prefs later)
    setIsActive(false);
    setActiveTour(null);
    setCurrentIndex(0);
  };

  const value: TourContextValue = {
    activeTour,
    currentIndex,
    isActive,
    startTour,
    next,
    prev,
    skip,
    complete,
    setCurrentIndex,
  };

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
};
