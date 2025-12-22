package ben.chatanon.service;

import ben.chatanon.entity.dto.NewRoleDto;
import ben.chatanon.entity.entity_chat.Models;
import ben.chatanon.entity.entity_role.RoleCategories;
import ben.chatanon.entity.entity_role.Roles;
import ben.chatanon.entity.entity_role.role_category;
import ben.chatanon.entity.vo.ModelListElementVO;
import ben.chatanon.entity.vo.RoleListElementVO;
import ben.chatanon.entity.vo.RoleTagListElementVO;
import ben.chatanon.entity.vo.RoleVO;
import ben.chatanon.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
public class RoleService {
    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private RoleCategoriesRepository roleCategoriesRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ModelRepository modelRepository;

    @Autowired
    private role_categoryRepository role_categoryRepository;

    public List<RoleListElementVO> getRecommendedList() {
        List<Roles> recommendedList = roleRepository.findRecommendedList(3);
        return recommendedList.stream()
                .map(r -> new RoleListElementVO(
                        r.getRoleId(),
                        r.getRoleName(),
                        r.getFavoriteCount(),
                        r.getLikesCount(),
                        r.getAvatarURL(),
                        r.getShortInfo()
                ))
                .toList();
    }

    public List<RoleListElementVO> getNewestList() {
        List<Roles> newestList = roleRepository.findNewestList(3);
        return newestList.stream()
                .map(r -> new RoleListElementVO(
                        r.getRoleId(),
                        r.getRoleName(),
                        r.getFavoriteCount(),
                        r.getLikesCount(),
                        r.getAvatarURL(),
                        r.getShortInfo()
                ))
                .toList();
    }

    public List<RoleListElementVO> getListBySearch(String tag, String search) {
        if (search == null || search.trim().isEmpty()) {
            throw new IllegalArgumentException("Invalid search");
        }
        String[] parts = search.split(" ");
        String regex = String.join("|", parts);
        List<Roles> searchList = roleRepository.findListBySearch(tag, regex);
        return searchList.stream()
                .map(r -> new RoleListElementVO(
                        r.getRoleId(),
                        r.getRoleName(),
                        r.getFavoriteCount(),
                        r.getLikesCount(),
                        r.getAvatarURL(),
                        r.getShortInfo()
                ))
                .toList();
    }

    public List<RoleTagListElementVO> getTagList() {
        List<RoleCategories> tagList = roleCategoriesRepository.findAll();
        return tagList.stream()
                .map(rc -> new RoleTagListElementVO(
                        rc.getRoleTagId(),
                        rc.getRoleTagName(),
                        rc.getHueColor(),
                        rc.getRolesCount(),
                        rc.getLastUpdateTime()
                ))
                .toList();
    }

    public RoleVO getRoleInfo(int roleId) {
        Roles role = roleRepository.findByRoleId(roleId);
        List<Models> modelList = modelRepository.findAll();
        List<ModelListElementVO> models = modelList.stream()
                .map(m -> new ModelListElementVO(
                        m.getModelId(),
                        m.getModelName(),
                        m.getModelVersion()
                ))
                .toList();
        return new RoleVO(
                role.getRoleId(),
                role.getRoleName(),
                role.getLikesCount(),
                role.getFavoriteCount(),
                role.getAvatarURL(),
                role.getDescription(),
                models
        );
    }

    public List<RoleListElementVO> getFavoriteList(int userId) {
        List<Roles> favoriteList = roleRepository.findFavoriteListByUserId(userId);
        return favoriteList.stream()
                .map(r -> new RoleListElementVO(
                        r.getRoleId(),
                        r.getRoleName(),
                        r.getFavoriteCount(),
                        r.getLikesCount(),
                        r.getAvatarURL(),
                        r.getShortInfo()
                ))
                .toList();
    }

    public List<RoleListElementVO> getRoleListByTag(String tag) {
        List<Roles> roleList = roleRepository.findByTagName(tag);
        return roleList.stream()
                .map(r -> new RoleListElementVO(
                        r.getRoleId(),
                        r.getRoleName(),
                        r.getFavoriteCount(),
                        r.getLikesCount(),
                        r.getAvatarURL(),
                        r.getShortInfo()
                ))
                .toList();
    }

    public RoleVO newRole(NewRoleDto dto, MultipartFile avatarFile, int userId) {
        RoleVO vo = new RoleVO();
        String avatarPath = null;

        // 本地保存新建角色的图片文件
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
                    String uploadDir = System.getProperty("user.dir") + "/upload/role/avatar/";
                    File folder = new File(uploadDir);
                    if (!folder.exists()) folder.mkdirs();
                    String savePath = uploadDir + filename;
                    File dest = new File(savePath);
                    avatarFile.transferTo(dest);
                    avatarPath = "http://localhost:8080/role/avatar/" + filename;
                } catch (Exception e) {
                    vo.setAvatarURL("fail");
                    return vo;
                }
            }
        }

        // 数据库更新
        Roles role = new Roles();
        role.setRoleName(dto.getRoleName());
        role.setAuthor(userRepository.findByUserId(userId));
        role.setLikesCount(0);
        role.setFavoriteCount(0);
        if (avatarPath != null) role.setAvatarURL(avatarPath);
        else role.setAvatarURL("https://avatars.githubusercontent.com/u/19370775");
        role.setDescription(dto.getDescription());
        role.setShortInfo(dto.getShortInfo());
        role.setCreatedAt(LocalDateTime.now());
        role.setPrompt(dto.getPrompt());
        roleRepository.save(role);

        role_category  rc = new role_category();
        rc.setRole(role);
        for(String tag : dto.getTags())
            rc.setRoleCategory(roleCategoriesRepository.findByRoleTagName(tag));
        role_categoryRepository.save(rc);

        vo.setRoleId(roleRepository.findByRoleName(dto.getRoleName()).getRoleId());
        vo.setRoleName(dto.getRoleName());
        vo.setLikesCount(0);
        vo.setFavoriteCount(0);
        vo.setAvatarURL(avatarPath);
        vo.setDescription(dto.getDescription());

        List<Models> modelList = modelRepository.findAll();
        List<ModelListElementVO> models = modelList.stream()
                .map(m -> new ModelListElementVO(
                        m.getModelId(),
                        m.getModelName(),
                        m.getModelVersion()
                ))
                .toList();

        vo.setModels(models);

        return vo;
    }

    public List<RoleListElementVO> getHistoryList(int userId) {
        List<Roles> historyList = roleRepository.findHistoryList(userId);
        return historyList.stream()
                .map(r -> new RoleListElementVO(
                        r.getRoleId(),
                        r.getRoleName(),
                        r.getFavoriteCount(),
                        r.getLikesCount(),
                        r.getAvatarURL(),
                        r.getShortInfo()
                ))
                .toList();
    }
}
