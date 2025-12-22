package ben.chatanon.repository;

import ben.chatanon.entity.entity_chat.Sessions;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface SessionRepository extends JpaRepository<Sessions, Integer> {
    @Query(value = """
            SELECT *
            FROM sessions
            WHERE userId = :userId
            """, nativeQuery = true)
    List<Sessions> findAllByUserId(int userId);

    Sessions getSessionsBySessionId(int sessionId);
}
