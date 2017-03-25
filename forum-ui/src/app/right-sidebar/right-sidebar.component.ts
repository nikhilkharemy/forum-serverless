import { Component, OnInit } from '@angular/core';
import { HomeComponent } from '../home/home.component';

@Component({
  selector: 'app-right-sidebar',
  templateUrl: './right-sidebar.component.html',
  styleUrls: ['./right-sidebar.component.scss']
})
export class RightSidebarComponent implements OnInit {

  constructor(private homeComp: HomeComponent) { }

  ngOnInit() {
  }
  _search(e){
  	this.homeComp._search(e.target.value);
  }

}
