package ben.chatanon.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 静态资源映射，让 /upload/avatar/ 目录下的图片能通过 /avatar/** URL访问
        String avatarPath = "file:" + System.getProperty("user.dir") + "/upload/avatar/";
        registry.addResourceHandler("/avatar/**").addResourceLocations(avatarPath);
    }
}
