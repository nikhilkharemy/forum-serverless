import { Directive, HostListener, HostBinding } from '@angular/core';

@Directive({
  selector: '[appdropdown]'
})

export class DropdownDirective {

  @HostBinding('class.show-menu') isOpen = false;

  @HostListener('click') toggleOpen() {
    this.isOpen = !this.isOpen;
  }
}
