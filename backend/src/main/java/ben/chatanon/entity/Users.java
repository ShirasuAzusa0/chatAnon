package ben.chatanon.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "users")
public class Users {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "userId")
    private int userId;

    @Column(name = "userName", nullable = false, unique = true)
    private String userName;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "avatarURL", nullable = false)
    private String avatarURL;

    @Column(name = "selfDescription", nullable = false)
    private String selfDescription;

    @Column(name = "registerDate", nullable = false)
    private LocalDateTime registerDate;

    @Column(name = "reply", nullable = false)
    private int reply;

    @Column(name = "topics", nullable = false)
    private int topics;

    @Column(name = "follower", nullable = false)
    private int follower;

    @Column(name = "following", nullable = false)
    private int following;

    @Column(name = "userType", nullable = false, columnDefinition = "enum('user', 'admin')")
    @Enumerated(EnumType.STRING)
    private userType userType;

    @Column(name = "lastConnectedAt", nullable = false)
    private LocalDateTime lastConnectedAt;
}
