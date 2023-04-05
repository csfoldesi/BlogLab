import { Component, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BlogCommentService } from '../../../services/blog-comment.service';
import { AccountService } from '../../../services/account.service';
import { BlogCommentViewModel } from '../../../models/blog-comment/blog-comment-view-model.model';
import { BlogComment } from '../../../models/blog-comment/blog-comment.model';

@Component({
    selector: 'app-comments',
    templateUrl: './comments.component.html',
    styleUrls: ['./comments.component.css'],
})
export class CommentsComponent {
    @Input() comments: BlogCommentViewModel[] = [];

    constructor(
        public accountService: AccountService,
        private blogCommentService: BlogCommentService,
        private toastr: ToastrService
    ) {}

    editComment(comment: BlogCommentViewModel): void {
        comment.isEditable = true;
    }

    showDeleteConfirm(comment: BlogCommentViewModel): void {
        comment.deleteConfirm = true;
    }

    cancelDeleteConfirm(comment: BlogCommentViewModel): void {
        comment.deleteConfirm = false;
    }

    deleteConfirm(comment: BlogCommentViewModel): void {
        this.blogCommentService.delete(comment.blogCommentId).subscribe(() => {
            this.comments = this.comments.filter(
                (c) => c.blogCommentId !== comment.blogCommentId
            );
            this.toastr.info('Blog comment deleted');
        });
    }

    replyComment(comment: BlogCommentViewModel): void {
        const replyComment: BlogCommentViewModel = {
            parentBlogCommentId: comment.blogCommentId,
            blogCommentId: -1,
            blogId: comment.blogId,
            content: '',
            username: this.accountService.currentUserValue?.username || '',
            publishDate: new Date(),
            updateDate: new Date(),
            isEditable: false,
            deleteConfirm: false,
            isReplying: true,
            comments: [],
        };

        comment.comments.push(replyComment);
    }

    onCommentSaved(
        blogComment: BlogComment,
        comment: BlogCommentViewModel
    ): void {
        comment.blogCommentId = blogComment.blogCommentId;
        comment.parentBlogCommentId = blogComment.parentBlogCommentId || null;
        comment.blogId = blogComment.blogId;
        comment.content = blogComment.content;
        comment.publishDate = blogComment.publishDate;
        comment.updateDate = blogComment.updateDate;
        comment.username = blogComment.username;
        comment.isEditable = false;
        comment.isReplying = false;
    }
}
