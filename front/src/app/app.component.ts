import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {RouterOutlet} from "@angular/router";

interface Player {
  name: string;
  image: string;
}

@Component({
  standalone:true,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [FormsModule, NgFor, RouterOutlet]
})
export class AppComponent {}

