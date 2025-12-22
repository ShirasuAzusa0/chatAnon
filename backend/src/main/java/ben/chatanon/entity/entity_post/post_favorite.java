package ben.chatanon.entity.entity_post;

import ben.chatanon.entity.Users;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "post_favorite")
public class post_favorite {
    @Id
    @ManyToOne
    @JoinColumn(name = "postId", referencedColumnName = "postId")
    private Posts post;

    @ManyToOne
    @JoinColumn(name = "userId", referencedColumnName = "userId")
    private Users user;
}
