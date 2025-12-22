package ben.chatanon.entity.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RegisterDto {
    private String userName;
    private String email;
    private String password;
    private String captcha;
    private String captchaKey;
}
