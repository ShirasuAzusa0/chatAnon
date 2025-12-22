package ben.chatanon.entity.vo;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
public class PostVO {

    private int postId;
    private String title;

    private AuthorVO author;
    private List<TagVO> tags;

    private LocalDateTime createdAt;
    private LocalDateTime lastCommentedAt;
    private int commentsCount;
    private int likesCount;
    private String content;
    private List<CommentVO> comments;
    private boolean isLiked;

    @Data
    public static class AuthorVO {
        private int id;
        private Attributes attributes;
    }

    @Data
    public static class Attributes {
        private String avatarUrl;
        private String userName;
        private String email;
    }

    @Data
    public static class TagVO {
        private int tagId;
        private String tagName;
    }

    @Data
    public static class CommentVO {
        private int commentId;
        private AuthorVO author;
        private String content;
        private LocalDateTime createdAt;
        private int likesCount;
        private boolean isLiked;
        private int repliedId;
    }
}
