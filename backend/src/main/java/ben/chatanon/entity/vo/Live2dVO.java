package ben.chatanon.entity.vo;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class Live2dVO {
    private int live2dId;
    private String live2dName;
    private ExpressionVO expression;
    private MotionVO motion;

    @Data
    @AllArgsConstructor
    public static class ExpressionVO {
        private String expressionCode;
        private String expressionPath;
    }

    @Data
    @AllArgsConstructor
    public static class MotionVO {
        private String motionCode;
        private String motionPath;
    }
}
