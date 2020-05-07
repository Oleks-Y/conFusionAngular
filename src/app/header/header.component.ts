import { Component, OnInit } from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material'
import { registerContentQuery } from '@angular/core/src/render3/instructions';
import { LoginComponent } from '../login/login.component';


 @Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  constructor( public dialog: MatDialog) { }

  ngOnInit() {
  }

  openLoginForm(){
    this.dialog.open(LoginComponent, {width:'500px', height: '450px'});
  }

}
