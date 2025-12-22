package ben.chatanon.entity.entity_chat;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Setter
@Getter
@Table(name = "live2daction")
public class L2DAction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "actionId")
    private int actionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "live2dId", referencedColumnName = "live2dId", nullable = false)
    private L2DModel live2d;

    @Column(name = "actionCode", nullable = false)
    private String actionCode;

    @Column(name = "expressionPath", nullable = false)
    private String expressionPath;

    @Column(name = "motionPath", nullable = false)
    private String motionPath;
}
