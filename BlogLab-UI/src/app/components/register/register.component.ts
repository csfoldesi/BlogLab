/* eslint-disable @typescript-eslint/unbound-method */
import { Component, OnInit } from '@angular/core';
import {
    AbstractControl,
    FormBuilder,
    FormGroup,
    ValidationErrors,
    ValidatorFn,
    Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ApplicationUserCreate } from '../../models/account/application-user-create.model';
import { AccountService } from '../../services/account.service';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
    registerForm!: FormGroup;

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
        this.registerForm = this.formBuilder.group(
            {
                fullname: [
                    null,
                    [Validators.minLength(10), Validators.maxLength(30)],
                ],
                username: [
                    null,
                    [
                        Validators.required,
                        Validators.minLength(5),
                        Validators.maxLength(20),
                    ],
                ],
                email: [
                    null,
                    [
                        Validators.required,
                        Validators.pattern(
                            /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i
                        ),
                        Validators.maxLength(30),
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
                confirmPassword: [null, [Validators.required]],
            },
            {
                validators: this.matchValue,
            }
        );
    }

    formHasError(error: string): boolean {
        return this.registerForm.hasError(error);
    }

    isTouched(field: string): boolean {
        return !!this.registerForm.get(field)?.touched;
    }

    hasErrors(field: string): boolean {
        return !!this.registerForm.get(field)?.errors;
    }

    hasError(field: string, error: string): boolean {
        return !!this.registerForm.get(field)?.hasError(error);
    }

    matchValue: ValidatorFn = (
        fg: AbstractControl
    ): ValidationErrors | null => {
        const password = fg.get('password')?.value as string;
        const confirmPassword = fg.get('confirmPassword')?.value as string;
        return password === confirmPassword ? null : { isMatching: true };
    };

    onSubmit(): void {
        const applicationUserCreate: ApplicationUserCreate =
            new ApplicationUserCreate(
                this.registerForm.get('username')?.value as string,
                this.registerForm.get('password')?.value as string,
                this.registerForm.get('email')?.value as string,
                this.registerForm.get('fullname')?.value as string
            );

        this.accountService.register(applicationUserCreate).subscribe(() => {
            this.router.navigate(['/dashboard']);
        });
    }
}
