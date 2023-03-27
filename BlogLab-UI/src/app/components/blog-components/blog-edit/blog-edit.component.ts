/* eslint-disable @typescript-eslint/unbound-method */
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';
import { ToastrService } from 'ngx-toastr';
import { BlogCreate } from '../../../models/blog/blog-create.model';
import { Blog } from '../../../models/blog/blog.model';
import { Photo } from '../../../models/photo/photo-model';
import { BlogService } from '../../../services/blog.service';
import { PhotoService } from '../../../services/photo.service';

@Component({
    selector: 'app-blog-edit',
    templateUrl: './blog-edit.component.html',
    styleUrls: ['./blog-edit.component.css'],
})
export class BlogEditComponent implements OnInit {
    blogForm!: FormGroup;

    confirmImageDelete = false;

    userPhotos: Photo[] = [];

    constructor(
        private route: ActivatedRoute,
        private formBuilder: FormBuilder,
        private blogService: BlogService,
        private photoService: PhotoService,
        private toastr: ToastrService
    ) {}

    ngOnInit(): void {
        const blogId = parseInt(
            this.route.snapshot.paramMap.get('id') as string
        );

        this.blogForm = this.formBuilder.group({
            blogId: [blogId],
            title: [
                '',
                [
                    Validators.required,
                    Validators.minLength(10),
                    Validators.maxLength(50),
                ],
            ],
            content: [
                '',
                [
                    Validators.required,
                    Validators.minLength(300),
                    Validators.maxLength(5000),
                ],
            ],
            photoDescription: [''],
            photoId: [null],
        });

        this.photoService.getByApplicationUserID().subscribe((userPhotos) => {
            this.userPhotos = userPhotos;
        });

        if (!!blogId && blogId !== -1) {
            this.blogService
                .get(blogId)
                .subscribe((blog) => this.updateForm(blog));
        }
    }

    getPhoto(photId: number): Photo | null {
        return (
            this.userPhotos.find((photo) => photo.photoId === photId) ?? null
        );
    }

    isTouched(field: string): boolean {
        return !!this.blogForm.get(field)?.touched;
    }

    hasErrors(field: string): boolean {
        return !!this.blogForm.get(field)?.errors;
    }

    hasError(field: string, error: string): boolean {
        return !!this.blogForm.get(field)?.hasError(error);
    }

    isNew(): boolean {
        return parseInt(this.blogForm.get('blogId')?.value as string) === -1;
    }

    detachPhoto() {
        this.blogForm.patchValue({
            photoId: null,
            photoDescription: null,
        });
    }

    updateForm(blog: Blog): void {
        const photoDescription = blog.photoId
            ? this.getPhoto(blog.photoId)?.description
            : null;

        this.blogForm.patchValue({
            blogId: blog.blogId,
            title: blog.title,
            content: blog.content,
            photoId: blog.photoId,
            photoDescription,
        });
    }

    onSelect(event: TypeaheadMatch): void {
        const chosenPhoto: Photo = event.item as Photo;

        this.blogForm.patchValue({
            photoId: chosenPhoto.photoId,
            photoDescription: chosenPhoto.description,
        });
    }

    onSubmit(): void {
        const blogCreate: BlogCreate = new BlogCreate(
            this.blogForm.get('blogId')?.value as number,
            this.blogForm.get('title')?.value as string,
            this.blogForm.get('content')?.value as string,
            this.blogForm.get('photoId')?.value as number
        );

        this.blogService.create(blogCreate).subscribe((createBlog) => {
            this.updateForm(createBlog);
            this.toastr.info('Blog saved');
        });
    }
}
