import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { BlogCommentCreate } from '../../../models/blog-comment/blog-comment-create.model';
import { BlogCommentService } from '../../../services/blog-comment.service';
import { BlogCommentViewModel } from '../../../models/blog-comment/blog-comment-view-model.model';
import { BlogComment } from '../../../models/blog-comment/blog-comment.model';

@Component({
    selector: 'app-comment-box',
    templateUrl: './comment-box.component.html',
    styleUrls: ['./comment-box.component.css'],
})
export class CommentBoxComponent implements OnInit {
    @Input() comment!: BlogCommentViewModel;

    @Output() commentSaved = new EventEmitter<BlogComment>();

    @ViewChild('commentForm') commentForm?: NgForm;

    constructor(
        private blogCommentService: BlogCommentService,
        private toastr: ToastrService
    ) {}

    ngOnInit(): void {
        throw new Error('Method not implemented.');
    }

    resetComment(): void {
        this.commentForm?.reset();
    }

    onSubmit(): void {
        const blogCommentCreate: BlogCommentCreate = {
            blogCommentId: this.comment.blogCommentId,
            parentBlogCommentId: this.comment.parentBlogCommentId,
            blogId: this.comment.blogId,
            content: this.comment.content,
        };

        this.blogCommentService
            .create(blogCommentCreate)
            .subscribe((blogComment) => {
                this.commentSaved.emit(blogComment);
                this.resetComment();
                this.toastr.info('Comment saved');
            });
    }
}
