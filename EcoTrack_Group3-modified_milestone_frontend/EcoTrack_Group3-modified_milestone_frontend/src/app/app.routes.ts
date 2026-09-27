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

import { authGuard } from './guards/auth.guard';

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
  // DASHBOARD 🔐
  // =========================
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard]
  },

  // =========================
  // RESET PASSWORD
  // =========================
  {
    path: 'reset-password',
    component: ResetPassword
  },

  // =========================
  // TRACK ACTIVITY 🔐
  // =========================
  {
    path: 'track-activity',
    component: TrackActivity,
    canActivate: [authGuard]
  },

  // =========================
  // CARBON FOOTPRINT 🔐
  // =========================
  {
    path: 'carbon-footprint',
    component: CarbonTracking,
    canActivate: [authGuard]
  },

  // =========================
  // GOALS 🔐
  // =========================
  {
    path: 'goals',
    component: Goals,
    canActivate: [authGuard]
  },

  // =========================
  // CHALLENGES 🔐
  // =========================
  {
    path: 'challenges',
    component: Challenges,
    canActivate: [authGuard]
  },

  // =========================
  // PROFILE 🔐
  // =========================
  {
    path: 'profile',
    component: Profile,
    canActivate: [authGuard]
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