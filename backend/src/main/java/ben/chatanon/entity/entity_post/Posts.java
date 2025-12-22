package ben.chatanon.entity.entity_post;

import ben.chatanon.entity.Users;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "posts")
public class Posts {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "postId")
    private int postId;

    @Column(name = "title", nullable = false, unique = true)
    private String title;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "authorId", referencedColumnName = "userId", nullable = false)
    private Users author;

    @Column(name = "createdAt", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "lastCommentedAt")
    private LocalDateTime lastCommentedAt;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lastCommentedUserId", referencedColumnName = "userId")
    private Users lastCommentedUser;

    @Column(name = "commentsCount", nullable = false)
    private int commentsCount;

    @Column(name = "likesCount", nullable = false)
    private int likesCount;

    // columnDefinition 指明数据库中对应的类型是大文本
    @Column(name = "content", nullable = false, columnDefinition = "LONGTEXT")
    private String content;

    @OneToMany(mappedBy = "post", fetch = FetchType.LAZY)
    private List<post_category> categories;

    @OneToMany(mappedBy = "post", fetch = FetchType.LAZY)
    private List<Comments> comments;
}
