package ben.chatanon.repository;

import ben.chatanon.entity.entity_post.Comments;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface CommentRepository extends JpaRepository<Comments, Integer> {
    @Query(value = """
            SELECT CASE
                WHEN EXISTS(
                    SELECT 1
                    FROM comment_like
                    WHERE commentId = :commentId
                    AND userId = :userId
                )
                THEN TRUE
                ELSE FALSE
            END
            """, nativeQuery = true)
    long likedCheck(int commentId, int userId);

    Comments findByCommentId(int commentId);

    @Modifying
    @Query(value = """
            INSERT INTO comment_like (commentId, userId)
            VALUES (:commentId, :userId)
            """, nativeQuery = true)
    void insert(int commentId, int userId);

    @Modifying
    @Query(value = """
            DELETE FROM comment_like
            WHERE commentId = :commentId
              AND userId = :userId
            """, nativeQuery = true)
    void deleteByCommentIdAndUserId(int commentId, int userId);

}
