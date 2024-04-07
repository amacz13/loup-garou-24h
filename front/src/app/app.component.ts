import { NgFor } from '@angular/common';
import { HttpClientModule } from "@angular/common/http";
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from "@angular/router";
import { NgxSpinnerModule } from 'ngx-spinner';

interface Player {
  name: string;
  image: string;
}

@Component({
  standalone:true,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [FormsModule, NgFor, NgxSpinnerModule, RouterOutlet, HttpClientModule]
})
export class AppComponent {}

