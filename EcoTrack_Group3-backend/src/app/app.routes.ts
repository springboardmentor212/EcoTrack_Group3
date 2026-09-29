import { ForgotPassword } from './pages/forgot-password/forgot-password';
import { Routes } from '@angular/router';
import { Profile } from './profile/profile';

import { Dashboard } from './pages/dashboard/dashboard';
import { TrackActivity } from './track-activity/track-activity';
import { CarbonTracking } from './carbon-tracking/carbon-tracking';
import { Goals } from './pages/goals/goals';
import { Login } from './pages/login/login';
import { Challenges } from './pages/challenges/challenges';

export const routes: Routes = [

  // =========================
  // LOGIN
  // =========================
  {
   
  path: '',
  component: Login
  },

  // =========================
  // DASHBOARD
  // =========================
  {
    path: 'dashboard',
    component: Dashboard
  },

  // =========================
  // TRACK ACTIVITY
  // =========================
  {
    path: 'track-activity',
    component: TrackActivity
  },

  // =========================
  // CARBON FOOTPRINT
  // =========================
  {
    path: 'carbon-footprint',
    component: CarbonTracking
  },

  // =========================
  // GOALS
  // =========================
  {
    path: 'goals',
    component: Goals
  },

  // =========================
  // CHALLENGES
  // =========================
  {
    path: 'challenges',
    component: Challenges
  },
  // =========================
// PROFILE
// =========================
{
  path: 'profile',
  component: Profile
},

  // =========================
  // UNKNOWN URL
  // =========================
  { path: 'forgot-password', component: ForgotPassword },
  {
    path: '**',
    redirectTo: ''
  }

];