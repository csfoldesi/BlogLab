/* eslint-disable @typescript-eslint/unbound-method */
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApplicationUserLogin } from '../../models/account/application-user-login.model';
import { AccountService } from '../../services/account.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
    loginForm!: FormGroup;

    constructor(
        private accountService: AccountService,
        private router: Router,
        private formBuilder: FormBuilder
    ) {
        if (accountService.isLoggedIn()) {
            this.router.navigate(['/dashboard']);
        }
    }

    ngOnInit(): void {
        this.loginForm = this.formBuilder.group({
            userName: [
                null,
                [
                    Validators.required,
                    Validators.minLength(5),
                    Validators.maxLength(20),
                ],
            ],
            password: [
                null,
                [
                    Validators.required,
                    Validators.minLength(10),
                    Validators.maxLength(50),
                ],
            ],
        });
    }

    isTouched(field: string): boolean {
        return !!this.loginForm.get(field)?.touched;
    }

    hasErrors(field: string): boolean {
        return !!this.loginForm.get(field)?.errors;
    }

    hasError(field: string, error: string): boolean {
        return !!this.loginForm.get(field)?.hasError(error);
    }

    onSubmit(): void {
        const applicationUserlogin: ApplicationUserLogin =
            new ApplicationUserLogin(
                this.loginForm.get('userName')?.value as string,
                this.loginForm.get('password')?.value as string
            );

        this.accountService.login(applicationUserlogin).subscribe(() => {
            this.router.navigate(['/dashboard']);
        });
    }
}
