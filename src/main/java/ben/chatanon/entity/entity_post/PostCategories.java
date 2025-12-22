package ben.chatanon.entity.entity_post;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "postcategories")
public class PostCategories {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tagId")
    private int tagId;

    @Column(name = "tagName", nullable = false, unique = true)
    private String tagName;

    @Column(name = "hueColor", nullable = false)
    private String hueColor;

    @Column(name = "description", nullable = false)
    private String description;

    @Column(name = "postsCount", nullable = false)
    private int postsCount;

    @Column(name = "lastPostTime", nullable = false)
    private LocalDateTime lastPostTime;

    @OneToMany(mappedBy = "postCategory", fetch = FetchType.LAZY)
    private List<post_category> posts;

}
