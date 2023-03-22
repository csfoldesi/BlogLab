import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from '../../services/account.service';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent {
    isCollapsed = true;

    constructor(
        public accountService: AccountService,
        private router: Router
    ) {}

    logout(): void {
        this.accountService.logout();
        this.router.navigate(['/']);
    }
}
