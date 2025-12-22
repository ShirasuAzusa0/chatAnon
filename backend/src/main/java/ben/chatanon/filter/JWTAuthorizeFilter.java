package ben.chatanon.filter;

import ben.chatanon.util.JwtUtils;
import ben.chatanon.entity.RestBean;
import com.auth0.jwt.interfaces.DecodedJWT;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.Enumeration;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class JWTAuthorizeFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtils jwtUtils;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {
        // 从 header 获取 token
        Enumeration<String> headers = request.getHeaders("Authorization");

        // 没有 Authorization 这个 header 连 名为 Authorization 的 key 也不会有
        if (headers == null || !headers.hasMoreElements()) {
            filterChain.doFilter(request, response);
            return;
        }

        String header = headers.nextElement();

        // 有 Authorization，但值是空
        if (header == null || header.isBlank()) {
            response.setContentType("application/json;charset=UTF-8");
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.getWriter().write(RestBean.failure("Authorization 为空").toString());
            return;
        }

        DecodedJWT decodedJWT;
        try {
            decodedJWT = jwtUtils.verifyJWT(header);
        } catch (Exception e) {
            response.setContentType("application/json;charset=UTF-8");
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.getWriter().write(RestBean.failure("JWT 解析失败: " + e.getMessage()).toString());
            return;
        }

        if (decodedJWT == null) {
            response.setContentType("application/json;charset=UTF-8");
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.getWriter().write(RestBean.failure("JWT 无效或已过期").toString());
            return;
        }

        // 校验成功才注入认证信息
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            Integer userId = jwtUtils.toId(decodedJWT);
            String userName = decodedJWT.getClaim("userName").asString();

            // 提取 authorities 数组
            String[] authoritiesArray = decodedJWT.getClaim("authorities").asArray(String.class);
            List<SimpleGrantedAuthority> authorities = authoritiesArray == null
                    ? List.of()
                    : Arrays.stream(authoritiesArray)
                    .map(SimpleGrantedAuthority::new)
                    .collect(Collectors.toList());

            UsernamePasswordAuthenticationToken authenticationToken =
                    new UsernamePasswordAuthenticationToken(userName, null, authorities);
            authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

            // 设置当前用户认证上下文
            SecurityContextHolder.getContext().setAuthentication(authenticationToken);
        }

        // 放行请求
        filterChain.doFilter(request, response);
    }
}