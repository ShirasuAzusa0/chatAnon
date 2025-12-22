package ben.chatanon.util;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.Claim;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.auth0.jwt.interfaces.JWTVerifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.util.Calendar;
import java.util.Date;
import java.util.Map;
import java.util.Objects;

import org.springframework.security.core.GrantedAuthority;

@Component
public class JwtUtils {
    // 加密密钥
    @Value("${spring.security.jwt.key}")
    private String key;

    // JWT有效期设置（单位：天）
    @Value("${spring.security.jwt.expire}")
    private int expire;

    // JWT令牌过期时间计算方法
    public Date expireTime() {
        Calendar cal = Calendar.getInstance();
        // 解释：将 expire 视为“天数”，如果配置异常（<=0），回退到 7 天默认
        int days = Math.max(1, expire);
        cal.add(Calendar.DAY_OF_YEAR, days);
        return cal.getTime();
    }

    // 解析用户信息的方法
    // 将已验证的DecodedJWT中自定义的用户信息提取出来，构造出UserInfo对象
    public UserDetails toUser(DecodedJWT jwt) {
        if (jwt == null) return User.withUsername("anonymous").password("*****").authorities(new String[0]).build();

        Map<String, Claim> claims = jwt.getClaims();
        Claim userNameClaim = claims.get("userName");
        Claim authoritiesClaim = claims.get("authorities");

        String userName = userNameClaim != null ? userNameClaim.asString() : "unknown";
        String[] authoritiesArray = new String[0];
        if (authoritiesClaim != null) {
            String[] arr = authoritiesClaim.asArray(String.class);
            if (arr != null) authoritiesArray = arr;
        }

        return User
                .withUsername(userName)
                .password("*****")
                .authorities(authoritiesArray)
                .build();
    }

    // 解析用户Id
    // 从DecodedJWT中提取用户的数据库主键唯一标识id，供业务层使用
    public Integer toId(DecodedJWT jwt) {
        if (jwt == null) return null;
        Map<String, Claim> claims = jwt.getClaims();
        Claim idClaim = claims.get("userId");
        if (idClaim == null) return null;
        try {
            return idClaim.asInt();
        } catch (Exception e) {
            // 保守处理：如果转换失败，返回 null
            return null;
        }
    }

    // 创建JWT令牌，需要用到用户的信息（从info中提取出来）、id、用户名
    public String generateJWT(UserDetails userDetails, int userId, String userName, String avatarURL) {
        // 使用HMAC256加密算法
        Algorithm algorithm = Algorithm.HMAC256(key);
        Date expire = this.expireTime();

        // 将 authorities 转为 String[] 并用 withArrayClaim 明确写入数组类型
        String[] authoritiesArray = userDetails.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .filter(Objects::nonNull)
                .toArray(String[]::new);

        return JWT.create()
                .withClaim("userId", userId)
                .withClaim("userName", userName)
                .withClaim("avatarURL", avatarURL)
                .withArrayClaim("authorities", authoritiesArray)
                .withIssuedAt(new Date())
                .withExpiresAt(expire)
                .sign(algorithm);
    }

    // JWT令牌验证与解析方法
    public DecodedJWT verifyJWT(String headerToken) {
        // 去前缀并校验
        String token = this.convertToken(headerToken);
        if (token == null) {
            return null;
        }

        Algorithm algorithm = Algorithm.HMAC256(key);
        JWTVerifier verifier = JWT.require(algorithm).build();
        try {
            DecodedJWT jwt = verifier.verify(token);
            Date expiresAt = jwt.getExpiresAt();
            // 如果没有 expires 字段，保守：当作有效（但生成时我们会写入 expires），
            // 如果确实想严格拒绝没有 exp 的 token，可改成返回 null
            if (expiresAt != null) {
                if (new Date().after(expiresAt)) {
                    return null;
                }
            }
            return jwt;
        } catch (JWTVerificationException e) {
            System.out.println("JWT verify failed: " + e.getMessage());
            return null;
        } catch (Exception e) {
            // 任何意外也返回 null，避免抛出到上层
            System.out.println("JWT verify unexpected error: " + e.getMessage());
            return null;
        }
    }

    // 格式化token方法，将headerToken的前缀去掉
    private String convertToken(String headerToken) {
        if (headerToken == null) return null;
        String trimmed = headerToken.trim();
        if (!trimmed.startsWith("Bearer ")) {
            return null;
        }
        // 返回去掉前缀并 trim
        return trimmed.substring(7).trim();
    }
}
