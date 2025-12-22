package ben.chatanon.controller;

import ben.chatanon.entity.RestBean;
import ben.chatanon.entity.Users;
import ben.chatanon.entity.dto.LoginDto;
import ben.chatanon.entity.dto.RegisterDto;
import ben.chatanon.entity.dto.UserEditDto;
import ben.chatanon.entity.userType;
import ben.chatanon.entity.vo.AccountVO;
import ben.chatanon.entity.vo.EditVO;
import ben.chatanon.entity.vo.UserInfoVO;
import ben.chatanon.repository.UserRepository;
import ben.chatanon.service.UserService;
import ben.chatanon.util.JwtUtils;
import ben.chatanon.util.RSAKeyUtils;
import jakarta.annotation.Resource;
import org.apache.commons.lang3.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/api/user")
public class AuthController {
    private ResponseEntity<?> verifyCaptcha(String captchaKey, String captchaInput) {
        if (captchaKey == null || captchaInput == null) {
            return ResponseEntity.badRequest().body(RestBean.failure("验证码不能为空"));
        }
        System.out.println(captchaKey);
        // 从 Redis 获取验证码
        String redisCaptcha = redisTemplate.opsForValue().get("captcha:" + captchaKey);
        System.out.println(redisCaptcha);
        if (redisCaptcha == null) {
            return ResponseEntity.badRequest().body(RestBean.failure("验证码已过期"));
        }

        if (!redisCaptcha.equalsIgnoreCase(captchaInput.trim())) {
            return ResponseEntity.badRequest().body(RestBean.failure("验证码错误"));
        }
        // 验证通过后删除验证码，防止重复使用
        redisTemplate.delete("captcha:" + captchaKey);
        return null;
    }

    @Resource
    private JwtUtils jwtUtils;

    @Resource
    private UserRepository userRepository;

    @Resource
    private RSAKeyUtils rsaKeyUtil;

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    StringRedisTemplate redisTemplate;

    // 注册
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterDto dto) {
        if (userRepository.findByEmail(dto.getEmail()) != null) {
            return ResponseEntity.badRequest().body(RestBean.failure("该邮箱已被注册"));
        }

        // 验证验证码
        String captchaKey = dto.getCaptchaKey();
        String captchaInput = dto.getCaptcha();
        ResponseEntity<?> captchaResult = verifyCaptcha(captchaKey, captchaInput);
        // 验证失败直接返回
        if (captchaResult != null) {
            return captchaResult;
        }

        // 对密码进行解密后再加密（RSA解密->BCrypt加密）
        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            String rawPassword = dto.getPassword();
            // 先把空格替换回加号
            String fixedPassword = rawPassword.replace(' ', '+');
            // 再去除密码中所有空白字符（空格、换行等）
            String encryptedPasswordClean = fixedPassword.replaceAll("\\s", "");

            System.out.println(encryptedPasswordClean);

            // 再进行解密存储
            String decryptedPassword = rsaKeyUtil.decrypt(encryptedPasswordClean);
            String encryptedPassword = passwordEncoder.encode(decryptedPassword);

            dto.setPassword(encryptedPassword);
        }

        Users user = new Users();
        // 手动设置
        user.setUserName(dto.getUserName());
        user.setEmail(dto.getEmail());
        user.setPassword(dto.getPassword());
        user.setAvatarURL("https://avatars.githubusercontent.com/u/19370775");
        user.setSelfDescription("这个用户很懒,什么都没有留下");
        user.setReply(0);
        user.setTopics(0);
        user.setFollower(0);
        user.setFollowing(0);
        user.setRegisterDate(LocalDateTime.now());
        user.setLastConnectedAt(LocalDateTime.now());
        user.setUserType(userType.user);

        userRepository.save(user);

        // 生成 JWT 令牌
        Authentication auth = new UsernamePasswordAuthenticationToken(user.getEmail(), user.getPassword());
        UserDetails userDetails = User
                .withUsername(user.getEmail())
                .password(user.getPassword())
                .authorities(auth.getAuthorities())
                .build();

        String token = jwtUtils.generateJWT(userDetails, user.getUserId(), dto.getUserName(), user.getAvatarURL());
        String bearerToken = "Bearer " + token;
        AccountVO vo = new AccountVO();
        vo.setUserId(user.getUserId());
        vo.setToken(bearerToken);
        return ResponseEntity.ok(
                Map.of(
                        "status", "success",
                        "msg", "注册成功",
                        "data", vo
                )
        );
    }

    // 登录
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDto dto) {
        if (userRepository.findByEmail(dto.getEmail()) == null) {
            return ResponseEntity.badRequest().body(RestBean.failure("不存在该账号"));
        }

        // 验证验证码
        String captchaKey = dto.getCaptchaKey();
        String captchaInput = dto.getCaptcha();
        ResponseEntity<?> captchaResult = verifyCaptcha(captchaKey, captchaInput);
        // 验证失败直接返回
        if (captchaResult != null) {
            return captchaResult;
        }

        // 从application/json中获取邮箱
        String email = dto.getEmail();

        Users user = userRepository.findByEmail(email);
        if (user == null) {
            return ResponseEntity.badRequest().body(RestBean.failure("该邮箱未注册账号"));
        }

        // 对密码进行解密
        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            String rawPassword = dto.getPassword();
            // 先把空格替换回加号
            String fixedPassword = rawPassword.replace(' ', '+');
            // 再去除密码中所有空白字符（空格、换行等）
            String encryptedPasswordClean = fixedPassword.replaceAll("\\s+", "");

            System.out.println(encryptedPasswordClean);

            // 再进行解密
            String decryptedPassword = rsaKeyUtil.decrypt(encryptedPasswordClean);

            // 使用BCrypt验证密码
            if (!passwordEncoder.matches(decryptedPassword, user.getPassword())) {
                return ResponseEntity.badRequest().body(RestBean.failure("密码错误"));
            }
        }
        else return ResponseEntity.badRequest().body(RestBean.failure("密码不能为空"));

        user.setLastConnectedAt(LocalDateTime.now());
        userRepository.save(user);

        // 生成 JWT 令牌
        Authentication auth = new UsernamePasswordAuthenticationToken(user.getEmail(), user.getPassword());
        UserDetails userDetails = User
                .withUsername(user.getEmail())
                .password(user.getPassword())
                .authorities(auth.getAuthorities())
                .build();

        String token = jwtUtils.generateJWT(userDetails, user.getUserId(), user.getUserName(), user.getAvatarURL());
        String bearerToken = "Bearer " + token;
        AccountVO vo = new AccountVO();
        vo.setUserId(user.getUserId());
        vo.setToken(bearerToken);

        return ResponseEntity.ok(
                Map.of(
                        "status", "success",
                        "msg", "登录成功",
                        "data", vo
                )
        );
    }

    // 获取用户信息
    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserInfo(@PathVariable int userId) {
        if(ObjectUtils.isEmpty(userId)) return ResponseEntity.badRequest().body(RestBean.failure("userId不能为空"));
        UserInfoVO vo = userService.getUserById(userId);

        return ResponseEntity.ok(
                Map.of(
                        "status", "success",
                        "msg", "获取用户信息成功",
                        "data", vo
                )
        );
    }

    // 用户个人信息修改
    // 通过 consumes = MediaType.MULTIPART_FORM_DATA_VALUE 告知 Spring 本接口只接受 multipart/form-data 请求
    @PutMapping(value = "/edit/{userId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> editUserInfo(@PathVariable int userId,
                                          @RequestParam(required = false) String userName,
                                          @RequestParam(required = false) String selfDescription,
                                          @RequestParam(required = false) String password,
                                          @RequestPart(value = "avatarFile", required = false) MultipartFile avatarFile
    ) {
        if(ObjectUtils.isEmpty(userId))
            return ResponseEntity.badRequest().body(RestBean.failure("userId不能为空"));

        UserEditDto dto = new UserEditDto(
            userName,
            selfDescription,
            password
        );

        EditVO vo = userService.EditInfo(userId, dto, avatarFile);

        if (Objects.equals(vo.getAvatarURL(), "fail")) {
            return ResponseEntity.badRequest().body(RestBean.failure("头像修改失败"));
        }

        else if (Objects.equals(vo.getPassword(), "fail")) {
            return ResponseEntity.badRequest().body(RestBean.failure("密码修改失败"));
        }

        return ResponseEntity.ok(
                Map.of(
                        "status", "success",
                        "msg", "用户个人信息修改成功",
                        "data", vo
                )
        );
    }
}
