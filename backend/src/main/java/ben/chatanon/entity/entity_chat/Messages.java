package ben.chatanon.entity.entity_chat;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "messages")
public class Messages {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "messageId")
    private int messageId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sessionId", referencedColumnName = "sessionId", nullable = false)
    private Sessions session;

    @Column(name = "content", nullable = false, columnDefinition = "LONGTEXT")
    private String content;

    @Column(name = "tokens", nullable = false)
    private int tokens;

    @Column(name = "createdAt", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "role", nullable = false, columnDefinition = "enum('system','user','assistant')")
    @Enumerated(EnumType.STRING)
    private roleType role;

    @Column(name = "emotion")
    private String emotion;
}
