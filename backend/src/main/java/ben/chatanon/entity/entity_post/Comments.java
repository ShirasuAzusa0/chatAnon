package ben.chatanon.entity.entity_post;

import ben.chatanon.entity.Users;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "comments")
public class Comments {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "commentId")
    private int commentId;

    @Column(name = "content", nullable = false, columnDefinition = "LONGTEXT")
    private String content;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "authorId", referencedColumnName = "userId")
    private Users author;

    @Column(name = "createdAt", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "likesCount", nullable = false)
    private int likesCount;

    @Column(name = "repliedId", nullable = false)
    private int repliedId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "postId", referencedColumnName = "postId")
    private Posts post;
}
