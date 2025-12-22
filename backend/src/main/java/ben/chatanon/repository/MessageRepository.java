package ben.chatanon.repository;

import ben.chatanon.entity.entity_chat.Messages;
import ben.chatanon.entity.entity_chat.Sessions;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface MessageRepository extends JpaRepository<Messages, Integer> {
    @Query(value = """
            SELECT *
            FROM messages
            WHERE sessionId = :sessionId
            Order by createdAt ASC
            """, nativeQuery = true)
    List<Messages> findBySessionIdOrderByCreatedAtAsc(int sessionId);

    void deleteBySession(Sessions session);
}
