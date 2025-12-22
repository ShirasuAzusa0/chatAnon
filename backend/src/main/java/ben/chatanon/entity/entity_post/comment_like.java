package ben.chatanon.entity.entity_post;

import ben.chatanon.entity.Users;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

public class comment_like {
    @Id
    @ManyToOne
    @JoinColumn(name = "commentId", referencedColumnName = "commentId")
    private Comments comment;

    @ManyToOne
    @JoinColumn(name = "userId", referencedColumnName = "userId")
    private Users user;
}
