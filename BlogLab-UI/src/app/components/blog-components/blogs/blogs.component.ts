import { Component, OnInit } from '@angular/core';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { BlogPaging } from '../../../models/blog/blog-paging.model';
import { BlogService } from '../../../services/blog.service';
import { Blog } from '../../../models/blog/blog.model';
import { PagedResult } from '../../../models/blog/paged-result.model';

@Component({
    selector: 'app-blogs',
    templateUrl: './blogs.component.html',
    styleUrls: ['./blogs.component.css'],
})
export class BlogsComponent implements OnInit {
    pagedBlogResult?: PagedResult<Blog>;

    constructor(private blogService: BlogService) {}

    ngOnInit(): void {
        this.loadPagedBlogResult(1, 6);
    }

    pageChanged(event: PageChangedEvent): void {
        this.loadPagedBlogResult(event.page, event.itemsPerPage);
    }

    loadPagedBlogResult(page: number, itemsPerPage: number): void {
        const blogPaging = new BlogPaging(page, itemsPerPage);

        this.blogService.getAll(blogPaging).subscribe((result) => {
            this.pagedBlogResult = result;
        });
    }
}
