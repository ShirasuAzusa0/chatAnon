// 实体类，装响应的基本信息，用于规范化返回json数据
package ben.chatanon.entity;

import com.alibaba.fastjson2.JSONObject;
import com.alibaba.fastjson2.JSONWriter;

// 返回信息包括状态（status）、说明信息（msg）、数据（data），接下来封装几个工具方法
public record RestBean<T>(String status, String msg, T data) {
    // 请求工具
    public static <T> RestBean<T> success(T data) { return new RestBean<>("success", "请求成功", data); }

    // 未登录无权限工具方法
    public static <T> RestBean<T> unauthorized(String msg) {
        return failure(msg);
    }

    public static <T> RestBean<T> forbidden(String msg) {
        return failure(msg);    //403
    }

    // 请求失败工具方法
    public static <T> RestBean<T> failure(String msg) {
        return new RestBean<>("fail", msg, null);
    }

    // 转换为json格式的工具方法
    public String asJsonString() {
        // WriteNulls可以处理空值
        return JSONObject.toJSONString(this, JSONWriter.Feature.WriteNulls);
    }
}
