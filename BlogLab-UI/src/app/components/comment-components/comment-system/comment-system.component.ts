import { Component, Input, OnInit } from '@angular/core';
import { BlogCommentService } from '../../../services/blog-comment.service';
import { AccountService } from '../../../services/account.service';
import { BlogCommentViewModel } from '../../../models/blog-comment/blog-comment-view-model.model';
import { BlogComment } from '../../../models/blog-comment/blog-comment.model';

@Component({
    selector: 'app-comment-system',
    templateUrl: './comment-system.component.html',
    styleUrls: ['./comment-system.component.css'],
})
export class CommentSystemComponent implements OnInit {
    @Input() blogId!: number;

    standaloneComment?: BlogCommentViewModel;

    blogComments: BlogComment[] = [];

    blogCommentViewModels: BlogCommentViewModel[] = [];

    constructor(
        private blogCommentService: BlogCommentService,
        public accountService: AccountService
    ) {}

    ngOnInit(): void {
        this.blogCommentService
            .getAll(this.blogId)
            .subscribe((blogComments) => {
                if (this.accountService.isLoggedIn()) {
                    this.initComment(
                        this.accountService.currentUserValue?.username || ''
                    );
                }

                this.blogComments = blogComments;
                this.blogCommentViewModels = [];

                this.blogComments.forEach((blogComment) => {
                    if (!blogComment.parentBlogCommentId) {
                        this.findCommentReplies(
                            this.blogCommentViewModels,
                            blogComment
                        );
                    }
                });
            });
    }

    initComment(username: string): void {
        this.standaloneComment = {
            parentBlogCommentId: null,
            blogCommentId: -1,
            blogId: this.blogId,
            content: '',
            username,
            publishDate: null,
            updateDate: null,
            isEditable: false,
            deleteConfirm: false,
            isReplying: false,
            comments: [],
        };
    }

    findCommentReplies(
        blogCommentViewModels: BlogCommentViewModel[],
        blogComment: BlogComment
    ): void {
        const newComments: BlogCommentViewModel[] = [];

        const commentViewModel: BlogCommentViewModel = {
            parentBlogCommentId: blogComment.parentBlogCommentId || null,
            blogCommentId: blogComment.blogCommentId,
            blogId: blogComment.blogId,
            content: blogComment.content,
            username: blogComment.username,
            publishDate: blogComment.publishDate,
            updateDate: blogComment.updateDate,
            isEditable: false,
            deleteConfirm: false,
            isReplying: false,
            comments: newComments,
        };

        blogCommentViewModels.push(commentViewModel);

        this.blogComments.forEach((bc) => {
            if (bc.parentBlogCommentId === blogComment.blogCommentId) {
                this.findCommentReplies(newComments, bc);
            }
        });
    }

    onCommentSaved(blogComment: BlogComment): void {
        const commentViewModel: BlogCommentViewModel = {
            parentBlogCommentId: blogComment.parentBlogCommentId || null,
            blogCommentId: blogComment.blogCommentId,
            blogId: blogComment.blogId,
            content: blogComment.content,
            username: blogComment.username,
            publishDate: blogComment.publishDate,
            updateDate: blogComment.updateDate,
            isEditable: false,
            deleteConfirm: false,
            isReplying: false,
            comments: [],
        };

        this.blogCommentViewModels = [
            commentViewModel,
            ...this.blogCommentViewModels,
        ];
    }
}
