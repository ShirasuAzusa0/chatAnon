package ben.chatanon.entity.vo;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class EditVO {
    private String userName;
    private String avatarURL;
    private String selfDescription;
    private String password;
    public EditVO() {}
}
