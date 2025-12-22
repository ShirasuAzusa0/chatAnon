package ben.chatanon.service;

import ben.chatanon.entity.dto.NewCommentDto;
import ben.chatanon.entity.dto.NewPostDto;
import ben.chatanon.entity.dto.NewReplyDto;
import ben.chatanon.entity.entity_post.Comments;
import ben.chatanon.entity.entity_post.PostCategories;
import ben.chatanon.entity.entity_post.Posts;
import ben.chatanon.entity.entity_post.post_category;
import ben.chatanon.entity.vo.*;
import ben.chatanon.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PostService {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private post_categoryRepository post_categoryRepository;

    @Autowired
    private PostCategoriesRepository postCategoriesRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private UserRepository userRepository;

    public List<PostListElementVO> getPostList(int limit, int start, int method) {
        List<Posts> postList;

        switch (method) {
            case 0:
                postList = postRepository.getPostListByLastCommentedAt(limit, start);
                break;
            case 1:
                postList = postRepository.getPostListByLikesCount(limit, start);
                break;
            case 2:
                postList = postRepository.getPostListByCreatedAt(limit, start);
                break;
            default:
                return List.of();
        }

        return postList.stream()
                .map(p -> {

                    // lastCommentedUser VO（允许为 null）
                    PostListElementVO.LastCommentedUserVO lastUserVO = null;
                    if (p.getLastCommentedUser() != null) {
                        lastUserVO = new PostListElementVO.LastCommentedUserVO();
                        lastUserVO.setId(p.getLastCommentedUser().getUserId());
                        lastUserVO.setUserName(p.getLastCommentedUser().getUserName());
                    }

                    return new PostListElementVO(
                            p.getPostId(),
                            p.getTitle(),

                            // author
                            new PostListElementVO.AuthorVO() {{
                                setId(p.getAuthor().getUserId());
                                setAttributes(new PostListElementVO.Attributes() {{
                                    setAvatarUrl(p.getAuthor().getAvatarURL());
                                    setUserName(p.getAuthor().getUserName());
                                    setEmail(p.getAuthor().getEmail());
                                }});
                            }},

                            // tags
                            p.getCategories().stream().map(pc -> {
                                PostListElementVO.TagVO t = new PostListElementVO.TagVO();
                                t.setTagId(pc.getPostCategory().getTagId());
                                t.setTagName(pc.getPostCategory().getTagName());
                                return t;
                            }).toList(),

                            // createdAt / lastCommentedAt（lastCommentedAt 本身允许为 null）
                            p.getCreatedAt(),
                            p.getLastCommentedAt(),

                            // lastCommentedUser（可以为 null）
                            lastUserVO,

                            // commentsCount
                            p.getCommentsCount()
                    );
                })
                .toList();
    }

    public List<PostListElementVO> getPostListByTag(String tag) {
        List<Posts> postList = postRepository.getPostListByTag(tag);

        return postList.stream()
                .map(p -> {

                    // lastCommentedUser（允许为 null）
                    PostListElementVO.LastCommentedUserVO lastUserVO = null;
                    if (p.getLastCommentedUser() != null) {
                        lastUserVO = new PostListElementVO.LastCommentedUserVO();
                        lastUserVO.setId(p.getLastCommentedUser().getUserId());
                        lastUserVO.setUserName(p.getLastCommentedUser().getUserName());
                    }

                    return new PostListElementVO(
                            p.getPostId(),
                            p.getTitle(),

                            // author
                            new PostListElementVO.AuthorVO() {{
                                setId(p.getAuthor().getUserId());
                                PostListElementVO.Attributes attr = new PostListElementVO.Attributes();
                                attr.setAvatarUrl(p.getAuthor().getAvatarURL());
                                attr.setUserName(p.getAuthor().getUserName());
                                attr.setEmail(p.getAuthor().getEmail());
                                setAttributes(attr);
                            }},

                            // tags
                            p.getCategories().stream().map(pc -> {
                                PostListElementVO.TagVO t = new PostListElementVO.TagVO();
                                t.setTagId(pc.getPostCategory().getTagId());
                                t.setTagName(pc.getPostCategory().getTagName());
                                return t;
                            }).toList(),

                            // createdAt / lastCommentedAt（lastCommentedAt 允许为 null）
                            p.getCreatedAt(),
                            p.getLastCommentedAt(),

                            // lastCommentedUser（可以为 null）
                            lastUserVO,

                            // commentsCount
                            p.getCommentsCount()
                    );
                })
                .toList();
    }

    public List<PostTagListElementVO> getTagList() {
        List<PostCategories> pcList = postCategoriesRepository.findAll();
        return pcList.stream()
                .map(pc -> new PostTagListElementVO(
                        pc.getTagId(),
                        pc.getTagName(),
                        pc.getHueColor(),
                        pc.getPostsCount(),
                        pc.getLastPostTime()
                )).toList();
    }

    public PostVO getPostById(int postId, int userId) {
        Posts post = postRepository.findByPostId(postId);
        return new PostVO(
                post.getPostId(),
                post.getTitle(),

                new PostVO.AuthorVO() {{
                    setId(post.getAuthor().getUserId());
                    PostVO.Attributes attr = new PostVO.Attributes();
                    attr.setAvatarUrl(post.getAuthor().getAvatarURL());
                    attr.setUserName(post.getAuthor().getUserName());
                    attr.setEmail(post.getAuthor().getEmail());
                    setAttributes(attr);
                }},

                post.getCategories().stream()
                        .map(pc -> {
                            PostVO.TagVO t = new PostVO.TagVO();
                            t.setTagId(pc.getPostCategory().getTagId());
                            t.setTagName(pc.getPostCategory().getTagName());
                            return t;
                        })
                        .toList(),

                post.getCreatedAt(),
                post.getLastCommentedAt(),
                post.getCommentsCount(),
                post.getLikesCount(),
                post.getContent(),

                post.getComments()
                        .stream()
                        .map(c -> {
                            PostVO.CommentVO vo = new PostVO.CommentVO();
                            vo.setCommentId(c.getCommentId());

                            PostVO.AuthorVO authorVO = new PostVO.AuthorVO();
                            authorVO.setId(c.getAuthor().getUserId());

                            PostVO.Attributes attributes = new PostVO.Attributes();
                            attributes.setAvatarUrl(c.getAuthor().getAvatarURL());
                            attributes.setUserName(c.getAuthor().getUserName());
                            attributes.setEmail(c.getAuthor().getEmail());

                            authorVO.setAttributes(attributes);
                            vo.setAuthor(authorVO);

                            vo.setContent(c.getContent());
                            vo.setCreatedAt(c.getCreatedAt());
                            vo.setLikesCount(c.getLikesCount());
                            vo.setLiked(commentRepository.likedCheck(c.getCommentId(), userId) > 0);
                            vo.setRepliedId(c.getRepliedId());

                            return vo;
                        })
                        .toList(),


                postRepository.likedCheck(postId, userId) > 0
        );
    }

    public NewPostVO newPost(NewPostDto dto, int userId) {
        Posts post = new Posts();
        post.setTitle(dto.getTitle());
        post.setContent(dto.getContent());
        post.setCreatedAt(LocalDateTime.now());
        post.setLastCommentedAt(null);
        post.setLastCommentedUser(null);
        post.setAuthor(userRepository.findByUserId(userId));
        post.setLikesCount(0);
        postRepository.save(post);

        // 处理存储新帖子的tag分类
        for (NewPostDto.TagDto t : dto.getTags()) {
            post_category pc = new post_category();
            pc.setPost(post);
            pc.setPostCategory(new PostCategories() {{
                setTagId(t.getTagId());
                setTagName(t.getTagName());
            }});
            post_categoryRepository.save(pc);
        }

        return new NewPostVO(
                postRepository.findByPostTitle(dto.getTitle()).getPostId(),
                dto.getTitle()
        );
    }

    public NewCommentVO newComment(NewCommentDto dto, int userId, int postId) {
        Comments comment = new Comments();
        comment.setContent(dto.getContent());
        comment.setAuthor(userRepository.findByUserId(userId));
        comment.setCreatedAt(LocalDateTime.now());
        comment.setLikesCount(0);
        comment.setRepliedId(-1);
        comment.setPost(postRepository.findByPostId(postId));
        commentRepository.save(comment);

        return new NewCommentVO(
                postId,
                comment.getCommentId()
        );
    }

    public NewReplyVO newReply(NewReplyDto dto, int userId) {
        Comments comment = new Comments();
        comment.setContent(dto.getContent());
        comment.setAuthor(userRepository.findByUserId(userId));
        comment.setCreatedAt(LocalDateTime.now());
        comment.setLikesCount(0);
        comment.setRepliedId(-1);
        comment.setPost(postRepository.findByPostId(dto.getPostId()));
        commentRepository.save(comment);

        int c_id = comment.getCommentId();

        comment = commentRepository.findByCommentId(dto.getReplyId());
        comment.setRepliedId(c_id);
        commentRepository.save(comment);

        return new NewReplyVO(
                dto.getPostId(),
                c_id,
                dto.getReplyId()
        );
    }

    @Transactional
    public LikeVO Like(String type, int userId, int likeId) {
        boolean isLiked = true;
        if (type.equals("post")) {
            isLiked = postRepository.likedCheck(likeId, userId) > 0;
            Posts post = postRepository.findByPostId(likeId);
            if (isLiked) {
                postRepository.deleteByPostIdAndUserId(likeId, userId);
                post.setLikesCount(post.getLikesCount() - 1);
                isLiked = false;
            }
            else {
                postRepository.insert(likeId, userId);
                post.setLikesCount(post.getLikesCount() + 1);
                isLiked = true;
            }
            postRepository.save(post);
        }
        else if (type.equals("comment")) {
            isLiked = commentRepository.likedCheck(likeId, userId) > 0;
            Comments comment = commentRepository.findByCommentId(likeId);
            if (isLiked) {
                commentRepository.deleteByCommentIdAndUserId(likeId, userId);
                comment.setLikesCount(comment.getLikesCount() - 1);
                isLiked = false;
            }
            else {
                commentRepository.insert(likeId, userId);
                comment.setLikesCount(comment.getLikesCount() + 1);
                isLiked = true;
            }
            commentRepository.save(comment);
        }

        else
            return null;

        return new LikeVO(
                isLiked,
                likeId
        );
    }
}
