package ben.chatanon.entity.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class NewRoleDto {
    private String roleName;
    private String shortInfo;
    private String description;
    private String prompt;
    private List<String> tags;
}
