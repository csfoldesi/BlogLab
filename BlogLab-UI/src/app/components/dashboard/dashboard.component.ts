import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Blog } from '../../models/blog/blog.model';
import { AccountService } from '../../services/account.service';
import { BlogService } from '../../services/blog.service';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
    userBlogs!: Blog[];

    constructor(
        private blogService: BlogService,
        private router: Router,
        private toastr: ToastrService,
        private accountService: AccountService
    ) {}

    ngOnInit(): void {
        this.userBlogs = [];

        const currentApplicationUserId = this.accountService.currentUserValue
            ?.applicationUserId as number;

        this.blogService
            .getByApplicationUserId(currentApplicationUserId)
            .subscribe((userBlogs) => {
                this.userBlogs = userBlogs;
            });
    }

    confirmDelete(blog: Blog): void {
        blog.deleteConfirm = true;
    }

    cancelDeleteConfirm(blog: Blog): void {
        blog.deleteConfirm = false;
    }

    deleteConfirmed(blog: Blog): void {
        this.blogService.delete(blog.blogId).subscribe(() => {
            this.userBlogs = this.userBlogs.filter(
                (b) => b.blogId !== blog.blogId
            );

            this.toastr.info('Blog deleted');
        });
    }

    editBlog(blogId: number): void {
        this.router.navigate([`/dashboard/${blogId}`]);
    }

    createBlog(): void {
        this.router.navigate(['/dashboard/-1']);
    }
}
