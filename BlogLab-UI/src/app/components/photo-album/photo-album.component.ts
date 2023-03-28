import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Photo } from '../../models/photo/photo-model';
import { PhotoService } from '../../services/photo.service';

@Component({
    selector: 'app-photo-album',
    templateUrl: './photo-album.component.html',
    styleUrls: ['./photo-album.component.css'],
})
export class PhotoAlbumComponent implements OnInit {
    @ViewChild('photoForm') photoForm!: NgForm;

    @ViewChild('photoUploadElement') photoUploadElement!: ElementRef;

    photos: Photo[] = [];

    photoFile: Blob | undefined;

    newPhotoDescription = '';

    constructor(
        private photoService: PhotoService,
        private toastr: ToastrService
    ) {}

    ngOnInit(): void {
        this.photoService.getByApplicationUserID().subscribe((userPhotos) => {
            this.photos = userPhotos;
        });
    }

    confirmDelete(photo: Photo): void {
        photo.deleteConfirm = true;
    }

    cancelDeleteConfirm(photo: Photo): void {
        photo.deleteConfirm = false;
    }

    deleteConfirmed(photo: Photo): void {
        this.photoService.delete(photo.photoId).subscribe(() => {
            this.photos = this.photos.filter(
                (p) => p.photoId !== photo.photoId
            );
            this.toastr.info('Photo deleted');
        });
    }

    onFileChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            const file = input.files[0];
            this.photoFile = file;
        }
    }

    onSubmit(): void {
        if (this.photoFile) {
            const formData = new FormData();
            formData.append('file', this.photoFile, this.newPhotoDescription);
            this.photoService.create(formData).subscribe((createdPhoto) => {
                this.photoForm.reset();
                const photoUploadElement = this.photoUploadElement
                    .nativeElement as HTMLInputElement;
                photoUploadElement.value = '';

                this.toastr.info('Photo uploaded');
                this.photos = [...this.photos, createdPhoto];
            });
        }
    }
}
