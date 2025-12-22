package ben.chatanon.entity.entity_chat;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "models")
public class Models {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "modelId")
    private int modelId;

    @Column(name = "modelName", nullable = false)
    private String modelName;

    @Column(name = "modelVersion", nullable = false)
    private String modelVersion;

    @Column(name = "apiURL", nullable = false)
    private String apiURL;

    @Column(name = "apiKey", nullable = false)
    private String apiKey;

    @Column(name = "maxTokens", nullable = false)
    private int maxTokens;

    @Column(name = "temperature", nullable = false)
    private int temperature;
}
