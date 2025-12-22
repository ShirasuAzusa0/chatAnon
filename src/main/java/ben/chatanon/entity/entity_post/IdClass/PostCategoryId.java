package ben.chatanon.entity.entity_post.IdClass;

import java.io.Serializable;
import lombok.Data;

@Data
public class PostCategoryId implements Serializable {
    private Integer post;
    private Integer postCategory;
}
