package ben.chatanon.repository;

import ben.chatanon.entity.entity_post.Posts;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface PostRepository extends JpaRepository<Posts, Integer> {
    @Query(value = """
            SELECT *
            FROM posts
            ORDER BY posts.lastCommentedAt
            ASC LIMIT :limit
            OFFSET :offset
            """, nativeQuery = true)
    List<Posts> getPostListByLastCommentedAt(int limit, int offset);

    @Query(value = """
            SELECT *
            FROM posts
            ORDER BY posts.likesCount
            ASC LIMIT :limit
            OFFSET :offset
            """, nativeQuery = true)
    List<Posts> getPostListByLikesCount(int limit, int offset);

    @Query(value = """
            SELECT *
            FROM posts
            ORDER BY posts.createdAt
            ASC LIMIT :limit
            OFFSET :offset
            """, nativeQuery = true)
    List<Posts> getPostListByCreatedAt(int limit, int offset);

    @Query(value = """
            SELECT p.*
            FROM posts p
            JOIN post_category pc ON p.postId = pc.postId
            JOIN postCategories t ON t.tagId = pc.tagId
            WHERE t.tagName = :tagName
            """, nativeQuery = true)
    List<Posts> getPostListByTag(String tagName);

    Posts findByPostId(int postId);

    // Hibernate 不会自动把 1/0 转成 boolean，不支持 boolean
    @Query(value = """
            SELECT CASE
                 WHEN EXISTS (
                     SELECT 1
                     FROM post_like
                     WHERE postId = :postId
                      AND userId = :userId
                )
                THEN TRUE
                ELSE FALSE
            END
            """, nativeQuery = true)
    long likedCheck(int postId, int userId);

    @Query(value = """
            SELECT *
            FROM posts
            WHERE title = :title
            """, nativeQuery = true)
    Posts findByPostTitle(String title);

    @Modifying
    @Query(value = """
            INSERT INTO post_like (postId, userId)
            VALUES (:postId, :userId)
            """, nativeQuery = true)
    void insert(int postId, int userId);

    @Modifying
    @Query(value = """
            DELETE FROM post_like
            WHERE postId = :postId
              AND userId = :userId
            """, nativeQuery = true)
    void deleteByPostIdAndUserId(int postId, int userId);
}
