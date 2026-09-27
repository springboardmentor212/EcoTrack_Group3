import { LandingPage } from './pages/landing-page/landing-page';

import { ForgotPassword } from './pages/forgot-password/forgot-password';

import { Routes } from '@angular/router';

import { Profile } from './profile/profile';

import { Register } from './pages/register/register';

import { ResetPassword } from './pages/reset-password/reset-password';

import { Dashboard } from './pages/dashboard/dashboard';

import { TrackActivity } from './track-activity/track-activity';

import { CarbonTracking } from './carbon-tracking/carbon-tracking';

import { Goals } from './pages/goals/goals';

import { Login } from './pages/login/login';

import { Challenges } from './pages/challenges/challenges';

import { Rewards } from './pages/rewards/rewards';
import { Report } from './pages/report/report';


export const routes: Routes = [

  // =========================
  // LANDING PAGE
  // =========================
  {
    path: '',
    component: LandingPage
  },

  // =========================
  // LOGIN
  // =========================
  {
    path: 'login',
    component: Login
  },

  // =========================
  // REGISTRATION
  // =========================
  {
    path: 'register',
    component: Register
  },

  // =========================
  // DASHBOARD
  // =========================
  {
    path: 'dashboard',
    component: Dashboard
  },

  // =========================
  // RESET PASSWORD
  // =========================
  {
    path: 'reset-password',
    component: ResetPassword
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
  // REWARDS
  // =========================
  {
    path: 'rewards',
    component: Rewards
  },


  {
  path: 'report',
  component: Report
},

  // =========================
  // PROFILE
  // =========================
  {
    path: 'profile',
    component: Profile
  },

  // =========================
  // FORGOT PASSWORD
  // =========================
  {
    path: 'forgot-password',
    component: ForgotPassword
  },

  // =========================
  // UNKNOWN URL
  // =========================
  {
    path: '**',
    redirectTo: ''
  }

];