package ben.chatanon.repository;

import ben.chatanon.entity.entity_chat.L2DModel;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

public interface L2DModelRepository extends CrudRepository<L2DModel, Integer> {
    @Query(value = """
            SELECT prompt
            FROM live2dmodel
            WHERE live2dId = :live2dId
            """, nativeQuery = true)
    String findPromptById(int live2dId);

    @Query(value = """
            SELECT *
            FROM live2dmodel
            WHERE roleId = :roleId
            """, nativeQuery = true)
    L2DModel findByRoleId(int roleId);
}
