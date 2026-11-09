/**
 * @file RailFoot.tsx
 * @description The foot of the rail in one order for every suite app, top to bottom: the sync status, Settings, then the account last. Each app fills the slots it has (Yard has no sync and puts Terminal beside Settings), so the foot reads the same in Drift, Harbour, Lighthouse and Yard. Pass it as the Rail's `footer`.
 * Used by: the suite apps' rails.
 */
import type { ReactNode } from 'react';

export interface RailFootProps {
  /** The sync status, a badge or a button; left out by apps that do not sync. */
  sync?: ReactNode;
  /** The Settings link, and anything that belongs beside it (Yard's Terminal). */
  settings?: ReactNode;
  /** The signed-in account, always last. */
  account?: ReactNode;
}

export function RailFoot({ sync, settings, account }: RailFootProps) {
  return (
    <>
      {sync}
      {settings}
      {account}
    </>
  );
}
