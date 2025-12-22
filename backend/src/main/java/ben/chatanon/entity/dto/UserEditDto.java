package ben.chatanon.entity.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserEditDto {
    private String userName;
    private String selfDescription;
    private String password;
}
