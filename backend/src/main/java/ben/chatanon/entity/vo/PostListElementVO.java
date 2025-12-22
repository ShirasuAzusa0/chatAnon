package ben.chatanon.entity.vo;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
public class PostListElementVO {

    private int postId;
    private String title;

    private AuthorVO author;
    private List<TagVO> tags;

    private LocalDateTime createdAt;
    private LocalDateTime lastCommentedAt;

    private LastCommentedUserVO lastCommentedUser;

    private int commentsCount;

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
    public static class LastCommentedUserVO {
        private int id;
        private String userName;
    }
}
