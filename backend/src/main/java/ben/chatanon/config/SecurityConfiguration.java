package ben.chatanon.config;

import ben.chatanon.filter.JWTAuthorizeFilter;
import jakarta.servlet.DispatcherType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfiguration {
    @Autowired
    private JWTAuthorizeFilter jwtAuthorizeFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)                                      // 前后端分离项目一般禁用 CSRF
                .authorizeHttpRequests(auth -> auth
                        .dispatcherTypeMatchers(DispatcherType.ASYNC).permitAll()         // 放行 SSE 接口
                        .requestMatchers("/api/user/register").permitAll()              // 允许匿名访问注册接口
                        .requestMatchers("/api/user/login").permitAll()                 // 允许匿名访问登录接口
                        .requestMatchers("/api/publicKey").permitAll()                  // 允许匿名访问公钥获取接口
                        .requestMatchers("/api/captcha").permitAll()                    // 允许匿名访问验证码获取接口
                        .requestMatchers("/api/role-list/recommended").permitAll()      // 允许匿名访问获取聊天角色推荐列表接口
                        .requestMatchers("/api/role-list/newest").permitAll()           // 允许匿名访问获取聊天角色最新列表接口
                        .requestMatchers("/api/role-list/search/{search}").permitAll()  // 允许匿名访问搜索获取聊天角色列表接口
                        .requestMatchers("/api/role-list/tags").permitAll()             // 允许匿名访问获取角色标签列表接口
                        .requestMatchers("/api/role-list/role/{roleId}").permitAll()    // 允许匿名访问获取具体角色内容接口
                        .requestMatchers("/api/role-list/{tag}").permitAll()            // 允许匿名访问通过标签获取角色列表接口
                        .requestMatchers("/api/forum/posts").permitAll()                // 允许匿名获取帖子列表接口
                        .requestMatchers("/api/forum/{tag}/posts").permitAll()          // 允许匿名获取指定标签对应的帖子列表接口
                        .requestMatchers("/api/forum/tags").permitAll()                 // 允许匿名获取帖子标签列表接口
                        .requestMatchers("/api/forum/post/{postId}").permitAll()        // 允许匿名获取具体帖子内容接口
                        .requestMatchers("/api/chat/model/list").permitAll()            // 允许匿名获取大模型列表接口
                        .requestMatchers("/role/avatar/**").permitAll()                 // 允许匿名访问 /role/avatar
                        .anyRequest().authenticated()                                     // 其它请求需要认证
                )
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((req, res, e) -> {
                            // 对 SSE 什么都不做
                        })
                        .accessDeniedHandler((req, res, e) -> {
                            // 对 SSE 什么都不做
                        })
                )
                .addFilterBefore(jwtAuthorizeFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    // CORS config: adjust origins in production
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("*"));                          // dev: allow all origins
        config.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
