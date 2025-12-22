package ben.chatanon.entity.dto;

import lombok.Data;

import java.util.List;

@Data
public class NewPostDto {
    private String title;
    private List<TagDto> tags;
    private String content;

    @Data
    public static class TagDto {
        private int tagId;
        private String tagName;
    }
}
