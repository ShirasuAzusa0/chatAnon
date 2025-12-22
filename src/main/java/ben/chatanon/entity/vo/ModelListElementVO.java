package ben.chatanon.entity.vo;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ModelListElementVO {
    private int modelId;
    private String modelName;
    private String modelVersion;
}
