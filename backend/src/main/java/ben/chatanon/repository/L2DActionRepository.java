package ben.chatanon.repository;

import ben.chatanon.entity.entity_chat.L2DAction;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

public interface L2DActionRepository extends CrudRepository<L2DAction, Integer> {
    @Query(value = """
            SELECT *
            FROM live2daction
            WHERE actionCode = :emotion
            """, nativeQuery = true)
    L2DAction findByEmotion(String emotion);
}
