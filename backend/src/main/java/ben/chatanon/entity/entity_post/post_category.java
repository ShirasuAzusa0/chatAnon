package ben.chatanon.entity.entity_post;

import ben.chatanon.entity.entity_post.IdClass.PostCategoryId;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@IdClass(PostCategoryId.class)
@Table(name = "post_category")
public class post_category {
    @Id
    @ManyToOne
    @JoinColumn(name = "postId", referencedColumnName = "postId")
    private Posts post;

    @Id
    @ManyToOne
    @JoinColumn(name = "tagId", referencedColumnName = "tagId")
    private PostCategories postCategory;
}
