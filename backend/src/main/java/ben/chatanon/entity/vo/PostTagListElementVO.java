package ben.chatanon.entity.vo;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class PostTagListElementVO {
    private int tagId;
    private String tagName;
    private String hueColor;
    private int Counts;
    private LocalDateTime lastUpdatedTime;
}
