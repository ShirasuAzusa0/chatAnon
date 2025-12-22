package ben.chatanon.controller;

import ben.chatanon.entity.RestBean;
import ben.chatanon.entity.dto.NewCommentDto;
import ben.chatanon.entity.dto.NewPostDto;
import ben.chatanon.entity.dto.NewReplyDto;
import ben.chatanon.entity.vo.*;
import ben.chatanon.service.PostService;
import org.apache.commons.lang3.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/forum")
public class PostController {

    @Autowired
    private PostService postService;

    // 获取帖子列表
    @GetMapping("/posts")
    public ResponseEntity<?> getPostList(@RequestParam int limit, @RequestParam int start, @RequestParam int method) {
        List<PostListElementVO> vos = postService.getPostList(limit, start, method);
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "msg", "帖子列表获取成功",
                "data", vos
        ));
    }

    // 获取指定标签对应的帖子列表
    @GetMapping("{tag}/posts")
    public ResponseEntity<?> getPostListByTag(@PathVariable String tag) {
        List<PostListElementVO> vos = postService.getPostListByTag(tag);
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "msg", "帖子列表获取成功",
                "data", vos
        ));
    }

    // 获取帖子标签列表
    @GetMapping("/tags")
    public ResponseEntity<?> getTagList() {
        List<PostTagListElementVO> vos = postService.getTagList();
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "msg", "帖子标签列表获取成功",
                "data", vos
        ));
    }

    // 获取具体帖子内容
    @GetMapping("/post/{postId}")
    public ResponseEntity<?> getPost(@PathVariable int postId, @RequestParam int userId) {
        if(ObjectUtils.isEmpty(postId)) return ResponseEntity.badRequest().body(RestBean.failure("postId不能为空"));
        PostVO vo = postService.getPostById(postId, userId);
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "msg", "具体帖子内容获取成功",
                "data", vo
        ));
    }

    // 发布新帖子
    @PostMapping("/newpost")
    public ResponseEntity<?> newPost(@RequestBody NewPostDto dto, @RequestParam int userId) {
        NewPostVO vo = postService.newPost(dto, userId);
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "msg", "新帖子发布成功",
                "data", vo
        ));
    }

    // 发表新评论
    @PostMapping("/newcomment")
    public ResponseEntity<?> newComment(@RequestBody NewCommentDto dto, @RequestParam int userId, @RequestParam int postId) {
        NewCommentVO vo = postService.newComment(dto, userId, postId);
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "msg", "新评论发布成功",
                "data", vo
        ));
    }

    // 回复评论
    @PostMapping("/newreply")
    public ResponseEntity<?> newReply(@RequestBody NewReplyDto dto, @RequestParam int userId) {
        NewReplyVO vo = postService.newReply(dto, userId);
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "msg", "回复评论成功",
                "data", vo
        ));
    }

    // 点赞帖子/评论
    @PutMapping("/{type}/like")
    public ResponseEntity<?> like(@PathVariable String type, @RequestParam int userId, @RequestParam int likeId) {
        LikeVO vo = postService.Like(type, userId, likeId);
        if (vo == null) return ResponseEntity.badRequest().body(RestBean.failure("type不合规"));
        else if (vo.isLiked())
            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "msg", "点赞成功",
                    "data", vo
            ));
        else
            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "msg", "取消点赞成功",
                    "data", vo
            ));
    }
}
