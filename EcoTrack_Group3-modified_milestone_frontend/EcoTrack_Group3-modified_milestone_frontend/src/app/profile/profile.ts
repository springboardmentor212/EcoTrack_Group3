import {
  Component,
  OnInit
} from '@angular/core';

import { AuthService } from '../services/auth.service';


@Component({

  selector: 'app-profile',

  standalone: true,

  imports: [],

  templateUrl: './profile.html',

  styleUrl: './profile.css'

})


export class Profile implements OnInit {


  userName = 'User';

  userEmail = '';

  ecoPoints = 0;

  currentStreak = 0;

  challengesCompleted = 0;


  constructor(
    private authService: AuthService
  ) {}


  ngOnInit(): void {

    const user =
      this.authService.getUser();


    if (!user) {

      return;

    }


    this.userName =
      user.name || 'User';


    this.userEmail =
      user.email || '';


    this.ecoPoints =
      Number(
        user.totalPoints || 0
      );


    this.currentStreak =
      Number(
        user.currentStreak || 0
      );

  }

}