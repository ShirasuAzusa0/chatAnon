package ben.chatanon.controller;

import ben.chatanon.entity.RestBean;
import ben.chatanon.entity.dto.NewRoleDto;
import ben.chatanon.entity.vo.RoleListElementVO;
import ben.chatanon.entity.vo.RoleTagListElementVO;
import ben.chatanon.entity.vo.RoleVO;
import ben.chatanon.repository.ModelRepository;
import ben.chatanon.service.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/api/role-list")
public class RoleController {

    @Autowired
    private RoleService roleService;

    @Autowired
    private ModelRepository modelRepository;

    // 获取聊天角色推荐列表
    @GetMapping("/recommended")
    public ResponseEntity<?> getRecommendedList() {
        List<RoleListElementVO> vos = roleService.getRecommendedList();
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "msg", "获取聊天角色推荐列表成功",
                "data", vos
        ));
    }

    // 获取聊天角色最新列表
    @GetMapping("/newest")
    public ResponseEntity<?> getNewestList() {
        List<RoleListElementVO> vos = roleService.getNewestList();
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "msg", "获取聊天角色最新列表成功",
                "data", vos
        ));
    }

    // 搜索获取聊天角色列表
    @GetMapping("/search/{search}")
    public ResponseEntity<?> searchRoleList(@PathVariable String search, @RequestParam String tag) {
        List<RoleListElementVO> vos = roleService.getListBySearch(tag, search);
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "msg", "搜索获取聊天角色列表成功",
                "data", vos
        ));
    }

    // 获取角色标签列表
    @GetMapping("/tags")
    public ResponseEntity<?> getTagList() {
        List<RoleTagListElementVO> vos = roleService.getTagList();
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "msg", "获取角色标签列表成功",
                "data", vos
        ));
    }

    // 获取具体角色内容
    @GetMapping("/role/{roleId}")
    public ResponseEntity<?> getRoleInfo(@PathVariable int roleId) {
        RoleVO vo = roleService.getRoleInfo(roleId);
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "msg", "获取具体角色内容成功",
                "data", vo
        ));
    }

    // 获取用户收藏的角色列表
    @GetMapping("/{userId}/favorite")
    public ResponseEntity<?> getFavoriteList(@PathVariable int userId) {
        List<RoleListElementVO> vos = roleService.getFavoriteList(userId);
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "msg", "获取用户收藏的角色列表成功",
                "data", vos
        ));
    }

    // 通过标签获取角色列表
    @GetMapping("/{tag}")
    public ResponseEntity<?> getRoleListByTag(@PathVariable String tag) {
        List<RoleListElementVO> vos = roleService.getRoleListByTag(tag);
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "msg", "通过标签获取角色列表成功",
                "data", vos
        ));
    }

    // 用户创建自定义角色
    @PostMapping("/newrole")
    public ResponseEntity<?> addRole(
            @RequestParam int userId,
            @RequestParam(required = false) String roleName,
            @RequestParam(required = false) String shortInfo,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) List<String> tags,
            @RequestParam(required = false) String prompt,
            @RequestPart(value = "avatar", required = false) MultipartFile avatarFile
    ) {

        NewRoleDto dto = new NewRoleDto(
                roleName,
                shortInfo,
                description,
                prompt,
                tags
        );

        RoleVO vo = roleService.newRole(dto, avatarFile, userId);
        if (Objects.equals(vo.getAvatarURL(), "fail")) {
            return ResponseEntity.badRequest().body(RestBean.failure("角色图片上传失败"));
        }
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "msg", "新角色创建成功",
                "data", vo
        ));
    }

    // 获取历史的聊天角色列表
    @GetMapping("/history")
    public ResponseEntity<?> getHistoryList(@RequestParam int userId) {
        List<RoleListElementVO> vos = roleService.getHistoryList(userId);
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "msg", "获取用户历史聊天角色列表成功",
                "data", vos
        ));
    }
}
