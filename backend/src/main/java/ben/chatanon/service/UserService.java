package ben.chatanon.service;

import ben.chatanon.entity.Users;
import ben.chatanon.entity.dto.UserEditDto;
import ben.chatanon.entity.vo.EditVO;
import ben.chatanon.entity.vo.UserInfoVO;
import ben.chatanon.repository.UserRepository;
import ben.chatanon.util.RSAKeyUtils;
import jakarta.annotation.Resource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.Objects;
import java.util.Set;

@Service
public class UserService {
    @Resource
    private RSAKeyUtils rsaKeyUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public UserInfoVO getUserById(int userId) {
        Users user = userRepository.findByUserId(userId);

        return new UserInfoVO(
                user.getUserId(),
                user.getUserName(),
                user.getEmail(),
                user.getAvatarURL(),
                user.getSelfDescription(),
                user.getReply(),
                user.getTopics(),
                user.getFollower(),
                user.getFollowing()
        );
    }

    public EditVO EditInfo(int userId, UserEditDto dto, MultipartFile avatarFile) {
        EditVO vo = new EditVO();
        String avatarPath = null;

        // 本地保存头像图片文件
        if (avatarFile != null && !avatarFile.isEmpty()) {
            String filename = avatarFile.getOriginalFilename();
            if (filename != null) {
                String extension = filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
                Set<String> allowed = Set.of("png", "jpg", "jpeg", "gif");
                if (!allowed.contains(extension)) {
                    vo.setAvatarURL("fail");
                    return vo;
                }
                try {
                    String uploadDir = System.getProperty("user.dir") + "/upload/avatar/";
                    File folder = new File(uploadDir);
                    if (!folder.exists()) folder.mkdirs();
                    String savePath = uploadDir + filename;
                    File dest = new File(savePath);
                    avatarFile.transferTo(dest);
                    avatarPath = "http://localhost:8080/avatar/" + filename;
                } catch (Exception e) {
                    vo.setAvatarURL("fail");
                    return vo;
                }
            }
        }

        // 数据库更新
        // 对密码进行解密后再加密（RSA解密->BCrypt加密）
        String encryptedPassword = "";
        if (dto.getPassword() == null || dto.getPassword().isEmpty()) {
            vo.setPassword("null");
        }

        if (!Objects.equals(vo.getPassword(), "null")) {
            String rawPassword = dto.getPassword();
            // 先把空格替换回加号
            String fixedPassword = rawPassword.replace(' ', '+');
            // 再去除密码中所有空白字符（空格、换行等）
            String encryptedPasswordClean = fixedPassword.replaceAll("\\s", "");

            // 再进行解密存储
            String decryptedPassword = rsaKeyUtil.decrypt(encryptedPasswordClean);
            encryptedPassword = passwordEncoder.encode(decryptedPassword);
        }

        Users user = userRepository.findByUserId(userId);
        if (StringUtils.hasText(dto.getUserName())) user.setUserName(dto.getUserName());
        if (StringUtils.hasText(dto.getSelfDescription())) user.setSelfDescription(dto.getSelfDescription());
        if (avatarPath != null) user.setAvatarURL(avatarPath);
        if (StringUtils.hasText(dto.getPassword()) && !Objects.equals(dto.getPassword(), "null")) user.setPassword(encryptedPassword);
        userRepository.save(user);

        vo.setAvatarURL(avatarPath);
        vo.setSelfDescription(dto.getSelfDescription());
        vo.setUserName(user.getUserName());
        if (!Objects.equals(vo.getPassword(), "null")) vo.setPassword("password updated successfully");

        return vo;
    }
}
