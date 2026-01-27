export type RequiredAction =
  | { type: 'click'; selector: string }
  | { type: 'custom'; eventName: string };

export type TourStep = {
  id: string;
  title: string;
  description: string;
  // CSS selector of target element. If null, center on screen.
  targetSelector?: string | null;
  // preferred placement for the popover: top, right, bottom, left
  placement?: 'top' | 'right' | 'bottom' | 'left';
  // optional action user must perform (e.g., click target)
  requiredAction?: RequiredAction | null;
};

export type Tour = {
  id: string;
  title: string;
  steps: TourStep[];
};
